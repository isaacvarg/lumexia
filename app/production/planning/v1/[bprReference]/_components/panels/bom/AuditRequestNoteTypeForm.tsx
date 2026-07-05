import { inventoryActions } from '@/actions/inventory'
import Form from '@/components/Form'
import React, { Dispatch, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'

type CProps = {
    setFormMode: Dispatch<SetStateAction<'form' | 'type'>>
    setReval: Dispatch<SetStateAction<string>>
}

type Inputs = {
    name: string
    description: string
    bgColor: string
    textColor: string
}

const AuditRequestNoteTypeForm = ({ setFormMode, setReval }: CProps) => {

    const form = useForm<Inputs>({ defaultValues: { name: 'Name', description: '', bgColor: "#9a4573", textColor: '#ffffff' } });
    const bgColor = form.watch('bgColor');
    const textColor = form.watch('textColor');
    const name = form.watch('name')

    const handleSubmit = async (data: Inputs) => {
        await inventoryActions.auditReqests.noteTypes.create(data)
        setReval(Math.random().toString())
        setFormMode('form')
    }


    return (
        <div className="flex flex-col gap-y-4">

            <div className="flex items-center justify-center">
                <div
                    style={{ backgroundColor: bgColor, color: textColor }}
                    className={`font-poppins font-medium text-xl rounded-xl py-2 px-4 `}
                >
                    <h3 className='font-poppins font-medium text-xl'>{name}</h3>
                </div>
            </div>


            <Form.Root form={form} onSubmit={handleSubmit}>

                <Form.Text fieldName="name" label="Type Name" form={form} required />

                <Form.Text fieldName="description" label="Description" form={form} required />


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Form.Color fieldName="bgColor" label="Background Color" form={form} />

                    <Form.Color fieldName="textColor" label="Text Color" form={form} />
                </div>

                <div className='flex flex-row justify-end gap-x-2'>
                    <button className='btn btn-warning' onClick={() => setFormMode('form')}>Cancel</button>

                    <button className='btn btn-success' type='submit'>Submit</button>
                </div>

            </Form.Root>
        </div>
    )
}

export default AuditRequestNoteTypeForm
