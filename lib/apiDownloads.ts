import { createHmac, timingSafeEqual } from "crypto";
import prisma from "@/lib/prisma";

// Download links for agents: get_document_downloads hands them out and the agent fetches each with curl,
// so file bytes never pass through the model and the API key never lands in a shell command. A link is an
// HMAC over the document, the key that asked for it, and an expiry; it stops working when the key does.

export const DOWNLOAD_TTL_MINUTES = 15;

const sign = (documentId: string, apiKeyId: string, exp: number) => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set; cannot sign download links.");
  // prefixed so these signatures can't be confused with the app's file-proxy links
  return createHmac("sha256", secret).update(`mcp-download\n${documentId}\n${apiKeyId}\n${exp}`).digest("hex");
};

export const createDownloadUrl = (origin: string, documentId: string, apiKeyId: string) => {
  const exp = Math.floor(Date.now() / 1000) + DOWNLOAD_TTL_MINUTES * 60;
  const params = new URLSearchParams({ k: apiKeyId, e: String(exp), s: sign(documentId, apiKeyId, exp) });
  return `${origin}/api/mcp/downloads/${documentId}?${params}`;
};

// Checks a link's signature, expiry, and that its key can still be used. Returns why not, if not.
export const verifyDownload = async (documentId: string, params: URLSearchParams) => {
  const apiKeyId = params.get("k");
  const exp = Number(params.get("e"));
  const sig = params.get("s");
  if (!apiKeyId || !sig || !Number.isFinite(exp)) return { status: 400, error: "Bad download link." } as const;

  const expected = Buffer.from(sign(documentId, apiKeyId, exp), "hex");
  const provided = Buffer.from(sig, "hex");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return { status: 403, error: "Invalid download link." } as const;
  }
  if (exp * 1000 < Date.now()) return { status: 410, error: "This download link has expired. Ask for a new one." } as const;

  const apiKey = await prisma.apiKey.findUnique({
    where: { id: apiKeyId },
    select: { revokedAt: true, expiresAt: true, user: { select: { disabled: true } } },
  });
  const now = new Date();
  if (!apiKey || apiKey.revokedAt || apiKey.user.disabled || (apiKey.expiresAt && apiKey.expiresAt <= now)) {
    return { status: 403, error: "The API key behind this link can no longer be used." } as const;
  }

  return { ok: true } as const;
};
