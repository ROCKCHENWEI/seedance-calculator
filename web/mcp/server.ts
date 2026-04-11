/**
 * SkillTable MCP (stdio). Mirrors the same tool contract locally.
 *
 * Env:
 * - SKILLTABLE_API_KEY (required)
 * - SKILLTABLE_API_BASE_URL (optional, used for returned URLs; default http://localhost:3000)
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildSkillTableMcpServer } from "@/lib/mcp/skilltable-server";

async function main() {
  const base = (
    process.env.SKILLTABLE_API_BASE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
  const apiKey = process.env.SKILLTABLE_API_KEY ?? "";

  if (!apiKey) {
    throw new Error("Missing SKILLTABLE_API_KEY for stdio MCP startup.");
  }

  const server = buildSkillTableMcpServer({
    origin: base,
    hasApiKey: true,
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
