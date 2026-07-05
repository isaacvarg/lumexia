import { QcExamination } from "@/actions/quality/qc/records/getAll";
import Card from "@/components/Card";
import SectionTitle from "@/components/Text/SectionTitle";

const ExaminationHeader = ({ record }: { record: QcExamination }) => {
  return (
    <Card.Root>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <SectionTitle size="small">Item</SectionTitle>
          <p className="font-poppins text-lg font-medium">
            {record.examinedLot.item.name}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <SectionTitle size="small">Lot</SectionTitle>
          <p className="font-poppins text-lg font-medium">
            {record.examinedLot.lotNumber}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <SectionTitle size="small">Conducted By</SectionTitle>
          <p className="font-poppins text-lg font-medium">
            {record.conductedBy.name}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <SectionTitle size="small">Type</SectionTitle>
          <p className="font-poppins text-lg font-medium">
            {record.examinationType.name}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <SectionTitle size="small">Status</SectionTitle>
          <span
            style={{
              backgroundColor: record.status.bgColor,
              color: record.status.textColor,
            }}
            className="font-poppins text-sm font-medium rounded-xl py-2 px-4 w-fit"
          >
            {record.status.name}
          </span>
        </div>
      </div>
    </Card.Root>
  );
};

export default ExaminationHeader;
