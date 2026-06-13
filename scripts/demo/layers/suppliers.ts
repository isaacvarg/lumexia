import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import { randInt } from '../lib/timeline';
import { SUPPLIERS } from '../data/suppliers';

export interface DemoSupplier {
  id: string;
  name: string;
}

export const seedSuppliers = async (): Promise<DemoSupplier[]> => {

  const suppliers: DemoSupplier[] = SUPPLIERS.map((s) => ({ id: uuid(), name: s.name }));

  await insert(
    'supplier',
    SUPPLIERS.map((s, i) => ({
      id: suppliers[i].id,
      name: s.name,
      addressStreet1: s.street,
      addressStreet2: null,
      addressCity: s.city,
      addressState: s.state,
      addressZip: s.zip,
      phone: `(${s.area}) 555-${randInt(1000, 9999)}`,
      recordStatusId: refs.recordStatuses.active,
    })),
  );

  return suppliers;
};
