import PageTitle from "@/components/Text/PageTitle";
import { canonActions } from "@/actions/canon";
import { getAllUsers } from "@/actions/users/getAllUsers";
import itemTypeActions from "@/actions/inventory/itemTypeActions";
import procurementTypeActions from "@/actions/inventory/procurementTypeActions";
import { userKinds } from "@/lib/userKinds";
import { listProposingUserIds } from "@/lib/apiKeys";
import prisma from "@/lib/prisma";
import { listFactDefinitions } from "@/lib/documentExtractions/catalog";
import TabSelector from "./_components/shared/TabSelector";
import TabsContainer from "./_components/shared/TabsContainer";
import DataTypesView from "./_components/DataTypesView";
import Groups from "./_components/groups/Groups";
import Teams from "./_components/teams/Teams";

const CanonSettingsPage = async () => {
  const [dataTypes, groups, teams, lookups, resolvers, users, itemTypes, procurementTypes, agentUserIds, factDefinitions] = await Promise.all([
    canonActions.dataTypes.getAll(),
    canonActions.groups.getAll(),
    canonActions.teams.getAll(),
    canonActions.lookups.getAll(),
    canonActions.dataTypes.getResolverOptions(),
    getAllUsers(),
    itemTypeActions.getAll(),
    procurementTypeActions.getAll(),
    listProposingUserIds(),
    listFactDefinitions(prisma),
  ]);

  const activeUsers = users
    // the system user (Lumexia) can't edit or review; agent users and holders of propose keys are listed as agents
    .filter((u) => !u.disabled && u.kind !== userKinds.system)
    .map(({ id, name, image, kind }) => ({ id, name, image, isAgent: kind === userKinds.agent || agentUserIds.includes(id) }));

  return (
    <div className="flex flex-col gap-y-6">
      <PageTitle>Canon Settings</PageTitle>
      <TabSelector />
      <TabsContainer
        dataTypes={
          <DataTypesView
            dataTypes={dataTypes}
            groups={groups}
            lookups={lookups}
            resolvers={resolvers}
            teams={teams}
            users={activeUsers}
            itemTypes={itemTypes}
            procurementTypes={procurementTypes}
            factDefinitions={factDefinitions.map(({ id, key, label, kind, status }) => ({ id, key, label, kind, status }))}
          />
        }
        groups={<Groups groups={groups} />}
        teams={<Teams teams={teams} users={activeUsers} />}
      />
    </div>
  );
};

export default CanonSettingsPage;
