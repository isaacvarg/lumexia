import { Lot } from "@/actions/inventory/lots/getAll";
import { SingleLot } from "@/actions/inventory/lots/getOne";
import { ExaminationType } from "@/actions/quality/qc/examinationTypes/getAll";
import { QcItemParameter } from "@/actions/quality/qc/parameters/getAllByItem";
import { QcRecordFile } from "@/actions/quality/qc/recordFiles/getAllByRecord";
import { QcRecordFileType } from "@/actions/quality/qc/recordFiles/types/getAll";
import { QcRecordNote } from "@/actions/quality/qc/recordNotes/getAllByRecord";
import { QcRecordNoteType } from "@/actions/quality/qc/recordNotes/types/getAll";
import { QcExamination } from "@/actions/quality/qc/records/getAll";
import { ExaminationResults } from "@/app/quality/qc/examination/new/[lotNumber]/_actions/getResults";
import { create } from "zustand"


type State = {
  examinationTypes: ExaminationType[]
  itemParameters: QcItemParameter[]
  lots: Lot[];
  selectedExaminationType: ExaminationType | null
  results: Map<string, ExaminationResults[]>
  selectedItemParameter: QcItemParameter | null
  specimentLot: SingleLot | null;
  step: number;
  qcRecord: QcExamination | null;
  notes: QcRecordNote[];
  noteTypes: QcRecordNoteType[];
  files: QcRecordFile[];
  fileTypes: QcRecordFileType[];
}

type Actions = {
  actions: {
    nextStep: () => void;
    setExaminationTypes: (types: ExaminationType[]) => void;
    setItemParameters: (itemParameters: QcItemParameter[]) => void;
    setSelectedExaminationType: (type: ExaminationType) => void;
    setSelectedItemParameter: (itemParameter: QcItemParameter) => void;
    setStep: (step: number) => void;
    setLots: (lots: Lot[]) => void;
    setSpecimentLot: (lot: SingleLot) => void;
    setRecord: (record: QcExamination) => void;
    setResults: (results: ExaminationResults[]) => void;
    setNotes: (notes: QcRecordNote[]) => void;
    setNoteTypes: (noteTypes: QcRecordNoteType[]) => void;
    setFiles: (files: QcRecordFile[]) => void;
    setFileTypes: (fileTypes: QcRecordFileType[]) => void;
  }
}

export const useQcExaminationSelection = create<State & Actions>((set, get) => ({
  qcRecord: null,
  examinationTypes: [],
  itemParameters: [],
  lots: [],
  selectedExaminationType: null,
  selectedItemParameter: null,
  specimentLot: null,
  step: 0,
  results: new Map,
  notes: [],
  noteTypes: [],
  files: [],
  fileTypes: [],


  actions: {
    nextStep: () => set((state) => ({ step: state.step + 1 })),
    setExaminationTypes: (types) => set(() => ({ examinationTypes: types })),
    setItemParameters: (itemParameters) => set(() => ({ itemParameters })),
    setSelectedExaminationType: (type) => set(() => ({ selectedExaminationType: type })),
    setSelectedItemParameter: (itemParameter) => set(() => ({ selectedItemParameter: itemParameter })),
    setStep: (step) => set(() => ({ step })),
    setSpecimentLot: (lot) => set(() => ({ specimentLot: lot })),
    setLots: (lots) => set(() => ({ lots })),
    setRecord: (record) => set(() => ({ qcRecord: record })),
    setResults: (results) => {
      const mapping = new Map<string, ExaminationResults[]>()
      for (const r of results) {
        const arr = mapping.get(r.qcItemParameterId) ?? []
        arr.push(r)
        mapping.set(r.qcItemParameterId, arr)
      }
      set(() => ({ results: mapping }))
    },
    setNotes: (notes) => set(() => ({ notes })),
    setNoteTypes: (noteTypes) => set(() => ({ noteTypes })),
    setFileTypes: (fileTypes) => set(() => ({ fileTypes })),
    setFiles: (files) => set(() => ({ files })),
  },



}))

export const useQcExaminationActions = () => useQcExaminationSelection((state) => state.actions)
