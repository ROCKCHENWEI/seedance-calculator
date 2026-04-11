import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authenticateApiKey } from "@/lib/auth";
import { logRequest } from "@/lib/services/metrics";
import { newTraceId } from "@/lib/trace";
import { buildSkillTableMcpServer } from "@/lib/mcp/skilltable-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-API-Key, Accept, Mcp-Protocol-Version, Mcp-Session-Id, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Protocol-Version, Mcp-Session-Id",
  Vary: "Origin",
} as const;

function withCors(response: Response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(BASE_CORS_HEADERS)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function mcpAuthError(status: number, message: string) {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message,
      },
      id: null,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

async function handleMcp(request: Request) {
  const started = Date.now();
  const traceId =
    request.headers.get("x-trace-id")?.trim() || newTraceId();
  const auth = await authenticateApiKey(request);
  if (!auth.ok) {
    const response = withCors(mcpAuthError(auth.status, auth.message));
    response.headers.set("x-trace-id", traceId);
    void logRequest({
      route: `${request.method} /api/mcp`,
      traceId,
      status: auth.status,
      durationMs: Date.now() - started,
    });
    return response;
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  const server = buildSkillTableMcpServer({
    origin: new URL(request.url).origin,
    hasApiKey: true,
  });
  await server.connect(transport);

  const response = await transport.handleRequest(request, {
    authInfo: {
      token: auth.token,
      clientId: auth.apiKeyId,
      scopes: ["skilltable"],
      extra: {
        apiKeyId: auth.apiKeyId,
      },
    },
  });

  const corsResponse = withCors(response);
  corsResponse.headers.set("x-trace-id", traceId);
  void logRequest({
    route: `${request.method} /api/mcp`,
    traceId,
    apiKeyId: auth.apiKeyId,
    status: response.status,
    durationMs: Date.now() - started,
  });
  return corsResponse;
}

export async function POST(request: Request) {
  return handleMcp(request);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: BASE_CORS_HEADERS,
  });
}
