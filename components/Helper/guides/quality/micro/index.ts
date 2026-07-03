import { GuideSection } from "../../types";
import Overview from "./Overview";
import SampleSubmission from "./SampleSubmission";

export const microSection: GuideSection = {
  id: "micro",
  title: "Micro",
  overview: Overview,
  guides: [
    {
      title: "Sample submission",
      description: "The two-step wizard that generates the SSF form.",
      content: SampleSubmission,
    },
  ],
};
