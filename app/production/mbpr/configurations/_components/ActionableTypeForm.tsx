'use client'

import Dialog from '@/components/Dialog'
import Form from '@/components/Form'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ActionableTypeRow } from '../_actions/getActionableTypes'
import { createActionableType } from '../_actions/createActionableType'
import { updateActionableType } from '../_actions/updateActionableType'
import { deleteActionableType } from '../_actions/deleteActionableType'
import { actionableDataTypes, ActionableDataType } from '@/types/actionableType'
import { UserRole } from '@prisma/client'

type Input = {
  name: string
  description: string
  dataType: ActionableDataType
  userRoleId: string
  bgColor: string
  textColor: string
  // numeric
  min: number | null
  max: number | null
  unit: string
  decimals: number | null
  // photo
  maxFiles: number | null
  accept: string
  // text
  maxLength: number | null
  placeholder: string
}

const defaultValues: Input = {
  name: '',
  description: '',
  dataType: 'boolean',
  userRoleId: '',
  bgColor: '#333333',
  textColor: '#ffffff',
  min: null,
  max: null,
  unit: '',
  decimals: 2,
  maxFiles: 5,
  accept: 'image/*',
  maxLength: 500,
  placeholder: '',
}

const buildConfig = (data: Input) => {
  switch (data.dataType) {
    case 'numeric':
      return {
        min: data.min,
        max: data.max,
        unit: data.unit || null,
        decimals: data.decimals,
      }
    case 'photo':
      return {
        maxFiles: data.maxFiles ?? 5,
        accept: data.accept || 'image/*',
      }
    case 'text':
      return {
        maxLength: data.maxLength ?? 500,
        placeholder: data.placeholder || null,
      }
    default:
      return null
  }
}

const explodeConfig = (row: ActionableTypeRow | null): Partial<Input> => {
  const cfg = (row?.config ?? null) as Record<string, unknown> | null
  if (!cfg) return {}
  return {
    min: typeof cfg.min === 'number' ? cfg.min : null,
    max: typeof cfg.max === 'number' ? cfg.max : null,
    unit: typeof cfg.unit === 'string' ? cfg.unit : '',
    decimals: typeof cfg.decimals === 'number' ? cfg.decimals : null,
    maxFiles: typeof cfg.maxFiles === 'number' ? cfg.maxFiles : null,
    accept: typeof cfg.accept === 'string' ? cfg.accept : '',
    maxLength: typeof cfg.maxLength === 'number' ? cfg.maxLength : null,
    placeholder: typeof cfg.placeholder === 'string' ? cfg.placeholder : '',
  }
}

const ActionableTypeForm = ({
  selected,
  userRoles,
}: {
  selected: ActionableTypeRow | null
  userRoles: UserRole[]
}) => {
  const form = useForm<Input>({ defaultValues })

  useEffect(() => {
    if (selected) {
      form.reset({
        ...defaultValues,
        name: selected.name,
        description: selected.description ?? '',
        dataType: selected.dataType as ActionableDataType,
        userRoleId: selected.userRoleId,
        bgColor: selected.bgColor,
        textColor: selected.textColor,
        ...explodeConfig(selected),
      })
    } else {
      form.reset(defaultValues)
    }
  }, [selected, form])

  const dataType = form.watch('dataType')

  const dataTypeOptions = actionableDataTypes.map(t => ({ label: t, value: t }))
  const userRoleOptions = userRoles.map(r => ({ label: r.name, value: r.id }))

  const handleSubmit = async (data: Input) => {
    const payload = {
      name: data.name,
      description: data.description || null,
      dataType: data.dataType,
      userRoleId: data.userRoleId,
      bgColor: data.bgColor,
      textColor: data.textColor,
      config: buildConfig(data) as never,
    }

    if (selected) {
      await updateActionableType(selected.id, payload)
    } else {
      await createActionableType(payload)
    }
    location.reload()
  }

  const handleDelete = async () => {
    if (!selected) return
    if (!confirm(`Delete "${selected.name}"?`)) return
    try {
      await deleteActionableType(selected.id)
      location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <Dialog.Root identifier='actionableType'>
      <Dialog.Title>{selected ? 'Edit Actionable Type' : 'New Actionable Type'}</Dialog.Title>

      <div className='max-h-[70vh] overflow-y-auto pr-2'>
      <Form.Root form={form} onSubmit={handleSubmit}>
        <Form.Text form={form} fieldName='name' label='Name' required />
        <Form.TextArea form={form} fieldName='description' label='Description' required={false} />
        <Form.Select form={form} fieldName='dataType' label='Data Type' options={dataTypeOptions} />
        <Form.Select form={form} fieldName='userRoleId' label='User Role' options={userRoleOptions} />
        <Form.Color form={form} fieldName='bgColor' label='Background Color' />
        <Form.Color form={form} fieldName='textColor' label='Text Color' />

        {dataType === 'numeric' && (
          <>
            <Form.Number form={form} fieldName='min' label='Minimum' required={false} />
            <Form.Number form={form} fieldName='max' label='Maximum' required={false} />
            <Form.Text form={form} fieldName='unit' label='Unit (e.g. pH, °C, g)' required={false} />
            <Form.Number form={form} fieldName='decimals' label='Decimal Places' required={false} />
          </>
        )}

        {dataType === 'photo' && (
          <>
            <Form.Number form={form} fieldName='maxFiles' label='Max Files' required={false} />
            <Form.Text form={form} fieldName='accept' label='Accept Pattern (e.g. image/*)' required={false} />
          </>
        )}

        {dataType === 'text' && (
          <>
            <Form.Number form={form} fieldName='maxLength' label='Max Length' required={false} />
            <Form.Text form={form} fieldName='placeholder' label='Placeholder' required={false} />
          </>
        )}

        <Form.ActionRow form={form} />

        {selected && (
          <button type='button' className='btn btn-error btn-sm mt-2' onClick={handleDelete}>
            Delete
          </button>
        )}
      </Form.Root>
      </div>
    </Dialog.Root>
  )
}

export default ActionableTypeForm
