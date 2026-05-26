import { getAllDataTypes } from "./qc/dataTypes/getAll";
import { getAllExaminationTypes } from "./qc/examinationTypes/getAll";
import { createQcParameterGroup } from "./qc/groups/create";
import { getAllQcParameterGroups } from "./qc/groups/getAll";
import { getOneQcGroup } from "./qc/groups/getOne";
import { createQcGroupParameter } from "./qc/groups/groupParameters/create";
import { deleteGroupParameter } from "./qc/groups/groupParameters/delete";
import { getAllQcGroupsByItem } from "./qc/groups/groupParameters/getAllByItem";
import { getGroupParametersByExamination } from "./qc/groups/groupParameters/getByExamination";
import { updateQcGroup } from "./qc/groups/update";
import { createInputDefinitions } from "./qc/inputDefinitions/create";
import { deleteInputDefinition } from "./qc/inputDefinitions/delete";
import { getAllInputDefinitions } from "./qc/inputDefinitions/getAll";
import { updateInputDefinition } from "./qc/inputDefinitions/update";
import { deleteQcItemParameter } from "./qc/itemParameters/delete";
import { updateQcItemParameter } from "./qc/itemParameters/update";
import { createQcItemSpecification } from "./qc/itemSpecifications/create";
import { updateQcItemSpecification } from "./qc/itemSpecifications/update";
import { deleteQcItemSpecification } from "./qc/itemSpecifications/delete";
import { createQcParameter } from "./qc/parameters/create";
import { getAllQcParameters } from "./qc/parameters/getAll";
import { getAllQcParametersByItem } from "./qc/parameters/getAllByItem";
import { getAllQcParametersByItemAndQcRecord } from "./qc/parameters/getAllByItemAndQcRecord";
import { getOneQcParameter } from "./qc/parameters/getOne";
import { updateQcParameter } from "./qc/parameters/update";
import { createQcRecordFile } from "./qc/recordFiles/create";
import { getAllQcRecordFilesByRecord } from "./qc/recordFiles/getAllByRecord";
import { getAllQcRecordFileTypes } from "./qc/recordFiles/types/getAll";
import { createRecordNote } from "./qc/recordNotes/create";
import { getAllRecordNotesByRecord } from "./qc/recordNotes/getAllByRecord";
import { createQcRecordNoteType } from "./qc/recordNotes/types/create";
import { getAllQcRecordNoteTypes } from "./qc/recordNotes/types/getAll";
import { bulkImportQcRecords } from "./qc/records/bulkImport";
import { createQcRecord } from "./qc/records/create";
import { getAllQcExaminations } from "./qc/records/getAll";
import { getAllQcRecordsByBpr } from "./qc/records/getAllByBpr";
import { getAllQcRecordsByItem } from "./qc/records/getAllByItem";
import { getSingleQcExamination } from "./qc/records/getOne";
import { getAllQcRecordStatuses } from "./qc/records/statuses/getAll";
import { updateQcRecord } from "./qc/records/update";
import { createTemplateParameter } from "./qc/templateParameters/create";
import { deleteTemplateParameter } from "./qc/templateParameters/delete";
import { createQcTemplate } from "./qc/templates/create";
import { getAllQcTemplates } from "./qc/templates/getAll";
import { getOneQcTemplate } from "./qc/templates/getOne";

export const qualityActions = {
  qc: {
    dataTypes: {
      getAll: getAllDataTypes,
    },
    inputDefinitions: {
      getAll: getAllInputDefinitions,
      create: createInputDefinitions,
      update: updateInputDefinition,
      delete: deleteInputDefinition,
    },
    parameters: {
      getOne: getOneQcParameter,
      getAll: getAllQcParameters,
      create: createQcParameter,
      update: updateQcParameter,
    },
    itemParameters: {
      getByItem: getAllQcParametersByItem,
      getAllByItemAndRecord: getAllQcParametersByItemAndQcRecord,
      delete: deleteQcItemParameter,
      update: updateQcItemParameter,
    },
    itemSpecifications: {
      create: createQcItemSpecification,
      update: updateQcItemSpecification,
      delete: deleteQcItemSpecification,
    },
    templates: {
      getAll: getAllQcTemplates,
      create: createQcTemplate,
      getOne: getOneQcTemplate,
    },
    templateParameters: {
      create: createTemplateParameter,
      delete: deleteTemplateParameter,
    },
    examinationTypes: {
      getAll: getAllExaminationTypes,
    },
    recordNotes: {
      create: createRecordNote,
      getAllByRecord: getAllRecordNotesByRecord,
      types: {
        getAll: getAllQcRecordNoteTypes,
        create: createQcRecordNoteType,
      }
    },
    recordFiles: {
      create: createQcRecordFile,
      getAll: getAllQcRecordFilesByRecord,
      types: {
        getAll: getAllQcRecordFileTypes,
      }
    },
    records: {
      create: createQcRecord,
      getAll: getAllQcExaminations,
      getAllByItem: getAllQcRecordsByItem,
      getAllByBpr: getAllQcRecordsByBpr,
      update: updateQcRecord,
      getOne: getSingleQcExamination,
      bulkImport: bulkImportQcRecords,
      statsues: {
        getAll: getAllQcRecordStatuses,
      }
    },
    groups: {
      create: createQcParameterGroup,
      getAll: getAllQcParameterGroups,
      getOne: getOneQcGroup,
      update: updateQcGroup,
      groupParameters: {
        getAllByItem: getAllQcGroupsByItem,
        getAllByExamination: getGroupParametersByExamination,
        create: createQcGroupParameter,
        delete: deleteGroupParameter,
      }
    }
  }
};
