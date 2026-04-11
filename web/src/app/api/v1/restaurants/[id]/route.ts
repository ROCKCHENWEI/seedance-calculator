import { prisma } from "@/lib/prisma";
import { withAuthJson } from "@/lib/api-route";
import { restaurantPublic } from "@/lib/restaurant-public";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return withAuthJson(request, "GET /api/v1/restaurants/:id", async () => {
    const r = await prisma.restaurant.findUnique({ where: { id } });
    if (!r) {
      return { status: 404, body: { error: "Not found" } };
    }

    return {
      body: {
        restaurant: restaurantPublic(r),
      },
    };
  });
}
