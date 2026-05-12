'use client'

import ActionButton from '@/components/ActionButton'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { handleSubmitActionable } from '../../../_actions/compounding/handleSubmitActionable'

type Props = {
  actionableId: string
}

const BooleanActionableInput = ({ actionableId }: Props) => {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    setPending(true)
    try {
      await handleSubmitActionable({ bprStepActionableId: actionableId, value: 'true' })
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <ActionButton onClick={handleClick} disabled={pending}>Done</ActionButton>
  )
}

export default BooleanActionableInput
