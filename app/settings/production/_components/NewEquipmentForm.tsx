'use client'
import { facilityActions } from '@/actions/facility'
import { Equipment } from '@/actions/facility/equipment/getAllEquipment'
import { EquipmentType } from '@/actions/facility/equipmentType/getAllEquipmentTypes'
import Dialog from '@/components/Dialog'
import Form from '@/components/Form'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

type Input = {
    name: string
    identifier: string
    equipmentTypeId: string
}

const NewEquipmentForm = ({ equipmentTypes, selectedEquipment }: { equipmentTypes: EquipmentType[], selectedEquipment?: Equipment }) => {


    const form = useForm<Input>({ defaultValues: selectedEquipment ? { name: selectedEquipment.name, identifier: selectedEquipment.identifier, equipmentTypeId: selectedEquipment.equipmentTypeId } : {} })

    const typeOptions = equipmentTypes.map((type) => ({ label: type.name, value: type.id }))

    const handleSubmit = async (data: Input) => {


        if (!selectedEquipment) {
            await facilityActions.equipment.create(data);
            location.reload()
            return;
        }


        await facilityActions.equipment.update(selectedEquipment.id, data);

        location.reload()
    }

    useEffect(() => {
        if (selectedEquipment) {
            form.reset({
                name: selectedEquipment.name,
                identifier: selectedEquipment.identifier,
                equipmentTypeId: selectedEquipment.equipmentTypeId,
            })
        }
    }, [selectedEquipment, form])

    return (
        <Dialog.Root identifier='addEquipment'>
            <Dialog.Title>Add Equipment</Dialog.Title>


            <Form.Root form={form} onSubmit={handleSubmit}>

                <Form.Text form={form} fieldName='name' label='Name' required />

                <Form.Text form={form} fieldName='identifier' label='Identifier' required />

                <Form.Select form={form} fieldName='equipmentTypeId' label='Equipment Type' options={typeOptions} />

                <Form.ActionRow form={form} />

            </Form.Root>

        </Dialog.Root>
    )
}

export default NewEquipmentForm
