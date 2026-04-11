import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json";
import { withAuthJson } from "@/lib/api-route";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return withAuthJson(request, "GET /api/v1/restaurants/:id/menu", async () => {
    const r = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { sortOrder: "asc" },
          include: { items: { orderBy: { name: "asc" } } },
        },
      },
    });

    if (!r) {
      return { status: 404, body: { error: "Not found" } };
    }

    return {
      body: {
        restaurant_id: r.id,
        restaurant_name: r.name,
        provider: r.provider,
        mcp_streamable_url: r.mcpStreamableUrl,
        skill_reference_url: r.skillReferenceUrl,
        note:
          r.skillReferenceUrl != null
            ? "Platform menu is illustrative; live hours/queue/Wi‑Fi etc. may be served by the linked MCP skill."
            : undefined,
        categories: r.categories.map((c) => ({
          id: c.id,
          name: c.name,
          items: c.items.map((i) => ({
            id: i.id,
            name: i.name,
            price_cents: i.priceCents,
            currency: i.currency,
            spice_level: i.spiceLevel,
            allergens: parseJsonArray(i.allergens),
            available: i.available,
            description: i.description,
          })),
        })),
      },
    };
  });
}
