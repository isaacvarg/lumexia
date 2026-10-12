import { Container } from "./container"
import { Item } from "./item"
import { Transaction } from "./transaction"
import { Uom } from "./uom"

export interface Lot {
    id: string
    itemId: string
    lotNumber: string
    supplierLotNumber?: string | null
    initialQuantity: number
    uomId: string
    createdAt: string | Date
    updatedAt: string | Date
    containers: Container[]
    uom: Uom
    item: Item
    transactions: Transaction[]
}