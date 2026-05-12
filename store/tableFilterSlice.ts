import { create } from 'zustand'
import { TableStateName } from './tableFacetsSlice'

type State = {
  items: string
  pos: string
  productionPlanningList: string
  poDetailsItems: string
  supplierDetailsPurchasesTab: string
  supplierDetailsAliasesTab: string
  suppliers: string
  itemDetailsLot: string
  poRequests: string
  receiving: string
  itemDetailsLotDialog: string
  itemDetailsTransactons: string
  itemDetailsPurchasesTab: string
  receivingRecentlyCompleted: string
  requestArchive: string
  itemPricingExamiantions: string
  latestPricingExaminationsAll: string
  mbpr: string
  equipment: string
  pricingBom: string
  itemWithGenericUnits: string
  qcExaminations: string
  qcGroups: string
  qcTemplates: string
  audits: string
  poAccounting: string
  discrepancyAudit: string
  itemActivity: string
  inventoryLots: string
  lotTransactions: string
  poActivity: string
  qcParameters: string
  accountingActivity: string
  supplierItemPurchases: string
  investigationLots: string
  investigationTransactions: string
  investigationPurchaseOrders: string
  investigationAudits: string
  investigationNotes: string
  mbprActivity: string
  files: string
  actionableTypes: string
}



type Actions = {
  setFilter: (filterName: TableStateName, value: string) => void;

}

export const useTableFilter = create<State & Actions>((set) => ({
  items: "",
  pos: "",
  productionPlanningList: "",
  poDetailsItems: "",
  supplierDetailsPurchasesTab: "",
  supplierDetailsAliasesTab: "",
  suppliers: "",
  itemDetailsLot: "",
  poRequests: "",
  receiving: "",
  itemDetailsLotDialog: "",
  itemDetailsTransactons: "",
  itemDetailsPurchasesTab: "",
  receivingRecentlyCompleted: "",
  requestArchive: "",
  itemPricingExamiantions: "",
  latestPricingExaminationsAll: "",
  mbpr: "",
  equipment: "",
  pricingBom: "",
  itemWithGenericUnits: "",
  qcExaminations: "",
  qcGroups: "",
  qcTemplates: '',
  audits: '',
  poAccounting: '',
  discrepancyAudit: '',
  itemActivity: '',
  inventoryLots: '',
  lotTransactions: '',
  poActivity: '',
  qcParameters: '',
  accountingActivity: '',
  supplierItemPurchases: '',
  investigationLots: '',
  investigationTransactions: '',
  investigationPurchaseOrders: '',
  investigationAudits: '',
  investigationNotes: '',
  mbprActivity: '',
  files: '',
  actionableTypes: '',

  setFilter: (filterName, value) => set((state) => ({
    ...state,
    [filterName]: value,
  })),

}))
