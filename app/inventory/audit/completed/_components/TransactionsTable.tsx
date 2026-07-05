import { CompletedAuditDetail } from "@/actions/inventory/auditRequests/getOneCompleted"
import Card from "@/components/Card"
import { dateFormatWithTime } from "@/configs/data/dateFormatString"
import { DateTime } from "luxon"

type Transaction = NonNullable<CompletedAuditDetail['inventoryAudit']>['transactions'][number]

const TransactionsTable = ({ transactions }: { transactions: Transaction[] }) => {

  if (transactions.length === 0) {
    return (
      <Card.Root>
        <p className="font-poppins text-sm text-zinc-400">No transactions recorded for this audit.</p>
      </Card.Root>
    )
  }

  return (
    <Card.Root>
      <div className="w-full overflow-x-auto"><table className="min-w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left text-xs font-medium text-zinc-400 font-poppins pb-3">Lot</th>
            <th className="text-left text-xs font-medium text-zinc-400 font-poppins pb-3">Type</th>
            <th className="text-right text-xs font-medium text-zinc-400 font-poppins pb-3">Before</th>
            <th className="text-right text-xs font-medium text-zinc-400 font-poppins pb-3">Amount</th>
            <th className="text-right text-xs font-medium text-zinc-400 font-poppins pb-3">After</th>
            <th className="text-left text-xs font-medium text-zinc-400 font-poppins pb-3">UOM</th>
            <th className="text-left text-xs font-medium text-zinc-400 font-poppins pb-3">Note</th>
            <th className="text-left text-xs font-medium text-zinc-400 font-poppins pb-3">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-zinc-800 last:border-b-0">
              <td className="py-3 text-sm font-poppins">{t.transaction.lot.lotNumber}</td>
              <td className="py-3 text-sm font-poppins">{t.transaction.transactionType.name}</td>
              <td className="py-3 text-sm font-poppins text-right text-zinc-400">
                {t.quantityBefore != null ? t.quantityBefore.toFixed(2) : '-'}
              </td>
              <td className="py-3 text-sm font-poppins text-right">
                <span className={t.transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {t.transaction.amount >= 0 ? '+' : ''}{t.transaction.amount}
                </span>
              </td>
              <td className="py-3 text-sm font-poppins text-right text-zinc-400">
                {t.quantityAfter != null ? t.quantityAfter.toFixed(2) : '-'}
              </td>
              <td className="py-3 text-sm font-poppins">{t.transaction.unitOfMeasurement.abbreviation}</td>
              <td className="py-3 text-sm font-poppins text-zinc-400">{t.transaction.systemNote}</td>
              <td className="py-3 text-sm font-poppins text-zinc-400">
                {DateTime.fromJSDate(t.transaction.createdAt).toFormat(dateFormatWithTime)}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </Card.Root>
  )
}

export default TransactionsTable
