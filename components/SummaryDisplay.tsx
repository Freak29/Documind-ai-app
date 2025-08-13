
import React from 'react';

interface SummaryDisplayProps {
  summary: string;
  isLoading: boolean;
}

const SummarySkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        <div className="h-3 bg-slate-700 rounded w-full"></div>
        <div className="h-3 bg-slate-700 rounded w-5/6"></div>
        <div className="h-3 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-1/3 mt-4"></div>
        <div className="h-3 bg-slate-700 rounded w-full"></div>
        <div className="h-3 bg-slate-700 rounded w-3/4"></div>
    </div>
);

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, isLoading }) => {
  // A simple markdown to HTML converter
  const renderMarkdown = (text: string) => {
    // This is a very basic parser. A library like 'marked' or 'react-markdown' would be better for production.
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-brand-light mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-brand-light mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold text-brand-light mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg flex-grow overflow-y-auto">
      <h3 className="text-lg font-semibold text-brand-light mb-2">Summary</h3>
      <div className="prose prose-invert prose-sm max-w-none text-brand-text">
        {isLoading ? (
          <SummarySkeleton />
        ) : summary ? (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }} />
        ) : (
          <p className="text-slate-400 italic">Click "Summarize Document" to generate a summary here.</p>
        )}
      </div>
    </div>
  );
};

export default SummaryDisplay;
