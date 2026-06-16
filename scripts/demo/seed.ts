import { seedUsers, usersByRole } from './layers/users';
import { seedSuppliers } from './layers/suppliers';
import { seedItemTypes } from './layers/itemTypes';
import { seedItems } from './layers/items';

// layers demo data on top of the initialized data (static records)
// layers run in dependency order; each returns the ids the next layer needs

export const seedDemo = async (): Promise<void> => {
  console.log('🌱 Seeding demo data...');

  console.log('✨ Users');
  const users = await seedUsers();
  const purchasingUsers = usersByRole(users, 'purchasing');
  const productionUsers = usersByRole(users, 'production');

  console.log('✨ Suppliers');
  const suppliers = await seedSuppliers();

  console.log('✨ Item Types');
  const itemTypes = await seedItemTypes();

  console.log('✨ Items');
  const items = await seedItems(itemTypes);
  console.log(JSON.stringify(items, null, 2));

  console.log('✅ Demo data seeded.');
};
