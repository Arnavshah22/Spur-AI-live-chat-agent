export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  isError?: boolean;
}

export type StreamEvent =
  | { type: 'token'; data: string }
  | { type: 'done'; data: DoneEventData }
  | { type: 'error'; data: ErrorEventData };

export interface DoneEventData {
  sessionId: string;
  reply: string;
}

export interface ErrorEventData {
  message: string;
  sessionId?: string;
  code?: string;
  statusCode?: number;
}

export interface HistoryResponse {
  id: string;
  channel: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    conversationId: string;
    sender: 'user' | 'ai';
    text: string;
    status: 'completed' | 'failed';
    createdAt: string;
  }>;
}
