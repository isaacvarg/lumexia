import { GuideSection } from "../types";
import { purchaseOrderBoardSection } from "./board";
import { purchaseOrderItemsSection } from "./items";
import { purchaseOrderAccountingSection } from "./accounting";
import { purchaseOrderNotesSection } from "./notes";
import { purchaseOrderActivitySection } from "./activity";
import { purchaseOrderOptionsSection } from "./options";

// The purchase orders board (`purchase-orders`, set declaratively) plus one section
// per PO detail tab (keyed `po-<tab>` and driven by POHelper.tsx from the active
// tab in the tab store).
export const purchaseOrderSections: GuideSection[] = [
  purchaseOrderBoardSection,
  purchaseOrderItemsSection,
  purchaseOrderAccountingSection,
  purchaseOrderNotesSection,
  purchaseOrderActivitySection,
  purchaseOrderOptionsSection,
];
