import { withAuthJson } from "@/lib/api-route";
import { joinQueue } from "@/lib/services/queue";
import { QueueJoinBodySchema } from "@/schemas";

export async function POST(request: Request) {
  return withAuthJson(request, "POST /api/v1/queue/join", async () => {
    const json = await request.json();
    const body = QueueJoinBodySchema.parse(json);
    const result = await joinQueue({
      restaurantId: body.restaurant_id,
      partySize: body.party_size,
    });

    if (!result.ok) {
      return {
        status: result.status,
        body: { error: result.message },
      };
    }

    return { body: result.ticket };
  });
}
