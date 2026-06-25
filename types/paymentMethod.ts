export interface PaymentMethod {
    id: string
    methodName: string
    associatedName: string
    paymentType: string
    identifier: string
    accountEndingIn?: string
    expiry?: string
    limit: number
    bgColorA: string
    bgColorB: string
    circleColorA?: string
    circleColorB?: string
}