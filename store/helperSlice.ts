import { create } from "zustand";
import { GuideSection, getGuideSection } from "@/components/Helper/guides";

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
  current: null,

  actions: {
    setHelper: (id) => {
      set(() => ({ current: getGuideSection(id) ?? null }));
    },
    clearHelper: () => {
      set(() => ({ current: null }));
    },
  },
}));

export const useHelperActions = () => useHelperSelection((state) => state.actions);
