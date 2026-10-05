"use server";

import { getUserId } from "@/actions/users/getUserId";
import { getArtifactHistory, getItemCanon, refreshAllArtifacts } from "@/lib/canon/queries";

export const getCanonForItem = async (itemId: string) => {
  const userId = await getUserId();
  return getItemCanon(userId, itemId);
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
