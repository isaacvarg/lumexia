import PageTitle from "@/components/Text/PageTitle"
import HelperSetter from "@/components/Helper/HelperSetter"
import { getUser } from "@/actions/users/getUser"
import { appActions } from "@/actions/app"
import { redirect } from "next/navigation"
import GlobalPoNotesForm from "./_components/GlobalPoNotesForm"

const PurchasingSettingsPage = async () => {

  // Access control: only system admins may manage purchasing settings.
  const user = await getUser()
  if (!user.roles.isSystemAdmin) {
    redirect('/settings')
  }

  const globalPoNotes = await appActions.configs.getGlobalPoNotes()

  return (
    <div className="flex flex-col gap-y-6">
      <HelperSetter section="settings-purchasing" />

      <PageTitle>Purchasing Settings</PageTitle>

      <GlobalPoNotesForm notes={globalPoNotes} />
    </div>
  )
}

export default PurchasingSettingsPage
