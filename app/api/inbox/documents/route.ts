import { Buffer } from "buffer";
import { apiKeyScopes, authenticateApiKey } from "@/lib/apiKeys";
import { ingestInboxMessage } from "@/lib/documentInbox/ingest";
import { inboxSources, InboxSource } from "@/lib/documentInbox/types";

export const dynamic = "force-dynamic";

// Automations (the n8n Gmail workflow, later Paperless) post a message and its attachments here as
// multipart form data, with an API key that has write access:
//   source=gmail, sourceId=<message id>, threadId, sourceUrl, senderEmail, senderName, subject, body,
//   receivedAt (ISO date), and one or more files (any field name; "files" by convention).
// Repeating a request is safe. The response lists an inboxDocumentId per file for the MCP inbox tools.
export async function POST(req: Request) {
  const auth = await authenticateApiKey(req.headers.get("authorization"));
  if (!auth) return Response.json({ error: "Missing or invalid API key." }, { status: 401 });
  if (!auth.scopes.includes(apiKeyScopes.write)) {
    return Response.json({ error: "This API key is read-only. An admin can grant it write access." }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return Response.json({ error: "Send multipart form data." }, { status: 400 });

  const text = (key: string) => {
    const v = form.get(key);
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };

  const source = text("source") ?? "manual";
  if (!inboxSources.includes(source as InboxSource)) {
    return Response.json({ error: `source must be one of ${inboxSources.join(", ")}.` }, { status: 400 });
  }
  const sourceId = text("sourceId");
  if (!sourceId) return Response.json({ error: "sourceId is required, e.g. the Gmail message id." }, { status: 400 });

  const received = text("receivedAt");
  const receivedAt = received ? new Date(/^\d+$/.test(received) ? Number(received) : received) : null;
  if (receivedAt && isNaN(receivedAt.getTime())) {
    return Response.json({ error: "receivedAt must be an ISO date or epoch milliseconds." }, { status: 400 });
  }

  const files = await Promise.all(
    Array.from(form.values())
      .filter((v): v is File => typeof v !== "string")
      .map(async (f) => ({ name: f.name || "attachment", type: f.type, buffer: Buffer.from(await f.arrayBuffer()) })),
  );

  try {
    const result = await ingestInboxMessage(
      auth.user.id,
      {
        source: source as InboxSource,
        sourceId,
        threadId: text("threadId"),
        sourceUrl: text("sourceUrl"),
        senderEmail: text("senderEmail"),
        senderName: text("senderName"),
        subject: text("subject"),
        body: text("body"),
        receivedAt,
      },
      files,
    );
    return Response.json(result);
  } catch (error) {
    console.error("Inbox upload failed:", error);
    return Response.json({ error: "Upload failed. Try again; nothing is added twice." }, { status: 500 });
  }
}
