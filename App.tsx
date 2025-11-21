
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputArea } from './components/InputArea';
import { MessageList } from './components/MessageList';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';
import { Message, Role, ChatSession, AppConfig, Attachment, GroundingMetadata } from './types';
import { DEFAULT_MODEL, IMAGE_GEN_KEYWORDS, IMAGE_GEN_MODEL } from './constants';
import { streamChatResponse, generateImage } from './services/geminiService';
import { PanelLeftOpen } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AppConfig>({
    model: DEFAULT_MODEL,
    enableSearch: false,
    enableThinking: false,
    enableResearch: false,
    personality: 'friendly',
    imageModel: IMAGE_GEN_MODEL
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexus_sessions_k5');
      if (saved) {
        setSessions(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  }, []);

  // Save sessions
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('nexus_sessions_k5', JSON.stringify(sessions));
    }
  }, [sessions]);

  const getCurrentSession = () => sessions.find(s => s.id === currentSessionId);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      lastUpdated: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const updateSessionMessages = (sessionId: string, updater: (messages: Message[]) => Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: updater(s.messages),
          lastUpdated: Date.now()
        };
      }
      return s;
    }));
  };

  const handleSendMessage = async (text: string, attachments: Attachment[], currentConfig: AppConfig) => {
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: text.slice(0, 30) || 'New Chat',
        messages: [],
        lastUpdated: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      // Small delay to ensure state update before processing
      setTimeout(() => processMessage(newSession.id, text, attachments, currentConfig), 0);
    } else {
      processMessage(currentSessionId, text, attachments, currentConfig);
    }
  };

  const processMessage = async (sessionId: string, text: string, attachments: Attachment[], currentConfig: AppConfig) => {
    setIsLoading(true);
    
    // 1. Add User Message
    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
      role: Role.USER,
      content: text,
      attachments,
      timestamp: Date.now()
    };

    updateSessionMessages(sessionId, (msgs) => [...msgs, userMsg]);

    // 2. Determine type (Image Gen vs Chat)
    const isImageGen = IMAGE_GEN_KEYWORDS.some(k => text.toLowerCase().includes(k));
    const modelMsgId = (Date.now() + 1).toString();

    // 3. Add Model Placeholder
    const loadingMsg: Message = {
      id: modelMsgId,
      role: Role.MODEL,
      content: '', // Start empty
      timestamp: Date.now(),
      isGeneratingImage: isImageGen,
      isStreaming: !isImageGen // Only stream if it's chat
    };

    updateSessionMessages(sessionId, (msgs) => [...msgs, loadingMsg]);

    try {
      if (isImageGen) {
        // HANDLE IMAGE GENERATION
        const imageResult = await generateImage(text);
        
        updateSessionMessages(sessionId, (msgs) => 
          msgs.map(m => m.id === modelMsgId ? {
            ...m,
            isGeneratingImage: false,
            image: {
              base64: imageResult.base64,
              model: imageResult.model,
              prompt: imageResult.prompt
            }
          } : m)
        );
        
      } else {
        // HANDLE CHAT STREAMING
        const currentSession = sessions.find(s => s.id === sessionId);
        const history = currentSession ? [...currentSession.messages, userMsg] : [userMsg];

        await streamChatResponse(
            history, 
            text, 
            attachments, 
            currentConfig,
            (chunk) => {
                // Update message content with the full accumulated text
                updateSessionMessages(sessionId, (msgs) => 
                    msgs.map(m => m.id === modelMsgId ? { ...m, content: chunk } : m)
                );
            },
            (metadata) => {
                 updateSessionMessages(sessionId, (msgs) => 
                    msgs.map(m => m.id === modelMsgId ? { ...m, groundingMetadata: metadata } : m)
                );
            }
        );
        
        // Finalize (remove isStreaming)
        updateSessionMessages(sessionId, (msgs) => 
            msgs.map(m => m.id === modelMsgId ? { ...m, isStreaming: false } : m)
        );
      }
    } catch (error: any) {
      console.error("Processing error:", error);
      // Update the placeholder with the error message so the user knows what happened
      updateSessionMessages(sessionId, (msgs) => 
        msgs.map(m => m.id === modelMsgId ? { 
            ...m, 
            isStreaming: false, 
            isGeneratingImage: false,
            content: `Error: ${error.message || "Something went wrong."}` 
        } : m)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentSession = getCurrentSession();

  return (
    <div className="flex h-screen bg-background text-textMain overflow-hidden relative">
      
      {/* Sidebar - Desktop */}
      <div className={`${isSidebarOpen ? 'w-[280px]' : 'w-0'} transition-[width] duration-300 ease-in-out hidden md:block relative h-full bg-surface overflow-hidden border-r border-border shrink-0`}>
         <Sidebar 
           isOpen={isSidebarOpen} 
           toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
           sessions={sessions}
           currentSessionId={currentSessionId}
           onNewChat={createNewSession}
           onSelectSession={setCurrentSessionId}
           onOpenSettings={() => setIsSettingsOpen(true)}
         />
      </div>

      {/* Sidebar - Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-[280px] h-full bg-surface animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            <Sidebar 
               isOpen={isSidebarOpen} 
               toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
               sessions={sessions}
               currentSessionId={currentSessionId}
               onNewChat={createNewSession}
               onSelectSession={(id) => { setCurrentSessionId(id); setIsSidebarOpen(false); }}
               onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* Top Bar */}
        <div className="h-16 border-b border-border flex items-center px-4 justify-between bg-surface/50 backdrop-blur-sm z-20">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-surfaceHighlight rounded-lg transition-colors text-textMuted hover:text-textMain"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
              <span className="font-medium text-sm">
                {currentSession?.title || 'New Chat'}
              </span>
           </div>
           <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
             <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">
                {isLoading ? 'Processing' : 'Ready'}
             </span>
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative min-h-0">
            {!currentSessionId || (currentSession && currentSession.messages.length === 0) ? (
               <WelcomeScreen />
            ) : (
               <MessageList 
                 messages={currentSession!.messages} 
                 isLoading={isLoading} 
               />
            )}
            
            {/* Input Area */}
            <div className="flex-shrink-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-10 pb-4">
               <InputArea 
                 onSendMessage={handleSendMessage}
                 isLoading={isLoading}
                 config={config}
                 setConfig={setConfig}
               />
               <div className="text-center text-[10px] text-textMuted mt-2">
                  Nexus K5.1 can make mistakes. Check important info.
               </div>
            </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        setConfig={setConfig}
      />
    </div>
  );
};

export default App;
