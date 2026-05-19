"use server"

import prisma from "@/lib/prisma"


export const getLinkedPos = async (requestId: string, itemId: string) => {

    const linkedPos = await prisma.requestPurchaseOrder.findMany({
        where: {
            requestId,
        },
        include: {
            po: {
                include: {
                    purchaseOrderItems: {
                        where: {
                            itemId,
                        },
                        include: {
                            item: true,
                            details: true,
                            uom: true,
                        },
                    },
                    status: true,
                    supplier: true,
                },
            },
        },
    });

    return linkedPos;
};


type LinkedPosType = Awaited<ReturnType<typeof getLinkedPos>>;

export type LinkedPos = LinkedPosType[number];
