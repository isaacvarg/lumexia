"use server"

import prisma from "@/lib/prisma"

export const getOnePricingExamination = async (id: string) => {
    const exam = await prisma.pricingExamination.findFirstOrThrow({
        where: {
            id,
        },
        include: {
            examinedItem: {
                include: {
                    procurementType: true,
                    itemType: true,
                }
            },
            user: true,
            status: true,
            approvedBy: true,
            rejectedBy: true,
            itemPricingDataArchive: true,
            consumerContainerArchive: {
                include: {
                    containerItem: true,
                    ItemConsumerContainerArchive: { include: { uom: true } },
                },
            },
            BomPricingDataArchive: { include: { item: true } },
            producedPricingDataArchives: true,
            FinishedProductArchive: {
                include: {
                    currentFinishedProduct: true,
                    fillUom: true,
                    filledWithItem: true,
                },
            },
            PricingExaminationNote: {
                include: {
                    user: true,
                    noteType: true,
                    files: { include: { file: true } },
                }
            }
        },
    });

    return exam
}

export type SinglePricingExaminationCombined = Awaited<ReturnType<typeof getOnePricingExamination>>


export type SinglePricingFinishedProduct = Awaited<ReturnType<typeof getOnePricingExamination>>["FinishedProductArchive"][number]


export type SinglePricingExamNote = SinglePricingExaminationCombined['PricingExaminationNote'][number];
