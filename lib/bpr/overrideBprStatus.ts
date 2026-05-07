"use server"

import { getUserId } from "@/actions/users/getUserId"
import { setBprStatusManually } from "./transitions"

export const overrideBprStatus = async (bprId: string, toStatusId: string, reason?: string) => {
  const userId = await getUserId()
  await setBprStatusManually(bprId, toStatusId, userId, reason)
}
