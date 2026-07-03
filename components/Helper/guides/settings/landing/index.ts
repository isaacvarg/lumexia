import { GuideSection } from "../../types";
import Overview from "./Overview";
import AccessGating from "./AccessGating";

export const settingsLandingSection: GuideSection = {
  id: "settings",
  title: "Settings",
  overview: Overview,
  guides: [
    {
      title: "Access gating",
      description: "Which cards are hidden or enforced for non-admins.",
      content: AccessGating,
    },
  ],
};
