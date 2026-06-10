import { getActivity } from "./activity/getActivity";
import { getConfigByGroup } from "./configs/getByGroup";
import { ensureInventoryAuditConfigs, getInventoryAuditConfig } from "./configs/getInventoryAuditConfig";
import { updateManyConfigs } from "./configs/updateMany";
import { updateCompanyConfigs } from "./configs/updateCompanyConfigs";
import { updateCompanyImage } from "./images/updateCompanyImage";
import { getCompanyPdfImages } from "./images/getCompanyPdfImages";
import { getCompanyImageUrls } from "./images/getCompanyImageUrls";
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
  images: {
    updateCompany: updateCompanyImage,
    getPdfImages: getCompanyPdfImages,
    getUrls: getCompanyImageUrls,
  },
  activity: {
    getAll: getActivity,
  }
}
