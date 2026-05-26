"use server"

import prisma from "@/lib/prisma"

export const getAllQcParametersByItem = async (itemId: string) => {

  const parameters = await prisma.qcItemParameter.findMany({
    where: {
      itemId,
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
    }
  });

  return parameters;
}

export type QcItemParameter = Awaited<ReturnType<typeof getAllQcParametersByItem>>[number]
export type QcItemSpecificationWithInputs = QcItemParameter["specifications"][number]
