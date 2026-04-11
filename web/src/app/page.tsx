import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json";
import {
  getRestaurantTheme,
  RestaurantLogo,
  restaurantThemeVars,
} from "@/components/restaurant-branding";

export default async function Home() {
  await connection();

  const allRestaurants = await prisma.restaurant.findMany({
    include: {
      categories: {
        include: {
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const restaurants = allRestaurants
    .filter((restaurant) => restaurant.name === "金谷园饺子馆")
    .slice(0, 1);

  const mcpCount = restaurants.filter((restaurant) => restaurant.mcpStreamableUrl).length;
  const queueCount = restaurants.filter((restaurant) =>
    parseJsonArray(restaurant.capabilities).includes("queue"),
  ).length;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-10">
      <div className="w-full space-y-8">
        <section className="pixel-panel retro-grid p-5 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <p className="pixel-kicker text-white">Agent-first dining selector</p>
              <h1 className="pixel-heading mt-4 text-2xl leading-relaxed md:text-4xl xl:text-5xl">
                SkillTable
              </h1>
              <div
                className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed md:text-lg"
                lang="zh-CN"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-[#00f5ff]">
                    一句话定位
                  </p>
                  <p className="muted-copy mt-2">
                    SkillTable 是第一个专为 AI Agent 设计的餐饮技能
                    （Dining Skills）开放平台，让 Agent 不再是&quot;聊天工具&quot;，而是能真正帮你决定吃什么、在哪吃、怎么点的智能美食参谋。
                  </p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-[#ffe500]">
                    核心概念
                  </p>
                  <p className="muted-copy mt-2">
                    传统的大众点评是&quot;人找信息&quot;，而 SkillTable 构建的是&quot;Agent 代你决策&quot;的新范式。
                  </p>
                  <p className="muted-copy mt-2">
                    我们将餐饮决策拆解为可编排的 Skills（技能模块）,
                    从口味分析、预算匹配、排队预测，到 dietary restrictions
                    过滤、社交场景推荐。开发者可像搭积木一样组合这些 Skills，构建专属的用餐 Agent；普通用户则直接享用由 Agent 驱动的&quot;零思考点餐&quot;体验。
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:w-[28rem]">
              <div className="pixel-panel-soft p-4">
                <p className="pixel-kicker text-[#ffe500]">Featured Example</p>
                <p className="mt-3 text-5xl">{restaurants.length}</p>
              </div>
              <div className="pixel-panel-soft p-4">
                <p className="pixel-kicker text-[#ff5a36]">Queue In Example</p>
                <p className="mt-3 text-5xl">{queueCount}</p>
              </div>
              <div className="pixel-panel-soft p-4">
                <p className="pixel-kicker text-[#6dff3b]">MCP In Example</p>
                <p className="mt-3 text-5xl">{mcpCount}</p>
              </div>
              <div className="pixel-panel-soft p-4">
                <p className="pixel-kicker text-[#ffffff]">Core Routes</p>
                <p className="mt-3 text-2xl">DOCS / DASH / JSON</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="pixel-button text-white" href="/docs">
              Open Docs
            </Link>
            <Link className="pixel-button text-[#00f5ff]" href="/dashboard">
              Operator Dash
            </Link>
            <a className="pixel-button text-[#ffe500]" href="/.well-known/skilltable-skills.json">
              Skill Manifest
            </a>
            <a className="pixel-button text-[#6dff3b]" href="/api/mcp/info">
              Site MCP
            </a>
            <a className="pixel-button text-[#ff5a36]" href="/openapi.yaml">
              OpenAPI
            </a>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <p className="pixel-kicker text-[#ffffff]">Restaurant options</p>
          </div>

          {restaurants.length === 0 ? (
            <div className="pixel-panel p-6 text-xl text-white md:text-2xl">
              未找到「金谷园饺子馆」示例数据，请先运行 <code>npm run db:seed</code>。
            </div>
          ) : (
            <div className="grid gap-6">
              {restaurants.map((restaurant) => {
                const theme = getRestaurantTheme(restaurant.name);
                const tags = parseJsonArray(restaurant.tags).slice(0, 4);
                const capabilities = parseJsonArray(restaurant.capabilities);
                const menuItemCount = restaurant.categories.reduce(
                  (sum, category) => sum + category.items.length,
                  0,
                );

                return (
                  <article
                    key={restaurant.id}
                    className="pixel-panel retro-grid p-5 transition-transform duration-150 hover:-translate-x-1 hover:-translate-y-1"
                    style={restaurantThemeVars(theme)}
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="pixel-kicker" style={{ color: theme.accent }}>
                          {theme.badge}
                        </p>
                        <h3
                          className="mt-4 break-words text-3xl leading-tight md:text-5xl"
                          style={{ color: theme.accent }}
                        >
                          {restaurant.name}
                        </h3>
                        <p className="muted-copy mt-4 text-xl leading-tight md:text-2xl">
                          {restaurant.address ?? "No address configured"}
                        </p>
                      </div>

                      <div
                        className="pixel-logo-frame shrink-0 p-3"
                        style={{ color: theme.accent }}
                      >
                        <RestaurantLogo className="h-20 w-20 md:h-24 md:w-24" name={restaurant.name} />
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 text-xl md:grid-cols-3">
                      <div className="pixel-panel-soft p-3">
                        <p className="pixel-kicker" style={{ color: theme.accent }}>
                          code
                        </p>
                        <p className="mt-2 text-3xl">{theme.code}</p>
                      </div>
                      <div className="pixel-panel-soft p-3">
                        <p className="pixel-kicker" style={{ color: theme.accent }}>
                          menu items
                        </p>
                        <p className="mt-2 text-3xl">{menuItemCount}</p>
                      </div>
                      <div className="pixel-panel-soft p-3">
                        <p className="pixel-kicker" style={{ color: theme.accent }}>
                          live skills
                        </p>
                        <p className="mt-2 text-3xl">
                          {capabilities.includes("queue") ? "MENU + Q" : "MENU"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={tag} className="pixel-chip" style={{ color: theme.accent }}>
                          {tag}
                        </span>
                      ))}
                      {restaurant.mcpStreamableUrl ? (
                        <span className="pixel-chip text-white">streamable MCP</span>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        className="pixel-button"
                        href={`/restaurants/${restaurant.id}`}
                        style={{ color: theme.accent }}
                      >
                        Open Option
                      </Link>
                      <a
                        className="pixel-button text-white"
                        href={`/api/v1/restaurants/${restaurant.id}/menu`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Menu Json
                      </a>
                      <a
                        className="pixel-button text-[#6dff3b]"
                        href="/api/mcp/info"
                        rel="noreferrer"
                        target="_blank"
                      >
                        Connect Site MCP
                      </a>
                      {restaurant.mcpStreamableUrl ? (
                        <a
                          className="pixel-button"
                          href={restaurant.mcpStreamableUrl}
                          rel="noreferrer"
                          style={{ color: theme.accent }}
                          target="_blank"
                        >
                          MCP Skill
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
