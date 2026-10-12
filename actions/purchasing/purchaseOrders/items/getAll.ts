'use server'

import { aliasTypes } from "@/configs/staticRecords/aliasTypes";
import prisma from "@/lib/prisma"
import { UomConversionError } from "@/utils/uom/conversionError";
import { validateConversion } from "@/utils/uom/validateConversion";

export const getAllPurchaseOrderItems = async (purchaseOrderId: string) => {


  const items = await prisma.purchaseOrderItem.findMany({
    where: {
      purchaseOrderId,
    },
    include: {
      item: {
        include: {
          itemType: {
            include: {
              config: true
            }
          },
          inventoryUom: true,
          aliases: true
        },
      },
      uom: true,
      purchaseOrders: true,
      purchaseOrderStatus: true,
      lot: {
        include: {
          item: true
        }
      },
    }
  });


  const withConversionErrors = await Promise.all(items.map(async (item) => {
    const conversionValidation = await validateConversion(
      { isStandard: item.uom.isStandardUom, id: item.uom.id },
      { isStandard: item.item.inventoryUom.isStandardUom, id: item.item.inventoryUom.id },
      item.purchaseOrders.supplierId,
      item.item.id,
    )

    const matchingSupplierAlias = await prisma.supplierAlias.findFirst({
      where: {
        supplierId: item.purchaseOrders.supplierId,
        alias: {
          itemId: item.itemId,
        }
      },
      include: {
        alias: true,
      },
    })

    const allAliases = item.item.aliases;

    const base = {
      ...item,
      alias: matchingSupplierAlias,
      allAliases,
    };

    if (!conversionValidation.isSuccessful && conversionValidation.error instanceof UomConversionError) {
      return {
        hasConversionError: true,
        ...base
      }
    }

    return {
      hasConversionError: false,
      ...base
    };
  }))



  return withConversionErrors;

}

export type PurchaseOrderItem = Awaited<ReturnType<typeof getAllPurchaseOrderItems>>[number];
