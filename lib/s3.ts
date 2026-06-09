import { S3Client } from "@aws-sdk/client-s3";

const port: number = process.env.S3_PORT ? parseInt(process.env.S3_PORT) : 9000;
const host: string = process.env.S3_END_POINT || "";

export const s3 = new S3Client({
  endpoint: `http://${host}:${port}`,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  forcePathStyle: true,
  // AWS SDK v3 now sends by default
  // (x-amz-checksum-mode=ENABLED) with a 400. Only send them when required.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});
