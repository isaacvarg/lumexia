import { PrismaClient } from '@prisma/client'



const prisma = new PrismaClient()

async function computeQuantityBefore(lotId: string, transactionCreatedAt: Date, transactionId: string) {
  const lot = await prisma.lot.findUniqueOrThrow({ where: { id: lotId } })

  const priorTransactions = await prisma.transaction.findMany({
    where: {
      lotId,
      OR: [
        { createdAt: { lt: transactionCreatedAt } },
        { createdAt: transactionCreatedAt, id: { lt: transactionId } },
      ],
    },
    include: { transactionType: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })

  const priorSum = priorTransactions.reduce(
    (acc, pt) => acc + (pt.transactionType.deduction ? -pt.amount : pt.amount),
    0
  )

  return lot.initialQuantity + priorSum
}

async function backfillInventoryAuditTransactions() {
  const records = await prisma.inventoryAuditTransaction.findMany({
    where: { quantityBefore: null },
    include: {
      transaction: { include: { transactionType: true } },
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })

  console.log(`Found ${records.length} InventoryAuditTransactions to backfill`)

  for (const record of records) {
    const quantityBefore = await computeQuantityBefore(
      record.transaction.lotId,
      record.transaction.createdAt,
      record.transaction.id
    )

    const signedAmount = record.transaction.transactionType.deduction
      ? -record.transaction.amount
      : record.transaction.amount
    const quantityAfter = quantityBefore + signedAmount

    await prisma.inventoryAuditTransaction.update({
      where: { id: record.id },
      data: { quantityBefore, quantityAfter },
    })

    console.log(`  Updated InventoryAuditTransaction ${record.id}: ${quantityBefore} -> ${quantityAfter}`)
  }
}

async function backfillDiscrepancyAuditItemTransactions() {
  const records = await prisma.discrepancyAuditItemTransaction.findMany({
    where: { quantityBefore: null },
    include: {
      transaction: { include: { transactionType: true } },
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })

  console.log(`Found ${records.length} DiscrepancyAuditItemTransactions to backfill`)

  for (const record of records) {
    const quantityBefore = await computeQuantityBefore(
      record.transaction.lotId,
      record.transaction.createdAt,
      record.transaction.id
    )

    const signedAmount = record.transaction.transactionType.deduction
      ? -record.transaction.amount
      : record.transaction.amount
    const quantityAfter = quantityBefore + signedAmount

    await prisma.discrepancyAuditItemTransaction.update({
      where: { id: record.id },
      data: { quantityBefore, quantityAfter },
    })

    console.log(`  Updated DiscrepancyAuditItemTransaction ${record.id}: ${quantityBefore} -> ${quantityAfter}`)
  }
}

async function main() {
  console.log('Starting audit transaction quantity backfill...\n')

  await backfillInventoryAuditTransactions()
  console.log()
  await backfillDiscrepancyAuditItemTransactions()

  console.log('\nBackfill complete.')
}

main()
  .catch((e) => {
    console.error('Backfill failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
