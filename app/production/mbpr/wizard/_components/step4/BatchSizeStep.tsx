'use client'
import SectionTitle from '@/components/Text/SectionTitle'
import { useMbprWizardActions, useMbprWizardSelection } from '@/store/mbprWizardSlice'
import React, { useEffect } from 'react'
import Heading from '../step3/details/Heading'
import NewButton from '../step3/details/NewButton'
import BatchSizeCard from './BatchSizeCard'
import BatchSizeForm from './BatchSizeForm'

const BatchSizeStep = () => {

    const { batchSizes, selectedMbpr, step } = useMbprWizardSelection()

    const { setIsNewForFormPanel, setSelectedBatchSize, getBatchSizes } = useMbprWizardActions()


    const handleNewBatchSize = () => {
        setIsNewForFormPanel(true);
        setSelectedBatchSize(null);

    }

    useEffect(() => {
        if (!selectedMbpr) return;

        if (batchSizes.length === 0) {
            getBatchSizes(selectedMbpr.id)
        }
    }, [selectedMbpr, batchSizes, getBatchSizes])


    if (step !== 3 || !selectedMbpr) return false


    return (
        <div className='flex flex-col gap-6'>

            <div className='flex justify-between items-center'>
                <SectionTitle>Batch Sizes</SectionTitle>
                <button className='btn btn-success' onClick={() => location.reload()}>Complete</button>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
                <div className='bg-[#EDEDE9] h-full rounded-xl p-6 flex flex-col gap-y-6'>

                    <Heading>Batch Sizes</Heading>

                    <div className='grid grid-cols-1 gap-2'>

                        <NewButton onClick={handleNewBatchSize} label='Add Batch Size' />

                        {batchSizes.map((bs) => <BatchSizeCard key={bs.id} batchSize={bs} />)}


                    </div>


                </div>

                <BatchSizeForm />

            </div>


        </div>

    )
}

export default BatchSizeStep
