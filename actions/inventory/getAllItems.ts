"use server"

import { recordStatuses } from "@/configs/staticRecords/recordStatuses";
import prisma from "@/lib/prisma"

// commandType boolean is for when using with command pallet includce command type

export const getAllItems = async (commandType?: true) => {
  const items = await prisma.item.findMany({
    where: {
      recordStatusId: {
        not: recordStatuses.archived
      }
    },
    include: {
      aliases: true,
      inventoryType: true,
      procurementType: true,
      itemType: true,
    }
  });

  const transformedItems = await Promise.all(items.map((item) => {
    const flatAliases = item.aliases.map((alias) => alias.name).join(", ");

    return {
      ...item,
      flatAliases,
      ...(commandType ? { commandType: "item" } : {})
    }
  }));

  return transformedItems;
}


export type Item = Awaited<ReturnType<typeof getAllItems>>[number]
