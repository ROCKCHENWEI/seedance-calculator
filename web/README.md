# SkillTable (web)

Agent-first dining platform: **HTTP API**, **website MCP (streamable HTTP)**, **MCP stdio server**, and minimal pages (`/docs`, `/dashboard`, `/q/[ticketId]`).

## Setup

```bash
npm install
npx prisma db push
npm run db:seed
```

Copy `.env.example` to `.env` and set `DATABASE_URL`, `SKILLTABLE_API_KEYS`.

## Dev

在项目根目录 **`web/`** 下执行（不要在仓库外层只打开网页）：

```bash
cd web
npm run dev
```

默认端口 **3000**。换端口请用环境变量（不要用脚本里写死 `--port` 覆盖）：

```bash
PORT=3005 npm run dev
```

浏览器访问 **http://127.0.0.1:3000**（或你设置的端口）。

### 无法访问时

1. **确认服务已启动**：终端里应出现 `Ready`，且没有立刻退出。
2. **端口被占用**：若 3000 已被占用，Next 会换端口（例如 3003）或报错。可先结束旧进程再启：
   `lsof -i :3000` 查看 PID，再 `kill <PID>`；或改用 `PORT=3005 npm run dev`，浏览器用对应端口。
3. **远程 / Cursor 云端开发**：开发机上的 `localhost` 在你本机浏览器里**打不开**。需在 Cursor 的 **Ports** 面板把端口 **转发（Forward）** 到本机，或使用本机克隆仓库后本地执行 `npm run dev`。
4. **仅在本机**：必须在运行 `npm run dev` 的同一台电脑上访问上述地址。

- OpenAPI: [http://localhost:3000/openapi.yaml](http://localhost:3000/openapi.yaml)
- Skill manifest: [http://localhost:3000/.well-known/skilltable-skills.json](http://localhost:3000/.well-known/skilltable-skills.json)
- Website MCP endpoint: `http://localhost:3000/api/mcp`
- Website MCP info: [http://localhost:3000/api/mcp/info](http://localhost:3000/api/mcp/info)

## MCP

### Website MCP

Agent clients can connect directly to the site:

```text
Endpoint: http://localhost:3000/api/mcp
Auth: Authorization: Bearer <api_key>
Content-Type: application/json
Accept: application/json, text/event-stream
```

This is the preferred path for MCP-capable agents that support streamable HTTP.
The current website MCP implementation is stateless and POST-based.
For a browser-friendly setup summary, open `http://localhost:3000/api/mcp/info`.

### Local stdio MCP

With the dev server running:

```bash
SKILLTABLE_API_KEY=<api_key> npm run mcp
```

Configure your MCP client to run `npm run mcp` in this directory (stdio), and set `SKILLTABLE_API_BASE_URL` if you want returned links to point somewhere other than `http://localhost:3000`.
The stdio server now mirrors the same toolset as the website MCP endpoint.

### 金谷园饺子馆（示例 Skill）

种子数据包含 **[jinguyuan-dumpling-skill](https://github.com/JinGuYuan/jinguyuan-dumpling-skill)**：门店元数据 + 示意菜单 + 平台内排队；**官方问答（排队细则、Wi‑Fi、外卖等）** 使用对方提供的 **streamable HTTP MCP**。

模拟 Agent 跑通 HTTP 流程（需已 `db:seed`，且 dev 在跑或改用 `npm start`）：

```bash
npm run simulate:jinguyuan
```

修改 Prisma schema 后请**重启** `npm run dev`，否则会读不到新字段。

## Production

```bash
npm run build
npm start
```

Use Postgres in production by changing `DATABASE_URL` and running migrations (`prisma migrate`).
