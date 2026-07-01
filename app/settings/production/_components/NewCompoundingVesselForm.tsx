'use client'
import { facilityActions } from '@/actions/facility'
import { Equipment } from '@/actions/facility/equipment/getAllEquipment'
import { EquipmentType } from '@/actions/facility/equipmentType/getAllEquipmentTypes'
import { productionActions } from '@/actions/production'
import { CompoundingVessel } from '@/actions/production/compoundingVessels/getAllCompoundinVessels'
import Dialog from '@/components/Dialog'
import Form from '@/components/Form'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

type Input = {
    equipmentId: string
    capacityMinimum: number
    capacityMaximum: number
    operationalCost: number
}

const NewEquipmentVesselForm = ({ compoundingVessels, selectedVessel }: { compoundingVessels: Equipment[], selectedVessel?: CompoundingVessel }) => {


    const form = useForm<Input>({ defaultValues: selectedVessel ? { equipmentId: selectedVessel.equipmentId, capacityMinimum: selectedVessel.capacityMinimum, capacityMaximum: selectedVessel.capacityMaximum, operationalCost: selectedVessel.operationalCost } : {} })

    const equipmentOptions = compoundingVessels.map((v) => ({ label: v.name, value: v.id }))

    const handleSubmit = async (data: Input) => {


        if (!selectedVessel) {
            await productionActions.compoundingVessels.create(data);
            location.reload()
            return;
        }


        await productionActions.compoundingVessels.update(selectedVessel.id, data);

        location.reload()
    }

    useEffect(() => {
        if (selectedVessel) {
            form.reset({
                equipmentId: selectedVessel.equipmentId,
                capacityMinimum: selectedVessel.capacityMinimum,
                capacityMaximum: selectedVessel.capacityMaximum,
                operationalCost: selectedVessel.operationalCost,
            })
        }
    }, [selectedVessel, form])

    return (
        <Dialog.Root identifier='addCompoundingVessel'>
            <Dialog.Title>Add Equipment</Dialog.Title>


            <Form.Root form={form} onSubmit={handleSubmit}>



                <Form.Select form={form} fieldName='equipmentId' label='Equipment' options={equipmentOptions} />

                <Form.Number form={form} fieldName='capacityMinimum' label='Capacity Minimum (lbs)' required />

                <Form.Number form={form} fieldName='capacityMaximum' label='Capacity Maximum (lbs)' required />

                <Form.Number form={form} fieldName='operationalCost' label='Operational Cost ($/hour)' required />


                <Form.ActionRow form={form} />

            </Form.Root>

        </Dialog.Root>
    )
}

export default NewEquipmentVesselForm
