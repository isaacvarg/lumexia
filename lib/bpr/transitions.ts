'use server';

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { bprStatuses } from "@/configs/staticRecords/bprStatuses";
import { BprEvent, BprStatusKey, transitionMap } from "./transitionMap";

const statusKeyById = (id: string): BprStatusKey | undefined => {
  for (const [key, value] of Object.entries(bprStatuses)) {
    if (value === id) return key as BprStatusKey;
  }
  return undefined;
};

const writeAdvance = async (
  tx: Prisma.TransactionClient,
  bprId: string,
  event: BprEvent,
  userId: string | undefined,
) => {
  const transition = transitionMap[event];
  if (!transition) throw new Error(`Unknown BPR event: ${event}`);

  const bpr = await tx.batchProductionRecord.findUnique({
    where: { id: bprId },
    select: { bprStatusId: true },
  });
  if (!bpr) throw new Error(`BPR ${bprId} not found`);

  const currentKey = statusKeyById(bpr.bprStatusId);
  if (!currentKey || !transition.from.includes(currentKey)) {
    throw new Error(
      `Illegal BPR transition: event '${event}' from status '${currentKey ?? bpr.bprStatusId}'. Allowed origins: ${transition.from.join(', ')}.`
    );
  }

  const toStatusId = bprStatuses[transition.to];

  await tx.batchProductionRecord.update({
    where: { id: bprId },
    data: { bprStatusId: toStatusId },
  });

  await tx.bprStatusTransition.create({
    data: {
      bprId,
      fromStatusId: bpr.bprStatusId,
      toStatusId,
      kind: 'automated',
      event,
      userId: userId ?? null,
    },
  });
};

export const advanceBpr = async (
  bprId: string,
  event: BprEvent,
  options?: { userId?: string; tx?: Prisma.TransactionClient },
) => {
  if (options?.tx) {
    return writeAdvance(options.tx, bprId, event, options.userId);
  }
  return prisma.$transaction((tx) => writeAdvance(tx, bprId, event, options?.userId));
};

const writeManual = async (
  tx: Prisma.TransactionClient,
  bprId: string,
  toStatusId: string,
  userId: string,
  reason: string | undefined,
) => {
  const bpr = await tx.batchProductionRecord.findUnique({
    where: { id: bprId },
    select: { bprStatusId: true },
  });
  if (!bpr) throw new Error(`BPR ${bprId} not found`);

  await tx.batchProductionRecord.update({
    where: { id: bprId },
    data: { bprStatusId: toStatusId },
  });

  await tx.bprStatusTransition.create({
    data: {
      bprId,
      fromStatusId: bpr.bprStatusId,
      toStatusId,
      kind: 'manual',
      userId,
      reason: reason ?? null,
    },
  });
};

export const setBprStatusManually = async (
  bprId: string,
  toStatusId: string,
  userId: string,
  reason?: string,
  options?: { tx?: Prisma.TransactionClient },
) => {
  if (options?.tx) {
    return writeManual(options.tx, bprId, toStatusId, userId, reason);
  }
  return prisma.$transaction((tx) => writeManual(tx, bprId, toStatusId, userId, reason));
};
