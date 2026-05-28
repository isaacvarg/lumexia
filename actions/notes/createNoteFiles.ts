"use server"

import prisma from "@/lib/prisma"

type NoteFileTable =
  | 'requestNoteFile'
  | 'generalRequestNoteFile'
  | 'purchaseOrderNoteFile'
  | 'poPublicNoteFile'
  | 'poSupplierNoteFile'
  | 'poAccountingNoteFile'
  | 'pricingExaminationNoteFile'
  | 'auditRequestNoteFile'
  | 'discrepancyAuditItemNoteFile'
  | 'lotNoteFile'
  | 'itemNoteFile'
  | 'bprNoteFile'
  | 'mbprNoteFile'
  | 'qcRecordNoteFile'
  | 'experimentNoteFile'
  | 'experimentSampleNoteFile'

const noteIdFieldMap: Record<NoteFileTable, string> = {
  requestNoteFile: 'requestNoteId',
  generalRequestNoteFile: 'generalRequestNoteId',
  purchaseOrderNoteFile: 'purchaseOrderNoteId',
  poPublicNoteFile: 'poPublicNoteId',
  poSupplierNoteFile: 'poSupplierNoteId',
  poAccountingNoteFile: 'poAccountingNoteId',
  pricingExaminationNoteFile: 'pricingExaminationNoteId',
  auditRequestNoteFile: 'auditRequestNoteId',
  discrepancyAuditItemNoteFile: 'discrepancyAuditItemNoteId',
  lotNoteFile: 'lotNoteId',
  itemNoteFile: 'itemNoteId',
  bprNoteFile: 'bprNoteId',
  mbprNoteFile: 'mbprNoteId',
  qcRecordNoteFile: 'qcRecordNoteId',
  experimentNoteFile: 'experimentNoteId',
  experimentSampleNoteFile: 'experimentSampleNoteId',
}

export const createNoteFiles = async (table: NoteFileTable, noteId: string, fileIds: string[]) => {
  if (!fileIds.length) return

  const noteIdField = noteIdFieldMap[table]
  const data = fileIds.map((fileId) => ({
    [noteIdField]: noteId,
    fileId,
  }))

  await (prisma[table] as any).createMany({ data })
}
