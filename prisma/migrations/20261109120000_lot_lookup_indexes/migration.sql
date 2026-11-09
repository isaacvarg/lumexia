-- Lot lookups by lot number (case-insensitive, used by the v1 REST API while a packer scans) and by item.
-- The expression index is not expressible in schema.prisma; queries must filter on lower(lot_number).
CREATE INDEX "lots_lower_lot_number_idx" ON "lots" (lower("lot_number"));

-- CreateIndex
CREATE INDEX "lots_item_id_idx" ON "lots"("item_id");

-- Alias and reference-code matching for the v1 items filters.
CREATE INDEX "aliases_lower_name_idx" ON "aliases" (lower("name"));
CREATE INDEX "items_lower_reference_code_idx" ON "items" (lower("reference_code"));
