import prisma from "@/lib/prisma"
import { pricingExaminationStatuses } from "@/configs/staticRecords/pricingExaminationStatuses"
import { pricingExaminationNoteTypes } from "@/configs/staticRecords/pricingExaminationNoteTypes"

// Approving and rejecting pricing examinations, shared by the pricing review page (server actions) and the
// MCP tools. Callers pass the reviewing user, so the review is recorded under the right person either way.

export const approveExamination = async (examinationId: string, userId: string) => {
    const exam = await prisma.pricingExamination.findUniqueOrThrow({
        where: { id: examinationId },
        select: { statusId: true },
    })

    if (exam.statusId !== pricingExaminationStatuses.pendingReview) {
        throw new Error("Only pricing examinations that are pending review can be approved.")
    }

    return prisma.pricingExamination.update({
        where: { id: examinationId },
        data: {
            statusId: pricingExaminationStatuses.approved,
            approvedById: userId,
            approvedAt: new Date(),
        },
    })
}

// Rejecting queues a fresh examination of the item that carries the rejected one's notes forward.
// An optional reason is added as a note first, so it shows on both.
export const rejectExamination = async (examinationId: string, userId: string, reason?: string) => {
    return prisma.$transaction(async (tx) => {
        const exam = await tx.pricingExamination.findUniqueOrThrow({
            where: { id: examinationId },
            select: { statusId: true, examinedItemId: true },
        })

        if (exam.statusId !== pricingExaminationStatuses.pendingReview) {
            throw new Error("Only pricing examinations that are pending review can be rejected.")
        }

        if (reason?.trim()) {
            await tx.pricingExaminationNote.create({
                data: {
                    pricingExaminationId: examinationId,
                    noteTypeId: pricingExaminationNoteTypes.general,
                    userId,
                    content: `Rejected: ${reason.trim()}`,
                },
            })
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
                examinedItemId: exam.examinedItemId,
                userId,
                statusId: pricingExaminationStatuses.queued,
                rejectedFromId: examinationId,
            },
        })

        const notes = await tx.pricingExaminationNote.findMany({
            where: { pricingExaminationId: examinationId },
            select: { noteTypeId: true, userId: true, content: true },
        })
        if (notes.length > 0) {
            await tx.pricingExaminationNote.createMany({
                data: notes.map((note) => ({ ...note, pricingExaminationId: newExam.id })),
            })
        }

        return { rejectedExam, newExam }
    })
}
