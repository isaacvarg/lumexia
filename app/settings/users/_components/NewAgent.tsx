'use client'
import Card from "@/components/Card"
import { useAppForm } from "@/components/Form2"
import useToast from "@/hooks/useToast"
import { createAgentUser } from "@/actions/users/agents"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbRobot } from "react-icons/tb"

// An agent is a user for Claude Code, Hermes and the like: it never signs in, and an admin creates its keys.
const NewAgent = () => {

  const router = useRouter()
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)

  const form = useAppForm({
    defaultValues: { name: '', description: '' },
    onSubmit: async ({ value }) => {
      try {
        const agent = await createAgentUser(value)
        router.push(`/settings/users/${agent.id}`)
      } catch (err: any) {
        toast('Could not create agent', err?.message ?? 'Something went wrong', 'error')
      }
    }
  })

  if (!isCreating) {
    return (
      <div className="flex justify-end">
        <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(true)}>
          <TbRobot className="w-5 h-5" /> New agent
        </button>
      </div>
    )
  }

  return (
    <Card.Root>
      <p className="text-base-content/70">
        An agent is a user for an AI agent like Claude Code or Hermes. It never signs in: after creating it,
        give it roles and create its API keys from its page. It starts with no roles.
      </p>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.AppField
          name="name"
          validators={{ onChange: ({ value }) => !value.trim() ? { message: 'An agent needs a name' } : undefined }}
        >
          {(field) => <field.TextField label="Name" labelClass="soft" description="How it appears on what it does, e.g. Hermes." />}
        </form.AppField>
        <form.AppField name="description">
          {(field) => <field.TextField label="Description" labelClass="soft" description="Optional: what it is and where it runs, e.g. Hermes on WhatsApp." />}
        </form.AppField>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={() => setIsCreating(false)}>Cancel</button>
          <form.AppForm>
            <form.SubmitButton>Create agent</form.SubmitButton>
          </form.AppForm>
        </div>
      </form>
    </Card.Root>
  )
}

export default NewAgent
