import { GuideSection } from "../../types";
import Overview from "./Overview";
import FourSteps from "./FourSteps";
import VerdictsAndRuns from "./VerdictsAndRuns";

export const qcConductSection: GuideSection = {
  id: "qc-conduct",
  title: "Conducting an examination",
  overview: Overview,
  guides: [
    {
      title: "The four steps",
      description: "Lot → Type → Examination → Verdict.",
      content: FourSteps,
    },
    {
      title: "Verdicts & runs",
      description: "Live PASS/FAIL/UNKNOWN badges, repeated runs, and the COA rule.",
      content: VerdictsAndRuns,
    },
  ],
};
