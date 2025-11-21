
import React from 'react';
import { X, Settings, ChevronDown } from 'lucide-react';
import { AppConfig, PersonalityMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  setConfig
}) => {
  if (!isOpen) return null;

  const modes: { id: PersonalityMode; label: string }[] = [
    { id: 'friendly', label: 'Friendly (Default)' },
    { id: 'professional', label: 'Professional / Formal' },
    { id: 'academic', label: 'Academic Researcher' },
    { id: 'brainrot', label: 'Brainrot Mode' },
    { id: 'roast-master', label: 'Roast Master' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            SETTINGS
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Personality Selector */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
              PERSONALIZATION
            </label>
            <div className="flex flex-col gap-2">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setConfig(prev => ({ ...prev, personality: mode.id }))}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    config.personality === mode.id
                      ? 'bg-[#2a2a2a] text-white border border-blue-500/50'
                      : 'bg-[#222] text-gray-400 hover:bg-[#2a2a2a] border border-transparent'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Generation Model (Visual Only) */}
          <div>
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                IMAGE GENERATION MODEL
             </label>
             <div className="relative">
                <button className="w-full flex items-center justify-between bg-[#222] border border-[#333] text-white text-sm px-4 py-3 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                    <span>Nexus Imagineer</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
