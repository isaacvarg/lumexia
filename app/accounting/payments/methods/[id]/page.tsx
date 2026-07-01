import { accountingActions } from "@/actions/accounting"
import { getPosByPaymentMethod } from "@/app/accounting/pos/_actions/getPoWithAccountingDetails"
import PageTitle from "@/components/Text/PageTitle"
import PaymentMethodDisplay from "@/components/UI/PaymentMethodDisplay"
import Link from "next/link"
import { notFound } from "next/navigation"
import PurchasesTable from "./_components/PurchasesTable"

type Props = {
    params: {
        id: string
    }
}

const PaymentMethodDetailsPage = async ({ params }: Props) => {

    const [method, pos] = await Promise.all([
        accountingActions.paymentMethods.getOne(params.id),
        getPosByPaymentMethod(params.id),
    ])

    if (!method) {
        notFound()
    }

    return (
        <div className='flex flex-col gap-y-6'>
            <div className='flex justify-between items-center'>
                <PageTitle>{method.methodName}</PageTitle>
                <Link href={`/accounting/payments/methods/create?id=${method.id}`} className='btn btn-accent'>
                    Modify
                </Link>
            </div>

            <div className="flex justify-start">
                <PaymentMethodDisplay method={method} />
            </div>

            <PurchasesTable pos={pos} />
        </div>
    )
}

export default PaymentMethodDetailsPage
