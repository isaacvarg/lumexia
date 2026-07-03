import { GuideSection } from "../types";
import { accountingPosSection } from "./pos";
import { accountingPosDetailSection } from "./posDetail";
import { accountingPricingSection } from "./pricing";
import { accountingPricingConductSection } from "./pricingConduct";
import { accountingPricingReviewSection } from "./pricingReview";
import { accountingPricingItemSection } from "./pricingItem";
import { accountingPricingTemplatesSection } from "./pricingTemplates";
import { accountingPaymentsSection } from "./payments";

// The accounting module: PO Matching (list + detail), Pricing (landing, conduct,
// review, per-item overview, templates), and Payments. Every accounting tab is local
// Tabs2 (not a store), so all sections are set declaratively with HelperSetter.
export const accountingSections: GuideSection[] = [
  accountingPosSection,
  accountingPosDetailSection,
  accountingPricingSection,
  accountingPricingConductSection,
  accountingPricingReviewSection,
  accountingPricingItemSection,
  accountingPricingTemplatesSection,
  accountingPaymentsSection,
];
