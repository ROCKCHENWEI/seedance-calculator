import { prisma } from "@/lib/prisma";
import { withAuthJson } from "@/lib/api-route";
import { isReadOnlyDemoMode, readOnlyDemoMessage } from "@/lib/deployment-mode";
import { CreateRestaurantBodySchema } from "@/schemas";

export async function POST(request: Request) {
  return withAuthJson(request, "POST /api/v1/restaurants", async () => {
    if (isReadOnlyDemoMode()) {
      return {
        status: 503,
        body: { error: readOnlyDemoMessage() },
      };
    }

    const json = await request.json();
    const body = CreateRestaurantBodySchema.parse(json);

    const caps = body.capabilities ?? ["menu"];
    const tags = body.tags ?? [];

    const r = await prisma.restaurant.create({
      data: {
        name: body.name,
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address,
        tags: JSON.stringify(tags),
        capabilities: JSON.stringify(caps),
        provider: body.provider ?? "SkillTable",
        externalUrl: body.externalUrl || null,
        mcpStreamableUrl: body.mcpStreamableUrl || null,
        skillReferenceUrl: body.skillReferenceUrl || null,
      },
    });

    return {
      status: 201,
      body: {
        restaurant: {
          id: r.id,
          name: r.name,
          capabilities: caps,
        },
      },
    };
  });
}
