import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import { UserWithRolesDetail } from "@/actions/users/getUserById"

// The system user (Lumexia) records what scheduled jobs and automation do. It is read-only here
// so nothing can break those jobs: no roles, keys, disabling or deactivation.
const SystemUserPanel = ({ user }: { user: UserWithRolesDetail }) => (
  <div className="flex flex-col gap-6">
    <SectionTitle>Profile</SectionTitle>

    <Card.Root>
      <p className="text-base-content/70">
        {user.name} is the system user. Scheduled jobs and automation, such as reordering rules and inventory
        audit triggers, act as this user. It never signs in, can&apos;t hold API keys, and can&apos;t be changed.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-base-content/60">User ID</span>
          <span className="text-base-content">{user.id}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-base-content/60">Created</span>
          <span className="text-base-content">{new Date(user.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </Card.Root>
  </div>
)

export default SystemUserPanel
