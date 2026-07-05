'use client';

import { FileResponseData } from '@/app/api/upload/route';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { TbCheck, TbPhoto, TbX } from 'react-icons/tb';

const classes = {
  span: {
    default: '',
    2: 'col-span-1 sm:col-span-2',
  }
}

type UploadProps = {
  pathPrefix?: string;
  onComplete?: (FileResponse: FileResponseData) => void;
  onMultipleComplete?: (results: FileResponseData[]) => void;
  multiple?: boolean;
  span?: keyof typeof classes.span;
}

const Uploader = ({ pathPrefix = 'general', onComplete, onMultipleComplete, multiple = false, span = 'default' }: UploadProps) => {

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadSingle = async (file: File): Promise<FileResponseData> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pathPrefix', pathPrefix);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadedFiles([]);

    try {
      if (multiple && onMultipleComplete) {
        setUploadProgress({ done: 0, total: acceptedFiles.length });
        const results: FileResponseData[] = [];
        for (const file of acceptedFiles) {
          const data = await uploadSingle(file);
          results.push(data);
          setUploadProgress(p => p ? { ...p, done: p.done + 1 } : null);
        }
        setUploadedFiles(results.map(r => r.name));
        onMultipleComplete(results);
      } else {
        const file = acceptedFiles[0];
        const data = await uploadSingle(file);
        if (onComplete) onComplete(data);
        setUploadedFiles([data.name]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [onComplete, onMultipleComplete, multiple, pathPrefix]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    multiple,
  });

  return (
    <div className={`w-full max-w-lg mx-auto p-4 ${classes.span[span]}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <TbPhoto className="w-12 h-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-gray-600">Drop {multiple ? 'files' : 'the image'} here ...</p>
          ) : (
            <p className="text-gray-600">
              {multiple
                ? 'Drag & drop images or PDFs here, or click to select files'
                : 'Drag & drop an image or pdf here, or click to select one'}
            </p>
          )}
        </div>
      </div>
      {isUploading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-2 text-gray-700">
            {uploadProgress
              ? `Uploading ${uploadProgress.done + 1} of ${uploadProgress.total}...`
              : 'Uploading...'}
          </p>
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
          <TbX className="w-5 h-5 mr-2 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 p-4 border rounded-lg bg-green-50 border-green-200">
          <div className="flex items-center text-green-800">
            <TbCheck className="w-5 h-5 mr-2 shrink-0" />
            <p className="font-semibold">
              {uploadedFiles.length === 1 ? 'Upload successful!' : `${uploadedFiles.length} files uploaded!`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Uploader;
