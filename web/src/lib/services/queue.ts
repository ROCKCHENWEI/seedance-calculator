import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/json";
import { isReadOnlyDemoMode, readOnlyDemoMessage } from "@/lib/deployment-mode";

export async function joinQueue(input: {
  restaurantId: string;
  partySize: number;
}) {
  if (isReadOnlyDemoMode()) {
    return {
      ok: false as const,
      status: 503,
      message: readOnlyDemoMessage(),
    };
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: input.restaurantId },
  });
  if (!restaurant) {
    return { ok: false as const, status: 404, message: "Restaurant not found" };
  }

  const caps = parseJsonArray(restaurant.capabilities);
  if (!caps.includes("queue")) {
    return {
      ok: false as const,
      status: 400,
      message: "Restaurant does not support queue",
    };
  }

  return prisma.$transaction(async (tx) => {
    const total = await tx.queueTicket.count({
      where: { restaurantId: input.restaurantId },
    });
    const waiting = await tx.queueTicket.count({
      where: { restaurantId: input.restaurantId, status: "waiting" },
    });
    const n = total + 1;
    const publicNumber = `A${String(n).padStart(2, "0")}`;
    const position = waiting + 1;
    const estimatedWaitMin = Math.max(5, waiting * 4);

    const ticket = await tx.queueTicket.create({
      data: {
        restaurantId: input.restaurantId,
        status: "waiting",
        partySize: input.partySize,
        publicNumber,
        queuePosition: position,
        estimatedWaitMin,
      },
    });

    return {
      ok: true as const,
      ticket: {
        ticket_id: ticket.id,
        restaurant_id: ticket.restaurantId,
        status: ticket.status,
        public_number: ticket.publicNumber,
        queue_position: ticket.queuePosition,
        estimated_wait_min: ticket.estimatedWaitMin,
        party_size: ticket.partySize,
        ticket_path: `/q/${ticket.id}`,
      },
    };
  });
}

export async function getQueueStatus(ticketId: string) {
  const ticket = await prisma.queueTicket.findUnique({
    where: { id: ticketId },
    include: { restaurant: true },
  });
  if (!ticket) {
    return { ok: false as const, status: 404, message: "Ticket not found" };
  }

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

  return {
    ok: true as const,
    ticket: {
      ticket_id: ticket.id,
      restaurant_id: ticket.restaurantId,
      restaurant_name: ticket.restaurant.name,
      status: ticket.status,
      public_number: ticket.publicNumber,
      queue_position: ticket.queuePosition,
      estimated_wait_min: ticket.estimatedWaitMin,
      party_size: ticket.partySize,
      waiting_ahead: waitingAhead,
      updated_at: ticket.updatedAt.toISOString(),
      ticket_path: `/q/${ticket.id}`,
    },
  };
}

export async function callNextForRestaurant(restaurantId: string) {
  if (isReadOnlyDemoMode()) {
    return {
      ok: false as const,
      status: 503,
      message: readOnlyDemoMessage(),
    };
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  if (!restaurant) {
    return { ok: false as const, status: 404, message: "Restaurant not found" };
  }

  const next = await prisma.queueTicket.findFirst({
    where: { restaurantId, status: "waiting" },
    orderBy: { createdAt: "asc" },
  });

  if (!next) {
    return { ok: false as const, status: 404, message: "No waiting tickets" };
  }

  const updated = await prisma.queueTicket.update({
    where: { id: next.id },
    data: { status: "called", queuePosition: 0 },
  });

  return {
    ok: true as const,
    ticket: {
      ticket_id: updated.id,
      public_number: updated.publicNumber,
      status: updated.status,
    },
  };
}
