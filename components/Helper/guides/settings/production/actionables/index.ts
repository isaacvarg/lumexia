import { GuideSection } from "../../../types";
import Overview from "./Overview";
import DataTypeConfig from "./DataTypeConfig";
import WhereTheyShowUp from "./WhereTheyShowUp";

export const settingsProductionActionablesSection: GuideSection = {
  id: "settings-production-actionables",
  title: "Step Actionable Types",
  overview: Overview,
  guides: [
    {
      title: "Data types & their config",
      description: "Numeric, photo, text, and boolean each expose different fields.",
      content: DataTypeConfig,
    },
    {
      title: "Where actionables show up",
      description: "MBPR wizard, compounding, live execution, and QA review.",
      content: WhereTheyShowUp,
    },
  ],
};
