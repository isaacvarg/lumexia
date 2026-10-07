import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ApiKeyAuth } from "@/lib/apiKeys";
import { registerWhoami } from "./tools/whoami";
import { registerItemTools } from "./tools/items";
import { registerLotTools } from "./tools/lots";
import { registerCanonTools } from "./tools/canon";
import { registerDocumentTools } from "./tools/documents";
import { registerDocumentWriteTools } from "./tools/documentWrites";
import { registerPurchasingTools } from "./tools/purchasing";
import { registerPricingTools } from "./tools/pricing";
import { apiKeyScopes } from "@/lib/apiKeys";

// Who is calling: the user behind the API key, and what the key allows. origin is the address the
// agent reached Lumexia at, used to build links it can call back (e.g. upload links).
export type McpContext = ApiKeyAuth & { origin: string };

export type ToolRegistrar = (server: McpServer, ctx: McpContext) => void;

const registrars: ToolRegistrar[] = [
  registerWhoami,
  registerItemTools,
  registerLotTools,
  registerCanonTools,
  registerDocumentTools,
  registerPurchasingTools,
  registerPricingTools,
];
// only keys an admin granted write access see these
const writeRegistrars: ToolRegistrar[] = [registerDocumentWriteTools];

// A fresh server per request: the endpoint is stateless, and every tool closes over the caller.
export const createMcpServer = (ctx: McpContext) => {
  const server = new McpServer(
    { name: "lumexia", version: "1.0.0" },
    {
      instructions:
        "Lumexia is the company's ERP for cosmetics manufacturing: items (raw materials, packaging, " +
        "bulk and finished goods), lots, Canon (reviewed canonical product data), purchasing (purchase orders and " +
        "purchasing requests, both identified by reference code), and pricing examinations. " +
        "Search for an item first, then use its id with the other tools. " +
        "Item documents (SDS, COA, IFRA…) have requirements per item; get_item_documents shows what an item has " +
        "and needs, get_document_issues what's missing across items. " +
        (ctx.scopes.includes(apiKeyScopes.write)
          ? "To file documents from local files: read each file to identify the item, document type, issuer " +
            "(supplier vs. our own branded version), supplier, lot, issue date and revision; check " +
            "find_documents_by_checksum to skip files already uploaded; show the user the proposed matches and wait " +
            "for confirmation before uploading; then create_document_upload, curl each file, and attach_item_document. " +
            "Skip and report files you can't match confidently instead of guessing."
          : "This key is read-only; filing documents needs a key with write access from an admin."),
    },
  );

  registrars.forEach((register) => register(server, ctx));
  if (ctx.scopes.includes(apiKeyScopes.write)) writeRegistrars.forEach((register) => register(server, ctx));

  return server;
};
