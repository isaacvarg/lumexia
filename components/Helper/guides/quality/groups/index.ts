import { GuideSection } from "../../types";
import Overview from "./Overview";
import Groups from "./Groups";

export const qcParamGroupsSection: GuideSection = {
  id: "qc-param-groups",
  title: "Parameter groups",
  overview: Overview,
  guides: [
    {
      title: "Groups",
      description: "Parameters tied to an examination type.",
      content: Groups,
    },
  ],
};
