import { GuideSection } from "../../types";
import Overview from "./Overview";
import Parameters from "./Parameters";

export const qcParamParametersSection: GuideSection = {
  id: "qc-param-parameters",
  title: "Parameters",
  overview: Overview,
  guides: [
    {
      title: "Parameters",
      description: "Data types, units, and input definitions.",
      content: Parameters,
    },
  ],
};
