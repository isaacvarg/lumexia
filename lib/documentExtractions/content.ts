import { createHash } from "crypto";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";
import { s3 } from "@/lib/s3";

// Extractions belong to file content. Uploads record their sha256; files uploaded before that get it the
// first time something needs it: the object is read from storage, hashed, and the hash saved on the File.

type HashableFile = { id: string; sha256: string | null; bucketName: string; objectName: string };

export const hashStoredFile = async (file: HashableFile) => {
  if (file.sha256) return file.sha256;
  const object = await s3.send(new GetObjectCommand({ Bucket: file.bucketName, Key: file.objectName }));
  if (!object.Body) throw new Error("The file isn't in storage.");
  const hash = createHash("sha256");
  for await (const chunk of object.Body as AsyncIterable<Uint8Array>) hash.update(chunk);
  const sha256 = hash.digest("hex");
  // outside any write transaction: a correct hash is worth keeping even if the write that wanted it fails
  await prisma.file.update({ where: { id: file.id }, data: { sha256 } });
  return sha256;
};

const fileSelect = { id: true, sha256: true, bucketName: true, objectName: true, name: true } as const;

// An item document and the sha256 of its file.
export const documentContent = async (documentId: string) => {
  const document = await prisma.itemFile.findUnique({
    where: { id: documentId },
    select: { id: true, itemId: true, fileTypeId: true, supersededAt: true, file: { select: fileSelect } },
  });
  if (!document) return null;
  return { document, sha256: await hashStoredFile(document.file) };
};

// Hashes the files that don't have one yet, at most `limit` per call so a long list stays quick; the
// rest come back without a hash and are reported as not checked yet.
export const hashFiles = async (files: HashableFile[], limit = 25) => {
  const hashes = new Map<string, string | null>();
  let hashed = 0;
  for (const file of files) {
    if (file.sha256) hashes.set(file.id, file.sha256);
    else if (hashed < limit) {
      hashed++;
      try {
        hashes.set(file.id, await hashStoredFile(file));
      } catch {
        hashes.set(file.id, null);
      }
    } else hashes.set(file.id, null);
  }
  return hashes;
};
