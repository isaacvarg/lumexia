'use server'

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import type { Db } from "@/lib/canon/db"
import { getUserId } from "@/actions/users/getUserId"
import { approveBaseline, CoaImportRefused, confirmResult, rejectResult } from "@/lib/qcCoaImport/importCoa"

// Only people approve; Hermes proposes over MCP and has no tool for any of these.
// Expected problems come back as a message; everything else is logged by the engine.
const run = async (fn: (db: Db, userId: string) => Promise<unknown>): Promise<{ error?: string }> => {
  try {
    const userId = await getUserId()
    await prisma.$transaction((tx) => fn(tx, userId), { timeout: 30_000 })
    revalidatePath("/quality/qc/review")
    return {}
  } catch (e) {
    if (e instanceof CoaImportRefused) return { error: e.message }
    throw e
  }
}

export const approveItemBaseline = (itemId: string) => run((db, userId) => approveBaseline(db, { userId }, itemId))
export const confirmImportedResult = (resultId: string) => run((db, userId) => confirmResult(db, { userId }, resultId))
export const rejectImportedResult = (resultId: string) => run((db, userId) => rejectResult(db, { userId }, resultId))
