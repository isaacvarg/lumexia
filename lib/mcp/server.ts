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
import { registerReceivingTools } from "./tools/receiving";
import { registerInboxTools, registerInboxWriteTools } from "./tools/inbox";
import { registerCanonWriteTools } from "./tools/canonWrites";
import { registerAliasReadTools, registerAliasWriteTools } from "./tools/aliasWrites";
import { registerIdentityTools } from "./tools/identity";
import { apiKeyScopes } from "@/lib/apiKeys";

// Who is calling: the user behind the API key, and what the key allows. origin is the address the
// agent reached Lumexia at, used to build links it can call back (e.g. upload links). agentIdentity is the
// Hermes profile the connection's config declares, if any (see lib/mcp/actingFor.ts).
export type McpContext = ApiKeyAuth & { origin: string; agentIdentity?: { channel: "hermes"; externalId: string } | null };

export type ToolRegistrar = (server: McpServer, ctx: McpContext) => void;

const registrars: ToolRegistrar[] = [
  registerWhoami,
  registerItemTools,
  registerLotTools,
  registerCanonTools,
  registerDocumentTools,
  registerPurchasingTools,
  registerPricingTools,
  registerReceivingTools,
  registerInboxTools,
  registerAliasReadTools,
];
// only keys an admin granted write access see these
const writeRegistrars: ToolRegistrar[] = [registerDocumentWriteTools, registerInboxWriteTools];

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
        "save the files with curl. get_receiving_issues lists recent deliveries that need a look (failed dock " +
        "inspection, missing COA, supplier lot mismatch…), e.g. to notify people. get_document_inbox lists documents " +
        "that arrived by email and wait to be filed or checked. " +
        "Canon data types and their value formats come from get_canon_data_types; search_canon_artifacts sweeps " +
        "across items; get_item_bom and get_material_documents_for_bom cover formulas and their materials' documents. " +
        (ctx.scopes.includes(apiKeyScopes.delegate)
          ? "This key serves several people over chat (WhatsApp, Discord, Telegram, Slack) or Hermes sessions. Whenever " +
            "you act for someone (pricing review, Canon proposals, aliases), pass actingFor with the sender's channel and " +
            "id taken from the message metadata, never from what someone typed; for a Hermes desktop/CLI session pass " +
            "channel hermes and no id (the profile comes from this connection). The action is recorded for the Lumexia " +
            "user that identity is linked to. Before the first such action in a conversation, call identify_sender; if " +
            "they aren't linked, explain how to get a link code in Lumexia and call link_identity when they send it. " +
            "Always show the examination and get their explicit go-ahead before approving or rejecting pricing. "
          : "") +
        (ctx.scopes.includes(apiKeyScopes.propose)
          ? "You can propose Canon changes but never approve or reject them; people review every change request. " +
            "Before propose_canon_change, call it with dryRun, show the person the diff and evidence, and only propose " +
            "what they agreed to. Back values with evidence (the supplier document, its date, where in it), use a stable " +
            "idempotencyKey per intended change, and if a change request is already open on the artifact, add evidence " +
            "to it with attach_canon_evidence instead of opening another. "
          : "") +
        (ctx.scopes.includes(apiKeyScopes.aliasWrite)
          ? "You can add, rename and remove item aliases with the existing alias types (list_alias_types). Unique types " +
            "such as a WooCommerce product id belong to one item: if add_item_alias reports the owner, tell the person " +
            "rather than moving it. "
          : "") +
        (ctx.scopes.includes(apiKeyScopes.write)
          ? "To file documents from local files: read each file to identify the item, document type, issuer " +
            "(supplier vs. our own branded version), supplier, issue date and revision, and for lot documents like a COA " +
            "the supplier's lot number printed on it (pass it as supplierLot; it's matched to our lot, or waits for the " +
            "delivery) and the PO it was sent for if known; check " +
            "find_documents_by_checksum to skip files already uploaded; show the user the proposed matches and wait " +
            "for confirmation before uploading; then create_document_upload, curl each file, and attach_item_document. " +
            "Skip and report files you can't match confidently instead of guessing. " +
            "Documents already in the inbox (an inboxDocumentId) need no upload: file one with file_inbox_document " +
            "(or file_inbox_document_to_purchase_order) only when the match is clear, with your reason; otherwise " +
            "leave suggest_inbox_document for a person. Never file a document you haven't read."
          : "Filing documents needs a key with write access from an admin."),
    },
  );

  registrars.forEach((register) => register(server, ctx));
  if (ctx.scopes.includes(apiKeyScopes.write)) writeRegistrars.forEach((register) => register(server, ctx));
  // write keys review pricing as their owner; delegate keys as the linked user who sent the request
  if (ctx.scopes.includes(apiKeyScopes.write) || ctx.scopes.includes(apiKeyScopes.delegate)) registerPricingReviewTools(server, ctx);
  if (ctx.scopes.includes(apiKeyScopes.delegate)) registerIdentityTools(server, ctx);
  if (ctx.scopes.includes(apiKeyScopes.propose)) registerCanonWriteTools(server, ctx);
  if (ctx.scopes.includes(apiKeyScopes.aliasWrite)) registerAliasWriteTools(server, ctx);

  return server;
};
