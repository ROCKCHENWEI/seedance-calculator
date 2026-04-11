import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json";
import { withAuthJson } from "@/lib/api-route";
import { restaurantPublic } from "@/lib/restaurant-public";
import { SearchRestaurantsQuerySchema } from "@/schemas";

export async function GET(request: Request) {
  return withAuthJson(request, "GET /api/v1/restaurants/search", async () => {
    const url = new URL(request.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const q = SearchRestaurantsQuerySchema.parse(raw);

    const where: {
      OR?: { name: { contains: string } }[];
      AND?: object[];
    } = {};

    if (q.q?.trim()) {
      const term = q.q.trim();
      where.OR = [{ name: { contains: term } }];
    }

    const tagFilter = q.tags
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const rows = await prisma.restaurant.findMany({
      where,
      take: q.limit,
      orderBy: { name: "asc" },
    });

    const filtered = tagFilter?.length
      ? rows.filter((r) => {
          const tags = parseJsonArray(r.tags);
          return tagFilter.every((t) => tags.some((x) => x.includes(t)));
        })
      : rows;

    return {
      body: {
        restaurants: filtered.map((r) => restaurantPublic(r)),
      },
    };
  });
}
