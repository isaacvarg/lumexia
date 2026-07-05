import batchSizeActions from '@/actions/production/batchSizes'
import ActionButton from '@/components/ActionButton'
import Card from '@/components/Card'
import Layout from '@/components/Layout'
import useDialog from '@/hooks/useDialog'
import useProductionWizard from '@/hooks/useProductionWizard'
import { BatchSize } from '@/types/batchSize'
import React, { useEffect, useState } from 'react'
import SizeCard from './SizeCard'
import BatchSizeForm from './BatchSizeForm'

const Step4 = () => {

    const { showDialog } = useDialog()

    const { selectedMbpr, revalidateTrigger } = useProductionWizard()

    const [sizes, setSizes] = useState<BatchSize[]>([])

    useEffect(() => {
        const getBatchSizes = async () => {

            if (!selectedMbpr) { return }

            const data = await batchSizeActions.getAll({ mbprId: selectedMbpr.id })
            setSizes(data);

        }

        getBatchSizes();
    }, [revalidateTrigger, selectedMbpr])


    return (
        <Card.Root>

            <BatchSizeForm />

            <Layout.Row>
                <Card.Title>Batch Sizes</Card.Title>
                <ActionButton onClick={() => showDialog('createBatchSize')}>New</ActionButton>
            </Layout.Row>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sizes.map((size) => <SizeCard key={size.id} size={size} />)}

            </div>
        </Card.Root>

    )
}

export default Step4
