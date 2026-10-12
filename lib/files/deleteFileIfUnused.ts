import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

// Removes a file record once whatever it was attached to is gone. A file can be shared, e.g. an inbox
// document filed on an item, so if something still points at it the record is kept.
export const deleteFileIfUnused = async (fileId: string) => {
  try {
    await prisma.file.delete({ where: { id: fileId } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") return false;
    throw e;
  }
};
