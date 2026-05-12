"use server"

import bprBomActions from "@/actions/production/bprBom";
import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses";
import { maybeCompleteStaging } from "@/lib/bpr/maybeCompleteStaging";
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

  await maybeCompleteStaging(bomItem.bprId);

}
