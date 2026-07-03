import { GuideSection } from "../../types";
import Overview from "./Overview";
import StartingAnExamination from "./StartingAnExamination";
import ExaminationRecord from "./ExaminationRecord";

export const qcExaminationsSection: GuideSection = {
  id: "qc-examinations",
  title: "Examinations",
  overview: Overview,
  guides: [
    {
      title: "Starting an examination",
      description: "From a lot, a scan, or bulk entry.",
      content: StartingAnExamination,
    },
    {
      title: "The examination record",
      description: "The header and read-only Results / Notes / Attachments.",
      content: ExaminationRecord,
    },
  ],
};
