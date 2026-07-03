import { GuideSection } from "../types";
import { suppliersListSection } from "./list";
import { supplierDetailsSection } from "./details";

// The suppliers list (`suppliers`) and the supplier detail page
// (`supplier-details`), both set declaratively with HelperSetter. The detail page's
// tabs are local Tabs2 state (no tab-store key), so its guides live in one section.
export const supplierSections: GuideSection[] = [
  suppliersListSection,
  supplierDetailsSection,
];
