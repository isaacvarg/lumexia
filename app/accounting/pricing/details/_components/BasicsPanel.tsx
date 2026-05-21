'use client'

import { SinglePricingExaminationCombined } from "@/actions/accounting/examinations/getOne"
import Card from "@/components/Card"
import LabelDataPair from "@/components/Text/LabelDataPair"
import { dateFormatString } from "@/configs/data/dateFormatString"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { DateTime } from "luxon"

const BasicsPanel = ({ exam }: { exam: SinglePricingExaminationCombined }) => {

    const pricing = exam.itemPricingDataArchive[0]
    const status = exam.status
    const statusName = status?.name

    return (
        <Card.Root>
            <Card.Title>Item Info</Card.Title>

            {status && (
                <span
                    style={{ backgroundColor: status.bgColor, color: status.textColor }}
                    className="py-1 px-2 rounded-xl text-sm font-poppins font-semibold w-fit"
                >
                    {status.name}
                </span>
            )}

            <LabelDataPair label="Examined On" data={DateTime.fromJSDate(exam.createdAt).toFormat(dateFormatString)} />
            <LabelDataPair label="Examined By" data={exam.user.name || ''} />
            <LabelDataPair label="Procurement Type" data={exam.examinedItem.procurementType.name} />

            {pricing && (
                <>
                    <LabelDataPair label="Overall Item Cost" data={toFracitonalDigits.pricingCurrency(pricing.overallItemCost)} />
                    <LabelDataPair label="Arrival Cost" data={toFracitonalDigits.pricingCurrency(pricing.arrivalCost)} />
                    <LabelDataPair label="Production Usage Cost" data={toFracitonalDigits.pricingCurrency(pricing.productionUsageCost)} />
                    <LabelDataPair label="Auxiliary Usage Cost" data={toFracitonalDigits.pricingCurrency(pricing.auxiliaryUsageCost)} />
                    <LabelDataPair label="Unforeseen Difficulties Cost" data={toFracitonalDigits.pricingCurrency(pricing.unforeseenDifficultiesCost)} />
                </>
            )}

            {statusName === 'Approved' && (
                <>
                    <LabelDataPair label="Approved By" data={exam.approvedBy?.name || ''} />
                    <LabelDataPair label="Approved On" data={exam.approvedAt ? DateTime.fromJSDate(exam.approvedAt).toFormat(dateFormatString) : ''} />
                </>
            )}

            {statusName === 'Rejected' && (
                <>
                    <LabelDataPair label="Rejected By" data={exam.rejectedBy?.name || ''} />
                    <LabelDataPair label="Rejected On" data={exam.rejectedAt ? DateTime.fromJSDate(exam.rejectedAt).toFormat(dateFormatString) : ''} />
                </>
            )}

        </Card.Root >
    )
}

export default BasicsPanel
