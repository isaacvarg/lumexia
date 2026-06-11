'use client'

import Alert from "@/components/Alert"
import useDialog from "@/hooks/useDialog"
import { useEffect } from "react"

type Props = {
  identifier: string
  error: string | null
  onClose: () => void
}

const DeletionErrorAlert = ({ identifier, error, onClose }: Props) => {
  const { showDialog } = useDialog()

  useEffect(() => {
    if (error) showDialog(identifier)
  }, [error, identifier, showDialog])

  return (
    <Alert.Root identifier={identifier}>
      <Alert.Content
        title="Deletion Failed"
        action={onClose}
        actionLabel="Okay"
        actionColor="error"
      >
        {error}
      </Alert.Content>
    </Alert.Root>
  )
}

export default DeletionErrorAlert
