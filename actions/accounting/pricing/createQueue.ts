"use server"

import { createExamination } from "@/actions/accounting/examinations/create"

interface CreateQueueInput {
    itemId: string
    isCompleted?: boolean
}

export const createPricingQueue = async (data: CreateQueueInput) => {
    return createExamination(data.itemId)
}
