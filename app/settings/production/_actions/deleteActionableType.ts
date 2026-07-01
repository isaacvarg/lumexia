"use server"

import prisma from "@/lib/prisma"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"

export const deleteActionableType = async (id: string) => {
  const inUse = await prisma.stepActionable.count({ where: { actionableTypeId: id } })
  if (inUse > 0) {
    throw new Error(`Cannot delete: ${inUse} step actionable(s) reference this type.`)
  }

  const deleted = await prisma.stepActionableType.delete({ where: { id } })
  await createActivityLog('delete', 'stepActionableType', deleted.id, {
    context: `Deleted actionable type "${deleted.name}"`,
  })
  return deleted
}
