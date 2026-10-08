'use server'

import { revalidatePath } from "next/cache"
import { getUserId } from "@/actions/users/getUserId"
import { approveExamination } from "@/lib/pricing/examinationReview"

export const approvePricingExamination = async (examinationId: string) => {
    const userId = await getUserId()

    const response = await approveExamination(examinationId, userId)

    revalidatePath('/accounting/pricing/details')
    revalidatePath('/accounting/pricing')

    return response
}
