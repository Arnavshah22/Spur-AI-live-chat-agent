export type StreamEvent =
  | { type: 'token'; data: string }
  | { type: 'done'; data: { sessionId: string; reply: string } }
  | {
      type: 'error';
      data: {
        message: string;
        sessionId?: string;
        code: string;
        statusCode: number;
      };
    };

export interface MessageDTO {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
  status: 'completed' | 'failed';
  createdAt: string;
}

export interface ConversationDTO {
  id: string;
  channel: string;
  createdAt: string;
  updatedAt: string;
  messages: MessageDTO[];
}
