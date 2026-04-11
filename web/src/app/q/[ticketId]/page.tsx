import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getRestaurantTheme,
  RestaurantLogo,
} from "@/components/restaurant-branding";

export default async function QueueTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const ticket = await prisma.queueTicket.findUnique({
    where: { id: ticketId },
    include: { restaurant: true },
  });

  if (!ticket) notFound();

  const waitingAhead =
    ticket.status === "waiting"
      ? await prisma.queueTicket.count({
          where: {
            restaurantId: ticket.restaurantId,
            status: "waiting",
            createdAt: { lt: ticket.createdAt },
          },
        })
      : 0;

  const theme = getRestaurantTheme(ticket.restaurant.name);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 px-4 py-6 md:px-8 md:py-10">
      <div className="w-full space-y-6">
        <section className="pixel-panel retro-grid p-5 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="pixel-kicker" style={{ color: theme.accent }}>
                queue ticket
              </p>
              <h1 className="pixel-heading mt-3 text-xl md:text-3xl">take your place</h1>
              <p className="muted-copy mt-4 text-2xl md:text-3xl">{ticket.restaurant.name}</p>
            </div>
            <div className="pixel-logo-frame p-3" style={{ color: theme.accent }}>
              <RestaurantLogo className="h-20 w-20 md:h-24 md:w-24" name={ticket.restaurant.name} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="pixel-panel-soft p-4">
              <p className="pixel-kicker" style={{ color: theme.accent }}>
                number
              </p>
              <p className="mt-3 text-6xl" style={{ color: theme.accent }}>
                {ticket.publicNumber}
              </p>
            </div>
            <div className="pixel-panel-soft p-4">
              <p className="pixel-kicker" style={{ color: theme.accent }}>
                status
              </p>
              <p className="mt-3 text-4xl text-white">{ticket.status}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="pixel-panel-soft p-4">
              <dt className="pixel-kicker text-white">ahead</dt>
              <dd className="mt-2 text-3xl text-white">{waitingAhead}</dd>
            </div>
            <div className="pixel-panel-soft p-4">
              <dt className="pixel-kicker text-white">est wait</dt>
              <dd className="mt-2 text-3xl text-white">{ticket.estimatedWaitMin ?? "—"}</dd>
            </div>
            <div className="pixel-panel-soft p-4">
              <dt className="pixel-kicker text-white">party</dt>
              <dd className="mt-2 text-3xl text-white">{ticket.partySize}</dd>
            </div>
          </dl>

          <p className="muted-copy mt-6 text-xl">ticket id: {ticket.id}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="pixel-button text-white" href="/">
              Home
            </Link>
            <Link
              className="pixel-button"
              href={`/restaurants/${ticket.restaurantId}`}
              style={{ color: theme.accent }}
            >
              Restaurant
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
