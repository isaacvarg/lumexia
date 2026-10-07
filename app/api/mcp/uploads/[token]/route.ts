import { Buffer } from "buffer";
import { claimUploadToken, completeUpload, releaseUploadToken } from "@/lib/apiUploads";
import { storeUploadedFile } from "@/lib/files/storeUpload";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = /^(application\/pdf|image\/(jpeg|png|gif|webp))$/;
const MAX_BYTES = 50 * 1024 * 1024;

// Agents upload here with `curl -F file=@path <url>`. The token in the path is the only credential:
// it comes from the create_document_upload MCP tool, works once, and expires after a few minutes.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const claim = await claimUploadToken(params.token);
  if ("error" in claim) return Response.json({ error: claim.error }, { status: 403 });

  try {
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
      await releaseUploadToken(claim.uploadId);
      return Response.json({ error: 'Send the file as multipart form data in a field named "file".' }, { status: 400 });
    }
    // curl sends application/octet-stream unless told otherwise; infer from the extension then
    const type = file.type && file.type !== "application/octet-stream" ? file.type : guessType(file.name);
    if (!ALLOWED_TYPES.test(type)) {
      await releaseUploadToken(claim.uploadId);
      return Response.json({ error: "Only PDFs and images (jpeg, png, gif, webp) can be uploaded." }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      await releaseUploadToken(claim.uploadId);
      return Response.json({ error: "Files can be at most 50 MB." }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storeUploadedFile({
      file: { name: file.name, type, size: file.size },
      buffer,
      pathPrefix: "item/mcp",
      uploadedById: claim.userId,
    });
    await completeUpload(claim.uploadId, stored.fileId);

    return Response.json({
      fileId: stored.fileId,
      name: stored.name,
      size: stored.size,
      mimeType: stored.mimetype,
      md5: stored.etag.replace(/"/g, ""),
      next: "Call attach_item_document with this fileId.",
    });
  } catch (error) {
    console.error("MCP upload failed:", error);
    await releaseUploadToken(claim.uploadId).catch(() => undefined);
    return Response.json({ error: "Upload failed. Try again with the same link." }, { status: 500 });
  }
}

const guessType = (name: string) => {
  const ext = name.toLowerCase().split(".").pop();
  if (ext === "pdf") return "application/pdf";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png" || ext === "gif" || ext === "webp") return `image/${ext}`;
  return "";
};
