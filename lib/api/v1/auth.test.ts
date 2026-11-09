import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "./errors";
import { requireRead } from "./auth";
import type { ApiKeyAuth } from "@/lib/apiKeys";

// Needs the generated Prisma client (auth.ts imports lib/apiKeys), like the other lib tests.
const req = (authorization?: string) => new Request("http://x/api/v1/health", { headers: authorization ? { authorization } : {} });
const keyAuth = (scopes: string[]) => ({ keyId: "k", user: { id: "u1", name: "n", email: "e" }, scopes }) as unknown as ApiKeyAuth;

describe("requireRead", () => {
  it("401 when the key is missing or unknown", async () => {
    await assert.rejects(requireRead(req(), async () => null), (e: unknown) => e instanceof ApiError && e.status === 401);
    await assert.rejects(requireRead(req("Bearer lmx_nope"), async () => null), (e: unknown) => e instanceof ApiError && e.status === 401);
  });
  it("200 path with a read key", async () => {
    assert.deepEqual(await requireRead(req("Bearer lmx_x"), async () => keyAuth(["read"])), { userId: "u1", scopes: ["read"] });
  });
  it("403 when the key lacks read", async () => {
    await assert.rejects(requireRead(req("Bearer lmx_x"), async () => keyAuth(["write"])), (e: unknown) => e instanceof ApiError && e.status === 403);
  });
});

