import type { NextResponse } from "next/server";
import { NextResponse as NR } from "next/server";
import { authenticateApiKey } from "@/lib/auth";
import { logRequest } from "@/lib/services/metrics";
import { newTraceId } from "@/lib/trace";

export async function withAuthJson(
  request: Request,
  route: string,
  handler: (ctx: {
    traceId: string;
    apiKeyId: string;
  }) => Promise<{ status?: number; body: Record<string, unknown> }>,
): Promise<NextResponse> {
  const started = Date.now();
  const traceId =
    request.headers.get("x-trace-id")?.trim() || newTraceId();

  const auth = await authenticateApiKey(request);
  if (!auth.ok) {
    const res = NR.json(
      { error: auth.message, trace_id: traceId },
      { status: auth.status, headers: { "x-trace-id": traceId } },
    );
    void logRequest({
      route,
      traceId,
      status: auth.status,
      durationMs: Date.now() - started,
    });
    return res;
  }

  try {
    const out = await handler({
      traceId,
      apiKeyId: auth.apiKeyId,
    });
    const status = out.status ?? 200;
    const res = NR.json(
      { trace_id: traceId, ...out.body },
      { status, headers: { "x-trace-id": traceId } },
    );
    void logRequest({
      route,
      traceId,
      apiKeyId: auth.apiKeyId,
      status,
      durationMs: Date.now() - started,
    });
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    const res = NR.json(
      { error: message, trace_id: traceId },
      { status: 500, headers: { "x-trace-id": traceId } },
    );
    void logRequest({
      route,
      traceId,
      apiKeyId: auth.apiKeyId,
      status: 500,
      durationMs: Date.now() - started,
    });
    return res;
  }
}
