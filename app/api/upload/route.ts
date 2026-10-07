import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import { requireApiUser } from '@/lib/requireApiUser';
import { storeUploadedFile, StoredFile } from '@/lib/files/storeUpload';

export type FileResponseData = StoredFile

export async function POST(request: NextRequest) {
  const gate = await requireApiUser();
  if (gate instanceof Response) return gate;

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storeUploadedFile({ file, buffer, pathPrefix, uploadedById: gate.userId });

    return NextResponse.json(stored, { status: 200 });

  } catch (error) {
    console.error('Upload failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to upload file.', details: errorMessage }, { status: 500 });
  }
}
