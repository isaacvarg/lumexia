'use client'
import Card from "@/components/Card"
import { useAppForm } from "@/components/Form2"
import SectionTitle from "@/components/Text/SectionTitle"
import UserIcon from "@/components/UI/UserIcon"
import Uploader from "@/components/Uploader/Uploader"
import { useAppActions, useAppSelection } from "@/store/appSlice"
import { updateUserName } from "@/actions/users/updateUserName"
import { setUserAvatar } from "@/actions/users/setUserAvatar"
import { resetUserAvatar } from "@/actions/users/resetUserAvatar"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { TbEdit, TbArrowLeft } from "react-icons/tb"

const ProfileSettings = () => {

  const router = useRouter()
  const { user } = useAppSelection()
  const { getUser } = useAppActions()
  const [isResetting, setIsResetting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const refresh = () => {
    getUser()
    router.refresh()
  }

  const defaultValues = useMemo(() => ({
    name: user?.name ?? '',
  }), [user?.name])

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await updateUserName(value.name)
      refresh()
    }
  })

  const handleReset = async () => {
    setIsResetting(true)
    try {
      await resetUserAvatar()
      refresh()
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>Profile</SectionTitle>

      <Card.Root>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserIcon image={user?.image || ''} name={user?.name || ''} />
            <div className="flex flex-col">
              <span className="font-medium text-base-content">{user?.name}</span>
              <span className="text-sm text-base-content/70">{user?.email}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-square"
            onClick={() => setIsEditing(prev => !prev)}
            aria-label={isEditing ? "Back" : "Edit profile"}
          >
            {isEditing ? <TbArrowLeft className="w-5 h-5" /> : <TbEdit className="w-5 h-5" />}
          </button>
        </div>

        {isEditing && (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="flex flex-col gap-4"
            >
              <form.AppField
                name="name"
              >
                {(field) => <field.TextField label="Name" />}
              </form.AppField>

              <div>
                <form.AppForm>
                  <form.SubmitButton />
                </form.AppForm>
              </div>
            </form>

            <div className="flex flex-col gap-2">
              <label className="font-medium text-xl text-base-content">Avatar</label>
              <Uploader
                pathPrefix="user-avatars"
                multiple={false}
                onComplete={async (result) => {
                  await setUserAvatar(result.thumbnailObjectName ?? result.objectName)
                  refresh()
                }}
              />
              <div>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleReset}
                  disabled={isResetting}
                >
                  Reset to Default Avatar
                </button>
              </div>
            </div>
          </>
        )}

      </Card.Root>

    </div>
  )
}

export default ProfileSettings
