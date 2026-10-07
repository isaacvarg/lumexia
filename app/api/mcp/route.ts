import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authenticateApiKey } from "@/lib/apiKeys";
import { createMcpServer } from "@/lib/mcp/server";

export const dynamic = "force-dynamic";

const jsonRpcError = (status: number, message: string) =>
  Response.json({ jsonrpc: "2.0", error: { code: -32000, message }, id: null }, { status });

// The address the agent used to reach Lumexia, so links handed back to it (uploads) resolve the same way.
const requestOrigin = (req: Request) => {
  const first = (v: string | null) => v?.split(",")[0].trim() || null
  const host = first(req.headers.get("x-forwarded-host")) ?? req.headers.get("host")
  const proto = first(req.headers.get("x-forwarded-proto")) ?? new URL(req.url).protocol.replace(":", "")
  return host ? `${proto}://${host}` : new URL(req.url).origin
}

// Stateless Streamable HTTP: each POST gets its own server and transport, so nothing
// lives in memory between requests and container restarts don't break clients.
export async function POST(req: Request) {
  const auth = await authenticateApiKey(req.headers.get("authorization"));
  if (!auth) {
    return jsonRpcError(401, "Missing or invalid API key. Create one in Lumexia under Settings → User → Agents.");
  }

  const server = createMcpServer({ ...auth, origin: requestOrigin(req) });
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  try {
    return await transport.handleRequest(req);
  } finally {
    await server.close();
  }
}

// No sessions, so no server-initiated stream (GET) and nothing to end (DELETE).
export async function GET() {
  return jsonRpcError(405, "Method not allowed");
}

export async function DELETE() {
  return jsonRpcError(405, "Method not allowed");
}
