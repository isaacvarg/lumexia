import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses";
import prisma from "@/lib/prisma";
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { advanceBpr } from "./transitions";

export const maybeCompleteStaging = async (bprId: string) => {
  const boms = await prisma.bprBillOfMaterials.findMany({
    where: { bprId },
    select: { statusId: true },
  });

  const allVerified = boms.length > 0 && boms.every(
    (b) => b.statusId === bprBomLineStatuses.secondaryVerified
  );

  if (!allVerified) return;

  await advanceBpr(bprId, 'stagingCompleted');
  await createActivityLog('updateBpr', 'bpr', bprId, {
    context: `BPR staging of materials completed`,
  });
};
