'use server'

import { getUserId } from "@/actions/users/getUserId"
import { getLotReceipt as getReceipt, LotSupplierDetails, updateLotSupplierDetails as update } from "@/lib/receiving/lots"

export const getLotReceipt = async (lotId: string) => getReceipt(lotId)

export const updateLotSupplierDetails = async (lotId: string, details: LotSupplierDetails) => {
  const { linked } = await update(await getUserId(), lotId, details)
  return { linked }
}
