"use server";

import { getFileUrl } from "@/actions/files/getUrl";

type RowWithFile = {
  file: {
    bucketName: string;
    objectName: string;
    thumbnailObjectName: string | null;
    thumbnailBucketName: string | null;
    [key: string]: any;
  };
  [key: string]: any;
};

export const resolveFileRows = async <T extends RowWithFile>(rows: T[]) => {
  return Promise.all(
    rows.map(async (row) => {
      const url = await getFileUrl(row.file.bucketName, row.file.objectName);
      let thumbnailUrl: string | undefined;
      if (row.file.thumbnailObjectName && row.file.thumbnailBucketName) {
        thumbnailUrl = await getFileUrl(
          row.file.thumbnailBucketName,
          row.file.thumbnailObjectName,
        );
      }
      return { ...row, url, thumbnailUrl };
    }),
  );
};
