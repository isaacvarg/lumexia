import Card from "@/components/Card"
import { useItemSelection } from "@/store/itemSlice"
import { useEffect, useState } from "react"
import { ItemFile } from "../../_actions/files/getAllItemFiles"
import { handleDeleteFile } from "../../_actions/files/handleDeleteFile"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Tag from "@/components/Text/Tag"
import ContextMenu from "@/components/ContextMenu"
import { TbWorld } from "react-icons/tb"

const View = () => {

  const { options, files } = useItemSelection()
  const [selectedType, setSelectedType] = useState<{ id: string, name: string }>({ id: 'default', name: 'all' })
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set())
  const [shownFiles, setShownFiles] = useState<ItemFile[]>(files)
  const types = options.itemFileTypes.map((t) => ({ id: t.id, name: t.name }));
  const router = useRouter();

  const tagOptions = (() => {
    const map = new Map<string, { id: string; name: string; bgColor: string; textColor: string }>();
    for (const f of files) {
      for (const ft of f.file.fileTags) {
        if (!map.has(ft.tag.id)) {
          map.set(ft.tag.id, {
            id: ft.tag.id,
            name: ft.tag.name,
            bgColor: ft.tag.bgColor,
            textColor: ft.tag.textColor,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onEditClick = (file: ItemFile) => {
    router.push(`/files/${file.fileId}`);
  }

  const onDeleteClick = async (file: ItemFile) => {
    await handleDeleteFile(file)
    router.refresh()
  }

  useEffect(() => {
    let next = files;
    if (selectedType.id !== 'default') {
      next = next.filter(f => f.fileTypeId === selectedType.id);
    }
    if (selectedTagIds.size > 0) {
      next = next.filter(f =>
        f.file.fileTags.some(ft => selectedTagIds.has(ft.tag.id))
      );
    }
    setShownFiles(next);
  }, [files, selectedType, selectedTagIds])

  return (
    <Card.Root span={2}>
      <div className="flex flex-col gap-6">

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Card.Title>Files</Card.Title>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType({ id: 'default', name: 'all' })}
                className={`btn btn-sm capitalize ${selectedType.id === 'default' ? 'btn-accent' : 'btn-ghost'}`}
              >
                All
              </button>
              {types.map(t => (
                <button
                  key={t.id}
                  className={`btn btn-sm capitalize ${selectedType.id === t.id ? 'btn-accent' : 'btn-ghost'}`}
                  onClick={() => setSelectedType(t)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {tagOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-poppins text-base-content/60">Tags:</span>
              {tagOptions.map((t) => {
                const active = selectedTagIds.has(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTag(t.id)}
                    className={`rounded-md px-2 py-0.5 text-xs font-poppins font-medium transition ${active ? 'ring-2 ring-offset-1 ring-accent' : 'opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: t.bgColor, color: t.textColor }}
                  >
                    {t.name}
                  </button>
                );
              })}
              {selectedTagIds.size > 0 && (
                <button
                  onClick={() => setSelectedTagIds(new Set())}
                  className="btn btn-ghost btn-xs"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shownFiles.map(file => {
            const extType = file.file.mimeType === 'application/pdf' ? 'pdf'
              : file.file.mimeType.startsWith('image/') ? 'image'
              : 'other';
            const { name: uploaderName, image: uploaderImage } = file.file.uploadedBy;

            return (
              <ContextMenu.Root key={file.id}>
                <ContextMenu.Trigger asChild>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <div className="card card-side bg-base-100 shadow-sm hover:shadow-md hover:cursor-pointer transition-shadow">
                      <figure className="relative w-32 shrink-0">
                        {file.thumbnailUrl ? (
                          <Image
                            className="absolute inset-0 h-full w-full object-cover"
                            src={file.thumbnailUrl}
                            alt={file.file.name}
                            width={128}
                            height={160}
                            unoptimized
                          />
                        ) : (
                          <div className="h-full w-full bg-base-300 flex items-center justify-center">
                            <span className="text-base-content/40 text-xs uppercase font-poppins font-semibold">
                              {extType}
                            </span>
                          </div>
                        )}
                      </figure>

                      <div className="card-body gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <h2 className="card-title text-sm font-poppins truncate">{file.file.name}</h2>
                          {file.file.public && (
                            <span className="tooltip shrink-0" data-tip="Public">
                              <TbWorld className="size-4 text-base-content/60" />
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Tag text="normal" color="accent" label={extType} tooltip="Extension" />
                          <Tag
                            text="normal"
                            bgColor={file.fileType.bgColor}
                            textColor={file.fileType.textColor}
                            label={file.fileType.name}
                            tooltip="File Type"
                          />
                          {file.file.fileTags.map((ft) => (
                            <Tag
                              key={ft.id}
                              text="normal"
                              bgColor={ft.tag.bgColor}
                              textColor={ft.tag.textColor}
                              label={ft.tag.name}
                              tooltip="Tag"
                            />
                          ))}
                        </div>

                        {uploaderName && uploaderImage && (
                          <div className="card-actions mt-auto">
                            <div className="tooltip" data-tip={uploaderName}>
                              <Image
                                src={uploaderImage}
                                className="rounded-full h-7 w-7"
                                alt={uploaderName}
                                width={28}
                                height={28}
                                unoptimized
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                </ContextMenu.Trigger>

                <ContextMenu.Content>
                  <ContextMenu.Item onClick={() => onEditClick(file)}>Edit</ContextMenu.Item>
                  <ContextMenu.Item onClick={() => onDeleteClick(file)}>Delete</ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Root>
            );
          })}
        </div>
      </div>
    </Card.Root>
  )
}

export default View
