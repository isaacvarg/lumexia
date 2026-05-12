'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { handleSubmitActionable } from '../../../_actions/compounding/handleSubmitActionable'

type Props = {
  actionableId: string
  config: Record<string, unknown> | null
}

const TextActionableInput = ({ actionableId, config }: Props) => {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxLength = config && typeof config.maxLength === 'number' ? config.maxLength : null
  const placeholder = config && typeof config.placeholder === 'string' ? config.placeholder : ''

  const handleSubmit = async () => {
    if (!value.trim()) {
      setError('Required')
      return
    }
    if (maxLength !== null && value.length > maxLength) {
      setError(`Too long (max ${maxLength})`)
      return
    }
    setError(null)
    setPending(true)
    try {
      await handleSubmitActionable({ bprStepActionableId: actionableId, value })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength ?? undefined}
        className='textarea textarea-bordered w-full'
        rows={3}
      />
      <div className='flex items-center justify-between'>
        {maxLength !== null && (
          <span className='text-xs text-base-content/60'>{value.length} / {maxLength}</span>
        )}
        <button className='btn btn-primary' onClick={handleSubmit} disabled={pending || !value.trim()}>
          Submit
        </button>
      </div>
      {error && <div className='text-error text-sm'>{error}</div>}
    </div>
  )
}

export default TextActionableInput
