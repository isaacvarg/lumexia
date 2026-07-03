import { GuideSection } from "../types";
import { researchExperimentsSection } from "./experiments";
import { researchGroupsSection } from "./groups";
import { experimentBasicsSection } from "./basics";
import { experimentVariantsSection } from "./variants";
import { experimentSamplesSection } from "./samples";
import { experimentCostSection } from "./cost";
import { experimentNotesSection } from "./notes";
import { experimentFilesSection } from "./files";

// The R&D module: the experiments list tabs (keyed `research-<tab>`, driven by
// ExperimentsListHelper from tabSlice.activeTab.researchExperiments) and the
// experiment detail tabs (keyed `experiment-<tab>`, driven by ExperimentHelper from
// tabSlice.activeTab.experimentDetails). Both use the global tab store.
export const researchSections: GuideSection[] = [
  researchExperimentsSection,
  researchGroupsSection,
  experimentBasicsSection,
  experimentVariantsSection,
  experimentSamplesSection,
  experimentCostSection,
  experimentNotesSection,
  experimentFilesSection,
];
