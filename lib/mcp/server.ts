import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ApiKeyAuth } from "@/lib/apiKeys";
import { registerWhoami } from "./tools/whoami";

// Who is calling: the user behind the API key, and what the key allows.
export type McpContext = ApiKeyAuth;

export type ToolRegistrar = (server: McpServer, ctx: McpContext) => void;

const registrars: ToolRegistrar[] = [registerWhoami];

// A fresh server per request: the endpoint is stateless, and every tool closes over the caller.
export const createMcpServer = (ctx: McpContext) => {
  const server = new McpServer(
    { name: "lumexia", version: "1.0.0" },
    {
      instructions:
        "Lumexia is the company's ERP for cosmetics manufacturing: items (raw materials, packaging, " +
        "bulk and finished goods), lots, and Canon (reviewed canonical product data). " +
        "Search for an item first, then use its id with the other tools.",
    },
  );

  registrars.forEach((register) => register(server, ctx));

  return server;
};
