'use server'

import prisma from "@/lib/prisma"

type Input = {
  itemParameterId: string
  examinationTypeId: string
  name: string
  specificationType: string
  valueA: string
  valueB?: string | null
  displayOnCoa: boolean
  inputs: { parameterInputDefinitionId: string; value: string }[]
}

export const createQcItemSpecification = async (data: Input) => {
  return await prisma.$transaction(async (tx) => {
    const spec = await tx.qcItemSpecification.create({
      data: {
        itemParameterId: data.itemParameterId,
        examinationTypeId: data.examinationTypeId,
        name: data.name,
        specificationType: data.specificationType,
        valueA: data.valueA,
        valueB: data.valueB ?? null,
        displayOnCoa: data.displayOnCoa,
      },
    })

    if (data.inputs.length > 0) {
      await tx.qcItemSpecificationInput.createMany({
        data: data.inputs.map((i) => ({
          itemSpecificationId: spec.id,
          parameterInputDefinitionId: i.parameterInputDefinitionId,
          value: i.value,
        })),
      })
    }

    return spec
  })
}
