
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-accent"></div>
      <p className="mt-4 text-brand-light text-lg">{message}</p>
    </div>
  );
};

export default Loader;
