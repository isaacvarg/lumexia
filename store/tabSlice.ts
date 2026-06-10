import { ItemTab } from '@/app/inventory/items/[name]/_components/shared/TabSelector';
import { InvestigationTab } from '@/store/investigationSlice';
import { PurchasingTab } from '@/app/purchasing/purchase-orders/[purchaseOrder]/_components/shared/TabSelector';
import { RequestTab } from '@/app/purchasing/requests/_components/shared/TabSelector';
import { ExperimentTab } from '@/app/research/experiments/[referenceCode]/_components/shared/TabSelector';
import { UserSettingsTab } from '@/app/settings/user/_components/shared/TabSelector';
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'


export type TabsConfig = {
  itemDetails: ItemTab
  purchasing: PurchasingTab,
  requests: RequestTab,
  investigation: InvestigationTab,
  experimentDetails: ExperimentTab,
  userSettings: UserSettingsTab,
};

type TabGroupKey = keyof TabsConfig;
type TabValue<K extends TabGroupKey> = TabsConfig[K];

type TabState = {
  activeTab: { [K in TabGroupKey]?: TabValue<K> };
}

type TabActions = {
  actions: {
    setActiveTab: <K extends TabGroupKey>(key: K, tab: TabValue<K>) => void;
  }
}

const initialState: TabState = {
  activeTab: {
    itemDetails: 'basics',
    purchasing: 'items',
    requests: 'new',
    investigation: 'lots',
    experimentDetails: 'basics',
    userSettings: 'main',
  },
}

export const useTabSelection = create<TabState & TabActions>()(
  persist(
    (set) => ({
      ...initialState,
      actions: {
        setActiveTab: <K extends TabGroupKey>(key: K, tab: TabValue<K>) => {
          set((state) => ({
            activeTab: {
              ...state.activeTab,
              [key]: tab,
            },
          }));
        },
      },
    }),
    {
      name: 'active-tab',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ activeTab: state.activeTab }),
    },
  ),
);

export const useTabActions = () => useTabSelection((state) => state.actions)
