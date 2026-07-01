'use client'
import { Equipment } from '@/actions/facility/equipment/getAllEquipment'
import { CompoundingVessel } from '@/actions/production/compoundingVessels/getAllCompoundinVessels'
import Card from '@/components/Card'
import useDialog from '@/hooks/useDialog'
import React, { useState } from 'react'
import NewEquipmentVesselForm from './NewCompoundingVesselForm'

type Props = {
  vessels: CompoundingVessel[]
  equipment: Equipment[]
}

const CompoundingVessels = ({ vessels, equipment }: Props) => {
  const { showDialog } = useDialog()
  const [selectedVessel, setSelectedVessel] = useState<CompoundingVessel>();
  return (
    <Card.Root>

      <NewEquipmentVesselForm selectedVessel={selectedVessel} compoundingVessels={equipment} />

      <div className='flex justify-between items-center'>
        <Card.Title>Compounding Vessels</Card.Title>
        <button className='btn btn-neutral' onClick={() => showDialog('addCompoundingVessel')}>Add Vessel</button>
      </div>


      {vessels.length === 0 && <p className='font-poppins text-xl'>No compounding vessels found.</p>}

      {vessels.map((vessel) => {
        return (
          <div
            key={vessel.id}
            className='card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors'
            onClick={() => {
              setSelectedVessel(vessel)
              showDialog("addCompoundingVessel")
            }}
          >
            <div className='card-body gap-y-4'>
              <div className='flex flex-col gap-y-2'>
                <h2 className='card-title font-poppins'>{vessel.equipment.name}</h2>
                <span className='badge badge-primary badge-lg font-poppins font-medium w-fit'>{vessel.equipment.identifier}</span>
              </div>

              <div className='flex gap-x-4 font-poppins font-medium'>
                <p>{vessel.capacityMinimum} - {vessel.capacityMaximum} lb Capacity</p>
                <p>{vessel.operationalCost} $/hour</p>
              </div>
            </div>
          </div>
        )
      })}


    </Card.Root>
  )
}

export default CompoundingVessels
