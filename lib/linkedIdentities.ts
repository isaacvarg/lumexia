import { createHash, randomInt } from "crypto";
import prisma from "@/lib/prisma";
import { identityChannelInfo, identityChannels, type IdentityChannel } from "./identityChannels";

// Chat identities (WhatsApp numbers, Discord and Telegram accounts, Hermes profiles...) linked to Lumexia users,
// so an agent that serves many people through one API key (Hermes) can act as whoever sent the message. A user
// proves the link by creating a one-time code in Lumexia and sending it to the agent from that identity; asking
// "who are you?" and trusting the answer would let anyone act as anyone. A user may link any number of
// identities, one per (channel, id).

export { identityChannelInfo, identityChannels, isIdentityChannel, formatExternalId, type IdentityChannel } from "./identityChannels";

export const LINK_CODE_TTL_MINUTES = 10;

// No 0/O, 1/I/L: codes are read off a screen and typed on a phone.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const CODE_LENGTH = 8;

const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

// Codes are shown as XXXX-XXXX; accept them typed with or without the dash, spaces, or in lower case.
const canonicalCode = (code: string) => code.toUpperCase().replace(/[^0-9A-Z]/g, "");

// Ids arrive in whatever shape the channel's metadata uses; store one canonical form per channel.
export const normalizeExternalId = (channel: IdentityChannel, externalId: string) => {
  const value = externalId.trim();
  switch (channel) {
    case identityChannels.whatsapp: {
      // +1 (555) 123-4567, 15551234567@s.whatsapp.net: digits only
      const digits = value.split("@")[0].replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15 ? digits : null;
    }
    case identityChannels.discord: {
      // snowflake user id, sometimes given as a mention <@123...>
      const digits = value.replace(/^<@!?|>$/g, "");
      return /^\d{15,21}$/.test(digits) ? digits : null;
    }
    case identityChannels.telegram:
      return /^\d{4,20}$/.test(value) ? value : null;
    case identityChannels.slack: {
      // member id, optionally team-qualified (T0123:U0456)
      const id = value.toUpperCase();
      return /^([TE][A-Z0-9]{6,}:)?[UW][A-Z0-9]{6,}$/.test(id) ? id : null;
    }
    case identityChannels.hermes: {
      // install id (~/.hermes/install_id) and profile name
      const match = value.match(/^([A-Za-z0-9-]{8,64}):([A-Za-z0-9._-]{1,64})$/);
      return match ? `${match[1].toLowerCase()}:${match[2]}` : null;
    }
  }
};

// Failed code attempts per identity, so a code can't be guessed by retrying. In-process: Lumexia runs as one
// container, and 31^8 possible codes per 10-minute window already make guessing hopeless.
const MAX_FAILED_ATTEMPTS = 5;
const FAILED_ATTEMPT_WINDOW_MS = 60 * 60_000;
const failedAttempts = new Map<string, number[]>();

const recentFailures = (identityKey: string) => {
  const now = Date.now();
  const recent = (failedAttempts.get(identityKey) ?? []).filter((t) => now - t < FAILED_ATTEMPT_WINDOW_MS);
  failedAttempts.set(identityKey, recent);
  return recent;
};

export const createLinkCode = async (userId: string, channel: IdentityChannel) => {
  const code = Array.from({ length: CODE_LENGTH }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
  const expiresAt = new Date(Date.now() + LINK_CODE_TTL_MINUTES * 60_000);

  // one live code per user and channel: making a new one retires the old
  await prisma.$transaction([
    prisma.identityLinkCode.updateMany({ where: { userId, channel, usedAt: null }, data: { usedAt: new Date() } }),
    prisma.identityLinkCode.create({ data: { userId, channel, codeHash: hashCode(code), expiresAt } }),
  ]);

  return { code: `${code.slice(0, 4)}-${code.slice(4)}`, expiresAt };
};

// Links the identity to the code's user. An identity belongs to one user, so redeeming a code from an
// identity that was linked to someone else moves it: the code proves who holds that account now.
export const redeemLinkCode = async (input: { code: string; channel: IdentityChannel; externalId: string; apiKeyId: string }) => {
  const externalId = normalizeExternalId(input.channel, input.externalId);
  const { label, idLabel } = identityChannelInfo[input.channel];
  if (!externalId) return { error: `That doesn't look like a valid ${label} ${idLabel}.` } as const;

  const identityKey = `${input.channel}:${externalId}`;
  if (recentFailures(identityKey).length >= MAX_FAILED_ATTEMPTS) {
    return { error: "Too many wrong codes from this account. Try again in an hour." } as const;
  }
  const result = await redeem(input.channel, externalId, input.code, input.apiKeyId);
  if ("error" in result) failedAttempts.get(identityKey)!.push(Date.now());
  return result;
};

const redeem = async (channel: IdentityChannel, externalId: string, code: string, apiKeyId: string) => {
  const linkCode = await prisma.identityLinkCode.findUnique({
    where: { codeHash: hashCode(canonicalCode(code)) },
    include: { user: { select: { id: true, name: true, email: true, disabled: true } } },
  });
  const now = new Date();
  if (!linkCode || linkCode.channel !== channel) return { error: "That link code isn't valid." } as const;
  if (linkCode.usedAt) return { error: "That link code was already used or replaced. Create a new one in Lumexia." } as const;
  if (linkCode.expiresAt <= now) return { error: "That link code has expired. Create a new one in Lumexia." } as const;
  if (linkCode.user.disabled) return { error: "That Lumexia user is disabled." } as const;

  const claimed = await prisma.identityLinkCode.updateMany({ where: { id: linkCode.id, usedAt: null }, data: { usedAt: now } });
  if (claimed.count === 0) return { error: "That link code was already used. Create a new one in Lumexia." } as const;

  const { disabled, ...user } = linkCode.user;
  await prisma.linkedIdentity.upsert({
    where: { channel_externalId: { channel: channel, externalId } },
    create: { userId: user.id, channel: channel, externalId, apiKeyId: apiKeyId },
    update: { userId: user.id, apiKeyId: apiKeyId },
  });

  return { user, externalId } as const;
};

// The user an identity is linked to, or null if it isn't linked (or the user is disabled).
export const resolveLinkedUser = async (channel: IdentityChannel, rawExternalId: string) => {
  const externalId = normalizeExternalId(channel, rawExternalId);
  if (!externalId) return null;

  const identity = await prisma.linkedIdentity.findUnique({
    where: { channel_externalId: { channel, externalId } },
    include: { user: { select: { id: true, name: true, email: true, disabled: true } } },
  });
  if (!identity || identity.user.disabled) return null;

  const { disabled, ...user } = identity.user;
  return { user, externalId, linkedAt: identity.createdAt };
};

export const unlinkByExternalId = async (channel: IdentityChannel, rawExternalId: string) => {
  const externalId = normalizeExternalId(channel, rawExternalId);
  if (!externalId) return 0;
  const { count } = await prisma.linkedIdentity.deleteMany({ where: { channel, externalId } });
  return count;
};

export const listLinkedIdentities = (userId: string) =>
  prisma.linkedIdentity.findMany({
    where: { userId },
    select: { id: true, channel: true, externalId: true, createdAt: true, apiKey: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

export type LinkedIdentityListing = Awaited<ReturnType<typeof listLinkedIdentities>>[number];
