import { withAuthJson } from "@/lib/api-route";
import { callNextForRestaurant } from "@/lib/services/queue";
import { CallNextBodySchema } from "@/schemas";

export async function POST(request: Request) {
  return withAuthJson(request, "POST /api/v1/queue/call-next", async () => {
    const json = await request.json();
    const body = CallNextBodySchema.parse(json);
    const result = await callNextForRestaurant(body.restaurant_id);
    if (!result.ok) {
      return {
        status: result.status,
        body: { error: result.message },
      };
    }
    return { body: result.ticket };
  });
}
