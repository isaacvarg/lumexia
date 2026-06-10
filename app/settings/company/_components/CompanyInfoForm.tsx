'use client'
import Card from "@/components/Card"
import { useAppForm } from "@/components/Form2"
import SectionTitle from "@/components/Text/SectionTitle"
import useToast from "@/hooks/useToast"
import { appActions } from "@/actions/app"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { companyFieldGroups, companyFieldKeys } from "./companyFields"

const CompanyInfoForm = ({ company }: { company: Record<string, string> }) => {

  const router = useRouter()
  const { toast } = useToast()

  const defaultValues = useMemo(
    () => Object.fromEntries(companyFieldKeys.map(key => [key, company[key] ?? ''])) as Record<string, string>,
    [company]
  )

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        await appActions.configs.updateCompany(value)
        toast('Company settings saved', '', 'success')
        router.refresh()
      } catch (err) {
        toast('Failed to save company settings', String(err), 'error')
      }
    }
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {companyFieldGroups.map(group => (
          <div key={group.title} className="flex flex-col gap-4">
            <SectionTitle size="normal">{group.title}</SectionTitle>

            <Card.Root>
              <div className="flex flex-col gap-4">
                {group.fields.map(field => (
                  <form.AppField key={field.key} name={field.key}>
                    {(f) => <f.TextField label={field.label} />}
                  </form.AppField>
                ))}
              </div>
            </Card.Root>
          </div>
        ))}
      </div>

      <div>
        <form.AppForm>
          <form.SubmitButton />
        </form.AppForm>
      </div>
    </form>
  )
}

export default CompanyInfoForm
