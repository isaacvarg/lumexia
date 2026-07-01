import { productionActions } from "@/actions/production"
import { BprNote } from "@/actions/production/bprs/notes/getAllByBpr"
import { BprNoteType } from "@/actions/production/bprs/notes/notesTypes/getAll"
import { ProductionStep } from "@/app/production/bpr/[bpr]/_actions/compounding/getSteps"
import { BprBomItem } from "@/app/production/bpr/[bpr]/_actions/getBprBom"
import { getBprStagings, BprStagingItem } from "@/app/production/bpr/[bpr]/_actions/getBprStagings"
import { ProductionBpr } from "@/app/production/bpr/[bpr]/_actions/getProductionBpr"
import { deriveViewStatuses } from "@/lib/bpr/activeStage"
import { create } from "zustand"



type State = {
  bpr: ProductionBpr | null,
  bom: BprBomItem[],
  selectedBomItem: BprBomItem | null,
  stagings: BprStagingItem[],
  stagingDetailsMode: 'main' | 'note' | 'add'
  compoundingDetailsMode: 'main' | 'note'
  steps: ProductionStep[]
  selectedStep: ProductionStep | null
  isStagingsLoading: boolean,
  qualityDetailsViewMode: 'main' | 'note'
  bprNoteTypes: BprNoteType[]
  bprNotes: BprNote[]
  qualityMode: 'primary' | 'secondary'
  viewStatuses: {
    isStaging: boolean,
    isPrimaryVerifcation: boolean,
    isSecondaryVerification: boolean
    isCompounding: boolean
  }

}

type Actions = {
  actions: {
    setBpr: (bpr: ProductionBpr | null) => void;
    setBom: (bom: BprBomItem[]) => void;
    setSelectedBomItem: (item: BprBomItem | null) => void;
    fetchStagings: (bprBomId: string) => Promise<void>;
    setViewStatuses: () => void;
    setQualityDetailsViewMode: (mode: 'note' | 'main') => void;
    setQualityMode: (mode: 'primary' | 'secondary') => void;
    setSteps: (steps: ProductionStep[]) => void;
    setSelectedStep: (step: ProductionStep | null) => void;
    setStagingDetailsMode: (mode: 'main' | 'note' | 'add') => void;
    getBprNoteType: () => void;
    setBprNotes: (notes: BprNote[]) => void;
    setCompoundingDetailsMode: (mode: 'main' | 'note') => void;
  }
}

export const useProductionSelection = create<State & Actions>((set, get) => ({
  bpr: null,
  bom: [],
  bprNoteTypes: [],
  bprNotes: [],
  selectedBomItem: null,
  stagings: [],
  stagingDetailsMode: 'main' as any,
  steps: [],
  selectedStep: null,
  isStagingsLoading: false,
  qualityMode: 'primary' as any,
  qualityDetailsViewMode: 'main' as any,
  compoundingDetailsMode: 'main' as any,
  viewStatuses: {
    isStaging: false,
    isPrimaryVerifcation: false,
    isSecondaryVerification: false,
    isCompounding: false
  },

  actions: {
    setBpr: (bpr) => set(() => ({ bpr })),
    setQualityDetailsViewMode: (mode) => set(() => ({ qualityDetailsViewMode: mode })),
    setBom: (bom) => set(() => ({ bom })),
    setSelectedBomItem: (item) => {
      set(() => ({ selectedBomItem: item, stagings: [], stagingsLoading: false, stagingsMode: 'view' }));
      if (item) {
        get().actions.fetchStagings(item.id);
      }
    },
    fetchStagings: async (bprBomId) => {
      set(() => ({ isStagingsLoading: true }));
      try {
        const stagings = await getBprStagings(bprBomId);
        set(() => ({ stagings, isStagingsLoading: false }));
      } catch (error) {
        console.error("Failed to fetch stagings:", error);
        set(() => ({ isStagingsLoading: false }));
      }
    },

    getBprNoteType: async () => {
      const types = await productionActions.bprs.notes.types.getAll();
      set(() => ({ bprNoteTypes: types }));
    },


    setViewStatuses: () => {
      const { bpr, bom } = get()

      if (!bpr || bom.length === 0) return;

      const derived = deriveViewStatuses(bom.map(item => item.statusId));

      set((state) => ({
        viewStatuses: {
          ...state.viewStatuses,
          ...derived,
        }
      }))
    },

    setQualityMode: (mode) => set(() => ({ qualityMode: mode })),
    setSteps: (steps) => set(() => ({ steps })),
    setSelectedStep: (step) => set(() => ({ selectedStep: step })),
    setStagingDetailsMode: (mode) => set(() => ({ stagingDetailsMode: mode })),
    setBprNotes: (notes) => set(() => ({ bprNotes: notes })),
    setCompoundingDetailsMode: (mode) => set(() => ({ compoundingDetailsMode: mode })),
  }
}))

export const useProductionActions = () => useProductionSelection((state) => state.actions)
