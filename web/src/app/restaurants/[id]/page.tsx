import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json";
import { isReadOnlyDemoMode, readOnlyDemoMessage } from "@/lib/deployment-mode";
import {
  getRestaurantTheme,
  RestaurantLogo,
} from "@/components/restaurant-branding";

export default async function RestaurantPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ queueError?: string }>;
}) {
  const { id } = await params;
  const { queueError } = await searchParams;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          items: {
            orderBy: {
              name: "asc",
            },
          },
        },
      },
      tickets: {
        where: {
          status: "waiting",
        },
      },
    },
  });

  if (!restaurant) notFound();

  const theme = getRestaurantTheme(restaurant.name);
  const tags = parseJsonArray(restaurant.tags);
  const capabilities = parseJsonArray(restaurant.capabilities);
  const readOnlyMode = isReadOnlyDemoMode();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-10">
      <div className="w-full space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link className="pixel-button text-white" href="/">
            Back Home
          </Link>
          <Link className="pixel-button" href="/docs" style={{ color: theme.accent }}>
            Docs
          </Link>
        </div>

        {queueError ? (
          <div className="pixel-panel p-4 text-xl text-[#ff5a36]" role="alert">
            queue error: {queueError}
          </div>
        ) : null}

        {readOnlyMode ? (
          <div className="pixel-panel p-4 text-xl text-[#ffe500]" role="status">
            {readOnlyDemoMessage()}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="pixel-panel retro-grid p-5 md:p-7">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="pixel-kicker" style={{ color: theme.accent }}>
                  {theme.badge}
                </p>
                <h1
                  className="mt-4 break-words text-4xl leading-tight md:text-6xl"
                  style={{ color: theme.accent }}
                >
                  {restaurant.name}
                </h1>
                <p className="muted-copy mt-4 text-2xl leading-tight md:text-3xl">
                  {restaurant.address ?? "No address configured"}
                </p>
              </div>

              <div className="pixel-logo-frame shrink-0 p-3" style={{ color: theme.accent }}>
                <RestaurantLogo className="h-24 w-24 md:h-28 md:w-28" name={restaurant.name} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="pixel-chip" style={{ color: theme.accent }}>
                  {tag}
                </span>
              ))}
              {restaurant.mcpStreamableUrl ? (
                <span className="pixel-chip text-white">linked MCP</span>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="pixel-panel-soft p-4">
                <p className="pixel-kicker" style={{ color: theme.accent }}>
                  provider
                </p>
                <p className="mt-2 text-2xl text-white">{restaurant.provider}</p>
              </div>
              <div className="pixel-panel-soft p-4">
                <p className="pixel-kicker" style={{ color: theme.accent }}>
                  queue
                </p>
                <p className="mt-2 text-2xl text-white">{restaurant.tickets.length} waiting</p>
              </div>
              <div className="pixel-panel-soft p-4">
                <p className="pixel-kicker" style={{ color: theme.accent }}>
                  capabilities
                </p>
                <p className="mt-2 text-2xl text-white">{capabilities.join(" / ")}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="pixel-button text-white"
                href={`/api/v1/restaurants/${restaurant.id}`}
                rel="noreferrer"
                target="_blank"
              >
                Detail Json
              </a>
              <a
                className="pixel-button"
                href={`/api/v1/restaurants/${restaurant.id}/menu`}
                rel="noreferrer"
                style={{ color: theme.accent }}
                target="_blank"
              >
                Menu Json
              </a>
              {restaurant.mcpStreamableUrl ? (
                <a
                  className="pixel-button"
                  href={restaurant.mcpStreamableUrl}
                  rel="noreferrer"
                  style={{ color: theme.accent }}
                  target="_blank"
                >
                  External MCP
                </a>
              ) : null}
            </div>

            {capabilities.includes("queue") && !readOnlyMode ? (
              <form
                action={`/restaurants/${restaurant.id}/join`}
                className="pixel-panel-soft mt-8 space-y-4 p-4"
                method="post"
              >
                <div>
                  <label className="pixel-kicker" htmlFor="partySize" style={{ color: theme.accent }}>
                    party size
                  </label>
                  <input
                    className="pixel-input mt-3"
                    defaultValue={2}
                    id="partySize"
                    max={12}
                    min={1}
                    name="partySize"
                    type="number"
                  />
                </div>
                <button className="pixel-button" style={{ color: theme.accent }} type="submit">
                  Take Number
                </button>
              </form>
            ) : capabilities.includes("queue") ? (
              <div className="pixel-panel-soft mt-8 p-4 text-xl text-white">
                Queue actions are available locally. The deployed Vercel demo is read-only.
              </div>
            ) : null}
          </article>

          <section className="space-y-5">
            {restaurant.categories.map((category) => (
              <article key={category.id} className="pixel-panel p-5">
                <p className="pixel-kicker" style={{ color: theme.accent }}>
                  category
                </p>
                <h2 className="pixel-heading mt-3 text-lg md:text-2xl">{category.name}</h2>
                <div className="mt-5 grid gap-3">
                  {category.items.map((item) => (
                    <div key={item.id} className="pixel-panel-soft p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-2xl text-white md:text-3xl">{item.name}</h3>
                          {item.description ? (
                            <p className="muted-copy mt-1 text-xl">{item.description}</p>
                          ) : null}
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-3xl" style={{ color: theme.accent }}>
                            {(item.priceCents / 100).toFixed(0)} CNY
                          </p>
                          <p className="muted-copy text-xl">
                            spice {item.spiceLevel ?? 0} / {item.available ? "ready" : "sold out"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </section>
      </div>
    </main>
  );
}
