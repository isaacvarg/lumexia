'use server'

import { findUniqueAliasConflict } from "@/lib/aliases"

// For the alias dialog: which item already holds this name, if its type is unique.
export const checkAliasConflict = async (input: { aliasTypeId: string; name: string; excludeAliasId?: string }) => {
  const conflict = await findUniqueAliasConflict(input)
  return conflict?.item ?? null
}
