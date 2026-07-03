import { GuideSection } from "../../types";
import Overview from "./Overview";
import Configuration from "./Configuration";

export const qcParamDetailSection: GuideSection = {
  id: "qc-param-detail",
  title: "Parameter configuration",
  overview: Overview,
  guides: [
    {
      title: "Configuring a parameter",
      description: "Basics, group/template membership, and input definitions.",
      content: Configuration,
    },
  ],
};
