'use client'
import Card from "@/components/Card";
import { useAppForm } from "@/components/Form2";
import SectionTitle from "@/components/Text/SectionTitle";
import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { UserWithRolesDetail } from "@/actions/users/getUserById";
import { updateUserRoles } from "@/actions/users/updateUserRoles";

type Props = {
  user: UserWithRolesDetail;
  allRoles: UserRole[];
}

const RolesPanel = ({ user, allRoles }: Props) => {

  const router = useRouter()

  const assignedRoleIds = useMemo(
    () => new Set(user.UserRoleAssignment.map(assignment => assignment.userRoleId)),
    [user]
  )

  const defaultValues = useMemo(() => ({
    assignments: allRoles.map(role => ({
      id: role.id,
      value: assignedRoleIds.has(role.id),
      label: role.name,
    })),
  }), [allRoles, assignedRoleIds])

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const selectedRoleIds = value.assignments
        .filter(assignment => assignment.value)
        .map(assignment => assignment.id)

      await updateUserRoles(user.id, selectedRoleIds)
      router.refresh()
    }
  })

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <SectionTitle>User Roles</SectionTitle>

      <Card.Root>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.AppField name="assignments" mode="array">
            {(field) => (
              <div className="flex flex-col gap-2">
                {field.state.value.map((assignment, i) => (
                  <form.AppField
                    key={assignment.id}
                    name={`assignments[${i}].value`}
                  >
                    {(subField) => (
                      <label className="flex items-center justify-between gap-4 rounded-lg border border-base-200 bg-base-100 px-4 py-3 cursor-pointer transition-colors hover:border-primary/40">
                        <span className="font-medium text-base-content">{assignment.label}</span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={subField.state.value}
                          onChange={(e) => subField.handleChange(e.target.checked)}
                        />
                      </label>
                    )}
                  </form.AppField>
                ))}
              </div>
            )}
          </form.AppField>

          <div>
            <form.AppForm>
              <form.SubmitButton />
            </form.AppForm>
          </div>
        </form>
      </Card.Root>
    </div>
  )
}

export default RolesPanel
