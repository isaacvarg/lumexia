import { NextRequest } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";
import { s3 } from "@/lib/s3";
import { verifyDownload } from "@/lib/apiDownloads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Agents download item documents here with `curl -o <file> <url>`. The signed link from the
// get_document_downloads MCP tool is the only credential (see lib/apiDownloads.ts).
export async function GET(request: NextRequest, { params }: { params: { documentId: string } }) {
  const verdict = await verifyDownload(params.documentId, request.nextUrl.searchParams);
  if (!("ok" in verdict)) return Response.json({ error: verdict.error }, { status: verdict.status });

  const document = await prisma.itemFile.findUnique({
    where: { id: params.documentId },
    select: { file: { select: { name: true, bucketName: true, objectName: true, mimeType: true } } },
  });
  if (!document) return Response.json({ error: "Document not found." }, { status: 404 });

  const { file } = document;
  try {
    const object = await s3.send(new GetObjectCommand({ Bucket: file.bucketName, Key: file.objectName }));
    if (!object.Body) return Response.json({ error: "File not found in storage." }, { status: 404 });

    const headers = new Headers();
    headers.set("Content-Type", object.ContentType ?? file.mimeType ?? "application/octet-stream");
    headers.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`);
    headers.set("Cache-Control", "private, no-store");
    if (object.ContentLength != null) headers.set("Content-Length", String(object.ContentLength));

    return new Response(object.Body.transformToWebStream(), { status: 200, headers });
  } catch (error) {
    console.error("MCP document download failed", error);
    return Response.json({ error: "Could not read the file from storage." }, { status: 502 });
  }
}
