"use server"

import prisma from "@/lib/prisma";

// Generated COAs are filed under the COA file type so document requirements can find them.
export const ensureCoaFileType = async () => {
  const existing = await prisma.itemFileType.findFirst({
    where: {
      OR: [
        { abbreviaton: { equals: "COA", mode: "insensitive" } },
        { name: { equals: "Certificate of Analysis", mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  if (existing) return existing;

  return prisma.itemFileType.create({
    data: {
      name: "Certificate of Analysis",
      abbreviaton: "COA",
      description: "PDF of the certificate of analysis",
      bgColor: "#f0c6c6",
      textColor: "#24273a",
    },
  });
};
