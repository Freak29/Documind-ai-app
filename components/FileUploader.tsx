
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './icons/UploadIcon';
import Loader from './Loader';

interface FileUploaderProps {
  onFileProcess: (file: File) => void;
  isLoading: boolean;
  loadingMessage: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileProcess, isLoading, loadingMessage }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    if (rejectedFiles && rejectedFiles.length > 0) {
        setError('File type not supported. Please upload a PDF or image file.');
        return;
    }
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileProcess(acceptedFiles[0]);
    }
  }, [onFileProcess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    multiple: false,
  });

  if (isLoading) {
    return <Loader message={loadingMessage} />;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div 
        {...getRootProps()} 
        className={`w-full max-w-2xl p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${isDragActive ? 'border-brand-accent bg-brand-secondary' : 'border-brand-secondary hover:border-sky-400'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <UploadIcon className="w-16 h-16 text-brand-secondary mb-4"/>
          <p className="text-xl font-semibold text-brand-light">
            {isDragActive ? 'Drop the file here ...' : 'Drag & drop a file here, or click to select'}
          </p>
          <p className="text-sm text-brand-text mt-2">
            Supported formats: PDF, PNG, JPG, WEBP
          </p>
          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
