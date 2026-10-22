'use client'
import Card from "@/components/Card"
import { useAppForm } from "@/components/Form2"
import SectionTitle from "@/components/Text/SectionTitle"
import UserIcon from "@/components/UI/UserIcon"
import UserKindBadge from "@/components/UI/UserKindBadge"
import Uploader from "@/components/Uploader/Uploader"
import useToast from "@/hooks/useToast"
import { UserWithRolesDetail } from "@/actions/users/getUserById"
import { setAgentAvatar, updateAgentProfile } from "@/actions/users/agents"
import { UserRole } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbArrowLeft, TbEdit } from "react-icons/tb"
import RolesPanel from "./RolesPanel"

const Row = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm text-base-content/60">{label}</span>
    <span className="text-base-content">{value || <span className="text-base-content/40">—</span>}</span>
  </div>
)

// Profile for an agent user: it never signs in, so an admin edits its name, description and avatar here.
const AgentProfilePanel = ({ user, allRoles }: { user: UserWithRolesDetail, allRoles: UserRole[] }) => {

  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)

  const form = useAppForm({
    defaultValues: { name: user.name ?? '', description: user.description ?? '' },
    onSubmit: async ({ value }) => {
      try {
        await updateAgentProfile(user.id, value)
        setIsEditing(false)
        router.refresh()
      } catch (err: any) {
        toast('Could not save agent', err?.message ?? 'Something went wrong', 'error')
      }
    }
  })

  const changeAvatar = async (objectName: string | null) => {
    try {
      await setAgentAvatar(user.id, objectName)
      router.refresh()
    } catch (err: any) {
      toast('Could not change avatar', err?.message ?? 'Something went wrong', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle>Profile</SectionTitle>

      <Card.Root>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserIcon kind={user.kind} image={user.image || ''} name={user.name || ''} />
            <div className="flex flex-col">
              <span className="flex items-center gap-2 font-medium text-base-content">{user.name} <UserKindBadge kind={user.kind} /></span>
              <span className="text-sm text-base-content/70">{user.description}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-square"
            onClick={() => setIsEditing(prev => !prev)}
            aria-label={isEditing ? "Back" : "Edit agent"}
          >
            {isEditing ? <TbArrowLeft className="w-5 h-5" /> : <TbEdit className="w-5 h-5" />}
          </button>
        </div>

        {isEditing ? (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
              className="flex flex-col gap-4"
            >
              <form.AppField
                name="name"
                validators={{ onChange: ({ value }) => !value.trim() ? { message: 'An agent needs a name' } : undefined }}
              >
                {(field) => <field.TextField label="Name" labelClass="soft" />}
              </form.AppField>
              <form.AppField name="description">
                {(field) => <field.TextField label="Description" labelClass="soft" description="What it is and where it runs, e.g. Hermes on WhatsApp." />}
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
                onComplete={(result) => changeAvatar(result.thumbnailObjectName ?? result.objectName)}
              />
              {user.image && (
                <div>
                  <button type="button" className="btn btn-outline" onClick={() => changeAvatar(null)}>
                    Remove avatar
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Row label="User ID" value={user.id} />
            <Row label="Signs in" value="Never. It acts only through the API keys on the Agents tab." />
            <Row label="Created" value={new Date(user.createdAt).toLocaleString()} />
            <Row label="Last updated" value={new Date(user.updatedAt).toLocaleString()} />
          </div>
        )}
      </Card.Root>

      <RolesPanel user={user} allRoles={allRoles} />
    </div>
  )
}

export default AgentProfilePanel
