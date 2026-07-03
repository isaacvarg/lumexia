import { GuideSection } from "../../types";
import Overview from "./Overview";
import TheQualityModule from "./TheQualityModule";

export const qcSection: GuideSection = {
  id: "qc",
  title: "Quality",
  overview: Overview,
  guides: [
    {
      title: "The quality module",
      description: "Parameters, specifications, and examinations — how they fit.",
      content: TheQualityModule,
    },
  ],
};
