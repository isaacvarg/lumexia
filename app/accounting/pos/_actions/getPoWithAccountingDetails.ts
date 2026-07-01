'use server'

import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { resolveNoteFiles } from "@/actions/notes/resolveNoteFiles"

// reusable type for the data structure
const poWithAccountingDetailsArgs = Prisma.validator<Prisma.PurchaseOrderDefaultArgs>()({
  include: {
    poAccountingDetail: {
      include: {
        status: true,
        paymentMethod: true,
      }
    },
    supplier: true,
    status: true,
    purchaseOrderItems: true,
    poAccountingFiles: {
      include: {
        fileType: true
      }
    },
    poAccountingNotes: {
      include: {
        user: true,
        noteType: true,
        files: { include: { file: true } },
      },
      orderBy: {
        createdAt: 'desc'
      }
    }
  }
});

type RawPo = Prisma.PurchaseOrderGetPayload<typeof poWithAccountingDetailsArgs>;

const transformPo = async (po: RawPo) => {
  const total = po.purchaseOrderItems.reduce((acc, curr) => {
    return acc + (curr.quantity * curr.pricePerUnit)
  }, 0);
  const poAccountingNotes = await resolveNoteFiles(po.poAccountingNotes);
  return { ...po, total, poAccountingNotes };
}

// overload signatures
export function getPoWithAccountingDetails(id: string): Promise<Awaited<ReturnType<typeof transformPo>> | null>;
export function getPoWithAccountingDetails(): Promise<Awaited<ReturnType<typeof transformPo>>[]>;

export async function getPoWithAccountingDetails(id?: string) {
  if (id) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      ...poWithAccountingDetailsArgs
    });

    if (!po) return null;
    return transformPo(po);
  } else {
    const pos = await prisma.purchaseOrder.findMany({
      ...poWithAccountingDetailsArgs
    });
    return Promise.all(pos.map(transformPo));
  }
};

export async function getPosByPaymentMethod(paymentMethodId: string) {
  const pos = await prisma.purchaseOrder.findMany({
    where: { poAccountingDetail: { paymentMethodId } },
    ...poWithAccountingDetailsArgs
  });
  return Promise.all(pos.map(transformPo));
}

export type PoWithAccounting = Awaited<ReturnType<typeof transformPo>>;
