import { assertDemoEnv } from './lib/guard';
import { prisma } from './lib/db';
import { seedDemo } from './seed';

// start for`npm run seed:demo`
// ensure that these have been run first: 
//    prisma migrate deploy -> npm run init -> npm run generate-static-records

// this ensures that we have the env demo variable set ot true
assertDemoEnv();


seedDemo()
  .catch((error) => {
    console.error('💔 An error occurred while seeding demo data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🎉 Demo seed process finished.');
  });
