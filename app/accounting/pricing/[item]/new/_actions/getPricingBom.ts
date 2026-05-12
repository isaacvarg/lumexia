'use server'

import prisma from "@/lib/prisma";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";

export const getPricingBom = async (mbprId: string) => {
    const bom = await prisma.billOfMaterial.findMany({
        where: {
            mbprId,
            recordStatusId: {
                not: recordStatuses.archived,
            },
        },
        include: {
            item: {
                include: {
                    itemPricingData: {
                        include: {
                            upcomingPriceUom: true,
                        }
                    },
                    purchaseOrderItem: {
                        include: {
                            uom: true,
                            purchaseOrders: {
                                select: {
                                    supplierId: true,
                                    referenceCode: true
                                }
                            }
                        },
                        take: 1,
                        orderBy: {
                            updatedAt: 'desc',
                        },
                    },
                },
            }
        }
    });

    return bom;
}

export type PricingBOM = Awaited<ReturnType<typeof getPricingBom>>[number]


