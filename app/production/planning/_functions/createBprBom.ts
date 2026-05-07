"use server"

import billOfMaterialActions from "@/actions/production/billOfMaterials"
import bprActions from "@/actions/production/bprActions"
import bprBomActions from "@/actions/production/bprBom"
import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses"
import { uom } from "@/configs/staticRecords/unitsOfMeasurement"
import { recordStatuses } from "@/configs/staticRecords/recordStatuses"
import { ExBillOfMaterials } from "@/types/billOfMaterials"

export const createBprBom = async (bprId: string) => {

  const bpr = await bprActions.getOne(bprId, undefined, ["batchSize"]);
  const allBom = await billOfMaterialActions.getAll({ mbprId: bpr.mbprId }, ["item"])
  const mbprBom = allBom.filter((item: ExBillOfMaterials) => item.recordStatusId !== recordStatuses.archived)
  const batchSize = await bpr.batchSize.quantity // assumes base uom of lb

  console.log(bpr)
  console.log(mbprBom)

  mbprBom.forEach(async (item: ExBillOfMaterials) => {

    const quantity = batchSize * (item.concentration * 0.01)


    await createBprBomItem(bpr.id, item.id, quantity);

  });



}

const createBprBomItem = async (bprId: string, bomId: string, quantity: number) => {

  await bprBomActions.createNew({
    bprId,
    bomId,
    quantity,
    uomId: uom.pounds,
    statusId: bprBomLineStatuses.pending,
  })
}
