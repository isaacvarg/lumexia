'use server'
import { recordStatuses } from "@/configs/staticRecords/recordStatuses"
import prisma from "@/lib/prisma"

export const archiveSupplier = async (supplierId: string) => {
  const response = await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      recordStatusId: recordStatuses.archived,
    },
  });
  return response
}
