import PageWrapper from "@/components/App/PageWrapper"
import AccountingTable from "./_components/AccountingTable"
import { getPoWithAccountingDetails } from "./_actions/getPoWithAccountingDetails"
import HelperSetter from "@/components/Helper/HelperSetter"

const PurchaseOrderAccounting = async () => {
    const pos = await getPoWithAccountingDetails()
    return (
        <PageWrapper pageTitle={'Purchase Order Accounting'}>
            <HelperSetter section="accounting-pos" />

            <AccountingTable pos={pos} />

        </PageWrapper >
    )
}

export default PurchaseOrderAccounting 
