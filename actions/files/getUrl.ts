"use server"

import { s3 } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// gets presigned url
export const getFileUrl = async (bucketName: string, objectName: string) => {
    const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: bucketName, Key: objectName }),
        { expiresIn: 3600 }
    );

    return url
}
