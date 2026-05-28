"use client";
import { useMemo, useState } from "react";
import { DateTime } from "luxon";
import Card from "@/components/Card";
import FileThumbnail from "@/components/Files/Thumbnail";
import { AggregatedFileEntry } from "@/actions/research/experimentFiles/getAggregatedList";
import { dateFormatWithTime } from "@/configs/data/dateFormatString";

type Props = {
  entries: AggregatedFileEntry[];
};

const sourceLabels: Record<AggregatedFileEntry["source"], string> = {
  "experiment-direct": "Experiment",
  "experiment-note": "Note on Experiment",
  "sample-direct": "Sample",
  "sample-note": "Note on Sample",
};

const Files = ({ entries }: Props) => {
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (sourceFilter === "all") return entries;
    return entries.filter((e) => e.source === sourceFilter);
  }, [entries, sourceFilter]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-poppins text-xl font-semibold text-base-content">Files</h2>

      <div className="flex gap-3 flex-wrap items-center">
        <label className="flex items-center gap-2">
          <span className="font-poppins text-sm">Source:</span>
          <select
            className="select select-sm select-bordered"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All</option>
            {Object.entries(sourceLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <Card.Root>
          <p className="font-poppins text-lg text-base-content/60 italic">
            No files yet.
          </p>
        </Card.Root>
      ) : (
        <Card.Root>
          <table className="table">
            <thead>
              <tr>
                <th>File</th>
                <th>Source</th>
                <th>Uploaded By</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={`${row.source}-${row.id}`}>
                  <td>
                    <div className="flex items-center gap-3">
                      <FileThumbnail
                        url={row.url}
                        thumbnailUrl={row.thumbnailUrl}
                        mimeType={row.file.mimeType}
                        name={row.file.name}
                        size="sm"
                      />
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-poppins font-medium link link-hover"
                      >
                        {row.file.name}
                      </a>
                    </div>
                  </td>
                  <td>
                    <span className="bg-base-300 font-poppins text-sm rounded-xl py-1 px-3">
                      {row.sourceLabel}
                    </span>
                  </td>
                  <td className="font-poppins text-base-content/70">
                    {row.file.uploadedBy?.name ?? "—"}
                  </td>
                  <td className="font-poppins text-base-content/70 whitespace-nowrap">
                    {DateTime.fromJSDate(row.createdAt).toFormat(dateFormatWithTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card.Root>
      )}
    </div>
  );
};

export default Files;
