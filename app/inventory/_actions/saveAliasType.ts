'use server'

import prisma from "@/lib/prisma"
import { findDuplicateAliasNames } from "@/lib/aliases"

// Renames an alias type and sets whether it's unique. A type can only become unique once no two
// aliases of it share a name, since unique means one item per name.
export const saveAliasType = async (id: string, input: { name: string; isUnique: boolean }) => {
  const name = input.name.trim()
  if (!name) return { success: false as const, error: "An alias type needs a name." }

  const current = await prisma.aliasType.findUniqueOrThrow({ where: { id }, select: { isUnique: true } })
  if (input.isUnique && !current.isUnique) {
    const duplicates = await findDuplicateAliasNames(id)
    if (duplicates.length > 0) {
      const shown = duplicates.slice(0, 5).join(", ")
      return {
        success: false as const,
        error: `${name} can't be unique yet: ${duplicates.length} name${duplicates.length === 1 ? " is" : "s are"} used by more than one item (${shown}${duplicates.length > 5 ? ", …" : ""}).`,
      }
    }
  }

  await prisma.aliasType.update({ where: { id }, data: { name, isUnique: input.isUnique } })
  return { success: true as const }
}
