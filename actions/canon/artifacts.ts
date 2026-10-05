"use server";

import { getUserId } from "@/actions/users/getUserId";
import prisma from "@/lib/prisma";
import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import { getArtifactHistory, getItemCanon, getSupplierCanonEntries, refreshAllArtifacts } from "@/lib/canon/queries";

export const getCanonForItem = async (itemId: string) => {
  const userId = await getUserId();
  return getItemCanon(userId, itemId);
};

export const getCanonSupplierEntries = async (itemId: string, supplierId: string) => {
  const userId = await getUserId();
  return getSupplierCanonEntries(userId, itemId, supplierId);
};

export const getCanonSupplierOptions = async () => {
  await getUserId();
  return prisma.supplier.findMany({
    where: { recordStatusId: { not: recordStatuses.archived } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
};

export const getCanonArtifactHistory = async (artifactId: string) => {
  await getUserId();
  return getArtifactHistory(artifactId);
};

// manual trigger; a scheduled job should call refreshAllArtifacts from lib/canon directly
export const refreshAllCanonArtifacts = async () => {
  await getUserId();
  return refreshAllArtifacts();
};
