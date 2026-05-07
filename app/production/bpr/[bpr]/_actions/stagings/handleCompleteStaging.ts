'use server'

import prisma from "@/lib/prisma"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { BprBomItem } from "../getBprBom";
import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses";

export const handleStagingComplete = async (bprBomItem: BprBomItem) => {

  const response = await prisma.bprBillOfMaterials.update({
    where: {
      id: bprBomItem.id,
    },
    data: {
      statusId: bprBomLineStatuses.staged
    }
  });

  await createActivityLog('completeMaterialStaging', 'bpr', bprBomItem.bprId, { context: `#${bprBomItem.bom.identifier} ${bprBomItem.bom.item.name} was staged.` })

  return response
}
