import { createHash, randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { apiKeyScopes } from "@/lib/apiKeys";

// Upload links for agents: create_document_upload hands one out, the agent POSTs the file to it with
// curl, and attach_item_document then links the resulting file to an item. Links are single-use and
// expire quickly; only a hash of the token is stored.

export const UPLOAD_TTL_MINUTES = 15;
const TOKEN_PREFIX = "lmxu_";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const createUploadTokens = async (apiKeyId: string, count: number) => {
  const expiresAt = new Date(Date.now() + UPLOAD_TTL_MINUTES * 60_000);
  const tokens = Array.from({ length: count }, () => TOKEN_PREFIX + randomBytes(24).toString("base64url"));
  await prisma.apiUpload.createMany({
    data: tokens.map((token) => ({ apiKeyId, tokenHash: hashToken(token), expiresAt })),
  });
  return { tokens, expiresAt };
};

// Claims an upload link for one upload. Returns the uploading user, or why the link can't be used.
// The claim is a conditional update, so two simultaneous requests can't both use one link.
export const claimUploadToken = async (token: string) => {
  if (!token.startsWith(TOKEN_PREFIX)) return { error: "Invalid upload link." } as const;

  const upload = await prisma.apiUpload.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { apiKey: { include: { user: { select: { id: true, disabled: true } } } } },
  });
  const now = new Date();
  if (!upload) return { error: "Invalid upload link." } as const;
  if (upload.usedAt) return { error: "This upload link has already been used. Ask for a new one." } as const;
  if (upload.expiresAt <= now) return { error: "This upload link has expired. Ask for a new one." } as const;

  const { apiKey } = upload;
  const keyUsable =
    !apiKey.revokedAt && !apiKey.user.disabled && (!apiKey.expiresAt || apiKey.expiresAt > now) &&
    apiKey.scopes.includes(apiKeyScopes.write);
  if (!keyUsable) return { error: "The API key behind this link can no longer upload." } as const;

  const claimed = await prisma.apiUpload.updateMany({ where: { id: upload.id, usedAt: null }, data: { usedAt: now } });
  if (claimed.count === 0) return { error: "This upload link has already been used. Ask for a new one." } as const;

  return { uploadId: upload.id, userId: apiKey.user.id } as const;
};

// If storing the file fails, the link can be retried until it expires.
export const releaseUploadToken = (uploadId: string) =>
  prisma.apiUpload.update({ where: { id: uploadId }, data: { usedAt: null } });

export const completeUpload = (uploadId: string, fileId: string) =>
  prisma.apiUpload.update({ where: { id: uploadId }, data: { fileId } });
