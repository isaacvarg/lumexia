import { assertDemoEnv } from './lib/guard';
import { db, prisma } from './lib/db';
import { seedDemo } from './seed';

const DEMO_EMAIL = '@demo.lumexia';

const WIPE_ORDER: string[] = [
  'requestNote',
  'requestBpr',
  'requestPurchaseOrder',
  'requestInventorySnapshot',
  'purchasingRequest',
  'bprStatusTransition',
  'bprNote',
  'poAccountingAuditLog',
  'poAccountingNote',
  'poAccountingDetail',
  'purchaseOrderNote',
  'purchaseOrderNoteType',
  'inventoryAuditTransaction',
  'discrepancyAuditItemTransaction',
  'auditRequestNote',
  'auditRequest',
  'inventoryAudit',
  'discrepancyAuditItemNote',
  'discrepancyAuditItem',
  'discrepancyAudit',
  'transaction',
  'lotOrigin',
  'purchaseOrderItem',
  'purchaseOrder',
  'lot',
  'batchProductionRecord',
  'batchSize',
  'billOfMaterial',
  'batchStep',
  'masterBatchProductionRecord',
  'itemNote',
  'supplierAlias',
  'alias',
  'item',
  'itemNoteType',
  'supplier',
  'itemType'
];

const wipe = async (): Promise<void> => {
  console.log('💣 Clearing existing demo data...');
  for (const model of WIPE_ORDER) {
    try {
      const { count } = await db[model].deleteMany({});
      console.log(`  - ${count.toString().padStart(4)} ${model}`);
    } catch (error) {
      throw new Error(`💔 Failed clearing "${model}": ${(error as Error).message}`, { cause: error });
    }
  }

  // demo users + their role assignments only — spare init's system user.
  const roleAssignments = await db.userRoleAssignment.deleteMany({
    where: { user: { email: { contains: DEMO_EMAIL } } },
  });
  console.log(`  - ${roleAssignments.count.toString().padStart(4)} userRoleAssignment`);
  const usersDeleted = await db.user.deleteMany({ where: { email: { contains: DEMO_EMAIL } } });
  console.log(`  - ${usersDeleted.count.toString().padStart(4)} user`);
};

assertDemoEnv();

wipe()
  .then(seedDemo)
  .catch((error) => {
    console.error('💔 An error occurred while resetting demo data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🎉 Demo reset process finished.');
  });
