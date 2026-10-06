"use server"
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireApiUser } from "@/lib/requireApiUser";

export async function POST(request: Request) {
    const gate = await requireApiUser();
    if (gate instanceof Response) return gate;

    const { lot_number } = await request.json();

    if (!lot_number) {
        return NextResponse.json({ error: 'lot_number is required' }, { status: 400 });
    }

    const referenceCode = lot_number.split('.')[0];

    const item = await prisma.item.findFirst({
        where: { referenceCode },
        select: { id: true, inventoryUomId: true },
    });

    if (!item) {
        return NextResponse.json({ error: `No item found for reference code "${referenceCode}"` }, { status: 404 });
    }

    const lot = await prisma.lot.create({
        data: {
            itemId: item.id,
            lotNumber: lot_number,
            initialQuantity: 1,
            uomId: item.inventoryUomId,
        },
    });

    await prisma.lotOrigin.create({
        data: {
            lotId: lot.id,
            originType: 'manuallyCreated',
        },
    });

    return NextResponse.json({ id: lot.id, lotNumber: lot.lotNumber }, { status: 201 });
}
