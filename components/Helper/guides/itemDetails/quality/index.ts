import { GuideSection } from "../../types";
import Overview from "./Overview";
import ParametersSpecifications from "./ParametersSpecifications";
import ExaminationsMeasurements from "./ExaminationsMeasurements";

export const qualitySection: GuideSection = {
  id: "item-quality",
  title: "Item details — Quality",
  overview: Overview,
  guides: [
    {
      title: "Parameters & specifications",
      description: "What you measure for the item and the ranges it must meet.",
      content: ParametersSpecifications,
    },
    {
      title: "Examinations & measurements",
      description: "Quality checks against lots and the values they capture.",
      content: ExaminationsMeasurements,
    },
  ],
};
