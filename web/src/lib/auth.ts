import { prisma } from "@/lib/prisma";

export type AuthResult =
  | { ok: true; apiKeyId: string; token: string }
  | { ok: false; status: 401; message: string };

function envKeys(): string[] {
  const raw = process.env.SKILLTABLE_API_KEYS;
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function apiKeyTokenFromRequest(request: Request): string | null {
  const header =
    request.headers.get("authorization") ?? request.headers.get("Authorization");
  const xKey = request.headers.get("x-api-key") ?? request.headers.get("X-API-Key");

  let token: string | null = null;
  if (header) {
    const [scheme, ...rest] = header.trim().split(/\s+/);
    if (scheme?.toLowerCase() === "bearer" && rest.length > 0) {
      token = rest.join(" ").trim();
    }
  } else if (xKey) {
    token = xKey.trim();
  }

  return token;
}

export async function authenticateApiKey(
  request: Request,
): Promise<AuthResult> {
  const token = apiKeyTokenFromRequest(request);

  if (!token) {
    return { ok: false, status: 401, message: "Missing API key" };
  }

  const row = await prisma.apiKey.findUnique({ where: { key: token } });
  if (row) {
    return { ok: true, apiKeyId: row.id, token };
  }

  if (envKeys().includes(token)) {
    return { ok: true, apiKeyId: "env", token };
  }

  return { ok: false, status: 401, message: "Invalid API key" };
}
