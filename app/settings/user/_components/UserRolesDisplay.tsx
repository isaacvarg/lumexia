import { User } from "@/actions/users/getUser";
import Card from "@/components/Card";
import SectionTitle from "@/components/Text/SectionTitle";

const UserRolesDisplay = ({ user }: { user: User }) => {

  const roleNames = user.UserRoleAssignment.map(assignment => assignment.userRole.name);

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle>User Roles</SectionTitle>

      <Card.Root>
        <div className="flex flex-col gap-4">
          {roleNames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {roleNames.map(name => (
                <span key={name} className="badge badge-primary badge-lg">{name}</span>
              ))}
            </div>
          ) : (
            <p className="text-base-content/70">No roles assigned</p>
          )}

          <p className="text-sm text-base-content/70">Contact a system admin to modify your roles.</p>
        </div>
      </Card.Root>

    </div>
  )
}

export default UserRolesDisplay
