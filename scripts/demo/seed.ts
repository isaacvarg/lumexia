import { seedUsers, usersByRole } from './layers/users';
import { seedSuppliers } from './layers/suppliers';
import { seedItemTypes } from './layers/itemTypes';
import { seedItems } from './layers/items';
import { seedItemNoteTypes } from './layers/itemNoteTypes';
import { seedItemNotes } from './layers/itemNotes';
import { seedItemAliases } from './layers/itemAliases';
import { seedPurchaseOrders } from './layers/purchaseOrders';
import { seedPurchasingRequests } from './layers/purchasingRequests';
import { seedAudits } from './layers/audits';

// layers demo data on top of the initialized data (static records)
// layers run in dependency order; each returns the ids the next layer needs

export const seedDemo = async (): Promise<void> => {
  console.log('🌱 Seeding demo data...');

  console.log('✨ Users');
  const users = await seedUsers();
  const purchasingUsers = usersByRole(users, 'purchasing');
  const productionUsers = usersByRole(users, 'production');

  // ┌────────────────────────────────────┐
  // │ ＩＮＤＥＰＥＮＤＥＮＴ  ＳＴＵＦＦ │
  // └────────────────────────────────────┘
  console.log('✨ Suppliers');
  const suppliers = await seedSuppliers();

  console.log('✨ Item Types');
  const itemTypes = await seedItemTypes();

  // ┌────────────┐
  // │ ＩＴＥＭＳ │
  // └────────────┘
  console.log('✨ Items');
  const items = await seedItems(itemTypes);

  console.log('✨ Item Note Types');
  const noteTypes = await seedItemNoteTypes();

  console.log('✨ Item Notes');
  await seedItemNotes(items.all, users, noteTypes);

  console.log('✨ Item Aliases');
  await seedItemAliases(items.all, suppliers);

  // ┌──────────────────────────────────────────────┐
  // │ ＰＵＲＣＨＡＳＩＮＧ  ＆  ＩＮＶＥＮＴＯＲＹ │
  // └──────────────────────────────────────────────┘
  console.log('✨ Purchase Orders');
  const { pos, lots } = await seedPurchaseOrders(80, suppliers, items.purchased, purchasingUsers);

  console.log('✨ Purchasing Requests');
  await seedPurchasingRequests(pos, items.purchased, purchasingUsers);

  console.log('✨ Audits');
  await seedAudits(items.purchased, lots, users);


  // finally
  console.log('✅ Demo data seeded.');
};
