import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { chance, sample, stamp } from '../lib/timeline';
import { PAYMENT_METHODS } from '../data/pricing';
import { DemoSupplier } from './suppliers';

export interface DemoPaymentMethod {
  id: string;
  methodName: string;
}

export interface DemoPaymentMethods {
  methods: DemoPaymentMethod[];
  // supplierId -> the payment methods linked to that supplier (its preferred wallet)
  idsBySupplier: Map<string, string[]>;
}

// PaymentMethod is not seeded at init, so the demo creates the café's wallet and a
// few supplier ↔ method links. Returned to the PO layer so orders can carry a method —
// preferentially one belonging to the order's supplier.
export const seedPaymentMethods = async (suppliers: DemoSupplier[]): Promise<DemoPaymentMethods> => {
  const methods = PAYMENT_METHODS.map((m) => ({ id: uuid(), data: m }));

  await insert(
    'paymentMethod',
    methods.map(({ id, data }) => ({
      id,
      methodName: data.methodName,
      associatedName: data.associatedName,
      paymentType: data.paymentType,
      identifier: data.identifier,
      accountEndingIn: data.accountEndingIn ?? null,
      expiry: data.expiry ?? null,
      limit: data.limit,
      bgColorA: data.bgColorA,
      bgColorB: data.bgColorB,
      circleColorA: data.circleColorA ?? null,
      circleColorB: data.circleColorB ?? null,
    })),
  );

  // give most suppliers a preferred method or two, and remember the mapping so POs can
  // pay with one of their supplier's methods
  const idsBySupplier = new Map<string, string[]>();
  const links = suppliers.flatMap((supplier) => {
    const chosen = sample(methods, chance(0.5) ? 2 : 1);
    idsBySupplier.set(supplier.id, chosen.map((m) => m.id));
    return chosen.map((m) => ({
      id: uuid(),
      supplierId: supplier.id,
      paymentMethodId: m.id,
      ...stamp(new Date()),
    }));
  });
  await insert('supplierPaymentMethod', links);

  return {
    methods: methods.map(({ id, data }) => ({ id, methodName: data.methodName })),
    idsBySupplier,
  };
};
