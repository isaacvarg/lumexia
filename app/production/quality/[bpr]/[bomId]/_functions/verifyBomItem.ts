"use server"

import bprActions from "@/actions/production/bprActions";
import bprBomActions from "@/actions/production/bprBom";
import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses";
import { bprStatuses } from "@/configs/staticRecords/bprStatuses";
import prisma from "@/lib/prisma";
import { BprBom } from "@/types/bprBom"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";

// the naming is really similar to the verifyBomItemStaging, but
// this is the overall bom item the other file is for the actual scan/staging to fulfill the item
// i.e., a bomitem can have many different lots scanned/stagings

export const verifyBomItem = async (bomItem: BprBom, isSecondary: boolean) => {

  console.log("oogie,goo", bomItem)

  const { primaryVerified, secondaryVerified } = bprBomLineStatuses;

  const statusId = isSecondary ? secondaryVerified : primaryVerified

  const payload = {
    statusId,
  };

  const bomResponse: BprBom = await bprBomActions.update({ id: bomItem.id }, payload)

  await createActivityLog('updateBprBom', 'bprBom', bomItem.id, { context: `BOM item status changed to ${bomResponse.statusId}` })

  await isBprStaged(bomItem.bprId);

}


const isBprStaged = async (bprId: string) => {

  const boms = await prisma.bprBillOfMaterials.findMany({
    where: {
      bprId,
    },
    include: {
      status: true,
    }
  });

  const isAllStaged = boms.every((item) => item.statusId === bprBomLineStatuses.secondaryVerified)

  if (!isAllStaged) {
    return;
  }

  handleAllStaged(bprId)
}

const handleAllStaged = async (bprId: string) => {

  await bprActions.update({ id: bprId }, { bprStatusId: bprStatuses.compounding });

  await createActivityLog('updateBpr', 'bpr', bprId, { context: `BPR staging of materials completed` });
} 
