import { GuideSection } from "../../types";
import Overview from "./Overview";
import Templates from "./Templates";

export const qcParamTemplatesSection: GuideSection = {
  id: "qc-param-templates",
  title: "Parameter templates",
  overview: Overview,
  guides: [
    {
      title: "Templates",
      description: "Reusable sets of parameters, and how they differ from groups.",
      content: Templates,
    },
  ],
};
