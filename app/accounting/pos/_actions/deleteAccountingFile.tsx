'use server'

import prisma from "@/lib/prisma"
import { deleteFileIfUnused } from "@/lib/files/deleteFileIfUnused"
import { AccountingFile } from "./getAccountingFilesByPo"

export const deleteAccountingFile = async (file: AccountingFile) => {

    await prisma.poAccountingFile.delete({
        where: { id: file.id },
    })

    return deleteFileIfUnused(file.file.id);
}
