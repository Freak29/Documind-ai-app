
import React, { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ProcessedDocument } from './types';
import { processFile } from './services/documentProcessor';
import { getSummary, askQuestion } from './services/geminiService';
import FileUploader from './components/FileUploader';
import ChatInterface from './components/ChatInterface';
import SummaryDisplay from './components/SummaryDisplay';
import Loader from './components/Loader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { DocumentIcon } from './components/icons/DocumentIcon';

const App: React.FC = () => {
  const [processedDocument, setProcessedDocument] = useState<ProcessedDocument | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyError(true);
    }
  }, []);

  const handleFileProcess = async (file: File) => {
    setLoadingMessage('Processing document...');
    setIsLoading(true);
    resetState();
    try {
      const doc = await processFile(file);
      setProcessedDocument(doc);
    } catch (error) {
      console.error('File processing failed:', error);
      alert('Failed to process file. Please try a different PDF or image.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const resetState = () => {
    setProcessedDocument(null);
    setChatHistory([]);
    setSummary('');
  };

  const handleSummarize = useCallback(async () => {
    if (!processedDocument) return;
    setLoadingMessage('Generating summary...');
    setIsLoading(true);
    setSummary('');
    try {
      const result = await getSummary(processedDocument);
      setSummary(result);
    } catch (error) {
      console.error('Summarization failed:', error);
      alert('Could not generate summary. Please check your API key or try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [processedDocument]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!processedDocument) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: message };
    setChatHistory(prev => [...prev, newUserMessage]);
    setLoadingMessage('Thinking...');
    setIsLoading(true);

    try {
      const response = await askQuestion(processedDocument, message, chatHistory);
      const modelMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Q&A failed:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Sorry, I encountered an error. Please check your API key and try again.'
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [processedDocument, chatHistory]);

  const handleNewUpload = () => {
    resetState();
  };

  if (apiKeyError) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-brand-light">
        <div className="text-center p-8 bg-brand-primary rounded-lg shadow-2xl">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Configuration Error</h1>
          <p>Google Gemini API key is not configured.</p>
          <p className="mt-2 text-sm text-slate-400">Please set the `API_KEY` environment variable to use this application.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-brand-text flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-7xl mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 text-brand-accent" />
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-light">DocuMind</h1>
        </div>
        {processedDocument && (
           <button onClick={handleNewUpload} className="px-4 py-2 bg-brand-accent hover:bg-sky-400 text-white font-semibold rounded-lg shadow-md transition-colors duration-300">
            Upload New
          </button>
        )}
      </header>

      <main className="w-full max-w-7xl flex-grow">
        {!processedDocument ? (
          <FileUploader onFileProcess={handleFileProcess} isLoading={isLoading} loadingMessage={loadingMessage} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="bg-brand-primary rounded-xl shadow-2xl p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <DocumentIcon className="w-6 h-6 text-brand-accent"/>
                <h2 className="text-xl font-semibold text-brand-light truncate">{processedDocument.fileName}</h2>
              </div>
              <div className="flex-grow flex flex-col gap-4">
                 <div className="bg-slate-900/50 p-4 rounded-lg flex-shrink-0">
                    <button onClick={handleSummarize} disabled={isLoading} className="w-full px-4 py-2 bg-brand-accent hover:bg-sky-400 text-white font-bold rounded-lg shadow-md transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      <SparklesIcon className="w-5 h-5"/>
                      {isLoading && loadingMessage === 'Generating summary...' ? 'Generating...' : 'Summarize Document'}
                    </button>
                 </div>
                 <SummaryDisplay summary={summary} isLoading={isLoading && loadingMessage === 'Generating summary...'} />
              </div>
            </div>
            <div className="bg-brand-primary rounded-xl shadow-2xl p-6 flex flex-col h-[75vh] lg:h-auto">
              <ChatInterface 
                messages={chatHistory} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading && (loadingMessage === 'Thinking...' || loadingMessage === '')}
              />
            </div>
          </div>
        )}
        {(isLoading && !processedDocument) && <Loader message={loadingMessage} />}
      </main>
    </div>
  );
};

export default App;
