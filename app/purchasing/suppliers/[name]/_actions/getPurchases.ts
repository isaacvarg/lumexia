"use server";

import prisma from "@/lib/prisma";
import { PaymentMethod } from "@/types/paymentMethod";
import { PurchaseOrder } from "@/types/purchaseOrder";
import { ExPurchaseOrderItem, PurchaseOrderItem } from "@/types/purchaseOrderItem";

interface LineItems extends ExPurchaseOrderItem {
	total: number,
}

export interface SupplierDetailPurchases extends PurchaseOrder {
	lineItems: LineItems[]
	total: number
	// Payment methods in this app are recorded on the accounting detail, not at the
	// PO level, so the supplier purchases table sources the payment method from here.
	poAccountingDetail: { paymentMethod: PaymentMethod | null } | null
}

export const getPurchases = async (supplierId: string) => {
	const purchases = await prisma.purchaseOrder.findMany({
		where: { supplierId },
		include: {
			purchaseOrderItems: true,
			status: true,
			poAccountingDetail: { include: { paymentMethod: true } },
		},
	});

	const extended: SupplierDetailPurchases[] = purchases.map((purchase: any) => {
		const { purchaseOrderItems, ...rest } = purchase;
		const lineItems = purchase.purchaseOrderItems?.map(
			(lineItem: PurchaseOrderItem) => {
				const total = lineItem.quantity * lineItem.pricePerUnit;

				return {
					...lineItem,
					total,
				};
			},
			0,
		);

		const total = lineItems?.reduce((purchaseTotal: number, lineItem: any) => {
			return purchaseTotal + lineItem.total;
		}, 0);

		return {
			...rest,
			lineItems,
			total,
		};
	});


	return extended;
};
