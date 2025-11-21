import React from 'react';
import { MessageSquarePlus, PanelLeftClose } from 'lucide-react';
import { ChatSession } from '../types';
import { NexusLogo } from './NexusLogo';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onOpenSettings
}) => {
  return (
    <div className="w-[280px] h-full bg-surface flex flex-col">
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between flex-shrink-0">
         <div className="flex items-center gap-2 font-bold text-xl text-white">
             <NexusLogo className="w-7 h-7" />
             <span>Nexus</span>
         </div>
         {/* Close button for mobile mainly */}
        <button 
          onClick={toggleSidebar}
          className="text-textMuted hover:text-textMain transition-colors md:hidden"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 pb-4 flex-shrink-0">
          <button 
            onClick={onNewChat}
            className="w-full flex items-center gap-2 bg-white hover:bg-gray-200 text-black text-sm px-4 py-2.5 rounded-xl transition-colors font-medium shadow-md"
          >
            <MessageSquarePlus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        <div className="text-xs font-bold text-textMuted mb-2 px-4 uppercase tracking-wider mt-2">
          History
        </div>
        {sessions.length === 0 && (
          <div className="text-textMuted text-sm px-4 py-2 italic">
            No chat history
          </div>
        )}
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm group relative ${
              currentSessionId === session.id
                ? 'bg-surfaceHighlight text-textMain'
                : 'text-textMuted hover:bg-surfaceHighlight/50 hover:text-textMain'
            }`}
          >
            <div className="font-medium truncate pr-2">{session.title}</div>
            <div className="text-[10px] opacity-60 mt-0.5">
              {new Date(session.lastUpdated).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-border bg-surface flex-shrink-0">
        <button 
          onClick={onOpenSettings}
          className="flex items-center gap-3 w-full px-3 py-2 text-textMuted hover:text-textMain hover:bg-surfaceHighlight rounded-lg transition-colors text-sm font-medium"
        >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-gray-600">
                <span className="text-xs text-white font-bold">U</span>
            </div>
            <div className="flex flex-col items-start">
                <span className="text-white">User</span>
                <span className="text-[10px]">Free Plan</span>
            </div>
        </button>
      </div>
    </div>
  );
};
