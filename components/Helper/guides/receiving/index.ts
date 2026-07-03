import { GuideSection } from "../types";
import { receivingDashboardSection } from "./dashboard";
import { receivingDetailSection } from "./detail";

// The receiving dashboard (`receiving`) and an order's receiving page
// (`receiving-detail`), both set declaratively with HelperSetter — receiving's tabs
// are local Tabs2 state / stacked sections, not the global tab store.
export const receivingSections: GuideSection[] = [
  receivingDashboardSection,
  receivingDetailSection,
];
