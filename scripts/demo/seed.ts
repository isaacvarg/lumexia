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
import { seedEquipment } from './layers/equipment';
import { seedMbprs } from './layers/mbprs';
import { seedBprs } from './layers/bprs';
import { seedPaymentMethods } from './layers/paymentMethods';
import { seedPricingTemplates } from './layers/pricingTemplates';
import { seedPricing } from './layers/pricing';
import { seedPackUoms } from './layers/uomConversions';
import { seedConfigs } from './layers/configs';

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
  console.log('✨ App Configs');
  await seedConfigs();

  console.log('✨ Suppliers');
  const suppliers = await seedSuppliers();

  console.log('✨ Item Types');
  const itemTypes = await seedItemTypes();

  console.log('✨ Payment Methods');
  const { methods: paymentMethods, idsBySupplier: paymentMethodIdsBySupplier } = await seedPaymentMethods(suppliers);

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
  console.log('✨ Pack UOMs & Discrete Conversions');
  const packMap = await seedPackUoms(items.ingredients);

  console.log('✨ Purchase Orders');
  const { pos, lots } = await seedPurchaseOrders(80, suppliers, items.purchased, purchasingUsers, paymentMethods, paymentMethodIdsBySupplier, packMap);

  console.log('✨ Purchasing Requests');
  await seedPurchasingRequests(pos, items.purchased, purchasingUsers);

  console.log('✨ Audits');
  await seedAudits(items.purchased, lots, users);

  // ┌──────────────────────────────────┐
  // │ ＰＲＯＤＵＣＴＩＯＮ  (ＭＢＰＲ) │
  // └──────────────────────────────────┘
  console.log('✨ Equipment & Vessels');
  const equipment = await seedEquipment();

  console.log('✨ MBPRs');
  const mbprs = await seedMbprs(items.produced, items.ingredients, equipment, productionUsers);

  console.log('✨ BPRs');
  await seedBprs(40, mbprs, lots, productionUsers);

  // ┌──────────────────────────────────────────┐
  // │ ＡＣＣＯＵＮＴＩＮＧ  /  ＰＲＩＣＩＮＧ │
  // └──────────────────────────────────────────┘
  const packagingItems = items.purchased.filter((i) => i.type === 'Cafe Supplies');

  console.log('✨ Pricing Templates');
  await seedPricingTemplates(itemTypes, packagingItems);

  console.log('✨ Pricing Examinations');
  await seedPricing(items.purchased, items.produced, mbprs, equipment, packagingItems, users);


  // finally
  console.log('✅ Demo data seeded.');
};
