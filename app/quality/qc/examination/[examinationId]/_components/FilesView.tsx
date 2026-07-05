import { QcRecordFile } from "@/actions/quality/qc/recordFiles/getAllByRecord";
import Card from "@/components/Card";
import SectionTitle from "@/components/Text/SectionTitle";
import FileButton from "@/components/Uploader/FileButton";

const FilesView = ({ files }: { files: QcRecordFile[] }) => {
  return (
    <Card.Root>
      <div className="flex flex-col gap-y-6">
        <SectionTitle size="small">Attachments</SectionTitle>

        {files.length === 0 ? (
          <p className="font-medium text-xl text-base-content/50 font-poppins">
            No attachments for this examination.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <FileButton
                key={file.id}
                shape="vertical"
                label={file.file.name}
                url={file.url}
                thumbnailUrl={undefined}
                mimeType={file.file.mimeType}
                onEditClick={() => {}}
                onDeleteClick={() => {}}
                {...(file.fileType
                  ? {
                      fileTag: {
                        label: file.fileType.name,
                        bgColor: file.fileType.bgColor,
                        textColor: file.fileType.textColor,
                      },
                    }
                  : {})}
                uploadedByName={file.file.uploadedBy.name || ""}
                uploadedByImage={file.file.uploadedBy.image || ""}
              />
            ))}
          </div>
        )}
      </div>
    </Card.Root>
  );
};

export default FilesView;
