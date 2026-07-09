import { NextRequest } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { verifyFileToken } from "@/lib/fileUrlSigning";

// The object store (RustFS) is only reachable inside the docker network, so the
// browser cannot fetch objects directly (see lib/fileUrlSigning.ts). This route
// is the same-origin proxy: it verifies the signed link produced by
// actions/files/getUrl.ts, then streams the object from the store server-side.
// Range requests are forwarded so <iframe> PDFs and future <video> can seek.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const bucket = searchParams.get("b");
  const key = searchParams.get("k");
  const expRaw = searchParams.get("e");
  const sig = searchParams.get("s");

  if (!bucket || !key || !expRaw || !sig) {
    return new Response("Bad request", { status: 400 });
  }

  const exp = Number(expRaw);
  const verdict = verifyFileToken({ bucket, key, exp, sig });
  if (verdict === "invalid") {
    return new Response("Forbidden", { status: 403 });
  }
  if (verdict === "expired") {
    return new Response("Link expired", { status: 410 });
  }

  const range = request.headers.get("range") ?? undefined;

  try {
    const object = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key, Range: range }),
    );

    if (!object.Body) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", object.ContentType ?? "application/octet-stream");
    headers.set("Content-Disposition", "inline");
    headers.set("Accept-Ranges", "bytes");
    // Private: these are per-user, time-limited links; let the browser cache
    // within the link's lifetime but keep shared caches out.
    headers.set("Cache-Control", "private, max-age=3600");
    if (object.ContentLength != null) {
      headers.set("Content-Length", String(object.ContentLength));
    }
    if (object.ETag) headers.set("ETag", object.ETag);
    if (object.ContentRange) headers.set("Content-Range", object.ContentRange);

    // 206 when the store honoured a range request, 200 otherwise.
    const status = object.ContentRange ? 206 : 200;

    const body = object.Body.transformToWebStream();
    return new Response(body, { status, headers });
  } catch (err: unknown) {
    const status = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata
      ?.httpStatusCode;
    const name = (err as { name?: string })?.name;
    if (status === 404 || name === "NoSuchKey" || name === "NotFound") {
      return new Response("Not found", { status: 404 });
    }
    console.error("File proxy failed:", err);
    return new Response("Internal error", { status: 500 });
  }
}
