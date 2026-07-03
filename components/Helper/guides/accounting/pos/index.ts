import { GuideSection } from "../../types";
import Overview from "./Overview";
import Dashboard from "./Dashboard";

export const accountingPosSection: GuideSection = {
  id: "accounting-pos",
  title: "PO Accounting",
  overview: Overview,
  guides: [
    {
      title: "The accounting dashboard",
      description: "The single accounting record and its Paid/Slip/Invoice states.",
      content: Dashboard,
    },
  ],
};
