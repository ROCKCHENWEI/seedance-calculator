import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json";
import { restaurantPublic } from "@/lib/restaurant-public";
import { isReadOnlyDemoMode, readOnlyDemoMessage } from "@/lib/deployment-mode";
import { metricsSummary } from "@/lib/services/metrics";
import { getQueueStatus, joinQueue } from "@/lib/services/queue";
import { recommendMeals } from "@/lib/services/recommend";
import { RecommendRequestSchema, SearchRestaurantsQuerySchema } from "@/schemas";
import { newTraceId } from "@/lib/trace";
import * as z from "zod";

function toolText(data: unknown, isError = false) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
    isError,
  };
}

function toolError(message: string, data?: Record<string, unknown>) {
  return toolText({ error: message, ...data }, true);
}

export function buildSkillTableMcpServer(input: {
  origin: string;
  hasApiKey?: boolean;
}) {
  const origin = input.origin.replace(/\/$/, "");
  const hasApiKey = input.hasApiKey ?? false;

  const server = new McpServer({
    name: "skilltable-http",
    version: "0.2.0",
    title: "SkillTable Dining Skills",
  });

  server.registerResource(
    "skilltable-overview",
    "https://skilltable.local/resources/overview",
    {
      title: "SkillTable Overview",
      description: "Quick MCP connection and capability summary for agents.",
      mimeType: "application/json",
    },
    async (uri) => {
      const restaurants = await prisma.restaurant.findMany({
        orderBy: { name: "asc" },
      });

      const featured =
        restaurants.find((restaurant) => restaurant.name === "金谷园饺子馆") ?? null;

      return {
        contents: [
          {
            uri: uri.toString(),
            text: JSON.stringify(
              {
                product: "SkillTable",
                mode: isReadOnlyDemoMode() ? "read-only-demo" : "read-write",
                note: isReadOnlyDemoMode() ? readOnlyDemoMessage() : undefined,
                connect: {
                  streamable_http_mcp: `${origin}/api/mcp`,
                  info: `${origin}/api/mcp/info`,
                  skill_manifest: `${origin}/.well-known/skilltable-skills.json`,
                  openapi: `${origin}/openapi.yaml`,
                  auth:
                    "Send Authorization: Bearer <api_key> or X-API-Key on MCP and HTTP requests.",
                },
                tools: [
                  "skilltable_recommend",
                  "skilltable_browse_restaurants",
                  "skilltable_get_restaurant",
                  "skilltable_get_menu",
                  "skilltable_queue_join",
                  "skilltable_queue_status",
                  "skilltable_metrics",
                ],
                restaurant_count: restaurants.length,
                featured_restaurant: featured
                  ? {
                      id: featured.id,
                      name: featured.name,
                      mcp_streamable_url: featured.mcpStreamableUrl,
                      skill_reference_url: featured.skillReferenceUrl,
                    }
                  : null,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "skilltable_recommend",
    {
      title: "Recommend Dining Option",
      description:
        "Primary dining recommendation. Returns ranked restaurants with next actions, including linked MCP skills when available.",
      inputSchema: {
        location: z
          .object({
            latitude: z.number().optional(),
            longitude: z.number().optional(),
            regionId: z.string().optional(),
          })
          .optional(),
        time_window: z.string().optional(),
        budget_per_person: z.number().optional(),
        dietary: z.array(z.string()).optional(),
        party_size: z.number().int().positive().optional(),
        scene: z.string().optional(),
        preference_tags: z.array(z.string()).optional(),
      },
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args) => {
      const parsed = RecommendRequestSchema.parse(args);
      const traceId = newTraceId();
      const { candidates } = await recommendMeals(parsed, traceId);
      return toolText({ trace_id: traceId, candidates });
    },
  );

  server.registerTool(
    "skilltable_browse_restaurants",
    {
      title: "Browse Restaurants",
      description:
        "Fast restaurant catalog for agents. Search by keyword, tags, or ask for queue/MCP capable entries only.",
      inputSchema: {
        q: z.string().optional(),
        tags: z.string().optional(),
        limit: z.number().int().min(1).max(50).optional(),
        queue_only: z.boolean().optional(),
        mcp_only: z.boolean().optional(),
      },
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args) => {
      const query = SearchRestaurantsQuerySchema.parse({
        q: args.q,
        tags: args.tags,
        limit: args.limit != null ? String(args.limit) : undefined,
      });

      const where: {
        OR?: { name: { contains: string } }[];
      } = {};

      if (query.q?.trim()) {
        where.OR = [{ name: { contains: query.q.trim() } }];
      }

      const rows = await prisma.restaurant.findMany({
        where,
        take: query.limit,
        orderBy: { name: "asc" },
      });

      const tagFilter = query.tags
        ?.split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      const restaurants = rows
        .filter((row) => {
          const tags = parseJsonArray(row.tags);
          const capabilities = parseJsonArray(row.capabilities);

          if (tagFilter?.length) {
            const matchesTags = tagFilter.every((tag) =>
              tags.some((value) => value.includes(tag)),
            );
            if (!matchesTags) return false;
          }

          if (args.queue_only && !capabilities.includes("queue")) {
            return false;
          }

          if (args.mcp_only && !row.mcpStreamableUrl) {
            return false;
          }

          return true;
        })
        .map((row) => restaurantPublic(row));

      return toolText({
        restaurants,
        connect: {
          site_mcp: `${origin}/api/mcp`,
          site_mcp_info: `${origin}/api/mcp/info`,
          reuse_api_key: hasApiKey,
        },
      });
    },
  );

  server.registerTool(
    "skilltable_get_restaurant",
    {
      title: "Get Restaurant",
      description: "Fetch restaurant metadata and capabilities.",
      inputSchema: {
        restaurant_id: z.string().min(1),
      },
      annotations: {
        readOnlyHint: true,
      },
    },
    async ({ restaurant_id }) => {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurant_id },
      });

      if (!restaurant) {
        return toolError("Restaurant not found");
      }

      return toolText({ restaurant: restaurantPublic(restaurant) });
    },
  );

  server.registerTool(
    "skilltable_get_menu",
    {
      title: "Get Structured Menu",
      description: "Fetch structured menu for a restaurant.",
      inputSchema: {
        restaurant_id: z.string().min(1),
      },
      annotations: {
        readOnlyHint: true,
      },
    },
    async ({ restaurant_id }) => {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurant_id },
        include: {
          categories: {
            orderBy: { sortOrder: "asc" },
            include: { items: { orderBy: { name: "asc" } } },
          },
        },
      });

      if (!restaurant) {
        return toolError("Restaurant not found");
      }

      return toolText({
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        provider: restaurant.provider,
        mcp_streamable_url: restaurant.mcpStreamableUrl,
        skill_reference_url: restaurant.skillReferenceUrl,
        note:
          restaurant.skillReferenceUrl != null
            ? "Platform menu is illustrative; live hours/queue/Wi-Fi etc. may be served by the linked MCP skill."
            : undefined,
        categories: restaurant.categories.map((category) => ({
          id: category.id,
          name: category.name,
          items: category.items.map((item) => ({
            id: item.id,
            name: item.name,
            price_cents: item.priceCents,
            currency: item.currency,
            spice_level: item.spiceLevel,
            allergens: parseJsonArray(item.allergens),
            available: item.available,
            description: item.description,
          })),
        })),
      });
    },
  );

  server.registerTool(
    "skilltable_queue_join",
    {
      title: "Join Queue",
      description: "Join queue when restaurant supports queue capability.",
      inputSchema: {
        restaurant_id: z.string().min(1),
        party_size: z.number().int().positive().optional(),
      },
    },
    async ({ restaurant_id, party_size }) => {
      const result = await joinQueue({
        restaurantId: restaurant_id,
        partySize: party_size ?? 1,
      });

      if (!result.ok) {
        return toolError(result.message, {
          mode: isReadOnlyDemoMode() ? "read-only-demo" : undefined,
        });
      }

      return toolText(result.ticket);
    },
  );

  server.registerTool(
    "skilltable_queue_status",
    {
      title: "Get Queue Status",
      description: "Poll queue ticket status.",
      inputSchema: {
        ticket_id: z.string().min(1),
      },
      annotations: {
        readOnlyHint: true,
      },
    },
    async ({ ticket_id }) => {
      const result = await getQueueStatus(ticket_id);
      if (!result.ok) {
        return toolError(result.message);
      }

      return toolText(result.ticket);
    },
  );

  server.registerTool(
    "skilltable_metrics",
    {
      title: "Usage Metrics",
      description: "Request volume and latency summary for the last 24 hours.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
      },
    },
    async () => {
      const summary = await metricsSummary();
      return toolText(summary);
    },
  );

  return server;
}
