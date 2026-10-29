"use server"

import prisma from "@/lib/prisma"

export const getAllQcParametersByItemAndQcRecord = async (itemId: string, qcRecordId: string) => {

  const parameters = await prisma.qcItemParameter.findMany({
    where: {
      itemId,
      results: {
        some: {
          qcRecordId,
          reviewState: "accepted",
        }
      }
    },
    include: {
      parameter: {
        include: {
          inputDefinitions: true,
        }
      },
      specifications: {
        include: {
          examinationType: true,
          itemSpecificationInputs: true,
        },
        orderBy: [
          { examinationTypeId: 'asc' },
          { name: 'asc' },
        ],
      },
      results: {
        where: {
          qcRecordId,
          // results from a supplier COA that a person still has to confirm stay off generated COAs
          reviewState: "accepted",
        },
        include: {
          parameterInputResults: true,
        },
        orderBy: { runNumber: 'asc' },
      }
    }
  });

  return parameters;
}

export type QcItemParameter = Awaited<ReturnType<typeof getAllQcParametersByItemAndQcRecord>>[number]
