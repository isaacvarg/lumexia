import { createExperiment } from "./createExperiment";
import { getAllExperiments } from "./getAllExperiments";
import { getAllExperimentGroups } from "./getAllExperimentGroups";
import { getAllExperimentStatuses } from "./getAllExperimentStatuses";
import { getOneExperiment } from "./getOneExperiment";
import { updateExperiment } from "./updateExperiment";
import { getAllVariantsByExperiment } from "./variants/getAllByExperiment";
import { createExperimentVariant } from "./variants/create";
import { createExperimentVariantAnalog } from "./variants/createAnalog";
import { updateExperimentVariant } from "./variants/update";
import { deleteExperimentVariant } from "./variants/delete";
import { createExperimentVariantMaterial } from "./variantMaterials/create";
import { updateExperimentVariantMaterial } from "./variantMaterials/update";
import { deleteExperimentVariantMaterial } from "./variantMaterials/delete";
import { reorderExperimentVariantMaterials } from "./variantMaterials/reorder";
import { setExperimentVariantMaterialPhase } from "./variantMaterials/setPhase";
import { renameExperimentVariantPhase } from "./variantMaterials/renamePhase";
import { getAllSamplesByExperiment } from "./samples/getAllByExperiment";
import { createExperimentSample } from "./samples/create";
import { updateExperimentSample } from "./samples/update";
import { deleteExperimentSample } from "./samples/delete";
import { markExperimentSamplePrepared } from "./samples/markPrepared";
import { markExperimentSampleUnprepared } from "./samples/markUnprepared";
import { toggleSamplePreparationStep } from "./samples/preparationSteps/toggle";
import { getAllExperimentNoteTypes } from "./experimentNoteTypes/getAll";
import { createExperimentNoteType } from "./experimentNoteTypes/create";
import { getAllExperimentNotesByExperiment } from "./experimentNotes/getAllByExperiment";
import { createExperimentNote } from "./experimentNotes/create";
import { updateExperimentNote } from "./experimentNotes/update";
import { deleteExperimentNote } from "./experimentNotes/delete";
import { getAggregatedNotesFeed } from "./experimentNotes/getAggregatedFeed";
import { getAllExperimentFilesByExperiment } from "./experimentFiles/getAllByExperiment";
import { createExperimentFile } from "./experimentFiles/create";
import { deleteExperimentFile } from "./experimentFiles/delete";
import { getAggregatedFilesList } from "./experimentFiles/getAggregatedList";
import { getAllSampleNotesBySample } from "./sampleNotes/getAllBySample";
import { createSampleNote } from "./sampleNotes/create";
import { updateSampleNote } from "./sampleNotes/update";
import { deleteSampleNote } from "./sampleNotes/delete";
import { getAllSampleFilesBySample } from "./sampleFiles/getAllBySample";
import { createSampleFile } from "./sampleFiles/create";
import { deleteSampleFile } from "./sampleFiles/delete";
import { getAllMeasurementsBySample } from "./measurements/getAllBySample";
import { createSampleMeasurement } from "./measurements/create";
import { updateSampleMeasurement } from "./measurements/update";
import { deleteSampleMeasurement } from "./measurements/delete";
import { createVariantMethodStep } from "./methodSteps/create";
import { updateVariantMethodStep } from "./methodSteps/update";
import { deleteVariantMethodStep } from "./methodSteps/delete";
import { reorderVariantMethodSteps } from "./methodSteps/reorder";
import { getAllCostBatchSizes } from "./costBatchSizes/getAll";
import { createCostBatchSize } from "./costBatchSizes/create";
import { updateCostBatchSize } from "./costBatchSizes/update";
import { deleteCostBatchSize } from "./costBatchSizes/delete";
import { getCostSettings } from "./costSettings/get";
import { updateCostSettings } from "./costSettings/update";
import { getVariantCostProjections } from "./cost/getProjections";
import { getVariantContext } from "./llmContext/getVariantContext";
import { getSampleContext } from "./llmContext/getSampleContext";

export const researchActions = {
  experiments: {
    getAll: getAllExperiments,
    getOne: getOneExperiment,
    create: createExperiment,
    update: updateExperiment,
  },
  experimentGroups: {
    getAll: getAllExperimentGroups,
  },
  experimentStatuses: {
    getAll: getAllExperimentStatuses,
  },
  variants: {
    getAllByExperiment: getAllVariantsByExperiment,
    create: createExperimentVariant,
    createAnalog: createExperimentVariantAnalog,
    update: updateExperimentVariant,
    delete: deleteExperimentVariant,
  },
  variantMaterials: {
    create: createExperimentVariantMaterial,
    update: updateExperimentVariantMaterial,
    delete: deleteExperimentVariantMaterial,
    reorder: reorderExperimentVariantMaterials,
    setPhase: setExperimentVariantMaterialPhase,
    renamePhase: renameExperimentVariantPhase,
  },
  samples: {
    getAllByExperiment: getAllSamplesByExperiment,
    create: createExperimentSample,
    update: updateExperimentSample,
    delete: deleteExperimentSample,
    markPrepared: markExperimentSamplePrepared,
    markUnprepared: markExperimentSampleUnprepared,
    preparationSteps: {
      toggle: toggleSamplePreparationStep,
    },
  },
  experimentNoteTypes: {
    getAll: getAllExperimentNoteTypes,
    create: createExperimentNoteType,
  },
  experimentNotes: {
    getAllByExperiment: getAllExperimentNotesByExperiment,
    create: createExperimentNote,
    update: updateExperimentNote,
    delete: deleteExperimentNote,
    getAggregatedFeed: getAggregatedNotesFeed,
  },
  experimentFiles: {
    getAllByExperiment: getAllExperimentFilesByExperiment,
    create: createExperimentFile,
    delete: deleteExperimentFile,
    getAggregatedList: getAggregatedFilesList,
  },
  sampleNotes: {
    getAllBySample: getAllSampleNotesBySample,
    create: createSampleNote,
    update: updateSampleNote,
    delete: deleteSampleNote,
  },
  sampleFiles: {
    getAllBySample: getAllSampleFilesBySample,
    create: createSampleFile,
    delete: deleteSampleFile,
  },
  measurements: {
    getAllBySample: getAllMeasurementsBySample,
    create: createSampleMeasurement,
    update: updateSampleMeasurement,
    delete: deleteSampleMeasurement,
  },
  methodSteps: {
    create: createVariantMethodStep,
    update: updateVariantMethodStep,
    delete: deleteVariantMethodStep,
    reorder: reorderVariantMethodSteps,
  },
  costBatchSizes: {
    getAll: getAllCostBatchSizes,
    create: createCostBatchSize,
    update: updateCostBatchSize,
    delete: deleteCostBatchSize,
  },
  costSettings: {
    get: getCostSettings,
    update: updateCostSettings,
  },
  cost: {
    getProjections: getVariantCostProjections,
  },
  llmContext: {
    getVariantContext,
    getSampleContext,
  },
};
