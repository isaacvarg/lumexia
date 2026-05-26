"use client";

import { QcItemParameter } from "@/actions/quality/qc/parameters/getAllByItem";
import { QcRecordFile } from "@/actions/quality/qc/recordFiles/getAllByRecord";
import { QcRecordNote } from "@/actions/quality/qc/recordNotes/getAllByRecord";
import { QcRecordNoteType } from "@/actions/quality/qc/recordNotes/types/getAll";
import { QcExamination } from "@/actions/quality/qc/records/getAll";
import { ExaminationResults } from "@/app/quality/qc/examination/new/[lotNumber]/_actions/getResults";
import { Tabs } from "@/components/Tabs2";
import ResultsView from "./ResultsView";
import NotesView from "./NotesView";
import FilesView from "./FilesView";

type Props = {
  record: QcExamination;
  itemParameters: QcItemParameter[];
  results: ExaminationResults[];
  notes: QcRecordNote[];
  noteTypes: QcRecordNoteType[];
  files: QcRecordFile[];
};

const ExaminationDetails = ({
  record,
  itemParameters,
  results,
  notes,
  noteTypes,
  files,
}: Props) => {
  const resultsMap = new Map<string, ExaminationResults[]>();
  for (const r of results) {
    const arr = resultsMap.get(r.qcItemParameterId) ?? [];
    arr.push(r);
    resultsMap.set(r.qcItemParameterId, arr);
  }

  return (
    <Tabs.Root defaultValue="results">
      <Tabs.List>
        <Tabs.Trigger value="results">Results</Tabs.Trigger>
        <Tabs.Trigger value="notes">Notes</Tabs.Trigger>
        <Tabs.Trigger value="attachments">Attachments</Tabs.Trigger>
      </Tabs.List>

      <div className="pt-4">
        <Tabs.ContentContainer>
          <Tabs.Content value="results">
            <ResultsView
              itemParameters={itemParameters}
              results={resultsMap}
              examinationTypeId={record.examinationTypeId}
            />
          </Tabs.Content>
          <Tabs.Content value="notes">
            <NotesView notes={notes} />
          </Tabs.Content>
          <Tabs.Content value="attachments">
            <FilesView files={files} />
          </Tabs.Content>
        </Tabs.ContentContainer>
      </div>
    </Tabs.Root>
  );
};

export default ExaminationDetails;
