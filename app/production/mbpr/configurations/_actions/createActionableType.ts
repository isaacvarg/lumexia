"use server"

import prisma from "@/lib/prisma"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { Prisma } from "@prisma/client"

export const createActionableType = async (data: Prisma.StepActionableTypeUncheckedCreateInput) => {
  const created = await prisma.stepActionableType.create({ data })
  await createActivityLog('create', 'stepActionableType', created.id, {
    context: `Created actionable type "${created.name}" (${created.dataType})`,
  })
  return created
}
