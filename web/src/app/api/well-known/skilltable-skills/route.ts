import { NextResponse } from "next/server";

const manifest = {
  name: "SkillTable",
  namespace: "skilltable",
  version: "0.2.0",
  slogan: "Don't search. Delegate.",
  base_url_env: "SKILLTABLE_API_BASE_URL",
  authentication: {
    type: "bearer_or_header",
    header: "X-API-Key",
    bearer: "Authorization: Bearer <key>",
  },
  mcp: {
    transport: "streamable-http",
    endpoint: "/api/mcp",
    info: "/api/mcp/info",
    mode: "stateless-json-response",
    notes: [
      "Agents can connect directly to the website MCP endpoint.",
      "Reuse the same API key used for HTTP API calls.",
    ],
  },
  http: {
    openapi: "/openapi.yaml",
    prefix: "/api/v1",
  },
  external_skill_examples: [
    {
      name: "jinguyuan-dumpling-skill",
      description: "金谷园饺子馆 — 官方 streamable HTTP MCP（排队、外卖、Wi‑Fi 等）",
      github: "https://github.com/JinGuYuan/jinguyuan-dumpling-skill",
      mcp_streamable_http:
        "https://mcp-4g9gkps4c04addd0.service.tcloudbase.com/jgy-mcp",
      seeded_in_platform: true,
      note: "Also registered as a Restaurant row with illustrative menu for SkillTable search/recommend/queue demos.",
    },
  ],
  tools: [
    {
      name: "skilltable_recommend",
      method: "POST",
      path: "/api/v1/recommend",
      description: "Rank restaurants for constraints (budget, dietary, location).",
    },
    {
      name: "skilltable_search_restaurants",
      method: "GET",
      path: "/api/v1/restaurants/search",
      description: "Search restaurants by keyword and tags.",
    },
    {
      name: "skilltable_browse_restaurants",
      method: "MCP",
      path: "/api/mcp",
      description: "Browse restaurant catalog quickly with queue_only / mcp_only filters.",
    },
    {
      name: "skilltable_get_restaurant",
      method: "GET",
      path: "/api/v1/restaurants/{id}",
      description: "Fetch restaurant metadata and capabilities.",
    },
    {
      name: "skilltable_get_menu",
      method: "GET",
      path: "/api/v1/restaurants/{id}/menu",
      description: "Structured menu for a restaurant.",
    },
    {
      name: "skilltable_queue_join",
      method: "POST",
      path: "/api/v1/queue/join",
      description: "Join queue when restaurant supports queue capability.",
    },
    {
      name: "skilltable_queue_status",
      method: "GET",
      path: "/api/v1/queue/{ticketId}",
      description: "Poll queue ticket status.",
    },
    {
      name: "skilltable_queue_call_next",
      method: "POST",
      path: "/api/v1/queue/call-next",
      description: "Staff/demo: mark next waiting ticket as called.",
    },
    {
      name: "skilltable_metrics",
      method: "GET",
      path: "/api/v1/metrics",
      description: "Basic request volume and latency (24h).",
    },
  ],
};

export async function GET() {
  return NextResponse.json(manifest, {
    headers: {
      "cache-control": "public, max-age=300",
    },
  });
}
