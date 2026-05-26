import { getActivity } from "./bprs/activity/getActivity";
import { getBprBom } from "./bprs/boms/getByBpr";
import { getSingleBpr } from "./bprs/getOne";
import { createBprNote } from "./bprs/notes/create";
import { getAllBprNotes } from "./bprs/notes/getAllByBpr";
import { createBprNoteType } from "./bprs/notes/notesTypes/create";
import { getAllBprNoteTypes } from "./bprs/notes/notesTypes/getAll";
import { getBprStagings } from "./bprs/stagings/getAll";
import { getBprStatuses } from "./bprs/statuses/getAll";
import { updateBpr2 } from "./bprs/update";
import { createCompoundingVessel } from "./compoundingVessels/createCompoundingVessel";
import { getAllCompoundingVessels } from "./compoundingVessels/getAllCompoundinVessels";
import { updateCompoundingVessel } from "./compoundingVessels/updateCompoundingVessel";
import { getActiveMbpr } from "./getActiveMbpr";
import { getAllMbprs } from "./getAllMbprs";
import { getMbprsByItem } from "./getMbprsByItem";
import { getPlanningBprs } from "./getPlanningBprs";
import { getAllPlanningBprs } from "./getAllPlanningBprs";
import { createActionable } from "./mbpr/actionables/create";
import { getAllActionablesByMbpr } from "./mbpr/actionables/getAllByMbpr";
import { updateActionable } from "./mbpr/actionables/update";
import { createAddedum } from "./mbpr/addendums/create";
import { deleteAddendum } from "./mbpr/addendums/delete";
import { getAllAddendumsByMbpr } from "./mbpr/addendums/getAllByMbpr";
import { updateAddendum } from "./mbpr/addendums/update";
import { createBatchSize } from "./mbpr/batchSizes/create";
import { getAllBatchSizesByMbpr } from "./mbpr/batchSizes/getAllByMbpr";
import { getOneBatchSize } from "./mbpr/batchSizes/getOne";
import { updateBatchSize } from "./mbpr/batchSizes/updateBatchSize";
import { createMbprBOM } from "./mbpr/bom/create";
import { getAllBomMaterialsByMbpr } from "./mbpr/bom/getAllByMbpr";
import { updateMbprBOM } from "./mbpr/bom/update";
import { getAllByProducedItem } from "./mbpr/getAllByProducedItem";
import { getOneMbpr } from "./mbpr/getOneMbpr";
import { createInstruction } from "./mbpr/instructions/create";
import { deleteInstruction } from "./mbpr/instructions/delete";
import { getAllInstructionsByMbpr } from "./mbpr/instructions/getAllByMbpr";
import { updateInstruction } from "./mbpr/instructions/update";
import { addBatchStep } from "./mbpr/steps/add";
import { getAllByMbpr } from "./mbpr/steps/getAllByMbpr";
import { updateMbpr } from "./mbpr/updateMbpr";
import { createMbprNote } from "./mbpr/notes/create";
import { getAllMbprNotes } from "./mbpr/notes/getAllByMbpr";
import { getAllMbprNoteTypes } from "./mbpr/notes/notesTypes/getAll";
import { createMbprNoteType } from "./mbpr/notes/notesTypes/create";
import { getMbprActivity } from "./mbpr/activity/getActivity";
import { handleNewScent } from "./templates/scents/handleNewScent";
import { updateBpr } from "./updateBpr";

export const productionActions = {
  planning: {
    getBprs: getPlanningBprs,
    getAllBprs: getAllPlanningBprs,
  },
  bprs: {
    stagings: {
      getAll: getBprStagings,
    },
    notes: {
      getAllByBpr: getAllBprNotes,
      create: createBprNote,
      types: {
        getAll: getAllBprNoteTypes,
        create: createBprNoteType,
      }
    },
    statuses: {
      getAll: getBprStatuses,
    },
    boms: {
      getByBpr: getBprBom,
    },
    getOne: getSingleBpr,
    update: updateBpr,
    // bad naming
    update2: updateBpr2,
    activity: {
      getAll: getActivity,
    }
  },
  mbprs: {
    getActive: getActiveMbpr,
    getAllByProducedItem: getAllByProducedItem, //same as below really, not sure why these are separate
    getByItem: getMbprsByItem,
    getAll: getAllMbprs,
    getOne: getOneMbpr,
    update: updateMbpr,
    batchSizes: {
      update: updateBatchSize,
      create: createBatchSize,
      getAllByMbpr: getAllBatchSizesByMbpr,
      getOne: getOneBatchSize,
    },
    steps: {
      getAllByMbpr: getAllByMbpr,
      create: addBatchStep,
    },
    bom: {
      update: updateMbprBOM,
      create: createMbprBOM,
      getAllByMbpr: getAllBomMaterialsByMbpr,
    },
    instructions: {
      getAllByMbpr: getAllInstructionsByMbpr,
      create: createInstruction,
      update: updateInstruction,
      delete: deleteInstruction,
    },
    addendums: {
      getAllByMbpr: getAllAddendumsByMbpr,
      create: createAddedum,
      update: updateAddendum,
      delete: deleteAddendum,
    },
    actionables: {
      getAllByMbpr: getAllActionablesByMbpr,
      create: createActionable,
      update: updateActionable,
    },
    notes: {
      getAllByMbpr: getAllMbprNotes,
      create: createMbprNote,
      types: {
        getAll: getAllMbprNoteTypes,
        create: createMbprNoteType,
      }
    },
    activity: {
      getAll: getMbprActivity,
    },
  },
  compoundingVessels: {
    getAll: getAllCompoundingVessels,
    create: createCompoundingVessel,
    update: updateCompoundingVessel,
  },
  templates: {
    scent: handleNewScent,
  }
};
