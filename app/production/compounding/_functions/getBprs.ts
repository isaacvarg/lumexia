import prisma from "@/lib/prisma";
import { DateTime } from "luxon"

export const getBprs = async () => {
    const now = DateTime.now();

    const startOfWeek = now.startOf('week').toISO();
    const endOfWeek = now.plus({ weeks: 1 }).endOf('week').toISO();


    const bprs = await prisma.batchProductionRecord.findMany({
        where: {
            scheduledForStart: {
                gte: startOfWeek,
                lte: endOfWeek
            }
        },
        include: {
            status: true,
            batchSize: true,
            mbpr: {
                include: {
                    producesItem: true,
                }
            },
            lotOrigin: {
                include: {
                    lot: true,
                }
            }

        }
    })

    return bprs
}
