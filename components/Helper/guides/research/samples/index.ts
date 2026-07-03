import { GuideSection } from "../../types";
import Overview from "./Overview";
import CreatingAndPreparing from "./CreatingAndPreparing";
import Measurements from "./Measurements";

export const experimentSamplesSection: GuideSection = {
  id: "experiment-samples",
  title: "Experiment — Samples",
  overview: Overview,
  guides: [
    {
      title: "Creating & preparing samples",
      description: "Sample creation, QR labels, and the preparation checklist.",
      content: CreatingAndPreparing,
    },
    {
      title: "Recording measurements",
      description: "QC measurements with runs and structured inputs.",
      content: Measurements,
    },
  ],
};
