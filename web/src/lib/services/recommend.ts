import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json";
import type { RecommendRequest } from "@/schemas";
import { capabilitiesList, haversineKm } from "@/lib/services/restaurant";

type NextAction =
  | { type: "view_menu"; restaurant_id: string }
  | { type: "join_queue"; restaurant_id: string }
  | { type: "external_booking"; url: string }
  | {
      type: "mcp_skill";
      streamable_http_url: string;
      skill_reference_url?: string;
    };

export type RecommendCandidate = {
  restaurant_id: string;
  name: string;
  match_reason: string;
  caveats: string[];
  confidence: number;
  data_gaps: string[];
  next_actions: NextAction[];
  distance_km?: number;
  estimated_avg_price_cents?: number | null;
};

export async function recommendMeals(
  input: RecommendRequest,
  traceId: string,
): Promise<{
  candidates: RecommendCandidate[];
}> {
  const restaurants = await prisma.restaurant.findMany({
    include: {
      categories: { include: { items: true } },
    },
  });

  const dietary = new Set((input.dietary ?? []).map((d) => d.toLowerCase()));
  const wantsNoSpicy =
    dietary.has("no_spicy") ||
    dietary.has("不吃辣") ||
    dietary.has("no spicy");

  const budgetCents = input.budget_per_person
    ? Math.round(input.budget_per_person * 100)
    : null;

  const scored: {
    r: (typeof restaurants)[0];
    score: number;
    reason: string;
    caveats: string[];
    gaps: string[];
    distance?: number;
    avg?: number | null;
  }[] = [];

  for (const r of restaurants) {
    const tags = parseJsonArray(r.tags);
    const items = r.categories.flatMap((c) => c.items);
    const avg =
      items.length > 0
        ? Math.round(
            items.filter((i) => i.available).reduce((a, b) => a + b.priceCents, 0) /
              Math.max(1, items.filter((i) => i.available).length),
          )
        : null;

    if (wantsNoSpicy) {
      const spicy = items.filter(
        (i) => i.available && (i.spiceLevel ?? 0) >= 2,
      );
      const mild = items.filter(
        (i) => i.available && (i.spiceLevel ?? 0) <= 1,
      );
      if (mild.length === 0 && spicy.length > 0) {
        continue;
      }
    }

    if (budgetCents !== null && avg !== null && avg > budgetCents * 1.2) {
      continue;
    }

    let distance: number | undefined;
    if (
      input.location?.latitude != null &&
      input.location?.longitude != null &&
      r.latitude != null &&
      r.longitude != null
    ) {
      distance = haversineKm(
        input.location.latitude,
        input.location.longitude,
        r.latitude,
        r.longitude,
      );
    }

    const gaps: string[] = [];
    if (avg === null) gaps.push("menu_prices_incomplete");
    if (r.latitude == null || r.longitude == null) gaps.push("geo_missing");

    let score = 50;
    const reasons: string[] = [];

    if (input.preference_tags?.length) {
      const hits = input.preference_tags.filter((t) =>
        tags.some((tag) => tag.includes(t)),
      );
      score += hits.length * 8;
      if (hits.length) reasons.push(`matches tags: ${hits.join(", ")}`);
    }

    if (input.scene?.includes("business")) {
      if (tags.some((t) => t.includes("商务") || t.includes("quiet")))
        score += 6;
    }

    if (distance != null) {
      score += Math.max(0, 20 - Math.min(20, distance * 2));
      reasons.push(`about ${distance.toFixed(1)} km away`);
    } else {
      reasons.push("fits current filters");
    }

    if (budgetCents !== null && avg !== null) {
      if (avg <= budgetCents) {
        score += 10;
        reasons.push("within budget signal");
      }
    }

    const caveats: string[] = [];
    if (wantsNoSpicy) caveats.push("verify spice level with the kitchen when ordering");

    scored.push({
      r,
      score,
      reason: reasons.join("; ") || "general fit",
      caveats,
      gaps,
      distance,
      avg,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);

  const candidates: RecommendCandidate[] = [];
  for (const row of top) {
    const caps = capabilitiesList(row.r.capabilities);
    const next_actions: NextAction[] = [];
    if (caps.includes("menu")) {
      next_actions.push({ type: "view_menu", restaurant_id: row.r.id });
    }
    if (caps.includes("queue")) {
      next_actions.push({ type: "join_queue", restaurant_id: row.r.id });
    }
    if (row.r.externalUrl) {
      next_actions.push({
        type: "external_booking",
        url: row.r.externalUrl,
      });
    }
    if (row.r.mcpStreamableUrl) {
      next_actions.push({
        type: "mcp_skill",
        streamable_http_url: row.r.mcpStreamableUrl,
        skill_reference_url: row.r.skillReferenceUrl ?? undefined,
      });
    }

    const confidence =
      row.gaps.length === 0 ? 0.85 : Math.max(0.35, 0.85 - row.gaps.length * 0.15);

    candidates.push({
      restaurant_id: row.r.id,
      name: row.r.name,
      match_reason: row.reason,
      caveats: row.caveats,
      confidence,
      data_gaps: row.gaps,
      next_actions,
      distance_km: row.distance,
      estimated_avg_price_cents: row.avg,
    });
  }

  void traceId;

  return { candidates };
}
