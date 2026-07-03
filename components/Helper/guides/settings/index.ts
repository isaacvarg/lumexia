import { GuideSection } from "../types";
import { settingsLandingSection } from "./landing";
import { settingsCompanyInfoSection } from "./company/info";
import { settingsCompanyImagesSection } from "./company/images";
import { settingsInventoryTriggersSection } from "./inventory/triggers";
import { settingsInventoryConfigurationSection } from "./inventory/configuration";
import { settingsInventoryUnitsSection } from "./inventory/units";
import { settingsProductionEquipmentSection } from "./production/equipment";
import { settingsProductionVesselsSection } from "./production/vessels";
import { settingsProductionActionablesSection } from "./production/actionables";
import { settingsResearchOverheadSection } from "./research/overhead";
import { settingsResearchBatchSizesSection } from "./research/batchSizes";

// Settings config areas: landing is declarative (HelperSetter); Company, Inventory,
// Production, and Research each drive an imperative per-tab helper off their own
// tabSlice key (companySettings/inventorySettings/productionSettings/researchSettings),
// keyed `settings-<area>-<tab>`. /settings/user, /settings/users(+detail), and
// /settings/fixes are intentionally out of scope for this round.
export const settingsSections: GuideSection[] = [
  settingsLandingSection,
  settingsCompanyInfoSection,
  settingsCompanyImagesSection,
  settingsInventoryTriggersSection,
  settingsInventoryConfigurationSection,
  settingsInventoryUnitsSection,
  settingsProductionEquipmentSection,
  settingsProductionVesselsSection,
  settingsProductionActionablesSection,
  settingsResearchOverheadSection,
  settingsResearchBatchSizesSection,
];
