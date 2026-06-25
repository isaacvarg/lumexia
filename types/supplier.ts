export interface Supplier {
    id: string
    name: string
    addressStreet1?: string
    addressStreet2?: string
    addressCity?: string
    addressState?: string
    addressZip?: string
    phone?: string
    showAddressOnPo: boolean
}