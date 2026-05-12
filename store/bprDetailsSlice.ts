import { BprBomItemInventory } from "@/actions/inventory/inventory/getAllByBom"
import { productionActions } from "@/actions/production"
import { BprActivity } from "@/actions/production/bprs/activity/getActivity"
import { BprBomItem } from "@/actions/production/bprs/boms/getByBpr"
import { BatchProductionRecord } from "@/actions/production/bprs/getOne"
import { BprNote } from "@/actions/production/bprs/notes/getAllByBpr"
import { BprNoteType } from "@/actions/production/bprs/notes/notesTypes/getAll"
import { BprStatus } from "@/actions/production/bprs/statuses/getAll"
import { BprPlanningStep } from "@/app/production/planning/[bprReferenceCode]/_functions/getStepsWithCompletions"
import { purchasingActions } from "@/actions/purchasing"
import { PurchasingRequestForPlanning } from "@/actions/purchasing/requests/getByItem"
import { QcExamination } from "@/actions/quality/qc/records/getAll"
import { BprTab } from "@/app/production/planning/[bprReferenceCode]/_components/shared/TabSelector"
import { create } from "zustand"

type Options = {
  noteTypes: BprNoteType[],
  bprStatuses: BprStatus[],
}


type State = {
  activity: BprActivity[]
  bpr: BatchProductionRecord | null
  currentTab: BprTab,
  bom: BprBomItem[],
  bomInventory: BprBomItemInventory[]
  selectedBomItem: BprBomItemInventory | null
  isLoading: boolean
  selectedBomItemPurchasingRequests: PurchasingRequestForPlanning[]
  notes: BprNote[]
  qcRecords: QcExamination[]
  steps: BprPlanningStep[]
  options: Options
}

type Actions = {
  actions: {
    setActivity: (activity: BprActivity[]) => void;
    setBpr: (bpr: BatchProductionRecord | null) => void;
    setBom: (bom: BprBomItem[]) => void;
    setBomInventory: (bomInventory: BprBomItemInventory[]) => void;
    setCurrentTab: (tab: BprTab) => void;
    setSelectedBomItem: (item: BprBomItemInventory) => void;
    setNotes: (notes: BprNote[]) => void;
    setQcRecords: (qcRecords: QcExamination[]) => void;
    setSteps: (steps: BprPlanningStep[]) => void;
    getSelectedBomItemPurchasingRequests: () => void;
    getOptions: () => void;
  }
}

export const useBprDetailsSelection = create<State & Actions>((set, get) => ({
  activity: [],
  bpr: null,
  bom: [],
  bomInventory: [],
  currentTab: 'basics' as BprTab,
  isLoading: false,
  selectedBomItem: null,
  selectedBomItemPurchasingRequests: [],
  notes: [],
  qcRecords: [],
  steps: [],
  options: {
    noteTypes: [],
    bprStatuses: [],
  },

  actions: {
    setActivity: (activity) => set(() => ({ activity, })),
    setBpr: (bpr) => set(() => ({ bpr, })),
    setCurrentTab: (tab) => set(() => ({ currentTab: tab })),
    setBom: (bom) => set(() => ({ bom })),
    setBomInventory: (bomInventory) => set(() => ({ bomInventory, })),
    setSelectedBomItem: (item) => set(() => ({ selectedBomItem: item })),
    setNotes: (notes) => set(() => ({ notes })),
    setQcRecords: (qcRecords) => set(() => ({ qcRecords })),
    setSteps: (steps) => set(() => ({ steps })),
    getSelectedBomItemPurchasingRequests: async () => {
      const selectedBomItem = get().selectedBomItem;
      if (!selectedBomItem) return;

      try {
        set(() => ({ isLoading: true }))
        const requests = await purchasingActions.requests.getPurchasingRequestsForPlanning(selectedBomItem.bom.itemId);
        set(() => ({ selectedBomItemPurchasingRequests: requests, }))
      } catch (error) {
        console.error(error)
      } finally {
        set(() => ({ isLoading: false }))
      }
    },
    getOptions: async () => {
      const [noteTypes, bprStatuses] = await Promise.all([
        await productionActions.bprs.notes.types.getAll(),
        await productionActions.bprs.statuses.getAll(),
      ]);
      set(() => ({
        options: {
          noteTypes,
          bprStatuses,
        }
      }));
    }

  }

}))

export const useBprDetailsActions = () => useBprDetailsSelection((state) => state.actions)
