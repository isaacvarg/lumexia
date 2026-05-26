'use server'

import prisma from "@/lib/prisma"

type Input = {
  id: string
  examinationTypeId: string
  name: string
  specificationType: string
  valueA: string
  valueB?: string | null
  displayOnCoa: boolean
  inputs: { parameterInputDefinitionId: string; value: string }[]
}

export const updateQcItemSpecification = async (data: Input) => {
  return await prisma.$transaction(async (tx) => {
    const spec = await tx.qcItemSpecification.update({
      where: { id: data.id },
      data: {
        examinationTypeId: data.examinationTypeId,
        name: data.name,
        specificationType: data.specificationType,
        valueA: data.valueA,
        valueB: data.valueB ?? null,
        displayOnCoa: data.displayOnCoa,
      },
    })

    await tx.qcItemSpecificationInput.deleteMany({
      where: { itemSpecificationId: data.id },
    })

    if (data.inputs.length > 0) {
      await tx.qcItemSpecificationInput.createMany({
        data: data.inputs.map((i) => ({
          itemSpecificationId: data.id,
          parameterInputDefinitionId: i.parameterInputDefinitionId,
          value: i.value,
        })),
      })
    }

    return spec
  })
}
