"use server"

import prisma from "@/lib/prisma"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog";
import { bprStagingStatuses } from "@/configs/staticRecords/bprStagingStatuses";
import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses";
import { advanceBpr } from "@/lib/bpr/transitions";
import { transactionTypes } from "@/configs/staticRecords/transactionTypes";
import { uom } from "@/configs/staticRecords/unitsOfMeasurement";
import { Prisma } from "@prisma/client";
import bprActions from "@/actions/production/bprActions";
import { productionActions } from "@/actions/production";
import { BprStaging } from "@/actions/production/bprs/stagings/getAll";
import { BprConsumptionError, StagingOperation } from "@/utils/errors/BprConsumptionError";
import { bprNoteTypes } from "@/configs/staticRecords/bprNoteTypes";
import { users } from "@/configs/staticRecords/users";

class StagingOperationError extends Error {
  operation: StagingOperation;
  originalError: unknown;

  constructor(operation: StagingOperation, originalError: unknown) {
    const message = originalError instanceof Error ? originalError.message : String(originalError);
    super(message);
    this.operation = operation;
    this.originalError = originalError;
  }
}

export const handleCompletedBprCascade = async (bprId: string) => {

  try {
    const bpr = await bprActions.getOne(bprId);

    if (!bpr) {
      throw new BprConsumptionError('BPR_NOT_FOUND', `BPR with id ${bprId} not found.`, { bprId, });
    }

    const stagings = await getStagings(bprId);

    if (stagings instanceof BprConsumptionError) {
      throw stagings;
    }

    try {
      await prisma.$transaction(async (tx) => {

        await cleanupPreviousConsumption(bprId, tx);

        for (const staging of stagings) {
          try {
            await processStaging(staging, users.lumexia, tx);
          } catch (error) {
            const itemName = staging.lot?.lotNumber ?? 'Unknown';
            const quantity = Number(staging.quantity);
            const stagingUom = staging.uom?.abbreviation ?? 'lbs';
            const operation = error instanceof StagingOperationError ? error.operation : 'createTransaction';
            const errorMessage = error instanceof Error ? error.message : String(error);

            throw new BprConsumptionError(
              'STAGING_FAILED',
              `Staging consumption failed for ${itemName} during ${operation}.`,
              {
                bprId,
                referenceCode: bpr.referenceCode,
                failedStaging: {
                  lotId: staging.lotId,
                  itemName,
                  quantity,
                  uom: stagingUom,
                  operation,
                  errorMessage,
                },
              }
            );
          }
        }

        await advanceBpr(bprId, 'completionCascadeSucceeded', { tx });
      });
    } catch (error) {
      if (error instanceof BprConsumptionError) {
        throw error;
      }
      throw new BprConsumptionError('TRANSACTION_FAILED', 'Failed to execute BPR consumption transaction.', { bprId, referenceCode: bpr.referenceCode, error });
    }


    await createActivityLog('cascadeBprCompletion', 'bpr', bprId, { context: `BPR #${bpr.referenceCode} completion cascade executed.` });

  } catch (error) {
    const consumptionError = error instanceof BprConsumptionError ? error : null;

    console.error(`BprConsumptionError in handleCompletedBprCascade for BPR ${bprId}:`, {
      name: consumptionError?.name ?? 'UnknownError',
      message: consumptionError?.message ?? String(error),
      data: consumptionError?.data,
    });

    // Set BPR status to failed (outside rolled-back transaction)
    try {
      await advanceBpr(bprId, 'completionCascadeFailed');
    } catch (statusError) {
      console.error(`Failed to set BPR ${bprId} status to failed:`, statusError);
    }

    // Write failure note to BPR
    try {
      const failedStaging = consumptionError?.data?.failedStaging;

      const content = failedStaging
        ? [
            `Error Code: ${consumptionError.name}`,
            `Message: ${consumptionError.message}`,
            `Root Cause:`,
            `  Material: ${failedStaging.itemName}`,
            `  Lot: ${failedStaging.lotId}`,
            `  Quantity: ${failedStaging.quantity} ${failedStaging.uom}`,
            `  Failed Operation: ${failedStaging.operation}`,
            `  Error Detail: ${failedStaging.errorMessage}`,
          ].join('\n')
        : [
            `Error Code: ${consumptionError?.name ?? 'UNKNOWN'}`,
            `Message: ${consumptionError?.message ?? String(error)}`,
          ].join('\n');

      await prisma.bprNote.create({
        data: {
          bprId,
          userId: users.lumexia,
          noteTypeId: bprNoteTypes.cascadeError,
          content,
        },
      });
    } catch (noteError) {
      console.error(`Failed to create failure note for BPR ${bprId}:`, noteError);
    }

    // Write activity log for failure
    try {
      await createActivityLog('cascadeBprCompletionFailed', 'bpr', bprId, {
        errorCode: consumptionError?.name ?? 'UNKNOWN',
        errorMessage: consumptionError?.message ?? String(error),
        failedStaging: consumptionError?.data?.failedStaging ?? null,
      }, true);
    } catch (logError) {
      console.error(`Failed to create activity log for BPR ${bprId} failure:`, logError);
    }

    throw new Error("Failed to execute BPR completion cascade.");
  }
}


const getStagings = async (bprId: string): Promise<BprStaging[] | BprConsumptionError> => {

  try {
    const stagings = await productionActions.bprs.stagings.getAll(bprId);

    if (stagings.length === 0) {
      throw new BprConsumptionError('NO_STAGINGS_FOUND', 'There are no stagings assocaited with this BPR ID.', { bprId, })
    }
    return stagings;
  } catch (error) {
    if (error instanceof BprConsumptionError) {
      return error;
    }
    return new BprConsumptionError('GET_STAGINGS_FAILED', `Failed to get stagings for BPR ${bprId}.`, { bprId, error });
  }

}

const processStaging = async (staging: BprStaging, userId: string, tx: Prisma.TransactionClient) => {
  try {
    await createTransaction(staging, userId, tx)
  } catch (error) {
    throw new StagingOperationError('createTransaction', error);
  }

  try {
    await tx.bprBillOfMaterials.update({
      where: { id: staging.bprBomId },
      data: { statusId: bprBomLineStatuses.consumed }
    })
  } catch (error) {
    throw new StagingOperationError('updateBom', error);
  }

  try {
    await tx.bprStaging.update({
      where: { id: staging.id },
      data: { bprStagingStatusId: bprStagingStatuses.consumed }
    })
  } catch (error) {
    throw new StagingOperationError('updateStagingStatus', error);
  }
}

async function cleanupPreviousConsumption(bprId: string, tx: Prisma.TransactionClient) {
  const consumptions = await tx.bprStagingConsumption.findMany({
    where: { bprStaging: { bprBom: { bprId } } },
    select: { id: true, transactionId: true, bprStagingId: true, bprStaging: { select: { bprBomId: true } } }
  })

  if (consumptions.length === 0) return

  const consumptionIds = consumptions.map(c => c.id)
  const transactionIds = consumptions.map(c => c.transactionId)
  const stagingIds = consumptions.map(c => c.bprStagingId)
  const bomIds = Array.from(new Set(consumptions.map(c => c.bprStaging.bprBomId)))

  await tx.bprStagingConsumption.deleteMany({ where: { id: { in: consumptionIds } } })

  await tx.transaction.deleteMany({ where: { id: { in: transactionIds } } })

  await tx.bprStaging.updateMany({
    where: { id: { in: stagingIds }, bprStagingStatusId: bprStagingStatuses.consumed },
    data: { bprStagingStatusId: bprStagingStatuses.staged }
  })

  await tx.bprBillOfMaterials.updateMany({
    where: { id: { in: bomIds }, statusId: bprBomLineStatuses.consumed },
    data: { statusId: bprBomLineStatuses.staged }
  })
}

const createTransaction = async (staging: BprStaging, userId: string, tx: Prisma.TransactionClient) => {

  const transactionPayload = {
    lotId: staging.lotId,
    transactionTypeId: transactionTypes.bprConsumption,
    userId,
    uomId: uom.pounds,
    amount: staging.quantity,
    systemNote: `Consumed by BPR# ${staging.bprBom.bpr.referenceCode}`,
    userNote: "",
  };

  const transaction = await tx.transaction.create({ data: transactionPayload })

  await tx.bprStagingConsumption.create({
    data: {
      transactionId: transaction.id,
      bprStagingId: staging.id,
    }
  })
}
