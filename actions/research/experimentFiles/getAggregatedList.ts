"use server";

import prisma from "@/lib/prisma";
import { resolveFileRows } from "@/actions/files/resolveFileRows";

type SourceVariant =
  | "experiment-direct"
  | "experiment-note"
  | "sample-direct"
  | "sample-note";

export const getAggregatedFilesList = async (experimentId: string) => {
  const [
    rawExperimentDirect,
    rawExperimentNoteFiles,
    rawSampleDirect,
    rawSampleNoteFiles,
  ] = await Promise.all([
    prisma.experimentFile.findMany({
      where: { experimentId },
      include: { file: { include: { uploadedBy: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.experimentNoteFile.findMany({
      where: { experimentNote: { experimentId } },
      include: {
        file: { include: { uploadedBy: true } },
        experimentNote: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.experimentSampleFile.findMany({
      where: { sample: { experimentId } },
      include: {
        file: { include: { uploadedBy: true } },
        sample: { select: { id: true, referenceCode: true, label: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.experimentSampleNoteFile.findMany({
      where: { experimentSampleNote: { sample: { experimentId } } },
      include: {
        file: { include: { uploadedBy: true } },
        experimentSampleNote: {
          include: {
            sample: { select: { id: true, referenceCode: true, label: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const [experimentDirect, experimentNoteFiles, sampleDirect, sampleNoteFiles] =
    await Promise.all([
      resolveFileRows(rawExperimentDirect),
      resolveFileRows(rawExperimentNoteFiles),
      resolveFileRows(rawSampleDirect),
      resolveFileRows(rawSampleNoteFiles),
    ]);

  type Entry = {
    id: string;
    createdAt: Date;
    source: SourceVariant;
    sourceLabel: string;
    sampleId?: string;
    sampleRef?: number;
    sampleLabel?: string;
    file: (typeof experimentDirect)[number]["file"];
    url: string;
    thumbnailUrl?: string;
  };

  const entries: Entry[] = [
    ...experimentDirect.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      source: "experiment-direct" as const,
      sourceLabel: "Experiment",
      file: row.file,
      url: row.url,
      thumbnailUrl: row.thumbnailUrl,
    })),
    ...experimentNoteFiles.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      source: "experiment-note" as const,
      sourceLabel: "Note on Experiment",
      file: row.file,
      url: row.url,
      thumbnailUrl: row.thumbnailUrl,
    })),
    ...sampleDirect.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      source: "sample-direct" as const,
      sourceLabel: `S-${String(row.sample.referenceCode).padStart(2, "0")}`,
      sampleId: row.sample.id,
      sampleRef: row.sample.referenceCode,
      sampleLabel: row.sample.label,
      file: row.file,
      url: row.url,
      thumbnailUrl: row.thumbnailUrl,
    })),
    ...sampleNoteFiles.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      source: "sample-note" as const,
      sourceLabel: `Note on S-${String(row.experimentSampleNote.sample.referenceCode).padStart(2, "0")}`,
      sampleId: row.experimentSampleNote.sample.id,
      sampleRef: row.experimentSampleNote.sample.referenceCode,
      sampleLabel: row.experimentSampleNote.sample.label,
      file: row.file,
      url: row.url,
      thumbnailUrl: row.thumbnailUrl,
    })),
  ];

  entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return entries;
};

export type AggregatedFileEntry = Awaited<
  ReturnType<typeof getAggregatedFilesList>
>[number];
