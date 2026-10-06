import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authenticateApiKey } from "@/lib/apiKeys";
import { createMcpServer } from "@/lib/mcp/server";

export const dynamic = "force-dynamic";

const jsonRpcError = (status: number, message: string) =>
  Response.json({ jsonrpc: "2.0", error: { code: -32000, message }, id: null }, { status });

// Stateless Streamable HTTP: each POST gets its own server and transport, so nothing
// lives in memory between requests and container restarts don't break clients.
export async function POST(req: Request) {
  const auth = await authenticateApiKey(req.headers.get("authorization"));
  if (!auth) {
    return jsonRpcError(401, "Missing or invalid API key. Create one in Lumexia under Settings → User → Agents.");
  }

  const server = createMcpServer(auth);
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
