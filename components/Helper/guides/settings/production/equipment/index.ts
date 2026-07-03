import { GuideSection } from "../../../types";
import Overview from "./Overview";
import EquipmentVsVessels from "./EquipmentVsVessels";

export const settingsProductionEquipmentSection: GuideSection = {
  id: "settings-production-equipment",
  title: "Equipment",
  overview: Overview,
  guides: [
    {
      title: "Equipment vs. vessels",
      description: "Equipment is the catalog; a vessel decorates one record.",
      content: EquipmentVsVessels,
    },
  ],
};
