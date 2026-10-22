import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { Db } from "@/lib/canon/db";
import type { McpContext } from "./server";

// Shared plumbing for MCP write tools: a per-key rate limit, idempotency keys so retries don't create
// duplicates, and dry runs that go through the real code path and then roll back, so the preview an
// agent shows a person is exactly what the real call would do.

const WRITES_PER_MINUTE = 60;
const WINDOW_MS = 60_000;
// canon writes refresh downstream statuses, which can take longer than Prisma's 5s default
const TRANSACTION_OPTIONS = { timeout: 20_000 };

// Lumexia runs as one container, so an in-process window is enough; it resets on restart.
const recentWrites = new Map<string, number[]>();

const takeWriteSlot = (keyId: string) => {
  const now = Date.now();
  const recent = (recentWrites.get(keyId) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= WRITES_PER_MINUTE) {
    recentWrites.set(keyId, recent);
    return false;
  }
  recent.push(now);
  recentWrites.set(keyId, recent);
  return true;
};

// Stable across key order, so the same arguments always hash the same.
const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .filter((k) => (value as Record<string, unknown>)[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
};

const hashRequest = (tool: string, args: unknown) => createHash("sha256").update(`${tool}:${stableStringify(args)}`).digest("hex");

class DryRunRollback extends Error {
  constructor(readonly result: unknown) {
    super("dry run");
  }
}

export class WriteRefused extends Error {}

type WriteRequest = {
  tool: string;
  // the tool's arguments minus idempotencyKey and dryRun, to detect a key reused for a different request
  args: unknown;
  idempotencyKey: string;
  dryRun?: boolean;
};

export type WriteOutcome<T> = { result: T; dryRun: boolean; replayed: boolean };

// Runs fn in a transaction. A dry run rolls it back and returns what it would have produced; a real run
// stores the result under the idempotency key, and a retry with the same key and arguments gets it back.
export const runWrite = async <T>(ctx: McpContext, request: WriteRequest, fn: (db: Db) => Promise<T>): Promise<WriteOutcome<T>> => {
  if (request.dryRun) {
    try {
      await prisma.$transaction(async (tx) => {
        throw new DryRunRollback(await fn(tx));
      }, TRANSACTION_OPTIONS);
    } catch (error) {
      if (error instanceof DryRunRollback) return { result: error.result as T, dryRun: true, replayed: false };
      throw error;
    }
    throw new Error("Dry run did not roll back.");
  }

  const requestHash = hashRequest(request.tool, request.args);
  const previous = await prisma.apiIdempotencyKey.findUnique({
    where: { apiKeyId_key: { apiKeyId: ctx.keyId, key: request.idempotencyKey } },
  });
  if (previous) {
    if (previous.tool !== request.tool || previous.requestHash !== requestHash) {
      throw new WriteRefused(
        `idempotencyKey "${request.idempotencyKey}" was already used for a different request. Use a new key for a new change.`,
      );
    }
    return { result: previous.response as T, dryRun: false, replayed: true };
  }

  if (!takeWriteSlot(ctx.keyId)) {
    throw new WriteRefused(`Rate limit: at most ${WRITES_PER_MINUTE} writes a minute per key. Wait a minute, then continue.`);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const result = await fn(tx);
      await tx.apiIdempotencyKey.create({
        data: {
          apiKeyId: ctx.keyId,
          key: request.idempotencyKey,
          tool: request.tool,
          requestHash,
          response: JSON.parse(JSON.stringify(result ?? null)),
        },
      });
      return { result, dryRun: false, replayed: false };
    }, TRANSACTION_OPTIONS);
  } catch (error) {
    // the same key raced in from a concurrent retry: answer with whichever call won
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const winner = await prisma.apiIdempotencyKey.findUnique({
        where: { apiKeyId_key: { apiKeyId: ctx.keyId, key: request.idempotencyKey } },
      });
      if (winner && winner.requestHash === requestHash) return { result: winner.response as T, dryRun: false, replayed: true };
    }
    throw error;
  }
};
