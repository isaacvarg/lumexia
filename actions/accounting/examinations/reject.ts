'use server'

import { revalidatePath } from "next/cache"
import { getUserId } from "@/actions/users/getUserId"
import { rejectExamination } from "@/lib/pricing/examinationReview"

export const rejectPricingExamination = async (examinationId: string) => {
    const userId = await getUserId()

    const result = await rejectExamination(examinationId, userId)

    revalidatePath('/accounting/pricing/details')
    revalidatePath('/accounting/pricing')

    return result
}
