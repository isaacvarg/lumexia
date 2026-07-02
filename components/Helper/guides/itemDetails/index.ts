import { GuideSection } from "../types";
import { basicsSection } from "./basics";
import { inventorySection } from "./inventory";
import { purchasingSection } from "./purchasing";
import { pricingSection } from "./pricing";
import { productionSection } from "./production";
import { rndSection } from "./rnd";
import { qualitySection } from "./quality";
import { filesSection } from "./files";
import { dangerSection } from "./danger";

// One section per item-details tab, keyed `item-<tab>` and driven by
// ItemHelper.tsx from the active tab in the tab store.
export const itemDetailsSections: GuideSection[] = [
  basicsSection,
  inventorySection,
  purchasingSection,
  pricingSection,
  productionSection,
  rndSection,
  qualitySection,
  filesSection,
  dangerSection,
];
