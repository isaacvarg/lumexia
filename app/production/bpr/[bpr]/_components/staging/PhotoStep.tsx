import { fileActions } from "@/actions/files"
import { getFileUrl } from "@/actions/files/getUrl"
import { FileResponseData } from "@/app/api/upload/route"
import Uploader from "@/components/Uploader/Uploader"
import { useState } from "react"
import { TbTrash } from "react-icons/tb"

export type StagingImage = {
  url: string,
  fileId: string
  name: string
}

const PhotoStep = ({ currentStep, onImagesSubmit }: { currentStep: number, onImagesSubmit: (files: StagingImage[]) => void }) => {

  const [images, setImages] = useState<StagingImage[]>([])

  if (currentStep !== 2) return false

  const handleSubmit = () => {
    onImagesSubmit(images)
  }


  const handlePhoto = async (fileResponse: FileResponseData) => {
    const url = await getFileUrl('lumexia', fileResponse.objectName);
    setImages((prev) => [...prev, {
      url,
      fileId: fileResponse.fileId,
      name: fileResponse.name
    }]);
  }

  const handleFileRemove = async (fileId: string) => {

    await fileActions.remove(fileId)
    const filter = images.filter(image => image.fileId !== fileId);
    setImages(filter);
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        <Uploader
          span={images.length !== 0 ? 'default' : 2}
          pathPrefix="/production/staging"
          onComplete={handlePhoto}
        />

        {images.length !== 0 && (
          <div className="pt-4 ">

            <button onClick={handleSubmit} className="w-full btn-success btn btn-xl min-h-24">Submit</button>
          </div>
        )}

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {images.map(image => {
          return (
            <div className="flex flex-col gap-2 p-6 border-dashed border-2 border-base-content/10 rounded-xl items-center justify-center" key={image.fileId}>
              <img className="size-80 rounded-xl object-cover" src={image.url} />
              <button onClick={() => handleFileRemove(image.fileId)} className="btn btn-soft btn-error">

                <TbTrash className="size-8" />
              </button>
            </div>
          )
        })}
      </div>

    </div>

  )
}

export default PhotoStep
