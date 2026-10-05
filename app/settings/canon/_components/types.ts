import type { getAllCanonDataTypes, getCanonResolverOptions } from "@/actions/canon/dataTypes";
import type { getAllCanonTeams } from "@/actions/canon/teams";
import type { CanonLookups } from "@/actions/canon/lookups";
import type { ItemType, ProcurementType } from "@prisma/client";

export type CanonDataTypeRow = Awaited<ReturnType<typeof getAllCanonDataTypes>>[number];
export type CanonTeamRow = Awaited<ReturnType<typeof getAllCanonTeams>>[number];
export type CanonResolverOption = Awaited<ReturnType<typeof getCanonResolverOptions>>[number];
export type CanonUserOption = { id: string; name: string | null; image: string | null };

export type CanonSettingsData = {
  dataTypes: CanonDataTypeRow[];
  lookups: CanonLookups;
  resolvers: CanonResolverOption[];
  teams: CanonTeamRow[];
  users: CanonUserOption[];
  itemTypes: ItemType[];
  procurementTypes: ProcurementType[];
};
