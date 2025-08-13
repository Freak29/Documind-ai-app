
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold text-brand-light mb-4 flex-shrink-0">Question & Answer</h2>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center"><SparklesIcon className="w-5 h-5 text-white"/></div>}
            <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-xl ${msg.role === 'user' ? 'bg-brand-accent text-white rounded-br-none' : 'bg-brand-secondary text-brand-text rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center"><SparklesIcon className="w-5 h-5 text-white animate-pulse"/></div>
              <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-xl bg-brand-secondary text-brand-text rounded-bl-none">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex-shrink-0">
        <div className="flex items-center bg-brand-secondary rounded-lg p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the document..."
            className="flex-grow bg-transparent text-brand-light placeholder-slate-400 focus:outline-none resize-none px-2 py-1"
            rows={1}
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2 rounded-md bg-brand-accent hover:bg-sky-400 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
