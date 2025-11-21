
import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Search, 
  BrainCircuit, 
  Lightbulb, 
  Mic, 
  SendHorizontal, 
  X, 
  ChevronUp,
  Loader2,
  LayoutGrid
} from 'lucide-react';
import { AppConfig, Attachment } from '../types';
import { DEFAULT_MODEL, PRO_MODEL, MODEL_LABELS } from '../constants';

interface InputAreaProps {
  onSendMessage: (text: string, attachments: Attachment[], config: AppConfig) => void;
  isLoading: boolean;
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onSendMessage, 
  isLoading,
  config,
  setConfig
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close model menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(input, attachments, config);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      setAttachments(prev => [...prev, {
        mimeType: file.type,
        data: base64Data
      }]);
    };
    reader.readAsDataURL(file);
  };

  const toggleSearch = () => setConfig(prev => ({ ...prev, enableSearch: !prev.enableSearch }));
  const toggleThinking = () => setConfig(prev => ({ ...prev, enableThinking: !prev.enableThinking }));
  const toggleResearch = () => setConfig(prev => ({ ...prev, enableResearch: !prev.enableResearch }));


  return (
    <div className="max-w-3xl mx-auto w-full px-4 pb-4 relative z-10">
      <div 
        className={`relative bg-[#1e1e1e] border transition-all duration-200 rounded-3xl shadow-2xl ${isDragOver ? 'border-blue-500' : 'border-[#333]'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
          }
        }}
      >
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex gap-2 px-4 pt-4 overflow-x-auto">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group flex-shrink-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#333] bg-black/20">
                   {att.mimeType.startsWith('image/') ? (
                       <img 
                         src={`data:${att.mimeType};base64,${att.data}`} 
                         alt="attachment" 
                         className="w-full h-full object-cover"
                       />
                   ) : (
                       <div className="flex items-center justify-center h-full text-textMuted">
                           <Paperclip className="w-6 h-6" />
                       </div>
                   )}
                </div>
                <button 
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 bg-surface border border-border rounded-full p-0.5 text-textMuted hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Nexus..."
          className="w-full bg-transparent text-textMain placeholder-gray-500 px-5 py-4 focus:outline-none resize-none max-h-[200px] min-h-[50px] text-base"
          rows={1}
        />

        <div className="flex items-center justify-between px-3 pb-3">
          {/* Left Tools */}
          <div className="flex items-center gap-1.5">
            
            {/* Model Selector */}
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2a2a2a] hover:bg-[#333] border border-[#444] text-xs font-medium text-gray-300 transition-colors mr-2"
                >
                    <LayoutGrid className="w-3.5 h-3.5 text-gray-400" />
                    <span>{MODEL_LABELS[config.model]}</span>
                    <ChevronUp className={`w-3 h-3 transition-transform text-gray-500 ${isModelMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isModelMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-56 bg-[#252525] border border-[#444] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => {
                                setConfig(prev => ({ ...prev, model: DEFAULT_MODEL }));
                                setIsModelMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-[#333] transition-colors flex flex-col gap-0.5"
                        >
                            <div className="flex items-center gap-2 text-sm text-gray-200 font-medium">
                                <span className={`w-2 h-2 rounded-full ${config.model === DEFAULT_MODEL ? 'bg-blue-500' : 'bg-gray-600'}`}></span> 
                                {MODEL_LABELS[DEFAULT_MODEL]}
                            </div>
                        </button>
                        <div className="h-px bg-[#333] mx-2"></div>
                        <button 
                             onClick={() => {
                                setConfig(prev => ({ ...prev, model: PRO_MODEL }));
                                setIsModelMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-[#333] transition-colors flex flex-col gap-0.5"
                        >
                            <div className="flex items-center gap-2 text-sm text-gray-200 font-medium">
                                <span className={`w-2 h-2 rounded-full ${config.model === PRO_MODEL ? 'bg-blue-500' : 'bg-gray-600'}`}></span> 
                                {MODEL_LABELS[PRO_MODEL]}
                            </div>
                        </button>
                    </div>
                )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept="image/*"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#333] rounded-full transition-colors relative group"
            >
              <Paperclip className="w-4 h-4" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Attach</span>
            </button>

            <button 
              onClick={toggleSearch}
              className={`p-2 rounded-full transition-colors relative group ${config.enableSearch ? 'text-blue-400 bg-blue-400/10' : 'text-gray-400 hover:text-gray-200 hover:bg-[#333]'}`}
            >
              <Search className="w-4 h-4" />
               <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Search Grounding</span>
            </button>

            <button 
              onClick={toggleThinking}
              className={`p-2 rounded-full transition-colors relative group ${config.enableThinking ? 'text-gray-100 bg-gray-700' : 'text-gray-400 hover:text-gray-200 hover:bg-[#333]'}`}
            >
              <BrainCircuit className="w-4 h-4" />
               <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Deep Reasoning</span>
            </button>

             <button 
              onClick={toggleResearch}
              className={`p-2 rounded-full transition-colors relative group ${config.enableResearch ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-gray-200 hover:bg-[#333]'}`}
            >
              <Lightbulb className="w-4 h-4" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Deep Research</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button 
               className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded-full transition-colors"
               title="Voice Input"
            >
               <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                (input.trim() || attachments.length > 0) && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                  : 'bg-[#333] text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
