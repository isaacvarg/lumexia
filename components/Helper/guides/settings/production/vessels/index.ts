import { GuideSection } from "../../../types";
import Overview from "./Overview";
import CapacityAndCost from "./CapacityAndCost";

export const settingsProductionVesselsSection: GuideSection = {
  id: "settings-production-vessels",
  title: "Compounding Vessels",
  overview: Overview,
  guides: [
    {
      title: "Adding & editing a vessel",
      description: "One shared dialog, and why capacity is a range.",
      content: CapacityAndCost,
    },
  ],
};
