import { GuideSection } from "./types";
import { homeSection } from "./home";
import { itemsSection } from "./items";
import { itemDetailsSections } from "./itemDetails";
import { purchasingRequestSections } from "./purchasingRequests";
import { purchaseOrderSections } from "./purchaseOrders";
import { supplierSections } from "./suppliers";
import { receivingSections } from "./receiving";
import { mbprSections } from "./mbpr";
import { planningSections } from "./planning";
import { compoundingSections } from "./compounding";
import { productionQualitySections } from "./productionQuality";
import { qualityModuleSections } from "./quality";
import { researchSections } from "./research";
import { accountingSections } from "./accounting";
import { settingsSections } from "./settings";

export const guideSections: GuideSection[] = [
  homeSection,
  itemsSection,
  ...itemDetailsSections,
  ...purchasingRequestSections,
  ...purchaseOrderSections,
  ...supplierSections,
  ...receivingSections,
  ...mbprSections,
  ...planningSections,
  ...compoundingSections,
  ...productionQualitySections,
  ...qualityModuleSections,
  ...researchSections,
  ...accountingSections,
  ...settingsSections,
];

const byId = new Map(guideSections.map((section) => [section.id, section]));

// Look up a section by its id — used by the helper store / setters.
export const getGuideSection = (id: string): GuideSection | undefined =>
  byId.get(id);

export * from "./types";
