'use server'

import prisma from "@/lib/prisma"
import { ProducedPricingSummations } from "../getBomWithPricing"
import { ItemPricingData } from "@/actions/accounting/pricing/getItemPricingData"
import { ProcessedFinishedProduct } from "@/store/pricingSharedSlice"
import { archiveProducedPricingData } from "./archiveProducedPricingData"
import { archiveItemPricingData } from "./archiveItemPricingData"
import { archiveFinishedProducts } from "./archiveFinishedProducts"
import { updateExaminationStatus } from "./updateExaminationStatus"

export type CompleteMainProps = {
    examinationId: string
    isProduced: boolean
    mbprId?: string
    producedPricingData?: ProducedPricingSummations
    purchasedPricingData?: ItemPricingData
    finishedProducts: any[]
    processedFinishedProducts: Record<string, ProcessedFinishedProduct>
    interimData: Record<string, any>
    totalCostPerLb: number
}

export const handleCompleteMain = async (props: CompleteMainProps) => {
    const {
        examinationId,
        isProduced,
        mbprId,
        producedPricingData,
        purchasedPricingData,
        finishedProducts,
        processedFinishedProducts,
        interimData,
        totalCostPerLb,
    } = props;

    try {
        await prisma.$transaction(async (tx) => {
            if (!isProduced && purchasedPricingData) {
                await archiveItemPricingData(examinationId, purchasedPricingData, tx);
            }

            if (isProduced && mbprId && producedPricingData) {
                await archiveProducedPricingData(examinationId, mbprId, producedPricingData, tx);
            }

            await archiveFinishedProducts(
                examinationId,
                finishedProducts,
                processedFinishedProducts,
                interimData,
                totalCostPerLb,
                tx,
            );

            await updateExaminationStatus(examinationId, tx);
        });

        return { success: true }
    } catch (error) {
        console.error("Error in handleCompleteMain:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
}
