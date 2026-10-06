import { Db } from "@/lib/canon/db";

// Call after creating an ItemFile. Older current files with the same item, file type, issuer, lot and
// supplier are marked superseded. If one of them was issued after the new file (back-filling an old
// revision), the new file is the one marked superseded instead.
export const supersedeOlderItemFiles = async (db: Db, itemFileId: string, now: Date = new Date()) => {
  const file = await db.itemFile.findUniqueOrThrow({ where: { id: itemFileId } });

  const siblings = await db.itemFile.findMany({
    where: {
      id: { not: file.id },
      itemId: file.itemId,
      fileTypeId: file.fileTypeId,
      issuer: file.issuer,
      lotId: file.lotId,
      supplierId: file.supplierId,
      supersededAt: null,
    },
    select: { id: true, issuedAt: true },
  });

  const newer = siblings.some((s) => s.issuedAt && file.issuedAt && s.issuedAt > file.issuedAt);
  if (newer) {
    await db.itemFile.update({ where: { id: file.id }, data: { supersededAt: now } });
    return;
  }

  if (siblings.length > 0) {
    await db.itemFile.updateMany({
      where: { id: { in: siblings.map((s) => s.id) } },
      data: { supersededAt: now },
    });
  }
};
