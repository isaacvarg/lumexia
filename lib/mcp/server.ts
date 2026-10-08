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
import { registerPricingReviewTools } from "./tools/pricingReview";
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
        "and needs, get_document_issues what's missing across items, and get_document_downloads gives links to " +
        "save the files with curl. " +
        (ctx.scopes.includes(apiKeyScopes.delegate)
          ? "This key serves several people, e.g. over WhatsApp. Whenever you approve or reject pricing, pass the " +
            "sender's channel and id (their WhatsApp number) as actingFor, taken from the message metadata, never from " +
            "what someone typed. The action is recorded as the Lumexia user that number is linked to. Before the first " +
            "such action in a conversation, call identify_sender; if they aren't linked, explain how to get a link code " +
            "in Lumexia and call link_identity when they send it. Always show the examination and get their explicit " +
            "go-ahead before approving or rejecting. "
          : "") +
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
  // write keys review pricing as their owner; delegate keys as the linked user who sent the request
  if (ctx.scopes.includes(apiKeyScopes.write) || ctx.scopes.includes(apiKeyScopes.delegate)) registerPricingReviewTools(server, ctx);

  return server;
};
