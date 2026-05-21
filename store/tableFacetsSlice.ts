import { create } from 'zustand';

// Array of objects where each object has a "key" and a "value" which is an array of strings.
type FilterArray = { id: string; value: string[] }[];

type State = {
  items: FilterArray;
  pos: FilterArray;
  productionPlanningList: FilterArray
  poDetailsItems: FilterArray
  supplierDetailsPurchasesTab: FilterArray
  supplierDetailsAliasesTab: FilterArray
  suppliers: FilterArray
  itemDetailsLot: FilterArray
  poRequests: FilterArray
  receiving: FilterArray
  itemDetailsLotDialog: FilterArray
  itemDetailsTransactons: FilterArray
  itemDetailsPurchasesTab: FilterArray
  receivingRecentlyCompleted: FilterArray
  requestArchive: FilterArray
  itemPricingExamiantions: FilterArray
  latestPricingExaminationsAll: FilterArray
  allPricingExaminations: FilterArray
  pricingExamContainers: FilterArray
  pricingExamBomArchive: FilterArray
  mbpr: FilterArray
  equipment: FilterArray
  pricingBom: FilterArray
  itemWithGenericUnits: FilterArray
  qcExaminations: FilterArray
  qcGroups: FilterArray
  qcTemplates: FilterArray
  audits: FilterArray
  poAccounting: FilterArray
  discrepancyAudit: FilterArray
  itemActivity: FilterArray
  inventoryLots: FilterArray
  lotTransactions: FilterArray
  poActivity: FilterArray
  qcParameters: FilterArray
  accountingActivity: FilterArray
  supplierItemPurchases: FilterArray
  investigationLots: FilterArray
  investigationTransactions: FilterArray
  investigationPurchaseOrders: FilterArray
  investigationAudits: FilterArray
  investigationNotes: FilterArray
  mbprActivity: FilterArray
  files: FilterArray
  actionableTypes: FilterArray
};

export type TableStateName = keyof State;

type Actions = {
  setFilter: (tableState: TableStateName, value: FilterArray) => void;
  addToFilter: (tableState: TableStateName, filterName: string, value: string | boolean) => void;
  removeFilter: (tableState: TableStateName, filterName: string) => void;
  resetFilter: (tableState: TableStateName) => void;
  removeValueFromFilter: (tableState: TableStateName, filterName: string, value: string | boolean) => void;
};

export const useTableFacets = create<State & Actions>((set) => ({
  items: [],
  pos: [],
  productionPlanningList: [],
  poDetailsItems: [],
  supplierDetailsPurchasesTab: [],
  supplierDetailsAliasesTab: [],
  suppliers: [],
  itemDetailsLot: [],
  poRequests: [],
  receiving: [],
  itemDetailsLotDialog: [],
  itemDetailsTransactons: [],
  itemDetailsPurchasesTab: [],
  receivingRecentlyCompleted: [],
  requestArchive: [],
  itemPricingExamiantions: [],
  latestPricingExaminationsAll: [],
  allPricingExaminations: [],
  pricingExamContainers: [],
  pricingExamBomArchive: [],
  mbpr: [],
  equipment: [],
  pricingBom: [],
  itemWithGenericUnits: [],
  qcExaminations: [],
  qcGroups: [],
  qcTemplates: [],
  audits: [],
  poAccounting: [],
  discrepancyAudit: [],
  itemActivity: [],
  inventoryLots: [],
  lotTransactions: [],
  poActivity: [],
  qcParameters: [],
  accountingActivity: [],
  supplierItemPurchases: [],
  investigationLots: [],
  investigationTransactions: [],
  investigationPurchaseOrders: [],
  investigationAudits: [],
  investigationNotes: [],
  mbprActivity: [],
  files: [],
  actionableTypes: [],

  setFilter: (tableState, value) =>
    set((state) => ({
      ...state,
      [tableState]: value,
    })),

  addToFilter: (tableState, filterName, value) =>
    set((state) => {
      const array = state[tableState] as FilterArray;
      const updatedArray = array.map((obj) =>
        obj.id === filterName ? { ...obj, value: [...obj.value, value] } : obj
      );

      // If the setName does not exist, add a new object
      if (!updatedArray.some((obj) => obj.id === filterName)) {
        updatedArray.push({ id: filterName, value: [value] });
      }

      return { ...state, [tableState]: updatedArray };
    }),

  removeFilter: (tableState, filterName) =>
    set((state) => {
      const array = state[tableState] as FilterArray;
      const updatedArray = array.filter((obj) => obj.id !== filterName);

      return { ...state, [tableState]: updatedArray };
    }),

  resetFilter: (tableState) =>
    set((state) => ({
      ...state,
      [tableState]: [],
    })),

  removeValueFromFilter: (tableState, filterName, value) =>
    set((state) => {
      const array = state[tableState] as FilterArray;
      const updatedArray = array.map((obj) =>
        obj.id === filterName
          ? { ...obj, value: obj.value.filter((v) => v !== value) }
          : obj
      );

      return { ...state, [tableState]: updatedArray };
    }),
}));
