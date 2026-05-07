"use server"

import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses";
import prisma from "@/lib/prisma";

export const getAwaitingVerificationBprs = async (isSecondary: boolean = false) => {
  const { staged, primaryVerified } = bprBomLineStatuses

  const statusId = isSecondary ? primaryVerified : staged


  const bprs = await prisma.batchProductionRecord.findMany({
    where: {
      BprBillOfMaterials: {
        some: {
          statusId,
        }
      }
    },
    include: {
      status: true,
      batchSize: true,
      mbpr: {
        include: {
          producesItem: true,
        }
      }

    }
  })

  return bprs;

}
