import { accountingActions } from "@/actions/accounting"
import { PaymentMethod } from "@/actions/accounting/paymentMethods/getAll"
import { appActions } from "@/actions/app"
import { purchasingActions } from "@/actions/purchasing"
import purchaseOrderStatusActions from "@/actions/purchasing/purchaseOrderStatusActions"
import { PoInternalNote } from "@/actions/purchasing/purchaseOrders/notes/interal/getAll"
import { PoInternalNoteType } from "@/actions/purchasing/purchaseOrders/notes/interal/getAllInternalNoteTypes"
import { PoPublicNote } from "@/actions/purchasing/purchaseOrders/notes/public/getAll"
import { PoPublicNoteType } from "@/actions/purchasing/purchaseOrders/notes/public/getAllTypes"
import { PoSupplierNote } from "@/actions/purchasing/purchaseOrders/notes/supplier/getAll"
import { PoSupplierNoteType } from "@/actions/purchasing/purchaseOrders/notes/supplier/getAllTypes"
import { AccountingFileTypes, getAccountingFileTags } from "@/app/accounting/pos/_actions/getAccountingFileTags"
import { AccountingFile } from "@/app/accounting/pos/_actions/getAccountingFilesByPo"
import { getAllAccountingNoteTypes } from "@/app/accounting/pos/_actions/getAllAccountingNoteTypes"
import { PoAccountingStatus, getAllPoAccountingStatuses } from "@/app/accounting/pos/_actions/getAllAccountingStatuses"
import { PoWithAccounting } from "@/app/accounting/pos/_actions/getPoWithAccountingDetails"
import { PurchasingTab } from "@/app/purchasing/purchase-orders/[purchaseOrder]/_components/shared/TabSelector"
import { FlattenedOrderItem, flattenOrderItems } from "@/app/purchasing/purchase-orders/[purchaseOrder]/_functions/flattenOrderItems"
import { PurchasableItem, getAllItems } from "@/app/purchasing/purchase-orders/[purchaseOrder]/_functions/getAllItems"
import { POItem } from "@/app/purchasing/purchase-orders/[purchaseOrder]/_functions/getPOItems"
import { PurchaseOrderDetails } from "@/app/purchasing/purchase-orders/[purchaseOrder]/_functions/getPurchaseOrder"
import { Config, PoAccountingNoteType, PurchaseOrderStatus } from "@prisma/client"
import { create } from "zustand"
import { PurchaseOrderActivity } from "@/actions/purchasing/purchaseOrders/getActivity"
import { LineItemsMode } from "@/app/purchasing/purchase-orders/[purchaseOrder]/_components/lineItems/LineItems"
import { Uom, getAllUom } from "@/actions/inventory/getAllUom"

type Options = {
  company: Config[]
  globalPoNotes: string[]
  fileTypes: AccountingFileTypes[]
  poStatuses: PurchaseOrderStatus[]
  paymentMethods: PaymentMethod[]
  accountingStatuses: PoAccountingStatus[]
  accountingNoteTypes: PoAccountingNoteType[]
  internalNoteTypes: PoInternalNoteType[]
  publicNoteTypes: PoPublicNoteType[]
  poSupplierNoteTypes: PoSupplierNoteType[]
  uoms: Uom[];
}


type State = {
  currentTab: PurchasingTab
  files: AccountingFile[]
  options: Options
  orderItems: FlattenedOrderItem[]
  poWithAccounting: PoWithAccounting | null
  purchasableItems: PurchasableItem[]
  purchaseOrder: PurchaseOrderDetails | null
  internalNotes: PoInternalNote[]
  publicNotes: PoPublicNote[]
  poSupplierNotes: PoSupplierNote[]
  activity: PurchaseOrderActivity
  lineItemsMode: LineItemsMode;
}

type Actions = {
  actions: {
    getOptions: () => void;
    getPurchasableItems: () => void;
    setCurrentTab: (tab: PurchasingTab) => void;
    setFiles: (files: AccountingFile[]) => void;
    setOrderItems: (serverOrderItems: POItem[]) => void;
    setPoWithAccounting: (poWithAccounting: PoWithAccounting | null) => void;
    setPurchaseOrder: (purchaseOrder: PurchaseOrderDetails | null) => void;
    setInternalNotes: (notes: PoInternalNote[]) => void;
    setPublicNotes: (notes: PoPublicNote[]) => void;
    setPoSupplierNotes: (notes: PoSupplierNote[]) => void;
    setActivity: (activity: PurchaseOrderActivity) => void;
    setLineItemsMode: (mode: LineItemsMode) => void;
  }
}

export const usePurchasingSelection = create<State & Actions>((set) => ({
  currentTab: 'items' as PurchasingTab,
  lineItemsMode: 'view' as LineItemsMode,
  options: {
    company: [],
    globalPoNotes: [],
    poStatuses: [],
    fileTypes: [],
    paymentMethods: [],
    accountingStatuses: [],
    accountingNoteTypes: [],
    internalNoteTypes: [],
    publicNoteTypes: [],
    poSupplierNoteTypes: [],
    uoms: [],
  },
  files: [],
  orderItems: [],
  poWithAccounting: null,
  purchasableItems: [],
  purchaseOrder: null,
  publicNotes: [],
  internalNotes: [],
  poSupplierNotes: [],
  activity: [],

  actions: {

    getOptions: async () => {

      const [
        company,
        globalPoNotes,
        poStatuses,
        fileTypes,
        paymentMethods,
        accountingStatuses,
        accountingNoteTypes,
        internalNoteTypes,
        publicNoteTypes,
        poSupplierNoteTypes,
        uoms,
      ] = await Promise.all([
        await appActions.configs.getByGroup('company'),
        await appActions.configs.getGlobalPoNotes(),
        await purchaseOrderStatusActions.getAll(),
        await getAccountingFileTags(),
        await accountingActions.paymentMethods.getAll(),
        await getAllPoAccountingStatuses(),
        await getAllAccountingNoteTypes(),
        await purchasingActions.purchaseOrders.notes.internal.types.getAll(),
        await purchasingActions.purchaseOrders.notes.public.types.getAll(),
        await purchasingActions.purchaseOrders.notes.supplier.types.getAll(),
        await getAllUom(),
      ])

      set(() => ({
        options: {
          company,
          globalPoNotes,
          poStatuses,
          fileTypes,
          paymentMethods,
          accountingStatuses,
          accountingNoteTypes,
          internalNoteTypes,
          publicNoteTypes,
          poSupplierNoteTypes,
          uoms,
        }

      }))

    },

    getPurchasableItems: async () => {
      const items = await getAllItems();
      set(() => ({ purchasableItems: items }));
    },

    setCurrentTab: (tab) => set(() => ({ currentTab: tab })),

    setOrderItems: (serverOrderItems) => {
      const orderItems = flattenOrderItems(serverOrderItems);
      set(() => ({ orderItems, }));
    },
    setPoWithAccounting: (poWithAccounting) => set(() => ({ poWithAccounting, })),
    setPurchaseOrder: (purchaseOrder) => set(() => ({ purchaseOrder, })),
    setFiles: (files) => set(() => ({ files, })),
    setInternalNotes: (notes) => set(() => ({ internalNotes: notes })),
    setPublicNotes: (notes) => set(() => ({ publicNotes: notes, })),
    setPoSupplierNotes: (notes) => set(() => ({ poSupplierNotes: notes })),
    setActivity: (activity) => set(() => ({ activity })),
    setLineItemsMode: (mode) => set(() => ({ lineItemsMode: mode })),

  },



}))

export const usePurchasingActions = () => usePurchasingSelection((state) => state.actions)
