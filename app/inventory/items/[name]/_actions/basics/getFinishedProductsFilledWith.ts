'use server'

import prisma from "@/lib/prisma"
import { recordStatuses } from "@/configs/staticRecords/recordStatuses"

// Finished products filled with this item, i.e. it's sold to customers in some form.
// Used to suggest marking an item as sold, never to set it automatically.
export const getFinishedProductsFilledWith = async (itemId: string) => {
  return prisma.finishedProduct.findMany({
    where: { filledWithItemId: itemId, recordStatusId: { not: recordStatuses.archived } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 5,
  })
}
