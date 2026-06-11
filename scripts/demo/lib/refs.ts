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
};
