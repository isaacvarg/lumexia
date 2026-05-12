"use server"

import prisma from "@/lib/prisma"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { Prisma } from "@prisma/client"

export const updateActionableType = async (id: string, data: Prisma.StepActionableTypeUncheckedUpdateInput) => {
  const updated = await prisma.stepActionableType.update({ where: { id }, data })
  await createActivityLog('update', 'stepActionableType', updated.id, {
    context: `Updated actionable type "${updated.name}"`,
  })
  return updated
}
