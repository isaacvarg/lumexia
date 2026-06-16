import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { chance, sample, stamp } from '../lib/timeline';
import { PAYMENT_METHODS } from '../data/pricing';
import { DemoSupplier } from './suppliers';

export interface DemoPaymentMethod {
  id: string;
  methodName: string;
}

// PaymentMethod is not seeded at init, so the demo creates the café's wallet and a
// few supplier ↔ method links. Returned to the PO layer so orders can carry a method.
export const seedPaymentMethods = async (suppliers: DemoSupplier[]): Promise<DemoPaymentMethod[]> => {
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

  // give most suppliers a preferred method or two
  const links = suppliers.flatMap((supplier) =>
    sample(methods, chance(0.5) ? 2 : 1).map((m) => ({
      id: uuid(),
      supplierId: supplier.id,
      paymentMethodId: m.id,
      ...stamp(new Date()),
    })),
  );
  await insert('supplierPaymentMethod', links);

  return methods.map(({ id, data }) => ({ id, methodName: data.methodName }));
};
