import { prisma } from "@/lib/prisma";
import { isReadOnlyDemoMode, readOnlyDemoMessage } from "@/lib/deployment-mode";

export async function logRequest(input: {
  route: string;
  traceId?: string;
  apiKeyId?: string;
  status: number;
  durationMs: number;
}) {
  if (isReadOnlyDemoMode()) {
    return;
  }

  try {
    await prisma.requestLog.create({
      data: {
        route: input.route,
        traceId: input.traceId,
        apiKeyId:
          input.apiKeyId && input.apiKeyId !== "env" ? input.apiKeyId : null,
        status: input.status,
        durationMs: input.durationMs,
      },
    });
  } catch {
    // ignore logging failures
  }
}

export async function metricsSummary() {
  if (isReadOnlyDemoMode()) {
    return {
      window_hours: 24,
      total_requests: null,
      by_route: [],
      mode: "read-only-demo",
      note: readOnlyDemoMessage(),
    };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [total, byRoute] = await Promise.all([
    prisma.requestLog.count({ where: { createdAt: { gte: since } } }),
    prisma.requestLog.groupBy({
      by: ["route"],
      where: { createdAt: { gte: since } },
      _count: { route: true },
      _avg: { durationMs: true },
    }),
  ]);

  return {
    window_hours: 24,
    total_requests: total,
    by_route: byRoute.map((r) => ({
      route: r.route,
      count: r._count.route,
      avg_duration_ms: r._avg.durationMs ?? 0,
    })),
  };
}
