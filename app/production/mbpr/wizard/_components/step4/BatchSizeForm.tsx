import React, { useEffect, useState } from 'react'
import Heading from '../step3/details/Heading'
import { useMbprWizardActions, useMbprWizardSelection } from '@/store/mbprWizardSlice'
import { UnmanagedForm } from '@/components/UnmanagedForm';
import { CompoundingVessel } from '@/actions/production/compoundingVessels/getAllCompoundinVessels';
import { productionActions } from '@/actions/production';
import { Prisma } from '@prisma/client';
import { createBatchSizeCompoundingVessel } from '../../_functions/createBatchSizeVessel';
import { toFloat } from 'validator';
import { updateBatchSizeVessel } from '../../_functions/updateBatchSizeVessel';
import { setActiveBatchSize } from '../../_functions/setActiveBatchSize';
import SelectItemStep from '@/app/production/planning/_components/createNewBpr/SelectItemStep';
import { uom } from '@/configs/staticRecords/unitsOfMeasurement';
import { recordStatuses } from '@/configs/staticRecords/recordStatuses';
import { createActivityLog } from '@/utils/auxiliary/createActivityLog';

const BatchSizeForm = () => {

  const { selectedMbpr, selectedBatchSize, isNewForFormPanel, compoundingVessels } = useMbprWizardSelection();
  const { updateBatchSize, setSelectedBatchSize, setIsNewForFormPanel, addBatchSize } = useMbprWizardActions()

  const [sizeInput, setSizeInput] = useState('');
  const [selectedCompoundingVessel, setSelectedCompoundingVessel] = useState<CompoundingVessel | null>()
  const [tankTime, setTankTime] = useState("");

  const submitData = () => {
    if (isNewForFormPanel) {
      handleNew()
      setSelectedBatchSize(null)
      setIsNewForFormPanel(false);
      return;
    }

    handleUpdate()
    setSelectedBatchSize(null)
    setIsNewForFormPanel(false);

  }

  const handleNew = async () => {
    if (!selectedMbpr || !selectedCompoundingVessel) return;

    const bzPayload: Prisma.BatchSizeUncheckedCreateInput = {
      mbprId: selectedMbpr?.id,
      quantity: parseFloat(sizeInput),
      uomId: uom.pounds,
      recordStatusId: recordStatuses.active,
    }

    // create batch size
    const batchSize = await productionActions.mbprs.batchSizes.create(bzPayload);

    // create compounding vessel link

    const linkPayload: Prisma.BatchSizeCompoundingVesselUncheckedCreateInput = {
      tankTime: toFloat(tankTime),
      batchSizeId: batchSize.id,
      compoundingVesselId: selectedCompoundingVessel?.id
    }
    const link = await createBatchSizeCompoundingVessel(linkPayload)

    // re-get batch size with proper data
    const bzNew = await productionActions.mbprs.batchSizes.getOne(batchSize.id);

    await createActivityLog('Created Batch Size', 'mbpr', selectedMbpr.id, { context: `Created batch size: ${sizeInput} lbs` })
    // update zustand state
    addBatchSize(bzNew)
  }

  const handleUpdate = async () => {
    if (!selectedMbpr || !selectedCompoundingVessel || !selectedBatchSize) return;

    // update db 
    const batchSizePayload: Prisma.BatchSizeUncheckedUpdateInput = {
      quantity: toFloat(sizeInput),
    }
    const batchSize = await productionActions.mbprs.batchSizes.update(selectedBatchSize.id, batchSizePayload)

    // update link
    // need to handle retro-added mbprs i.e., before compounding vessels was a thing
    if (batchSize.batchSizeCompoundingVessels.length === 0) {
      const linkPayload: Prisma.BatchSizeCompoundingVesselUncheckedCreateInput = {
        tankTime: toFloat(tankTime),
        batchSizeId: batchSize.id,
        compoundingVesselId: selectedCompoundingVessel?.id
      }

      await createBatchSizeCompoundingVessel(linkPayload)

    } else {

      const linkPayload: Prisma.BatchSizeCompoundingVesselUncheckedUpdateInput = {
        tankTime: toFloat(tankTime),
        compoundingVesselId: selectedCompoundingVessel.id,
      }

      await updateBatchSizeVessel(selectedBatchSize.batchSizeCompoundingVessels[0].id, linkPayload);

    }

    // get size
    const bzNew = await productionActions.mbprs.batchSizes.getOne(batchSize.id);

    await createActivityLog('Updated Batch Size', 'mbpr', selectedMbpr.id, { context: `Updated batch size to ${sizeInput} lbs` })
    // update zustand
    updateBatchSize(batchSize.id, bzNew)

  }

  const handleSetAsActive = async () => {
    if (!selectedBatchSize || !selectedMbpr) return;

    await setActiveBatchSize(selectedBatchSize.id, selectedMbpr.id)

    await createActivityLog('Set Active Batch Size', 'mbpr', selectedMbpr.id, { context: 'Set batch size as active' })
    location.reload()

  }

  useEffect(() => {

    if (selectedBatchSize) {

      setSizeInput(selectedBatchSize.quantity.toString())
      setSelectedCompoundingVessel(selectedBatchSize.batchSizeCompoundingVessels[0]?.compoundingVessel || null)
      setTankTime(selectedBatchSize.batchSizeCompoundingVessels[0]?.tankTime.toString() || '')
    } else {
      setSizeInput("")
      setSelectedCompoundingVessel(null)
      setTankTime('')
    }

  }, [selectedBatchSize])

  return (
    <div className='bg-[#EDEDE9] h-full rounded-xl p-6 flex flex-col gap-y-6'>
      <div className='flex flex-col'>
        <Heading>Actions</Heading>
        <div className='flex flex-col gap-y-1'>
          {(selectedBatchSize || isNewForFormPanel) && <button onClick={() => submitData()} className='btn btn-success'>Save</button>}
          {(selectedBatchSize || isNewForFormPanel) && <button onClick={() => handleSetAsActive()} className='btn btn-info'>Set As Active</button>}
        </div>
      </div>




      {(!selectedBatchSize && !isNewForFormPanel) && <div className='font-poppins text-lg font-medium text-base-content'>Please select or create a batch size</div>}

      {(selectedBatchSize || isNewForFormPanel) && (
        <div className='flex flex-col gap-6'>

          <Heading>Batch Size (lbs)</Heading>
          <UnmanagedForm.Number
            input={sizeInput}
            onChangeOutput={setSizeInput}
            placeholder='0'
          />




          <Heading>Tank Time</Heading>
          <UnmanagedForm.Number
            input={tankTime}
            onChangeOutput={setTankTime}
            placeholder='0'
          />
          <Heading>Compounding Vessel</Heading>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {compoundingVessels.filter((cv) => parseFloat(sizeInput) <= cv.capacityMaximum && parseFloat(sizeInput) >= cv.capacityMinimum).map((cv) => {
              const isSelected = cv.id === selectedCompoundingVessel?.id;
              return (
                <div key={cv.id} className={`bg-neutral-100   ${isSelected ? 'ring-2 ring-lilac-500' : ''} flex flex-col gap-4 p-6 rounded-xl`} onClick={() => setSelectedCompoundingVessel(cv)}>
                  <h1 className='font-poppins font-semibold text-lg text-base-content'>
                    {cv.equipment.name}
                  </h1>
                  <h2 className='font-poppins font-medium text-base text-base-content'>{cv.capacityMinimum} - {cv.capacityMaximum} lb Capacity</h2>
                  <h2 className='font-poppins font-medium text-base text-base-content'>{cv.operationalCost} $/hour</h2>
                </div>
              )
            })}
          </div>

        </div>
      )}



    </div>
  )
}

export default BatchSizeForm
