"use server";

import prisma from "@/lib/prisma";
import { groupByMonthAndYear } from "@/utils/general/groupByMonthAndYear";
import { UnitOfMeasurement } from "@prisma/client";
import { getPricingChartData } from "./getPricingChartData";
import { ExPurchaseOrderItem } from "@/types/purchaseOrderItem";
import { DateTime } from "luxon";
import { getModeDates } from "@/utils/general/getModeDates";
import { uomUtils } from "@/utils/uom";
import { uom } from "@/configs/staticRecords/unitsOfMeasurement";
//
// TODO make this configurable and then pull what the use selected as their default uom rather than hard code it. . . what if someone doesn't want to only use lb as their default.
const defaultUomId = uom.pounds;

export interface SupplierFilterItems {
    totalSpent: number;
    lastPaid: { price: number, uom: UnitOfMeasurement, timestamp: Date };
    uoms: string[]
    prices: any
    purchases: ExPurchaseOrderItem[];
    pricingChartData: any;
}

export const getFilteredItems = async (itemId: string, supplierId: string, mode: "yearToDate" | "lastYear" | "all",
) => {

    const { start, end } = getModeDates(mode);


    const itemData = await prisma.purchaseOrderItem.findMany({
        where: {
            purchaseOrders: {
                supplierId,
            },
            itemId,
            createdAt: {
                lte: end.toJSDate(),
                gte: start.toJSDate(),
            }
        },
        orderBy: {
            updatedAt: "asc",
        },
        include: {
            purchaseOrders: {
                include: {
                    status: true,
                    poAccountingDetail: { include: { paymentMethod: true } },
                },
            },
            uom: true,
            item: true
        },
    });

    if (itemData.length === 0) {
        return {
            totalSpent: 0,
            lastPaid: { price: 0, uom: { abbreviation: '' }, timestamp: '' },
            uoms: [""],
            purchases: [],
            pricingChartData: [],
            prices: []
        }
    }

    const lastPurchaseIndex = itemData.length - 1

    const totalSpent = itemData.reduce((total, item) => {
        return total + item.quantity * item.pricePerUnit;
    }, 0);
    const lastPaid = { price: itemData[lastPurchaseIndex].pricePerUnit, uom: itemData[lastPurchaseIndex].uom, timestamp: itemData[lastPurchaseIndex].createdAt };
    const uomIds = itemData
        .map((item) => item.uom.id)
        .filter((value, index, self) => self.indexOf(value) === index);

    const uoms = itemData
        .map((item) => item.uom.abbreviation)
        .filter((value, index, self) => self.indexOf(value) === index);

    const isPurchasedInMultipleUom = uomIds.length > 1;


    const prices = await Promise.all(
        itemData.map(async (item) => {
            let price = item.pricePerUnit;

            if (isPurchasedInMultipleUom) {
                const isDefaultUom = item.uomId === defaultUomId;

                if (!isDefaultUom) {
                    try {
                        // Convert price to $/lb using the unified conversion approach
                        // For price conversion, we convert 1 lb to the source UOM, then multiply
                        price = item.pricePerUnit * await uomUtils.convert(
                            { id: defaultUomId, isStandard: true },
                            1,
                            { id: item.uomId, isStandard: item.uom.isStandardUom },
                            itemId,
                            supplierId
                        );
                    } catch (error) {
                        // If conversion fails, keep original price
                        price = item.pricePerUnit;
                    }
                }
            }
            return { price: price, createdAt: item.createdAt }
        }),
    );

    const pricesGrouped = groupByMonthAndYear(prices)

    const pricingChartData = getPricingChartData(pricesGrouped)

    const data = {
        prices: pricesGrouped,
        lastPaid,
        uoms,
        totalSpent,
        purchases: itemData,
        pricingChartData,
        //   item: itemData.item

    };
    return data;
};
