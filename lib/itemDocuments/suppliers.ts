// Pre-select a supplier for a new document only when the purchase history clearly points at one: the only
// supplier the item was ever ordered from, or the only one it was ordered from in the last 12 months.
export const suggestSupplierId = (orderedFrom: { id: string; lastOrderedAt: Date | string }[], now = new Date()) => {
  if (orderedFrom.length === 1) return orderedFrom[0].id
  const yearAgo = new Date(now)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)
  const recent = orderedFrom.filter((s) => new Date(s.lastOrderedAt) >= yearAgo)
  return recent.length === 1 ? recent[0].id : ""
}
