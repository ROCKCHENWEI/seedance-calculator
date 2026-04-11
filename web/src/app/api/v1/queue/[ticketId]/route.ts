import { withAuthJson } from "@/lib/api-route";
import { getQueueStatus } from "@/lib/services/queue";

export async function GET(
  request: Request,
  context: { params: Promise<{ ticketId: string }> },
) {
  const { ticketId } = await context.params;
  return withAuthJson(request, "GET /api/v1/queue/:ticketId", async () => {
    const result = await getQueueStatus(ticketId);
    if (!result.ok) {
      return { status: result.status, body: { error: result.message } };
    }
    return { body: result.ticket };
  });
}
