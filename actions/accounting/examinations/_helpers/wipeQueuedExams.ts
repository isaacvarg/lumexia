"use server"

import prisma from "@/lib/prisma"
import { pricingExaminationStatuses } from "@/configs/staticRecords/pricingExaminationStatuses"
import { Prisma } from "@prisma/client"

type Client = Prisma.TransactionClient | typeof prisma

export const wipeQueuedExams = async (examinedItemId: string, client: Client = prisma) => {
    const queuedExams = await client.pricingExamination.findMany({
        where: {
            examinedItemId,
            statusId: pricingExaminationStatuses.queued,
        },
        select: { id: true },
    })

    if (queuedExams.length === 0) return

    const ids = queuedExams.map((e) => e.id)

    await client.pricingExaminationNoteFile.deleteMany({
        where: { pricingExaminationNote: { pricingExaminationId: { in: ids } } },
    })
    await client.pricingExaminationNote.deleteMany({
        where: { pricingExaminationId: { in: ids } },
    })
    await client.pricingExamination.deleteMany({
        where: { id: { in: ids } },
    })
}
