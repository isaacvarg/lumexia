'use server'

import prisma from "@/lib/prisma"
import { pricingExaminationStatuses } from "@/configs/staticRecords/pricingExaminationStatuses"
import { revalidatePath } from "next/cache"
import { getUserId } from "@/actions/users/getUserId"

export const rejectPricingExamination = async (examinationId: string) => {
    const userId = await getUserId()

    const result = await prisma.$transaction(async (tx) => {
        const currentExam = await tx.pricingExamination.findUniqueOrThrow({
            where: { id: examinationId },
            include: { PricingExaminationNote: true },
        })

        if (currentExam.statusId !== pricingExaminationStatuses.pendingReview) {
            throw new Error("Only pricing examinations that are pending review can be rejected.")
        }

        const rejectedExam = await tx.pricingExamination.update({
            where: { id: examinationId },
            data: {
                statusId: pricingExaminationStatuses.rejected,
                rejectedById: userId,
                rejectedAt: new Date(),
            },
        })

        const newExam = await tx.pricingExamination.create({
            data: {
                examinedItemId: currentExam.examinedItemId,
                userId,
                statusId: pricingExaminationStatuses.queued,
                rejectedFromId: examinationId,
            },
        })

        if (currentExam.PricingExaminationNote.length > 0) {
            await tx.pricingExaminationNote.createMany({
                data: currentExam.PricingExaminationNote.map((note) => ({
                    pricingExaminationId: newExam.id,
                    noteTypeId: note.noteTypeId,
                    userId: note.userId,
                    content: note.content,
                })),
            })
        }

        return { rejectedExam, newExam }
    })

    revalidatePath('/accounting/pricing/details')
    revalidatePath('/accounting/pricing')

    return result
}
