'use server'

import prisma from "@/lib/prisma"

export const deleteQcItemSpecification = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.qcItemSpecificationInput.deleteMany({
      where: { itemSpecificationId: id },
    })
    return await tx.qcItemSpecification.delete({
      where: { id },
    })
  })
}
