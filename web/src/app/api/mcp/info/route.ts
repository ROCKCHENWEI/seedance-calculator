import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    name: "SkillTable MCP",
    transport: "streamable-http",
    endpoint: `${origin}/api/mcp`,
    manifest: `${origin}/.well-known/skilltable-skills.json`,
    openapi: `${origin}/openapi.yaml`,
    auth: {
      type: "bearer_or_header",
      bearer: "Authorization: Bearer <api_key>",
      header: "X-API-Key: <api_key>",
    },
    notes: [
      "Connect agents to /api/mcp.",
      "Use this /api/mcp/info route only for human-readable setup metadata.",
      "POST clients should send Content-Type: application/json.",
      "POST clients should send Accept: application/json, text/event-stream.",
    ],
    quick_tools: [
      "skilltable_recommend",
      "skilltable_browse_restaurants",
      "skilltable_get_menu",
      "skilltable_queue_status",
    ],
  });
}
