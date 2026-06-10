import PageTitle from "@/components/Text/PageTitle"
import { getUser } from "@/actions/users/getUser"
import { appActions } from "@/actions/app"
import { createConfigLookup } from "@/utils/data/createConfigLookup"
import { redirect } from "next/navigation"
import TabSelector from "./_components/shared/TabSelector"
import TabsContainer from "./_components/shared/TabsContainer"
import CompanyInfoForm from "./_components/CompanyInfoForm"

const CompanySettingsPage = async () => {

  // Access control: only system admins may manage company settings.
  const user = await getUser()
  if (!user.roles.isSystemAdmin) {
    redirect('/settings')
  }

  const companyConfigs = await appActions.configs.getByGroup('company')
  const company = createConfigLookup(companyConfigs)

  return (
    <div className="flex flex-col gap-y-6">
      <PageTitle>Company Settings</PageTitle>

      <TabSelector />
      <TabsContainer
        info={<CompanyInfoForm company={company} />}
        images={<p className="text-base-content/70">Company images coming soon.</p>}
      />
    </div>
  )
}

export default CompanySettingsPage
