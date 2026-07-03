import { GuideSection } from "../types";
import { mbprListSection } from "./list";
import { mbprOverviewSection } from "./overview";
import { mbprInstructionsSection } from "./instructions";
import { mbprNotesSection } from "./notes";
import { mbprActivitySection } from "./activity";
import { mbprRndSection } from "./rnd";
import { mbprEditSection } from "./edit";

// The MBPR list (`mbpr`, declarative), one section per detail tab (keyed
// `mbpr-<tab>` and driven by MbprHelper.tsx from mbprDetailsSlice.currentTab), and
// the create/edit wizard (`mbpr-edit`, declarative).
export const mbprSections: GuideSection[] = [
  mbprListSection,
  mbprOverviewSection,
  mbprInstructionsSection,
  mbprNotesSection,
  mbprActivitySection,
  mbprRndSection,
  mbprEditSection,
];
