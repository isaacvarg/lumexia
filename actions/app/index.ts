import { getActivity } from "./activity/getActivity";
import { getConfigByGroup } from "./configs/getByGroup";
import { ensureInventoryAuditConfigs, getInventoryAuditConfig } from "./configs/getInventoryAuditConfig";
import { updateManyConfigs } from "./configs/updateMany";
import { updateCompanyConfigs } from "./configs/updateCompanyConfigs";
import { getNewRequests } from "./getNewRequests";
import { getAllRecordStatuses } from "./recordStatuses/getAllRecordStatuses";

export const appActions = {
  sidebar: {
    getNewRequests: getNewRequests,
  },
  recordStatuses: {
    getAll: getAllRecordStatuses,
  },
  configs: {
    getByGroup: getConfigByGroup,
    updateMany: updateManyConfigs,
    updateCompany: updateCompanyConfigs,
    ensureInventoryAuditConfigs,
    getInventoryAuditConfig,
  },
  activity: {
    getAll: getActivity,
  }
}
