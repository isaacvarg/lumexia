import { ApiError } from "./errors";

export const MAX_LIST_VALUES = 200;
export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 200;

type Cursor = { v: 1; id: string };

// Opaque to clients. Lists are ordered by id, so the cursor is just the last id seen.
export const encodeCursor = (id: string) => Buffer.from(JSON.stringify({ v: 1, id } satisfies Cursor)).toString("base64url");

export const decodeCursor = (raw: string): string => {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Partial<Cursor>;
    if (parsed?.v === 1 && typeof parsed.id === "string" && parsed.id) return parsed.id;
  } catch {
    // falls through
  }
  throw new ApiError("invalid_request", "cursor is not valid");
};

export const parseLimit = (sp: URLSearchParams): number => {
  const raw = sp.get("limit");
  if (raw === null) return DEFAULT_LIMIT;
  if (!/^\d+$/.test(raw)) throw new ApiError("invalid_request", `limit must be an integer from 1 to ${MAX_LIMIT}`);
  const n = Number(raw);
  if (n < 1 || n > MAX_LIMIT) throw new ApiError("invalid_request", `limit must be an integer from 1 to ${MAX_LIMIT}`);
  return n;
};

export const parseCursor = (sp: URLSearchParams): string | null => {
  const raw = sp.get("cursor");
  return raw ? decodeCursor(raw) : null;
};

// A repeatable parameter (?id=a&id=b), at most MAX_LIST_VALUES values, blanks rejected.
export const parseMulti = (sp: URLSearchParams, name: string): string[] | null => {
  const values = sp.getAll(name);
  if (values.length === 0) return null;
  if (values.length > MAX_LIST_VALUES) {
    throw new ApiError("invalid_request", `${name} accepts at most ${MAX_LIST_VALUES} values`);
  }
  if (values.some((v) => !v.trim())) throw new ApiError("invalid_request", `${name} must not be empty`);
  return values.map((v) => v.trim());
};

export const parseSingle = (sp: URLSearchParams, name: string): string | null => {
  const values = sp.getAll(name);
  if (values.length === 0) return null;
  if (values.length > 1 || !values[0].trim()) throw new ApiError("invalid_request", `${name} must be a single non-empty value`);
  return values[0].trim();
};

export const parseBoolean = (sp: URLSearchParams, name: string, fallback: boolean): boolean => {
  const raw = sp.get(name);
  if (raw === null) return fallback;
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new ApiError("invalid_request", `${name} must be true or false`);
};

export const parseTimestamp = (sp: URLSearchParams, name: string): Date | null => {
  const raw = sp.get(name);
  if (raw === null) return null;
  const date = new Date(raw);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(raw) || Number.isNaN(date.getTime())) {
    throw new ApiError("invalid_request", `${name} must be an ISO 8601 timestamp`);
  }
  return date;
};

// Rows are fetched with limit + 1; the extra row only says whether another page exists.
export const toPage = <T extends { id: string }>(rows: T[], limit: number) => {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return { items, nextCursor: hasMore ? encodeCursor(items[items.length - 1].id) : null };
};
