export interface LegalDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}
