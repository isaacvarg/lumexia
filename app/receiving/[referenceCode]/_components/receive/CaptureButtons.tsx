'use client'
import { useRef, useState } from "react"
import { TbCamera, TbFileUpload } from "react-icons/tb"
import { FileResponseData } from "@/app/api/upload/route"
import { Uploaded } from "./draft"

const upload = async (file: File, pathPrefix: string): Promise<Uploaded> => {
  const body = new FormData()
  body.append("file", file)
  body.append("pathPrefix", pathPrefix)
  const res = await fetch("/api/upload", { method: "POST", body })
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Upload failed")
  const data: FileResponseData = await res.json()
  return { fileId: data.fileId, name: data.name, mimeType: data.mimetype }
}

type Props = {
  pathPrefix: string
  onUploaded: (files: Uploaded[]) => void
  // photos only (damage, labels) vs. documents (PDFs or photos of paperwork)
  photosOnly?: boolean
  cameraLabel?: string
  fileLabel?: string
  size?: "md" | "lg"
}

// Big tap targets for the dock tablet: one opens the camera, the other the file picker.
const CaptureButtons = ({ pathPrefix, onUploaded, photosOnly = false, cameraLabel = "Take photo", fileLabel = "Choose file", size = "lg" }: Props) => {
  const camera = useRef<HTMLInputElement>(null)
  const picker = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handle = async (list: FileList | null) => {
    if (!list || list.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const done: Uploaded[] = []
      for (const f of Array.from(list)) done.push(await upload(f, pathPrefix))
      onUploaded(done)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setBusy(false)
      if (camera.current) camera.current.value = ""
      if (picker.current) picker.current.value = ""
    }
  }

  const btn = `btn ${size === "lg" ? "btn-lg" : ""}`
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${btn} btn-outline`} disabled={busy} onClick={() => camera.current?.click()}>
          {busy ? <span className="loading loading-spinner loading-sm" /> : <TbCamera className="size-6" />}
          {cameraLabel}
        </button>
        <button type="button" className={`${btn} btn-ghost border-base-300`} disabled={busy} onClick={() => picker.current?.click()}>
          <TbFileUpload className="size-6" />
          {fileLabel}
        </button>
      </div>
      <input ref={camera} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handle(e.target.files)} />
      <input ref={picker} type="file" accept={photosOnly ? "image/*" : "image/*,application/pdf"} multiple className="hidden" onChange={(e) => handle(e.target.files)} />
      {error && <span role="alert" className="text-sm text-error">{error}</span>}
    </div>
  )
}

export default CaptureButtons
