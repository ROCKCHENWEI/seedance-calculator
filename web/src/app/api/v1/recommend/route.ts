import { recommendMeals } from "@/lib/services/recommend";
import { withAuthJson } from "@/lib/api-route";
import { RecommendRequestSchema } from "@/schemas";

export async function POST(request: Request) {
  return withAuthJson(request, "POST /api/v1/recommend", async ({ traceId }) => {
    const json = await request.json();
    const parsed = RecommendRequestSchema.parse(json);
    const { candidates } = await recommendMeals(parsed, traceId);
    return { body: { candidates } };
  });
}
