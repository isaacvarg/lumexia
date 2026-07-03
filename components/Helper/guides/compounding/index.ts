import { GuideSection } from "../types";
import { compoundingDashboardSection } from "./dashboard";
import { compoundingBatchSection } from "./batch";
import { compoundingStagingSection } from "./staging";
import { compoundingStepSection } from "./step";

// Compounding has no tab state — the view is chosen by the batch's status and by
// route — so each route gets its own declarative section (set with HelperSetter).
export const compoundingSections: GuideSection[] = [
  compoundingDashboardSection,
  compoundingBatchSection,
  compoundingStagingSection,
  compoundingStepSection,
];
