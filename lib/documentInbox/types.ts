// Shared vocabulary for the document inbox (see prisma/subschemas/documents/documentInbox.prisma).

export const inboxSources = ["gmail", "paperless", "manual"] as const;
export type InboxSource = (typeof inboxSources)[number];

export type InboxStatus = "pending" | "filed" | "dismissed";
export type FilingVia = "user" | "agent";

// What the inbox page shows in each view. "review" is what needs a person: unfiled documents and the
// agent's filings nobody has checked yet.
export type InboxView = "review" | "pending" | "agentFiled" | "filed" | "dismissed";

// What the agent proposed for a document it didn't file, used to prefill the filing form. Ids are
// resolved when the suggestion is saved; names are kept so it still reads if a record is renamed.
export type InboxSuggestion = {
  target?: "item" | "purchaseOrder";
  item?: { id: string; name: string; referenceCode: string } | null;
  fileType?: { id: string; name: string } | null;
  issuer?: "supplier" | "internal" | null;
  supplier?: { id: string; name: string } | null;
  supplierLot?: string | null;
  purchaseOrder?: { id: string; referenceCode: number } | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  revision?: string | null;
  confidence?: "low" | "medium" | "high" | null;
  reason: string;
};

// Reasons offered when dismissing; the inbox also dismisses on its own with the last two.
export const dismissReasons = {
  notADocument: "Not a document (logo, signature, terms…)",
  notForLumexia: "Not for Lumexia",
  duplicate: "Duplicate",
  dismissedBefore: "Same file was dismissed before",
  alreadyFiled: "Same file is already on file",
} as const;

// Files accepted into the inbox. Office files are kept so a spreadsheet COA can still be filed, though
// only PDFs and images preview.
export const inboxMimeTypes: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
};

export const INBOX_MAX_BYTES = 50 * 1024 * 1024;
