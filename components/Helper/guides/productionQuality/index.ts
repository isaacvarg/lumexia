import { GuideSection } from "../types";
import { productionQualityDashboardSection } from "./dashboard";
import { productionQualityVerifySection } from "./verify";

// Production-side verification that gates a batch during manufacturing — distinct
// from the top-level /quality QC module. No tab state, so declarative sections: the
// dashboard plus a shared "verify" section on the three verification routes.
export const productionQualitySections: GuideSection[] = [
  productionQualityDashboardSection,
  productionQualityVerifySection,
];
