"use server";

import prisma from "@/lib/prisma";
import { resolveNoteFiles } from "@/actions/notes/resolveNoteFiles";

export const getAggregatedNotesFeed = async (experimentId: string) => {
  const [rawExperimentNotes, rawSampleNotes] = await Promise.all([
    prisma.experimentNote.findMany({
      where: { experimentId },
      include: {
        noteType: true,
        user: true,
        files: { include: { file: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.experimentSampleNote.findMany({
      where: { sample: { experimentId } },
      include: {
        noteType: true,
        user: true,
        files: { include: { file: true } },
        sample: {
          select: { id: true, referenceCode: true, label: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const [experimentNotes, sampleNotes] = await Promise.all([
    resolveNoteFiles(rawExperimentNotes),
    resolveNoteFiles(rawSampleNotes),
  ]);

  type Entry =
    | {
        kind: "experiment";
        id: string;
        createdAt: Date;
        note: (typeof experimentNotes)[number];
      }
    | {
        kind: "sample";
        id: string;
        createdAt: Date;
        sampleId: string;
        sampleRef: number;
        sampleLabel: string;
        note: (typeof sampleNotes)[number];
      };

  const entries: Entry[] = [
    ...experimentNotes.map((n) => ({
      kind: "experiment" as const,
      id: n.id,
      createdAt: n.createdAt,
      note: n,
    })),
    ...sampleNotes.map((n) => ({
      kind: "sample" as const,
      id: n.id,
      createdAt: n.createdAt,
      sampleId: n.sample.id,
      sampleRef: n.sample.referenceCode,
      sampleLabel: n.sample.label,
      note: n,
    })),
  ];

  entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return entries;
};

export type AggregatedNoteEntry = Awaited<
  ReturnType<typeof getAggregatedNotesFeed>
>[number];
