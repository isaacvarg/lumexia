import { GuideSection } from "../../types";
import Overview from "./Overview";
import WhatIsAPricingExam from "./WhatIsAPricingExam";
import TriggersAndLifecycle from "./TriggersAndLifecycle";

export const accountingPricingSection: GuideSection = {
  id: "accounting-pricing",
  title: "Pricing",
  overview: Overview,
  guides: [
    {
      title: "What a pricing examination is",
      description: "An auditable re-pricing that clears a margin target.",
      content: WhatIsAPricingExam,
    },
    {
      title: "Triggers & lifecycle",
      description: "How an examination starts and the statuses it moves through.",
      content: TriggersAndLifecycle,
    },
  ],
};
