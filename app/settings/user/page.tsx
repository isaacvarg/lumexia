import userActions from "@/actions/users/userAction"
import Title from "./_components/Title"
import userRoleActions from "@/actions/users/userRoles"
import UserRoles from "./_components/UserRoles";
import { getUser } from "@/actions/users/getUser";
import { getAllUserConfigs } from "./_actions/getAllConfigs";
import AppConfigurations from "./_components/AppConfigurations";
import { userConfigGroups } from "@/configs/staticRecords/userConfigGroups";
import TabSelector from "./_components/shared/TabSelector";
import TabsContainer from "./_components/shared/TabsContainer";
import ProfileSettings from "./_components/ProfileSettings";
import DashboardSettings from "./_components/DashboardSettings";
import { getHomeDashLayout } from "@/actions/users/homeDash/getHomeDashLayout";

const UserPage = async () => {

  const allRoles = await userRoleActions.getAll();
  const user = await getUser();
  const configs = await getAllUserConfigs(user.id);
  const homeDashLayout = await getHomeDashLayout();


  return (
    <div className="flex flex-col gap-y-6">
      <Title />

      <TabSelector />
      <TabsContainer
        main={
          <div className="grid grid-cols-3 gap-4">
            <ProfileSettings />
            <UserRoles allRoles={allRoles} user={user} />
            <AppConfigurations configs={configs.filter(config => config.configGroupId === userConfigGroups.general)} />
          </div>
        }
        dashboard={<DashboardSettings layout={homeDashLayout} />}
      />

    </div>
  )
}

export default UserPage 
