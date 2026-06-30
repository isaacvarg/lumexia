// aggregatesx the auto-generated static records (name -> UUID maps) that the
// demo seed needs. These files are produced by `npm run init` +
// `npm run generate-static-records`
// these obviously must exists so seed can only happen after initializing lumexia

import { recordStatuses } from '@/configs/staticRecords/recordStatuses';
import { purchaseOrderStatuses } from '@/configs/staticRecords/purchaseOrderStatuses';
import { poAccountingStatuses } from '@/configs/staticRecords/poAccountingStatuses';
import { poAccountingNoteTypes } from '@/configs/staticRecords/poAccountingNoteTypes';
import { bprStatuses } from '@/configs/staticRecords/bprStatuses';
import { bprNoteTypes } from '@/configs/staticRecords/bprNoteTypes';
import { requestStatuses } from '@/configs/staticRecords/requestStatuses';
import { requestPriorities } from '@/configs/staticRecords/requestPriorities';
import { requestNoteTypes } from '@/configs/staticRecords/requestNoteTypes';
import { transactionTypes } from '@/configs/staticRecords/transactionTypes';
import { itemTypes } from '@/configs/staticRecords/itemTypes';
import { procurementTypes } from '@/configs/staticRecords/procurementTypes';
import { inventoryTypes } from '@/configs/staticRecords/inventoryTypes';
import { uom } from '@/configs/staticRecords/unitsOfMeasurement';
import { userRoles } from '@/configs/staticRecords/userRoles';
import { aliasTypes } from '@/configs/staticRecords/aliasTypes';
import { auditRequestStatuses } from '@/configs/staticRecords/auditRequestStatuses';
import { auditRequestNoteTypes } from '@/configs/staticRecords/auditRequestNoteTypes';
import { discrepancyAuditStatuses } from '@/configs/staticRecords/discrepancyAuditStatuses';
import { discrepancyAuditItemStatuses } from '@/configs/staticRecords/discrepancyAuditItemStatuses';
import { discrepancyAuditItemNoteTypes } from '@/configs/staticRecords/discrepancyAuditItemNoteTypes';
import { bprBatchStepStatuses } from '@/configs/staticRecords/bprBatchStepStatuses';
import { bprBomLineStatuses } from '@/configs/staticRecords/bprBomLineStatuses';
import { bprStagingStatuses } from '@/configs/staticRecords/bprStagingStatuses';
import { bprStepActionableStatuses } from '@/configs/staticRecords/bprStepActionableStatuses';
import { stepActionableTypes } from '@/configs/staticRecords/stepActionableTypes';
import { stepAddendumTypes } from '@/configs/staticRecords/stepAddendumTypes';
import { pricingExaminationStatuses } from '@/configs/staticRecords/pricingExaminationStatuses';
import { pricingExaminationNoteTypes } from '@/configs/staticRecords/pricingExaminationNoteTypes';
import { qcDataTypes } from '@/configs/staticRecords/qcDataTypes';
import { qcExaminationTypes } from '@/configs/staticRecords/qcExaminationTypes';
import { qcRecordStatuses } from '@/configs/staticRecords/qcRecordStatuses';
import { qcRecordNoteTypes } from '@/configs/staticRecords/qcRecordNoteTypes';

export const refs = {
  recordStatuses,
  purchaseOrderStatuses,
  poAccountingStatuses,
  poAccountingNoteTypes,
  bprStatuses,
  bprNoteTypes,
  requestStatuses,
  requestPriorities,
  requestNoteTypes,
  transactionTypes,
  itemTypes,
  procurementTypes,
  inventoryTypes,
  uom,
  userRoles,
  aliasTypes,
  auditRequestStatuses,
  auditRequestNoteTypes,
  discrepancyAuditStatuses,
  discrepancyAuditItemStatuses,
  discrepancyAuditItemNoteTypes,
  bprBatchStepStatuses,
  bprBomLineStatuses,
  bprStagingStatuses,
  bprStepActionableStatuses,
  stepActionableTypes,
  stepAddendumTypes,
  pricingExaminationStatuses,
  pricingExaminationNoteTypes,
  qcDataTypes,
  qcExaminationTypes,
  qcRecordStatuses,
  qcRecordNoteTypes,
};
