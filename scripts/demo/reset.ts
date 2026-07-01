import { assertDemoEnv } from './lib/guard';
import { db, prisma } from './lib/db';
import { seedDemo } from './seed';
import { appConfigGroups } from '@/configs/staticRecords/appConfigGroups';

const DEMO_EMAIL = '@demo.lumexia';

const WIPE_ORDER: string[] = [
  // activity feed (entityId is a plain string, no FK — safe to wipe first)
  'activityLog',
  // quality / QC (children first; must precede purchaseOrderItem, lot, batchProductionRecord, item)
  'qcParameterInputResult',
  'qcParameterResult',
  'qcRecordNote',
  'qcAuditLog',
  'qcRecordFile',
  'qcRecord',
  'qcItemSpecificationInput',
  'qcItemSpecification',
  'qcItemParameter',
  'qcTemplateParameter',
  'qcGroupParameter',
  'qcTemplate',
  'qcParameterGroup',
  'qcParameterInputDefinition',
  'qcParameter',
  'requestNote',
  'requestBpr',
  'requestPurchaseOrder',
  'requestInventorySnapshot',
  'purchasingRequest',
  'bprStatusTransition',
  'bprNote',
  'bprStagingConsumption',
  'bprStaging',
  'bprStepActionable',
  'bprBatchStep',
  'bprBillOfMaterials',
  // pricing examinations + templates (children first; reference items/mbpr/etc wiped later)
  'pricingExaminationNote',
  'pricingExaminationValidation',
  'itemConsumerContainerArchive',
  'consumerContainerArchive',
  'finishedProductAuxiliaryArchive',
  'finishedProductArchive',
  'bomPricingDataArchive',
  'producedPricingDataArchive',
  'itemPricingDataArchive',
  'pricingExamination',
  'itemConsumerContainer',
  'consumerContainer',
  'finishedProductAuxiliary',
  'finishedProduct',
  'itemPricingData',
  'pricingTemplateAuxiliary',
  'pricingTemplateFinishedProduct',
  'pricingTemplate',
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
  'batchSizeCompoundingVessel',
  'batchSize',
  'stepInstruction',
  'stepEquipment',
  'stepActionable',
  'stepAddendum',
  'billOfMaterial',
  'batchStep',
  'mbprNote',
  'masterBatchProductionRecord',
  'compoundingVessel',
  'equipment',
  'equipmentType',
  'mbprNoteType',
  'discreteUnitOfMeasurementConversion',
  'itemNote',
  'supplierAlias',
  'alias',
  'item',
  'itemNoteType',
  'supplierPaymentMethod',
  'paymentMethod',
  'supplierContact', // must precede supplier (supplier_contacts_supplier_id_fkey)
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

  // demo-only pack UOMs are the non-standard ones (init seeds all uoms as standard).
  // The standard SI UnitOfMeasurementConversion rows are init/reference data — kept.
  const packUoms = await db.unitOfMeasurement.deleteMany({ where: { isStandardUom: false } });
  console.log(`  - ${packUoms.count.toString().padStart(4)} unitOfMeasurement (pack)`);

  // demo users + their role assignments / per-user configs only — spare init's system user.
  const roleAssignments = await db.userRoleAssignment.deleteMany({
    where: { user: { email: { contains: DEMO_EMAIL } } },
  });
  console.log(`  - ${roleAssignments.count.toString().padStart(4)} userRoleAssignment`);
  const userConfigs = await db.userConfig.deleteMany({
    where: { user: { email: { contains: DEMO_EMAIL } } },
  });
  console.log(`  - ${userConfigs.count.toString().padStart(4)} userConfig`);
  const usersDeleted = await db.user.deleteMany({ where: { email: { contains: DEMO_EMAIL } } });
  console.log(`  - ${usersDeleted.count.toString().padStart(4)} user`);

  // demo-owned config groups only (seedConfigs reseeds these). init's general /
  // inventoryaudits groups are reference data — kept.
  const configsDeleted = await db.config.deleteMany({
    where: { configGroupId: { in: [appConfigGroups.microform, appConfigGroups.company] } },
  });
  console.log(`  - ${configsDeleted.count.toString().padStart(4)} config (demo groups)`);
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
