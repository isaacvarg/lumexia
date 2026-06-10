'use server'

import prisma from "@/lib/prisma"
import { getUserId } from "./getUserId"

export const updateUserName = async (name: string) => {

  const userId = await getUserId()
  if (!userId) {
    throw new Error("userId not found")
  }

  const trimmed = name.trim()
  if (!trimmed) {
    throw new Error("Name cannot be empty")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name: trimmed },
  })
}
