import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json";
import {
  getRestaurantTheme,
  RestaurantLogo,
} from "@/components/restaurant-branding";

export default async function DashboardPage() {
  await connection();

  const restaurants = await prisma.restaurant.findMany({
    include: {
      tickets: {
        where: {
          status: "waiting",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-10">
      <div className="w-full space-y-6">
        <section className="pixel-panel retro-grid p-5 md:p-8">
          <p className="pixel-kicker text-white">Operator mode</p>
          <h1 className="pixel-heading mt-4 text-2xl md:text-4xl">dashboard / skills / queue</h1>
          <p className="muted-copy mt-4 max-w-3xl text-2xl leading-tight md:text-3xl">
            Same 8-bit interface, but focused on platform control: demo key, linked skills,
            and live queue status per restaurant.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="pixel-button text-[#00f5ff]" href="/">
              Home
            </Link>
            <Link className="pixel-button text-white" href="/docs">
              Docs
            </Link>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="pixel-panel p-5">
            <p className="pixel-kicker text-[#ffe500]">Runtime</p>
            <h2 className="pixel-heading mt-3 text-lg md:text-2xl">demo access</h2>
            <dl className="mt-5 space-y-4 text-xl md:text-2xl">
              <div>
                <dt className="pixel-kicker text-white">Auth mode</dt>
                <dd className="mt-2 text-3xl text-[#ffe500]">bearer / x-api-key</dd>
              </div>
              <div>
                <dt className="pixel-kicker text-white">Fallback env</dt>
                <dd className="mt-2 text-white">SKILLTABLE_API_KEYS</dd>
              </div>
              <div>
                <dt className="pixel-kicker text-white">Restaurants</dt>
                <dd className="mt-2 text-white">{restaurants.length}</dd>
              </div>
            </dl>
          </article>

          <section className="grid gap-4">
            {restaurants.map((restaurant) => {
              const theme = getRestaurantTheme(restaurant.name);
              const capabilities = parseJsonArray(restaurant.capabilities);

              return (
                <article key={restaurant.id} className="pixel-panel p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="pixel-logo-frame p-2" style={{ color: theme.accent }}>
                        <RestaurantLogo className="h-14 w-14" name={restaurant.name} />
                      </div>
                      <div>
                        <p className="pixel-kicker" style={{ color: theme.accent }}>
                          {theme.badge}
                        </p>
                        <h2 className="mt-2 text-2xl md:text-3xl" style={{ color: theme.accent }}>
                          {restaurant.name}
                        </h2>
                      </div>
                    </div>

                    <div className="grid gap-2 text-xl md:text-2xl md:text-right">
                      <p className="text-white">
                        waiting queue: <span style={{ color: theme.accent }}>{restaurant.tickets.length}</span>
                      </p>
                      <p className="muted-copy">
                        {capabilities.includes("queue") ? "menu + queue live" : "menu only"}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </section>
      </div>
    </main>
  );
}
