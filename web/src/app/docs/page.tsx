import Link from "next/link";
import { RestaurantLogo, getRestaurantTheme } from "@/components/restaurant-branding";

export default function DocsPage() {
  const jinguyuanTheme = getRestaurantTheme("金谷园饺子馆");

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10">
      <div className="w-full space-y-6">
        <section className="pixel-panel retro-grid p-5 md:p-8">
          <p className="pixel-kicker text-[#ffffff]">Reference manual</p>
          <h1 className="pixel-heading mt-4 text-2xl md:text-4xl">Docs / install / routes</h1>
          <p className="muted-copy mt-4 max-w-3xl text-2xl leading-tight md:text-3xl">
            Same 8-bit shell, same black-white baseline. The docs stay machine-first,
            but now the interface still feels like part of the restaurant arcade.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="pixel-button text-[#00f5ff]" href="/">
              Back Home
            </Link>
            <a className="pixel-button text-[#ffe500]" href="/openapi.yaml">
              OpenAPI
            </a>
            <a className="pixel-button text-white" href="/.well-known/skilltable-skills.json">
              Manifest
            </a>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="pixel-panel p-5">
            <p className="pixel-kicker text-[#6dff3b]">MCP (website)</p>
            <h2 className="pixel-heading mt-3 text-lg md:text-2xl">direct agent connection</h2>
            <pre className="pixel-panel-soft mt-4 overflow-x-auto p-4 text-xl leading-tight text-white md:text-2xl">
              {`POST /api/mcp
Authorization: Bearer <api_key>
Content-Type: application/json
Accept: application/json, text/event-stream`}
            </pre>
            <p className="muted-copy mt-4 text-xl md:text-2xl">
              Agents can connect directly to <code className="text-white">/api/mcp</code>.
              This is a stateless POST-based MCP endpoint for Cursor / Claude style
              clients that support streamable HTTP MCP.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="pixel-button text-[#6dff3b]" href="/api/mcp/info">
                Open MCP Info
              </a>
            </div>
          </article>

          <article className="pixel-panel p-5">
            <p className="pixel-kicker text-[#00f5ff]">Authentication</p>
            <h2 className="pixel-heading mt-3 text-lg md:text-2xl">api key wiring</h2>
            <p className="muted-copy mt-4 text-xl md:text-2xl">
              Send <code className="text-white">Authorization: Bearer &lt;api_key&gt;</code>
              {" "}or <code className="text-white">X-API-Key</code>. Use a key you configure in
              {" "}your local env or deployment env.
            </p>
          </article>

          <article className="pixel-panel p-5">
            <p className="pixel-kicker text-[#ff5a36]">HTTP</p>
            <h2 className="pixel-heading mt-3 text-lg md:text-2xl">menu / queue / recommend</h2>
            <p className="muted-copy mt-4 text-xl md:text-2xl">
              Primary endpoint: <code className="text-white">POST /api/v1/recommend</code>.
              Menu, restaurant detail, queue, metrics and manifest stay under the same
              agent-facing contract, authenticated with the same API key model.
            </p>
          </article>

          <article className="pixel-panel p-5">
            <p className="pixel-kicker text-[#ffe500]">MCP (stdio)</p>
            <h2 className="pixel-heading mt-3 text-lg md:text-2xl">agent connection</h2>
            <pre className="pixel-panel-soft mt-4 overflow-x-auto p-4 text-xl leading-tight text-white md:text-2xl">
              {`npm run dev
SKILLTABLE_API_KEY=<api_key> npm run mcp`}
            </pre>
            <p className="muted-copy mt-4 text-xl md:text-2xl">
              Local fallback: point Cursor or Claude at <code className="text-white">tsx mcp/server.ts</code>.
              Set <code className="text-white">SKILLTABLE_API_BASE_URL</code> if you want returned
              links to point somewhere other than localhost:3000, or use the website MCP endpoint
              above for direct remote access.
            </p>
          </article>

          <article className="pixel-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="pixel-kicker" style={{ color: jinguyuanTheme.accent }}>
                  External Skill
                </p>
                <h2 className="pixel-heading mt-3 text-lg md:text-2xl">金谷园饺子馆</h2>
              </div>
              <div className="pixel-logo-frame p-3" style={{ color: jinguyuanTheme.accent }}>
                <RestaurantLogo className="h-16 w-16" name="金谷园饺子馆" />
              </div>
            </div>
            <p className="muted-copy mt-4 text-xl md:text-2xl">
              Seeded into the platform and linked to the official GitHub skill repo and
              streamable HTTP MCP. Run <code className="text-white">npm run simulate:jinguyuan</code>
              {" "}for the local search → detail → menu → recommend → queue flow.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                className="pixel-button"
                href="https://github.com/JinGuYuan/jinguyuan-dumpling-skill"
                rel="noreferrer"
                style={{ color: jinguyuanTheme.accent }}
                target="_blank"
              >
                GitHub Skill
              </a>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
