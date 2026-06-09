import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';
import { s3 } from '@/lib/s3';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { getUserId } from '@/actions/users/getUserId';
import prisma from '@/lib/prisma';
import { fromBuffer } from "pdf2pic"

async function bucketExists(name: string): Promise<boolean> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: name }));
    return true;
  } catch (err: unknown) {
    const status = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
    if (status === 404 || status === 301 || status === 403) return false;
    throw err;
  }
}

export type FileResponseData = {
  name: string
  mimetype: string
  size: number
  bucket: string
  objectName: string
  etag: string
  versionId: string | null
  fileId: string
  thumbnailObjectName: string | null
  thumbnailBucketName: string | null
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const pathPrefix = formData.get('pathPrefix') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!pathPrefix) {
      return NextResponse.json({ error: 'No path prefix specified.' }, { status: 400 })
    }

    const bucketName = process.env.S3_BUCKET_NAME!;
    if (!bucketName) {
      throw new Error("S3_BUCKET_NAME environment variable is not set.");
    }

    // TODO ensure that bucket exists on app startup not every time we upload
    if (!(await bucketExists(bucketName))) {
      await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket ${bucketName} created.`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // callers pass prefixes inconsistently (e.g. "/item/", "research/sample-1").
    // strip leading/trailing slashes and collapse internal ones so keys never
    // contain empty segments — S3/MinIO presigned URLs with "//" fail to match.
    const normalizedPrefix = pathPrefix.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');

    const fileExtension = path.extname(file.name);
    const objectName = `${normalizedPrefix}/${uuidv4()}${fileExtension}`;

    const uploadInfo = await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: objectName,
      Body: buffer,
      ContentLength: file.size,
      ContentType: file.type,
    }));

    let thumbnailObjectName: string | null = null;
    let thumbnailBucketName: string | null = null;

    // Generate thumbnail for images
    if (file.type.startsWith('image/')) {
      const thumbnailBuffer = await sharp(buffer).resize(128, 128, { fit: 'inside' }).toBuffer();
      const thumbnailExtension = '.webp'; // Use webp for thumbnails for better compression
      thumbnailObjectName = `${normalizedPrefix}/thumbnails/${uuidv4()}${thumbnailExtension}`;
      await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: thumbnailObjectName,
        Body: thumbnailBuffer,
        ContentLength: thumbnailBuffer.length,
        ContentType: 'image/webp',
      }));
      thumbnailBucketName = bucketName;
    }

    if (file.type === 'application/pdf') {
      const options = {
        density: 100,
        saveFilename: "untitled",
        width: 600,
        height: 800
      };
      try {
        const thumbnail = await fromBuffer(buffer, options).bulk(1, { responseType: 'buffer' });
        const buf = thumbnail?.[0]?.buffer;

        // pdf2pic silently returns a 0-length Buffer when its `gm`
        // (GraphicsMagick) backend isn't available on the host. Skip
        // storing the thumbnail in that case so the renderer can fall
        // back to the PDF icon instead of a broken image.
        if (buf && buf.length > 0) {
          const thumbnailExtension = '.webp';
          thumbnailObjectName = `${normalizedPrefix}/thumbnails/${uuidv4()}${thumbnailExtension}`;
          await s3.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: thumbnailObjectName,
            Body: buf,
            ContentLength: buf.length,
            ContentType: 'image/webp',
          }));
          thumbnailBucketName = bucketName;
        } else {
          console.warn('PDF thumbnail generation produced an empty buffer; skipping. Is GraphicsMagick installed on the host?');
        }
      } catch (e) {
        console.warn('PDF thumbnail generation failed; uploading PDF without thumbnail.', e);
      }
    }
    // create the response rather than provide just upload info
    const responseData = {
      name: file.name,
      mimetype: file.type,
      size: file.size,
      bucket: bucketName,
      objectName: objectName,
      etag: uploadInfo.ETag ?? '',
      versionId: uploadInfo.VersionId ?? null,
      thumbnailObjectName: thumbnailObjectName,
      thumbnailBucketName: thumbnailBucketName,
    };


    // handle posting to our db
    const userId = await getUserId();
    const fileEntry = await prisma.file.create({
      data: {
        name: responseData.name,
        objectName: responseData.objectName,
        bucketName: responseData.bucket,
        etag: responseData.etag,
        versionId: responseData.versionId,
        size: responseData.size,
        mimeType: responseData.mimetype,
        uploadedById: userId,
        thumbnailObjectName: responseData.thumbnailObjectName,
        thumbnailBucketName: responseData.thumbnailBucketName,
      }
    });

    return NextResponse.json({
      ...responseData,
      fileId: fileEntry.id,
    }, { status: 200 });

  } catch (error) {
    console.error('Upload failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to upload file.', details: errorMessage }, { status: 500 });
  }
}
