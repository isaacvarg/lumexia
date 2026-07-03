import { GuideSection } from "../types";
import { qcSection } from "./qc";
import { qcExaminationsSection } from "./examinations";
import { qcConductSection } from "./conduct";
import { qcParamParametersSection } from "./parameters";
import { qcParamGroupsSection } from "./groups";
import { qcParamTemplatesSection } from "./templates";
import { qcParamDetailSection } from "./parameterDetail";
import { microSection } from "./micro";

// The standalone top-level Quality module: the QC hub, examinations (list/detail),
// conducting an examination, the parameters manager tabs (keyed `qc-param-<tab>` and
// driven by QcParametersHelper.tsx from qcParametersSlice.currentTab), the parameter
// config page, and Micro. All declarative except the parameters tabs.
export const qualityModuleSections: GuideSection[] = [
  qcSection,
  qcExaminationsSection,
  qcConductSection,
  qcParamParametersSection,
  qcParamGroupsSection,
  qcParamTemplatesSection,
  qcParamDetailSection,
  microSection,
];
