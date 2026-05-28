"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";
import { TbX } from "react-icons/tb";
import Card from "@/components/Card";
import Uploader from "@/components/Uploader/Uploader";
import FileThumbnail from "@/components/Files/Thumbnail";
import { researchActions } from "@/actions/research";
import { ExperimentFileRow } from "@/actions/research/experimentFiles/getAllByExperiment";
import { dateFormatWithTime } from "@/configs/data/dateFormatString";

type Props = {
  experimentId: string;
  files: ExperimentFileRow[];
};

const ExperimentFilesPanel = ({ experimentId, files }: Props) => {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleDelete = async (id: string) => {
    await researchActions.experimentFiles.delete({ id });
    router.refresh();
  };

  return (
    <Card.Root>
      <div className="flex items-center justify-between">
        <h3 className="font-poppins text-xl font-semibold">Files</h3>
        <button
          type="button"
          className="btn btn-neutral btn-soft btn-sm"
          onClick={() => setIsAdding((v) => !v)}
        >
          {isAdding ? "Cancel" : "Add File"}
        </button>
      </div>

      {isAdding && (
        <Uploader
          pathPrefix={`research/experiment-${experimentId}`}
          onComplete={async (data) => {
            await researchActions.experimentFiles.create({
              experimentId,
              fileId: data.fileId,
            });
            setIsAdding(false);
            router.refresh();
          }}
        />
      )}

      {files.length === 0 ? (
        <p className="italic text-base-content/50 font-poppins">
          No files attached yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {files.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 bg-base-200/40 rounded-lg p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileThumbnail
                  url={row.url}
                  thumbnailUrl={row.thumbnailUrl}
                  mimeType={row.file.mimeType}
                  name={row.file.name}
                  size="sm"
                />
                <div className="flex flex-col min-w-0">
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-poppins font-medium link link-hover truncate"
                  >
                    {row.file.name}
                  </a>
                  <span className="font-poppins text-xs text-base-content/60">
                    {row.file.uploadedBy?.name ?? "—"} ·{" "}
                    {DateTime.fromJSDate(row.createdAt).toFormat(dateFormatWithTime)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => handleDelete(row.id)}
                aria-label="Remove file"
              >
                <TbX />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card.Root>
  );
};

export default ExperimentFilesPanel;
