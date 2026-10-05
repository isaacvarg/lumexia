import prisma from "@/lib/prisma";
import { aliasTypes } from "@/configs/staticRecords/aliasTypes";
import { CanonResolver } from "./types";

export const inciAliasesResolver: CanonResolver<"orderedList"> = {
  key: "item.aliases.inci",
  label: "Item INCI aliases",
  description: "The item's aliases of type INCI Name, as edited in the Basics tab.",
  shapeKey: "orderedList",
  subjectKind: "item",
  resolve: async (subject) => {
    if (subject.kind !== "item") return null;

    const aliases = await prisma.alias.findMany({
      where: { itemId: subject.itemId, aliasTypeId: aliasTypes.inciName },
      select: { name: true },
      orderBy: { name: "asc" },
    });
    if (aliases.length === 0) return null;

    return { items: aliases.map((a) => a.name) };
  },
};
