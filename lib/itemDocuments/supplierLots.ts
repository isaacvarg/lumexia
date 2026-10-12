// Supplier lot numbers are typed at the dock and read off documents (sometimes by OCR), so they're compared
// loosely: case, spaces, hyphens, underscores and slashes don't count. "ab-123 4" matches "AB1234".
export const normalizeSupplierLot = (value: string) => value.toUpperCase().replace(/[\s\-_/]+/g, "");

export const sameSupplierLot = (a: string, b: string) => {
  const na = normalizeSupplierLot(a);
  return na.length > 0 && na === normalizeSupplierLot(b);
};

// Trimmed, or null when blank, for storing.
export const cleanSupplierLot = (value: string | null | undefined) => value?.trim() || null;
