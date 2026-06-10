'use client'

import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import Uploader from "@/components/Uploader/Uploader"
import useToast from "@/hooks/useToast"
import { appActions } from "@/actions/app"
import { FileResponseData } from "@/app/api/upload/route"
import { CompanyImageKey } from "@/actions/app/images/companyImageKeys"
import { CompanyImageUrls } from "@/actions/app/images/getCompanyImageUrls"
import { useRouter } from "next/navigation"

type ImageSlot = {
  key: CompanyImageKey
  title: string
  description: string
}

const imageSlots: ImageSlot[] = [
  {
    key: 'logo',
    title: 'Company Logo',
    description: 'Shown on Purchase Orders and Certificates of Analysis.',
  },
  {
    key: 'microFormTemplate',
    title: 'Micro Submission Form Template',
    description: 'Full-page background used when generating the Micro Submission Form.',
  },
  {
    key: 'signature',
    title: 'Signature',
    description: 'Stamped onto the Micro Submission Form when a signature is included.',
  },
]

const CompanyImagesForm = ({ images }: { images: CompanyImageUrls }) => {

  const router = useRouter()
  const { toast } = useToast()

  const handleComplete = async (key: CompanyImageKey, data: FileResponseData) => {
    try {
      await appActions.images.updateCompany(key, data.fileId)
      toast('Image saved', '', 'success')
      router.refresh()
    } catch (err) {
      toast('Failed to save image', String(err), 'error')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {imageSlots.map(slot => (
        <div key={slot.key} className="flex flex-col gap-4">
          <SectionTitle size="normal">{slot.title}</SectionTitle>

          <Card.Root>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-base-content/70">{slot.description}</p>

              <div className="flex items-center justify-center rounded-lg border border-base-300 bg-base-200 p-4 min-h-32">
                {images[slot.key] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[slot.key]!}
                    alt={slot.title}
                    className="max-h-40 max-w-full object-contain"
                  />
                ) : (
                  <p className="text-sm text-base-content/50">No image uploaded</p>
                )}
              </div>

              <Uploader
                pathPrefix="company/images"
                onComplete={(data) => handleComplete(slot.key, data)}
              />
            </div>
          </Card.Root>
        </div>
      ))}
    </div>
  )
}

export default CompanyImagesForm
