import { NextResponse } from "next/server";
import { joinQueue } from "@/lib/services/queue";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const formData = await request.formData();
  const rawPartySize = formData.get("partySize");

  let partySize = Number.parseInt(String(rawPartySize ?? "2"), 10);
  if (Number.isNaN(partySize)) partySize = 2;
  partySize = Math.max(1, Math.min(12, partySize));

  const result = await joinQueue({
    restaurantId: id,
    partySize,
  });

  if (!result.ok) {
    return NextResponse.redirect(
      new URL(
        `/restaurants/${id}?queueError=${encodeURIComponent(result.message)}`,
        request.url,
      ),
      303,
    );
  }

  return NextResponse.redirect(new URL(result.ticket.ticket_path, request.url), 303);
}
