"use client";
import { useMemo, useState } from "react";
import { DateTime } from "luxon";
import { TbGhost2 } from "react-icons/tb";
import Card from "@/components/Card";
import FileThumbnail from "@/components/Files/Thumbnail";
import { AggregatedNoteEntry } from "@/actions/research/experimentNotes/getAggregatedFeed";
import { dateFormatWithTime } from "@/configs/data/dateFormatString";

type Props = {
  entries: AggregatedNoteEntry[];
};

const formatSampleRef = (code: number) => `S-${String(code).padStart(2, "0")}`;

const Notes = ({ entries }: Props) => {
  const [sourceFilter, setSourceFilter] = useState<"all" | "experiment" | string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const sampleOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of entries) {
      if (e.kind === "sample") {
        seen.set(e.sampleId, `${formatSampleRef(e.sampleRef)} — ${e.sampleLabel}`);
      }
    }
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
  }, [entries]);

  const typeOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of entries) {
      seen.set(e.note.noteType.id, e.note.noteType.name);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (sourceFilter === "experiment" && e.kind !== "experiment") return false;
      if (
        sourceFilter !== "all" &&
        sourceFilter !== "experiment" &&
        (e.kind !== "sample" || e.sampleId !== sourceFilter)
      ) {
        return false;
      }
      if (typeFilter !== "all" && e.note.noteType.id !== typeFilter) return false;
      return true;
    });
  }, [entries, sourceFilter, typeFilter]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-poppins text-xl font-semibold text-base-content">Notes</h2>

      <div className="flex gap-3 flex-wrap items-center">
        <label className="flex items-center gap-2">
          <span className="font-poppins text-sm">Source:</span>
          <select
            className="select select-sm select-bordered"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="experiment">Experiment</option>
            {sampleOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="font-poppins text-sm">Type:</span>
          <select
            className="select select-sm select-bordered"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All</option>
            {typeOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <Card.Root>
          <p className="font-poppins text-lg text-base-content/60 italic">
            No notes yet.
          </p>
        </Card.Root>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((entry) => {
            const sourceLabel =
              entry.kind === "experiment"
                ? "Experiment"
                : `${formatSampleRef(entry.sampleRef)} — ${entry.sampleLabel}`;
            const note = entry.note;
            const files = note.files ?? [];

            return (
              <div
                key={`${entry.kind}-${entry.id}`}
                className="flex flex-col gap-3 bg-base-200/40 p-6 rounded-xl"
              >
                <div className="flex flex-row justify-between items-center flex-wrap gap-3">
                  <div className="flex flex-row gap-x-3 items-center flex-wrap">
                    <div className="bg-secondary/50 flex items-center gap-x-2 rounded-xl px-3 py-1">
                      <span className="text-lg">
                        <TbGhost2 />
                      </span>
                      <h3 className="font-poppins text-base font-medium">
                        {note.user.name}
                      </h3>
                    </div>
                    <div
                      style={{
                        backgroundColor: note.noteType.bgColor,
                        color: note.noteType.textColor,
                      }}
                      className="font-poppins font-medium text-sm rounded-xl py-1 px-3"
                    >
                      {note.noteType.name}
                    </div>
                    <div className="bg-base-300 font-poppins font-medium text-sm rounded-xl py-1 px-3">
                      {sourceLabel}
                    </div>
                    <div className="font-poppins text-sm text-base-content/70">
                      {DateTime.fromJSDate(note.createdAt).toFormat(dateFormatWithTime)}
                    </div>
                  </div>
                </div>

                <div className="font-poppins text-lg whitespace-pre-wrap">
                  {note.content}
                </div>

                {files.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {files.map((nf) => (
                      <FileThumbnail
                        key={nf.id}
                        url={nf.url!}
                        thumbnailUrl={nf.thumbnailUrl}
                        mimeType={nf.file.mimeType}
                        name={nf.file.name}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notes;
