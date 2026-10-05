import PageTitle from "@/components/Text/PageTitle";
import { canonActions } from "@/actions/canon";
import { getAllUsers } from "@/actions/users/getAllUsers";
import itemTypeActions from "@/actions/inventory/itemTypeActions";
import procurementTypeActions from "@/actions/inventory/procurementTypeActions";
import { users as staticUsers } from "@/configs/staticRecords/users";
import TabSelector from "./_components/shared/TabSelector";
import TabsContainer from "./_components/shared/TabsContainer";
import DataTypeCanvas from "./_components/canvas/DataTypeCanvas";
import Teams from "./_components/teams/Teams";

const CanonSettingsPage = async () => {
  const [dataTypes, teams, lookups, resolvers, users, itemTypes, procurementTypes] = await Promise.all([
    canonActions.dataTypes.getAll(),
    canonActions.teams.getAll(),
    canonActions.lookups.getAll(),
    canonActions.dataTypes.getResolverOptions(),
    getAllUsers(),
    itemTypeActions.getAll(),
    procurementTypeActions.getAll(),
  ]);

  const activeUsers = users
    // the Lumexia bot user can't edit or review
    .filter((u) => !u.disabled && u.id !== staticUsers.lumexia)
    .map(({ id, name, image }) => ({ id, name, image }));

  return (
    <div className="flex flex-col gap-y-6">
      <PageTitle>Canon Settings</PageTitle>
      <TabSelector />
      <TabsContainer
        dataTypes={
          <DataTypeCanvas
            dataTypes={dataTypes}
            lookups={lookups}
            resolvers={resolvers}
            teams={teams}
            users={activeUsers}
            itemTypes={itemTypes}
            procurementTypes={procurementTypes}
          />
        }
        teams={<Teams teams={teams} users={activeUsers} />}
      />
    </div>
  );
};

export default CanonSettingsPage;
