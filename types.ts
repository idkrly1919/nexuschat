
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Attachment {
  mimeType: string;
  data: string; // base64
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  isStreaming?: boolean;
  timestamp: number;
  groundingMetadata?: GroundingMetadata;
  isGeneratingImage?: boolean;
  image?: {
    base64: string;
    model: string;
    prompt: string;
  };
}

export interface GroundingMetadata {
  searchQueries?: string[];
  webSources?: {
    uri: string;
    title: string;
  }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

// FIX: Changed ModelType to use Gemini model names.
export type ModelType = 'gemini-2.5-flash' | 'gemini-3-pro-preview';

export type PersonalityMode = 'friendly' | 'brainrot' | 'roast-master' | 'academic' | 'professional';

export interface AppConfig {
  model: ModelType;
  enableSearch: boolean;
  enableThinking: boolean;
  enableResearch: boolean;
  personality: PersonalityMode;
  imageModel?: string;
}
