"use server"

import { recordStatuses } from "@/configs/staticRecords/recordStatuses"
import prisma from "@/lib/prisma"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

export type CreateItemInput = {
  name: string
  referenceCode: string
  itemTypeId: string
  inventoryTypeId: string
  procurementTypeId: string
  inventoryUomId: string
}

type CreateItemResult =
  | { success: true; item: { id: string; name: string } }
  | { success: false; error: string }

// Returns an error instead of throwing, so the dialog can say why an item wasn't created
// (a thrown server action error is masked in production and the dialog just sat there).
export const createItem = async (input: CreateItemInput): Promise<CreateItemResult> => {
  const name = input.name?.trim()
  const referenceCode = input.referenceCode?.trim()
  const required: [keyof CreateItemInput, string][] = [
    ["itemTypeId", "an item type"],
    ["inventoryTypeId", "an inventory type"],
    ["procurementTypeId", "a procurement type"],
    ["inventoryUomId", "an inventory unit of measurement"],
  ]

  if (!name) return { success: false, error: "The item needs a name." }
  if (!referenceCode) return { success: false, error: "The item needs a reference code." }
  const missing = required.find(([key]) => !input[key])
  if (missing) return { success: false, error: `Choose ${missing[1]}.` }

  const existing = await prisma.item.findFirst({
    where: { referenceCode: { equals: referenceCode, mode: "insensitive" } },
    select: { name: true, referenceCode: true },
  })
  if (existing) {
    return { success: false, error: `${existing.referenceCode} is already used by '${existing.name}'.` }
  }

  try {
    const item = await prisma.item.create({
      data: {
        recordStatusId: recordStatuses.active,
        name,
        referenceCode,
        itemTypeId: input.itemTypeId,
        inventoryTypeId: input.inventoryTypeId,
        procurementTypeId: input.procurementTypeId,
        inventoryUomId: input.inventoryUomId,
      },
      select: { id: true, name: true },
    })

    await createActivityLog("Item Created", "item", item.id, { context: `'${item.name}' item was created` })
    revalidatePath("/inventory/items")

    return { success: true, item }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: `${referenceCode} is already used by another item.` }
    }
    console.error("createItem failed", error)
    return { success: false, error: "The item couldn't be created. Check the server logs for details." }
  }
}
