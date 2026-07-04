import prisma from '@/lib/prisma';

// checker if db has been seeded
// used by the container entrypoint to decide whether to seed an empty DB once.
// requestStatus is a random sampling static-record table seeded by `npm run init`.
prisma.requestStatus
  .count()
  .then((count) => process.exit(count > 0 ? 0 : 1))
  .catch(() => process.exit(1))
  .finally(async () => {
    await prisma.$disconnect();
  });
