'use client'
import Card from "@/components/Card";
import SectionTitle from "@/components/Text/SectionTitle";
import FileTypeForm from "./FileTypeForm";
import { useState } from "react";
import { TbPlus, TbTrash } from "react-icons/tb";
import { useAppForm } from "@/components/Form2";
import { ItemFileType } from "@/app/inventory/items/[name]/_actions/files/getItemFilesTypes";
import { updateItemFileType } from "@/app/inventory/_actions/updateItemFileTypes";
import { deleteItemFileType } from "@/app/inventory/_actions/deleteItemFileType";
import { useRouter } from "next/navigation";
import DeletionErrorAlert from "./shared/DeletionErrorAlert";

const FileTypes = ({ fileTypes }: { fileTypes: ItemFileType[] }) => {

  const [isAdd, setIsAdd] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    const result = await deleteItemFileType(id);
    if (!result.success) {
      setDeleteError(result.error);
      return;
    }
    router.refresh();
  };
  const form = useAppForm({
    defaultValues: {
      fileTypes,
    },
    onSubmit: async ({ value }) => {
      await Promise.all(value.fileTypes.map(async (ft) => {
        return await updateItemFileType(ft.id, ft);
      }));
      router.refresh()
      form.reset()
    }
  })

  return (
    <div className="flex flex-col gap-4  col-span-1">
      <div className="flex justify-between items-center">
        <SectionTitle>Item File Types</SectionTitle>

        <button onClick={() => setIsAdd(true)} className="btn btn-secondary"><TbPlus className="size-4" /> </button>

      </div>

      <Card.Root>

        {isAdd && <FileTypeForm setIsAdd={setIsAdd} />}

        {!isAdd && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <form.AppField name="fileTypes" mode="array">
              {(field) => {
                return (
                  <div className="flex flex-col gap-4">
                    {field.state.value.map((_, i) => {
                      return (
                        <div
                          key={`itemTypes[${i}].id`}
                          className="flex flex-col gap-1">
                          <label className="font-medium text-xl text-base-content">{_.name}</label>
                          <div className='flex items-end justify-between gap-2'>
                            <form.AppField
                              name={`fileTypes[${i}].name`} >
                              {(subField) => (
                                <subField.TextField label={'Name'} labelClass="soft" />
                              )}
                            </form.AppField>
                            <form.AppField
                              name={`fileTypes[${i}].abbreviaton`}>
                              {(subField) => (
                                <subField.TextField label={'Abbreviaton'} labelClass="soft" />
                              )}
                            </form.AppField>
                            <form.AppField
                              name={`fileTypes[${i}].description`}>
                              {(subField) => (
                                <subField.TextField label={'Description'} labelClass="soft" />
                              )}
                            </form.AppField>
                            <form.AppField
                              name={`fileTypes[${i}].bgColor`}>
                              {(subField) => (
                                <subField.TextField label={'Background Color'} labelClass="soft" />
                              )}
                            </form.AppField>

                            <form.AppField
                              name={`fileTypes[${i}].textColor`}>
                              {(subField) => (
                                <subField.TextField label={'Text Color'} labelClass="soft" />
                              )}
                            </form.AppField>

                            <button
                              type="button"
                              onClick={() => handleDelete(_.id)}
                              className="btn btn-error btn-soft"
                              aria-label={`Delete ${_.name}`}
                            >
                              <TbTrash className="size-4" />
                            </button>

                          </div>
                        </div>

                      )
                    })}
                  </div>
                )
              }}

            </form.AppField>



            <div>
              <form.AppForm>
                <form.SubmitButton />
              </form.AppForm>
            </div>

          </form>

        )}

      </Card.Root>

      <DeletionErrorAlert
        identifier="fileTypeDeletionError"
        error={deleteError}
        onClose={() => setDeleteError(null)}
      />

    </div>

  )
}

export default FileTypes
