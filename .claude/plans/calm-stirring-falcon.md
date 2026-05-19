# Exclude the current BPR from its own inventory calculations

## Context

Commit `1939bd6` added soft-allocation / soft-availability quantities to inventory.
On the BPR planning detail page (`app/production/planning/[bprReferenceCode]/page.tsx`),
material inventory is computed by `getAllInventoryByBom` (exported as
`inventoryActions.inventory.getAllByBprBom`).

That function sums **every** `bprBillOfMaterials` row for the item — including the
rows belonging to the BPR currently being viewed. As a result the page's own
demand is double-counted:

- When the viewed BPR is `draft`, its bom line is part of `totalQuantitySoftAllocated`,
  so `totalQuantitySoftAvailability` (= onHand − allocated − softAllocated) subtracts
  this BPR's own demand. The sufficiency check then compares that already-reduced
  number against `material.quantity` again.
- When the viewed BPR is `queued`/`stagingMaterials`/`compounding`/`completed`/
  `awaitingMaterials`, its bom line is part of `totalQuantityAllocated`, so
  `totalQuantityAvailable` (= onHand − allocated) is likewise self-reduced.

The fix: a BPR's inventory figures should be self-exclusive — "what is available
to *this* BPR" must not count *this* BPR's own allocation.

## Change

**File: `actions/inventory/inventory/getAllByBom.ts`**

Each `material` in the `bom.map(...)` is a `BprBomItem` and carries the scalar
`material.bprId` (all lines share the same BPR). Add a `bprId` exclusion to both
Prisma queries:

- `allocated` query (`prisma.bprBillOfMaterials.findMany`): add
  `bprId: { not: material.bprId }` to the `where` clause.
- `softAllocated` query: add the same `bprId: { not: material.bprId }` to its `where`.

No signature change is needed, so both callers
(`app/production/planning/[bprReferenceCode]/page.tsx:28` and
`store/planningDashboardSlice.ts:107`) work unchanged.

Effects after the change:
- `totalQuantityAllocated` / `totalQuantitySoftAllocated` = quantity committed to
  **other** BPRs only.
- `totalQuantityAvailable` / `totalQuantitySoftAvailability` = quantity genuinely
  free for this BPR.
- `isAvailableSufficient` / `isSoftSufficient` in `MaterialSufficiencyLine.tsx`
  become correct (compare free inventory against this BPR's requirement once).
- The "Allocations" table in `MaterialAllocationPanels.tsx` (driven by
  `material.allocated`) no longer lists the current BPR — it shows competing BPRs.

## Tooltip wording

**File: `app/production/planning/[bprReferenceCode]/_components/bom/MaterialAllocationPanels.tsx`**

Update the `Allocated` and `Soft Allocated` tooltips (lines 56–57) so the wording
matches the new behavior — e.g. "committed to **other** confirmed BPRs…" and
"committed to **other** draft BPRs…", noting these exclude the current BPR.

## Verification

1. Open a BPR planning page for a `draft` BPR. Confirm `Soft Allocated` for each
   material no longer includes this BPR's required quantity, and `Soft Availability`
   increases accordingly.
2. Open a BPR in a confirmed status; confirm `Available` no longer subtracts this
   BPR's own line, and the Allocations dialog table omits the current BPR.
3. Cross-check the item-level page (`getInventory` / `getByItem`) still shows the
   full org-wide totals — it is intentionally not changed.
