import { GuideSection } from "../types";
import { planningDashboardSection } from "./dashboard";
import { bprBasicsSection } from "./basics";
import { bprStepsSection } from "./steps";
import { bprQualitySection } from "./quality";
import { bprNotesSection } from "./notes";
import { bprActivitySection } from "./activity";

// The planning dashboard (`planning`, declarative) plus one section per BPR detail
// tab (keyed `bpr-<tab>` and driven by BprHelper.tsx from bprDetailsSlice.currentTab).
export const planningSections: GuideSection[] = [
  planningDashboardSection,
  bprBasicsSection,
  bprStepsSection,
  bprQualitySection,
  bprNotesSection,
  bprActivitySection,
];
