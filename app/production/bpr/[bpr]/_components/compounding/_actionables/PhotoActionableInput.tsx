'use client'

import Uploader from '@/components/Uploader/Uploader'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { handleSubmitActionable } from '../../../_actions/compounding/handleSubmitActionable'
import { FileResponseData } from '@/app/api/upload/route'

type Props = {
  actionableId: string
  config: Record<string, unknown> | null
}

const PhotoActionableInput = ({ actionableId, config }: Props) => {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<FileResponseData[]>([])

  const maxFiles = config && typeof config.maxFiles === 'number' ? config.maxFiles : 5

  const submit = async (fileIds: string[]) => {
    setPending(true)
    setError(null)
    try {
      await handleSubmitActionable({
        bprStepActionableId: actionableId,
        value: JSON.stringify({ fileCount: fileIds.length }),
        fileIds,
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setPending(false)
    }
  }

  const handleSingle = async (file: FileResponseData) => {
    setUploaded([file])
    if (maxFiles === 1) {
      await submit([file.fileId])
    }
  }

  const handleMultiple = async (files: FileResponseData[]) => {
    setUploaded(files)
  }

  const handleSubmitClick = async () => {
    if (uploaded.length === 0) {
      setError('Upload at least one file')
      return
    }
    await submit(uploaded.map(f => f.fileId))
  }

  return (
    <div className='flex flex-col gap-2'>
      <Uploader
        pathPrefix='/production/actionables'
        multiple={maxFiles > 1}
        onComplete={handleSingle}
        onMultipleComplete={handleMultiple}
      />
      {maxFiles > 1 && uploaded.length > 0 && (
        <button className='btn btn-primary' onClick={handleSubmitClick} disabled={pending}>
          Submit {uploaded.length} file{uploaded.length === 1 ? '' : 's'}
        </button>
      )}
      {error && <div className='text-error text-sm'>{error}</div>}
    </div>
  )
}

export default PhotoActionableInput
