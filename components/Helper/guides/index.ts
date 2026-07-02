import { GuideSection } from "./types";
import { itemsSection } from "./items";
import { itemDetailsSections } from "./itemDetails";

export const guideSections: GuideSection[] = [
  itemsSection,
  ...itemDetailsSections,
];

const byId = new Map(guideSections.map((section) => [section.id, section]));

// Look up a section by its id — used by the helper store / setters.
export const getGuideSection = (id: string): GuideSection | undefined =>
  byId.get(id);

export * from "./types";
