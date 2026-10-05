import {
  addCanonTeamMember,
  createCanonTeam,
  deleteCanonTeam,
  getAllCanonTeams,
  removeCanonTeamMember,
  updateCanonTeam,
} from "./teams";
import {
  archiveCanonDataType,
  createCanonDataType,
  getAllCanonDataTypes,
  getCanonResolverOptions,
  setCanonDataTypePosition,
  updateCanonDataType,
} from "./dataTypes";
import { getCanonLookups } from "./lookups";
import { createCanonDependency, deleteCanonDependency } from "./dependencies";
import {
  grantCanonTeamPermission,
  grantCanonUserPermission,
  revokeCanonTeamPermission,
  revokeCanonUserPermission,
} from "./permissions";
import {
  getCanonArtifactHistory,
  getCanonForItem,
  getCanonSupplierEntries,
  getCanonSupplierOptions,
  refreshAllCanonArtifacts,
} from "./artifacts";
import {
  acceptCanonSource,
  confirmCanonStale,
  proposeCanonEdit,
  reviewCanonChangeRequest,
  withdrawCanonChangeRequest,
} from "./changeRequests";

export const canonActions = {
  lookups: {
    getAll: getCanonLookups,
  },
  teams: {
    getAll: getAllCanonTeams,
    create: createCanonTeam,
    update: updateCanonTeam,
    delete: deleteCanonTeam,
    addMember: addCanonTeamMember,
    removeMember: removeCanonTeamMember,
  },
  dataTypes: {
    getAll: getAllCanonDataTypes,
    getResolverOptions: getCanonResolverOptions,
    create: createCanonDataType,
    update: updateCanonDataType,
    archive: archiveCanonDataType,
    setPosition: setCanonDataTypePosition,
  },
  dependencies: {
    create: createCanonDependency,
    delete: deleteCanonDependency,
  },
  permissions: {
    grantUser: grantCanonUserPermission,
    grantTeam: grantCanonTeamPermission,
    revokeUser: revokeCanonUserPermission,
    revokeTeam: revokeCanonTeamPermission,
  },
  artifacts: {
    getForItem: getCanonForItem,
    getSupplierEntries: getCanonSupplierEntries,
    getSupplierOptions: getCanonSupplierOptions,
    getHistory: getCanonArtifactHistory,
    refreshAll: refreshAllCanonArtifacts,
  },
  changeRequests: {
    proposeEdit: proposeCanonEdit,
    confirmStale: confirmCanonStale,
    acceptSource: acceptCanonSource,
    review: reviewCanonChangeRequest,
    withdraw: withdrawCanonChangeRequest,
  },
};
