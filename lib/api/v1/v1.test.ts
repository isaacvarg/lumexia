import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ApiError, apiHandler } from "./errors";
import { decodeCursor, encodeCursor, parseBoolean, parseLimit, parseMulti, parseSingle, parseTimestamp, toPage } from "./params";
import { serializeInventoryType, serializeItem, serializeLot, serializeType } from "./serialize";

const sp = (q: string) => new URLSearchParams(q);
const req = (authorization?: string) => new Request("http://x/api/v1/health", { headers: authorization ? { authorization } : {} });

const invalid = (fn: () => unknown) =>
  assert.throws(fn, (e: unknown) => e instanceof ApiError && e.code === "invalid_request" && e.status === 400);

describe("apiHandler", () => {
  it("renders ApiErrors as the envelope with JSON charset", async () => {
    const res = await apiHandler(async () => { throw new ApiError("not_found", "Lot not found"); })(req(), undefined);
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("content-type"), "application/json; charset=utf-8");
    assert.deepEqual(await res.json(), { error: { code: "not_found", message: "Lot not found" } });
  });
  it("hides unexpected failures behind a 500", async () => {
    const orig = console.error; console.error = () => {};
    try {
      const res = await apiHandler(async () => { throw new Error("db password leaked"); })(req(), undefined);
      assert.equal(res.status, 500);
      assert.deepEqual(await res.json(), { error: { code: "internal", message: "Internal server error" } });
    } finally { console.error = orig; }
  });
  it("sends Retry-After with a 429", async () => {
    const res = await apiHandler(async () => { throw new ApiError("rate_limited", "slow down", { "Retry-After": "5" }); })(req(), undefined);
    assert.equal(res.status, 429);
    assert.equal(res.headers.get("retry-after"), "5");
  });
});

describe("params", () => {
  it("limit defaults to 50 and is bounded 1..200", () => {
    assert.equal(parseLimit(sp("")), 50);
    assert.equal(parseLimit(sp("limit=200")), 200);
    for (const bad of ["0", "201", "abc", "-1", "1.5"]) invalid(() => parseLimit(sp(`limit=${bad}`)));
  });
  it("cursor round-trips and rejects garbage", () => {
    assert.equal(decodeCursor(encodeCursor("abc-123")), "abc-123");
    invalid(() => decodeCursor("not-a-cursor"));
    invalid(() => decodeCursor(Buffer.from('{"v":2,"id":"x"}').toString("base64url")));
  });
  it("repeatable params are capped at 200 and trimmed", () => {
    assert.deepEqual(parseMulti(sp("reference_code=A&reference_code= b "), "reference_code"), ["A", "b"]);
    assert.equal(parseMulti(sp(""), "id"), null);
    invalid(() => parseMulti(sp(Array.from({ length: 201 }, (_, i) => `id=${i}`).join("&")), "id"));
    invalid(() => parseMulti(sp("id="), "id"));
  });
  it("single params reject repeats", () => {
    assert.equal(parseSingle(sp("q=lav"), "q"), "lav");
    invalid(() => parseSingle(sp("q=a&q=b"), "q"));
  });
  it("include_archived and updated_since validate", () => {
    assert.equal(parseBoolean(sp(""), "include_archived", true), true);
    assert.equal(parseBoolean(sp("include_archived=false"), "include_archived", true), false);
    invalid(() => parseBoolean(sp("include_archived=no"), "include_archived", true));
    assert.equal(parseTimestamp(sp("updated_since=2026-11-09T14:03:00.000Z"), "updated_since")?.toISOString(), "2026-11-09T14:03:00.000Z");
    invalid(() => parseTimestamp(sp("updated_since=yesterday"), "updated_since"));
  });
  it("toPage trims the look-ahead row and sets nextCursor", () => {
    const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const first = toPage(rows, 2);
    assert.deepEqual(first.items, [{ id: "a" }, { id: "b" }]);
    assert.equal(decodeCursor(first.nextCursor!), "b");
    assert.equal(toPage(rows.slice(0, 2), 2).nextCursor, null);
  });
});

describe("serializers", () => {
  const t = new Date("2026-11-09T14:03:00.000Z");
  it("items: nulls kept, aliases deduped and sorted, updatedAt follows newest alias", () => {
    const out = serializeItem({
      id: "i", referenceCode: "BASE1234", name: "Lavender", itemTypeId: "t", procurementTypeId: null, inventoryTypeId: null,
      updatedAt: t, archived: true,
      aliases: [{ name: "B", updatedAt: t }, { name: "A", updatedAt: new Date("2026-11-10T00:00:00.000Z") }, { name: "A", updatedAt: t }],
    });
    assert.deepEqual(out.aliases, ["A", "B"]);
    assert.equal(out.procurementTypeId, null);
    assert.equal(out.archived, true);
    assert.equal(out.updatedAt, "2026-11-10T00:00:00.000Z");
  });
  it("lots and types", () => {
    assert.deepEqual(serializeLot({ id: "l", itemId: "i", lotNumber: "BASE1234.A12A0124", createdAt: t }),
      { id: "l", itemId: "i", lotNumber: "BASE1234.A12A0124", archived: false, createdAt: "2026-11-09T14:03:00.000Z" });
    assert.deepEqual(serializeType({ id: "x", name: "Fragrances" }), { id: "x", name: "Fragrances", archived: false });
    assert.equal(serializeInventoryType({ id: "x", name: "n", isTracked: true }).isTracked, true);
  });
});
