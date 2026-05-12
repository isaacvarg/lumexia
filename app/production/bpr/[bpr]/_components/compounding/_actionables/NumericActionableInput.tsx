'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { handleSubmitActionable } from '../../../_actions/compounding/handleSubmitActionable'

type Props = {
  actionableId: string
  config: Record<string, unknown> | null
}

const NumericActionableInput = ({ actionableId, config }: Props) => {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const min = config && typeof config.min === 'number' ? config.min : null
  const max = config && typeof config.max === 'number' ? config.max : null
  const unit = config && typeof config.unit === 'string' ? config.unit : null
  const decimals = config && typeof config.decimals === 'number' ? config.decimals : null

  const handleSubmit = async () => {
    const num = Number(value)
    if (!Number.isFinite(num)) {
      setError('Enter a valid number')
      return
    }
    if (min !== null && num < min) {
      setError(`Must be ≥ ${min}`)
      return
    }
    if (max !== null && num > max) {
      setError(`Must be ≤ ${max}`)
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
      <div className='flex items-center gap-2'>
        <input
          type='number'
          step={decimals !== null ? Math.pow(10, -decimals) : 'any'}
          min={min ?? undefined}
          max={max ?? undefined}
          value={value}
          onChange={e => setValue(e.target.value)}
          className='input input-bordered w-32'
        />
        {unit && <span className='text-base-content/70'>{unit}</span>}
        <button className='btn btn-primary' onClick={handleSubmit} disabled={pending || !value}>
          Submit
        </button>
      </div>
      {(min !== null || max !== null) && (
        <div className='text-xs text-base-content/60'>
          Range: {min ?? '—'} to {max ?? '—'}{unit ? ` ${unit}` : ''}
        </div>
      )}
      {error && <div className='text-error text-sm'>{error}</div>}
    </div>
  )
}

export default NumericActionableInput
