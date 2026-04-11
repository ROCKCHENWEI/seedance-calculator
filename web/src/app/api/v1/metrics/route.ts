import { withAuthJson } from "@/lib/api-route";
import { metricsSummary } from "@/lib/services/metrics";

export async function GET(request: Request) {
  return withAuthJson(request, "GET /api/v1/metrics", async () => {
    const summary = await metricsSummary();
    return { body: summary };
  });
}
