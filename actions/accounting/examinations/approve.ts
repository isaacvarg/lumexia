'use server'

import prisma from "@/lib/prisma"
import { pricingExaminationStatuses } from "@/configs/staticRecords/pricingExaminationStatuses"
import { revalidatePath } from "next/cache"
import { getUserId } from "@/actions/users/getUserId"

export const approvePricingExamination = async (examinationId: string) => {
    const userId = await getUserId()

    const exam = await prisma.pricingExamination.findUniqueOrThrow({
        where: { id: examinationId },
        select: { userId: true, statusId: true },
    })

    if (exam.statusId !== pricingExaminationStatuses.pendingReview) {
        throw new Error("Only pricing examinations that are pending review can be approved.")
    }

    if (exam.userId === userId) {
        throw new Error("You cannot approve a pricing examination that you drafted.")
    }

    const response = await prisma.pricingExamination.update({
        where: { id: examinationId },
        data: {
            statusId: pricingExaminationStatuses.approved,
            approvedById: userId,
            approvedAt: new Date(),
        },
    })

    revalidatePath('/accounting/pricing/details')
    revalidatePath('/accounting/pricing')

    return response
}
