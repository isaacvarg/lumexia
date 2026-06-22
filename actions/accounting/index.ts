import { update } from "../classes/update";
import { createFilledConsumerContainer } from "./consumerContainers/createFilledConsumerContainer";
import { createOneConsumerContainer } from "./consumerContainers/createOne";
import { deletedFilledConsumerContainer } from "./consumerContainers/deleteFilledConsumerContainer";
import { getAllConsumerContainers } from "./consumerContainers/getAll";
import { getAllByFillItem } from "./consumerContainers/getAllByFillItem";
import { getPackagingItems } from "./consumerContainers/getPackagingItems";
import { updateOneFilledConsumerContainer } from "./consumerContainers/updateOneFilledConsumerContainer";
import { createExaminationValidationArchive } from "./examinations/archives/createExaminationValidationArchive";
import { createItemPricingDataArchive } from "./examinations/archives/createItemPricingDataArchive";
import { createManyConsumerContainerArchives } from "./examinations/archives/createManyConsumerContainerArchives";
import { createManyFilledConsumerContainerArchive } from "./examinations/archives/createManyFilledConsumerContainerArchives";
import { createExamination } from "./examinations/create";
import { getAllPricingExaminations } from "./examinations/getAll";
import { getAllPricingExaminationsByItem } from "./examinations/getAllByItem";
import { getOnePricingExamination } from "./examinations/getOne";
import { createExaminationNote } from "./examinations/notes/createExaminationNote";
import { createExaminationNoteType } from "./examinations/notes/createExaminationNoteType";
import { getAllByExamId } from "./examinations/notes/getAllByExamId";
import { getAllNoteTypes } from "./examinations/notes/getAllNoteTypes";
import { upsertPricingExamination } from "./examinations/upsert";
import { approvePricingExamination } from "./examinations/approve";
import { rejectPricingExamination } from "./examinations/reject";
import { createAuxiliary } from "./finishedProducts/auxiliaries/create";
import { deleteAuxiliary } from "./finishedProducts/auxiliaries/delete";
import { getAllAuxiliaries } from "./finishedProducts/auxiliaries/getAll";
import { updateAuxiliary } from "./finishedProducts/auxiliaries/update";
import { createFinishedProduct } from "./finishedProducts/create";
import { deleteFinishedProduct } from "./finishedProducts/delete";
import { getFinishedProductsByItem } from "./finishedProducts/getByItem";
import { getFinishedProductsByProducedItem } from "./finishedProducts/getByProducedItem";
import { getFinishedProductsByPurchasedItem } from "./finishedProducts/getByPurchasedItem";
import { createPricingTemplateAuxiliaries } from "./finishedProducts/templates/auxiliaries/create";
import { deletePricingTemplateAuxiliary } from "./finishedProducts/templates/auxiliaries/delete";
import { getByFinishedProduct } from "./finishedProducts/templates/auxiliaries/getByFinishedProduct";
import { createPricingTemplate } from "./finishedProducts/templates/create";
import { createPricingTemplateFinishedProduct } from "./finishedProducts/templates/finishedProducts/create";
import { updateTemplateFinishedProduct } from "./finishedProducts/templates/finishedProducts/update";
import { applyTemplate } from "./finishedProducts/templates/applyTemplate";
import { getAllTemplates } from "./finishedProducts/templates/getAll";
import { getAllByItemType } from "./finishedProducts/templates/getAllByItemType";
import { getOnePricingTemplate } from "./finishedProducts/templates/getOne";
import { updatePricingTemplate } from "./finishedProducts/templates/update";
import { updateFinishedProduct } from "./finishedProducts/update";
import { createPaymentMethod } from "./paymentMethods/create";
import { getAllPaymentMethods } from "./paymentMethods/getAll";
import { getOnePaymentMethod } from "./paymentMethods/getOne";
import { updatePaymentMethod } from "./paymentMethods/update";
import { createPoAccountingDetail } from "./pos/details/create";
import { updatePoAccountingDetails } from "./pos/details/update";
import { createPricingQueue } from "./pricing/createQueue";
import { getItemPricingData } from "./pricing/getItemPricingData";
import { getLastItemPrice } from "./pricing/getLastItemPrice";
import { getQueue } from "./pricing/getQueue";
import { getReviewablePricingExams } from "./pricing/getReviewable";

export const accountingActions = {
  pricing: {
    item: {
      getItemPricingData: getItemPricingData,
      getLastItemPrice: getLastItemPrice,
    },
    createQueue: createPricingQueue,
    getQueue: getQueue,
  },
  paymentMethods: {
    create: createPaymentMethod,
    getAll: getAllPaymentMethods,
    update: updatePaymentMethod,
    getOne: getOnePaymentMethod,
  },
  finishedProducts: {
    templates: {
      finishedProducts: {
        update: updateTemplateFinishedProduct,
        create: createPricingTemplateFinishedProduct,
      },
      auxiliaries: {
        getByFinishedProduct: getByFinishedProduct,
        delete: deletePricingTemplateAuxiliary,
        create: createPricingTemplateAuxiliaries,
      },
      create: createPricingTemplate,
      update: updatePricingTemplate,
      getAllByItemType: getAllByItemType,
      getOne: getOnePricingTemplate,
      getAllTemplates: getAllTemplates,
      apply: applyTemplate,
    },
    auxiliaries: {
      delete: deleteAuxiliary,
      create: createAuxiliary,
      getAll: getAllAuxiliaries,
      update: updateAuxiliary,
    },
    getByItem: getFinishedProductsByItem,
    getByPurchasedItem: getFinishedProductsByPurchasedItem,
    getByProducedItem: getFinishedProductsByProducedItem,
    create: createFinishedProduct,
    delete: deleteFinishedProduct,
    update: updateFinishedProduct,
  },
  filledConsumerContainers: {
    getAllByFillItem: getAllByFillItem,
    createOne: createFilledConsumerContainer,
    update: updateOneFilledConsumerContainer,
    delete: deletedFilledConsumerContainer,
  },
  consumerContainers: {
    getPackagingItems: getPackagingItems,
    getAll: getAllConsumerContainers,
    createOne: createOneConsumerContainer,
  },
  examinations: {
    notes: {
      getAllNoteTypes: getAllNoteTypes,
      getAll: getAllByExamId,
      createNoteType: createExaminationNoteType,
      create: createExaminationNote,
    },
    archives: {
      itemPricingData: {
        create: createItemPricingDataArchive,
      },
      filleConsumerContainer: {
        create: createFilledConsumerContainer,
        createMany: createManyFilledConsumerContainerArchive,
      },
      consumerContainer: {
        createMany: createManyConsumerContainerArchives,
      },
      examinationValidation: {
        create: createExaminationValidationArchive,
      }
    },
    create: createExamination,
    getReviewable: getReviewablePricingExams,
    getAllByItem: getAllPricingExaminationsByItem,
    getOne: getOnePricingExamination,
    getAll: getAllPricingExaminations,
    upsert: upsertPricingExamination,
    approve: approvePricingExamination,
    reject: rejectPricingExamination,
  },
  pos: {
    details: {
      update: updatePoAccountingDetails,
      create: createPoAccountingDetail,
    }
  }
}


