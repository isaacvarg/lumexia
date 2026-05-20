'use client'

import { accountingActions } from '@/actions/accounting'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FaRegThumbsUp } from 'react-icons/fa'

type Props = {
  examId: string
  isSelf?: boolean
}

const ApproveButton = ({ examId, isSelf = false }: Props) => {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  if (isSelf) return null

  const handleApprove = async () => {
    if (isPending) return
    setIsPending(true)
    try {
      await accountingActions.examinations.approve(examId)
      router.back()
    } catch (error) {
      console.error('Error approving examination:', error)
      alert(error instanceof Error ? error.message : 'Failed to approve examination')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      className={`btn btn-success ${isPending ? 'loading' : ''}`}
    >
      {!isPending && <FaRegThumbsUp />}
      {isPending ? 'Approving...' : 'Approve'}
    </button>
  )
}

export default ApproveButton
