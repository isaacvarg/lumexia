import { qualityActions } from "@/actions/quality";
import PageTitle from "@/components/Text/PageTitle";
import { getResults } from "../new/[lotNumber]/_actions/getResults";
import ExaminationHeader from "./_components/ExaminationHeader";
import ExaminationDetails from "./_components/ExaminationDetails";
import HelperSetter from "@/components/Helper/HelperSetter";

type Props = {
  params: {
    examinationId: string;
  };
};

const ExaminationDetailsPage = async ({ params }: Props) => {
  const record = await qualityActions.qc.records.getOne(params.examinationId);

  if (!record) {
    throw new Error("Examination not found");
  }

  const [itemParameters, results, notes, noteTypes, files] = await Promise.all([
    qualityActions.qc.itemParameters.getByItem(record.examinedLot.item.id),
    getResults(record.id),
    qualityActions.qc.recordNotes.getAllByRecord(record.id),
    qualityActions.qc.recordNotes.types.getAll(),
    qualityActions.qc.recordFiles.getAll(record.id),
  ]);

  return (
    <div className="flex flex-col gap-y-6">
      <HelperSetter section="qc-examinations" />
      <PageTitle>Examination {record.referenceCode}</PageTitle>

      <ExaminationHeader record={record} />

      <ExaminationDetails
        record={record}
        itemParameters={itemParameters}
        results={results}
        notes={notes}
        noteTypes={noteTypes}
        files={files}
      />
    </div>
  );
};

export default ExaminationDetailsPage;
