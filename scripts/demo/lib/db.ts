import prisma from '@/lib/prisma';

// type-asserted as any so we can index models dynamically, mirroring the
// approach in scripts/initialization/main.ts.
export const db = prisma as any;
export { prisma };

// create many for a model and return them so the next layers can use the data 
export const insert = async <T extends object>(model: string, rows: T[]): Promise<T[]> => {
  if (rows.length === 0) return rows;
  await db[model].createMany({ data: rows });
  console.log(`  + ${rows.length.toString().padStart(4)} ${model}`);
  return rows;
};
