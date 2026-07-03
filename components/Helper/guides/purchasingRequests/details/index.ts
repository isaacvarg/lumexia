import { GuideSection } from "../../types";
import Overview from "./Overview";
import RequestCards from "./RequestCards";

export const requestDetailsSection: GuideSection = {
  id: "request-details",
  title: "Request details",
  overview: Overview,
  guides: [
    {
      title: "Request cards",
      description: "Basics, linked batches & POs, and the inventory snapshot.",
      content: RequestCards,
    },
  ],
};
