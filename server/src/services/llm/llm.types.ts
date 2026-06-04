export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMServiceConfig {
  apiKey: string;
  baseURL?: string;
  model: string;
  maxTokens: number;
  maxRetries: number;
  retryBaseDelay: number;
  requestTimeoutMs: number;
}
