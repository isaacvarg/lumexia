import { GuideSection } from "../../types";
import Overview from "./Overview";
import AccountingDetail from "./AccountingDetail";

export const purchaseOrderAccountingSection: GuideSection = {
  id: "po-accounting",
  title: "Purchase order — Accounting",
  overview: Overview,
  guides: [
    {
      title: "Accounting detail",
      description: "The Details, Notes, and Files sub-tabs and what they feed.",
      content: AccountingDetail,
    },
  ],
};
