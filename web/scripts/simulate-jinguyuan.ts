/**
 * Simulated agent run: SkillTable HTTP API against seeded「金谷园饺子馆」.
 * Start dev server first: npm run dev
 *
 * Official MCP (streamable HTTP) for full Q&A lives at the URL in seed / restaurant detail.
 * @see https://github.com/JinGuYuan/jinguyuan-dumpling-skill
 */
const base = (
  process.env.SKILLTABLE_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
const key = process.env.SKILLTABLE_API_KEY ?? "sk_dev_demo";

const auth = {
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
} as const;

async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { ...auth, ...init?.headers },
  });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);
  if (!res.ok) {
    console.error("HTTP", res.status, data);
    throw new Error(String(res.status));
  }
  return data;
}

async function main() {
  console.log("SkillTable simulate — 金谷园饺子馆 (HTTP 层)\n");
  console.log("BASE:", base, "\n");

  const search = await j<{
    restaurants: { id: string; name: string; mcp_streamable_url: string | null }[];
  }>(`/api/v1/restaurants/search?q=${encodeURIComponent("金谷园")}`);
  const r0 = search.restaurants[0];
  if (!r0) {
    console.error("No restaurant matched. Run: npm run db:seed");
    process.exit(1);
  }
  console.log("1) search?q=金谷园 →", r0.name, r0.id);
  console.log("   mcp_streamable_url:", r0.mcp_streamable_url);

  const detail = await j<{ restaurant: Record<string, unknown> }>(
    `/api/v1/restaurants/${r0.id}`,
  );
  console.log("\n2) GET restaurant → provider:", detail.restaurant.provider);
  console.log("   skill_reference_url:", detail.restaurant.skill_reference_url);

  const menu = await j<{ categories: unknown[]; note?: string }>(
    `/api/v1/restaurants/${r0.id}/menu`,
  );
  console.log("\n3) GET menu → categories:", menu.categories.length);
  if (menu.note) console.log("   note:", menu.note);

  const rec = await j<{ candidates: { name: string; next_actions: unknown[] }[] }>(
    `/api/v1/recommend`,
    {
      method: "POST",
      body: JSON.stringify({
        location: { latitude: 39.962, longitude: 116.357 },
        budget_per_person: 80,
        preference_tags: ["饺子"],
      }),
    },
  );
  const hit = rec.candidates.find((c) => c.name.includes("金谷园"));
  console.log("\n4) POST recommend (饺子 @ 北邮附近) →");
  if (hit) {
    console.log("   candidate:", hit.name);
    console.log(
      "   next_actions:",
      JSON.stringify(hit.next_actions, null, 2),
    );
  } else {
    console.log("   (金谷园 not in top 3 for this seed — try raising budget or tags)");
  }

  const join = await j<{
    ticket_id: string;
    ticket_path: string;
    public_number: string;
  }>(`/api/v1/queue/join`, {
    method: "POST",
    body: JSON.stringify({ restaurant_id: r0.id, party_size: 2 }),
  });
  console.log("\n5) queue join →", join.public_number, join.ticket_path);
  console.log(
    "\nDone. 人机票据页:",
    `${base}${join.ticket_path}`,
  );
  console.log(
    "\n若要使用官方金谷园 MCP（排队细则/Wi‑Fi/外卖等），在客户端配置 streamable-http URL：",
    r0.mcp_streamable_url,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
