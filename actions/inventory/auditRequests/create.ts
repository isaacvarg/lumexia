'use server'
import { getUserId } from "@/actions/users/getUserId"
import prisma from "@/lib/prisma"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { revalidatePath } from "next/cache"
import { auditRequestStatuses } from "@/configs/staticRecords/auditRequestStatuses"
import { InterimAuditRequestNote } from "@/app/production/planning/[bprReferenceCode]/_components/bom/AuditRequest"

export const createAuditRequest = async (notes: InterimAuditRequestNote[], itemId: string, requestById?: string) => {

  const userId = requestById ?? await getUserId()
  // create the request
  const auditRequest = await prisma.auditRequest.create({
    data: {
      requestById: userId,
      statusId: auditRequestStatuses.open,
      itemId,
    },
    include: {
      item: true
    }
  })

  // create the notes
  await Promise.all(notes.map(async (note) => {
    const response = await prisma.auditRequestNote.create({
      data: {
        requestId: auditRequest.id,
        userId,
        noteTypeId: note.requestNoteTypeId,
        content: note.content
      }
    })

    return response
  }))



  // log the creation

  await createActivityLog('addAuditRequest', 'auditRequest', auditRequest.id, { context: `Audit Request added for ${auditRequest.item.name}` }, !!requestById)
  revalidatePath('/')

  return auditRequest;
}
