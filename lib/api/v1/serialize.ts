// Wire shapes for /api/v1. Absent values are null, never omitted; timestamps are ISO 8601 UTC.

export type TypeRow = { id: string; name: string };

export const serializeType = (row: TypeRow) => ({ id: row.id, name: row.name, archived: false });

export const serializeInventoryType = (row: TypeRow & { isTracked: boolean }) => ({
  ...serializeType(row),
  isTracked: row.isTracked,
});

export type ItemRow = {
  id: string;
  referenceCode: string;
  name: string;
  itemTypeId: string | null;
  procurementTypeId: string | null;
  inventoryTypeId: string | null;
  updatedAt: Date;
  archived: boolean;
  aliases: { name: string; updatedAt: Date }[];
};

export const serializeItem = (row: ItemRow) => {
  // Alias edits don't touch the item row, so the item counts as changed when its newest alias did.
  const updatedAt = row.aliases.reduce((latest, a) => (a.updatedAt > latest ? a.updatedAt : latest), row.updatedAt);
  return {
    id: row.id,
    referenceCode: row.referenceCode,
    name: row.name,
    aliases: Array.from(new Set(row.aliases.map((a) => a.name))).sort(),
    itemTypeId: row.itemTypeId ?? null,
    procurementTypeId: row.procurementTypeId ?? null,
    inventoryTypeId: row.inventoryTypeId ?? null,
    archived: row.archived,
    updatedAt: updatedAt.toISOString(),
  };
};

export type LotRow = { id: string; itemId: string; lotNumber: string; createdAt: Date };

// Lots have no status of their own, so none is ever archived.
export const serializeLot = (row: LotRow) => ({
  id: row.id,
  itemId: row.itemId,
  lotNumber: row.lotNumber,
  archived: false,
  createdAt: row.createdAt.toISOString(),
});
