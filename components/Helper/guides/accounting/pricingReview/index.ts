import { GuideSection } from "../../types";
import Overview from "./Overview";
import Reviewing from "./Reviewing";

export const accountingPricingReviewSection: GuideSection = {
  id: "accounting-pricing-review",
  title: "Pricing — Review",
  overview: Overview,
  guides: [
    {
      title: "Reviewing & approving",
      description: "The cost breakdown, approve/reject, and how rejection re-queues.",
      content: Reviewing,
    },
  ],
};
