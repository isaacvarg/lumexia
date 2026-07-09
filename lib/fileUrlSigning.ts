import { createHmac, timingSafeEqual } from "crypto";

// Files are served to the browser through the same-origin proxy route
// (app/api/files/route.ts) rather than via S3/RustFS presigned URLs, because the
// object store endpoint (e.g. the docker service name `rustfs`) is not reachable
// from a browser behind the Cloudflare tunnel. To keep those proxy links
// self-authorizing — unguessable and time-limited, like a presigned URL — each
// link carries an HMAC over the bucket, key, and expiry. The proxy verifies it
// before streaming anything, so an authenticated user cannot fetch an arbitrary
// object by tampering with the query string.

const getSecret = (): string => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set; cannot sign file URLs.");
  }
  return secret;
};

const computeSignature = (bucket: string, key: string, exp: number): string =>
  createHmac("sha256", getSecret())
    .update(`${bucket}\n${key}\n${exp}`)
    .digest("hex");

export type FileToken = {
  bucket: string;
  key: string;
  exp: number;
  sig: string;
};

// Returns the HMAC signature for a (bucket, key, exp) triple.
export const signFileToken = (bucket: string, key: string, exp: number): string =>
  computeSignature(bucket, key, exp);

// Verifies a token: the signature must match and the expiry must be in the future.
// Returns "ok", "expired", or "invalid" so the route can pick an appropriate status.
export const verifyFileToken = (token: FileToken): "ok" | "expired" | "invalid" => {
  const expected = computeSignature(token.bucket, token.key, token.exp);
  const provided = token.sig;

  // timingSafeEqual requires equal-length buffers; bail early on a length
  // mismatch (which is itself not secret) before the constant-time compare.
  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");
  if (
    expectedBuf.length === 0 ||
    expectedBuf.length !== providedBuf.length ||
    !timingSafeEqual(expectedBuf, providedBuf)
  ) {
    return "invalid";
  }

  if (!Number.isFinite(token.exp) || token.exp * 1000 < Date.now()) {
    return "expired";
  }

  return "ok";
};
