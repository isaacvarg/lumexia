import { GuideSection } from "../../types";
import Overview from "./Overview";
import Examinations from "./Examinations";

export const bprQualitySection: GuideSection = {
  id: "bpr-quality",
  title: "Batch — Quality",
  overview: Overview,
  guides: [
    {
      title: "Batch examinations",
      description: "QC tests against the batch's lot, gating Awaiting QC → Released.",
      content: Examinations,
    },
  ],
};
