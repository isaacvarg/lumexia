'use server'

import prisma from "@/lib/prisma"

export const deleteUnitOfMeasurement = async (id: string) => {
  const [items, lots, txns, poItems, audits, samples, conversions, discrete] = await Promise.all([
    prisma.item.count({ where: { inventoryUomId: id } }),
    prisma.lot.count({ where: { uomId: id } }),
    prisma.transaction.count({ where: { uomId: id } }),
    prisma.purchaseOrderItem.count({ where: { uomId: id } }),
    prisma.discrepancyAuditItem.count({ where: { quantitiesUomId: id } }),
    prisma.experimentSample.count({ where: { uomId: id } }),
    prisma.unitOfMeasurementConversion.count({ where: { OR: [{ uomAId: id }, { uomBId: id }] } }),
    prisma.discreteUnitOfMeasurementConversion.count({ where: { OR: [{ uomAId: id }, { uomBId: id }] } }),
  ])

  const total = items + lots + txns + poItems + audits + samples + conversions + discrete

  if (total > 0) {
    return {
      success: false as const,
      error: `This unit can't be deleted because ${total} record(s) still reference it.`,
    }
  }

  try {
    await prisma.unitOfMeasurement.delete({ where: { id } })
    return { success: true as const }
  } catch {
    return {
      success: false as const,
      error: "This unit can't be deleted because existing records still reference it.",
    }
  }
}
