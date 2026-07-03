import { accountingActions } from "@/actions/accounting";
import PageTitle from "@/components/Text/PageTitle";
import Link from "next/link";
import MethodsDisplay from "./_components/MethodsDisplay";
import HelperSetter from "@/components/Helper/HelperSetter";

const PaymentsPage = async () => {

    const methods = await accountingActions.paymentMethods.getAll();

    return (
        <div className='flex flex-col gap-y-6'>
            <HelperSetter section="accounting-payments" />
            <div className='flex justify-between items-center'>
                <PageTitle>Payments</PageTitle>
                <Link href="/accounting/payments/methods/create" className='btn btn-accent'>
                    Add Payment Method
                </Link>
            </div>

            <MethodsDisplay methods={methods} />
        </div>
    )
}

export default PaymentsPage;
