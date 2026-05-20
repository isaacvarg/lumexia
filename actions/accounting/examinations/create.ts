"use server"

import { getUserId } from "@/actions/users/getUserId"
import { pricingExaminationStatuses } from "@/configs/staticRecords/pricingExaminationStatuses"
import prisma from "@/lib/prisma"
import { wipeQueuedExams } from "./_helpers/wipeQueuedExams"

export const createExamination = async (examinedItemId: string, examinationId?: string) => {

    const userId = await getUserId()

    return prisma.$transaction(async (tx) => {
        await wipeQueuedExams(examinedItemId, tx)

        return tx.pricingExamination.create({
            data: {
                userId,
                examinedItemId,
                statusId: pricingExaminationStatuses.queued,
                ...(examinationId && { id: examinationId }),
            },
        })
    })
}
