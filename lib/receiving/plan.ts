const QUANTITY_EPSILON = 1e-6;

// How a PO line's open quantity divides between what arrived and what's still expected.
export const planLine = (openQuantity: number, lotQuantities: number[]) => {
  const received = lotQuantities.reduce((sum, q) => sum + q, 0);
  const remainder = openQuantity - received > QUANTITY_EPSILON ? openQuantity - received : 0;
  return { received, remainder, overReceived: received > openQuantity + QUANTITY_EPSILON };
};
