import { create } from "zustand";
import { GuideSection, getGuideSection } from "@/components/Helper/guides";

// Shown whenever no page-specific section applies — on `/` itself, on any unwired
// page, or if a bad/unregistered id is ever passed to setHelper.
const DEFAULT_SECTION_ID = "home";

type State = {
  current: GuideSection | null;
};

type Actions = {
  actions: {
    setHelper: (id: string) => void; // look up a section by key from guides/
    clearHelper: () => void;
  };
};

export const useHelperSelection = create<State & Actions>((set) => ({
  current: getGuideSection(DEFAULT_SECTION_ID) ?? null,

  actions: {
    setHelper: (id) => {
      set(() => ({
        current: getGuideSection(id) ?? getGuideSection(DEFAULT_SECTION_ID) ?? null,
      }));
    },
    clearHelper: () => {
      set(() => ({ current: getGuideSection(DEFAULT_SECTION_ID) ?? null }));
    },
  },
}));

export const useHelperActions = () => useHelperSelection((state) => state.actions);
