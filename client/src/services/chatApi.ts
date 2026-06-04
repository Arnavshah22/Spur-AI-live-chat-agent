import type {
  DoneEventData,
  ErrorEventData,
  HistoryResponse,
  StreamEvent,
} from '../types';

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ?? '/api/chat'
).replace(/\/$/, '');

function isDoneEventData(data: unknown): data is DoneEventData {
  if (!data || typeof data !== 'object') return false;
  const value = data as Record<string, unknown>;
  return typeof value.sessionId === 'string' && typeof value.reply === 'string';
}

function isErrorEventData(data: unknown): data is ErrorEventData {
  if (!data || typeof data !== 'object') return false;
  const value = data as Record<string, unknown>;
  return (
    typeof value.message === 'string' &&
    (value.sessionId === undefined || typeof value.sessionId === 'string') &&
    (value.code === undefined || typeof value.code === 'string') &&
    (value.statusCode === undefined || typeof value.statusCode === 'number')
  );
}

export const chatApi = {
  async sendMessage(
    message: string,
    sessionId?: string,
    signal?: AbortSignal
  ): Promise<Response> {
    const response = await fetch(`${API_BASE}/message`, {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, sessionId }),
      signal,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response;
  },

  async getHistory(
    sessionId: string,
    signal?: AbortSignal
  ): Promise<HistoryResponse | null> {
    const response = await fetch(`${API_BASE}/history/${sessionId}`, { signal });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to load conversation history');
    }
    const json = await response.json();
    return json.data ?? json;
  },

  async parseStream(
    response: Response,
    callbacks: {
      onToken: (token: string) => void;
      onDone: (data: DoneEventData) => void;
      onError: (data: ErrorEventData) => void;
    }
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('The server returned an empty response.');

    const decoder = new TextDecoder();
    let buffer = '';
    let terminalEventReceived = false;

    const processLine = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) return;

      let event: StreamEvent;
      try {
        event = JSON.parse(trimmed.slice(5).trim()) as StreamEvent;
      } catch {
        throw new Error('The server returned an invalid streaming response.');
      }

      switch (event.type) {
        case 'token':
          if (typeof event.data !== 'string') {
            throw new Error('The server returned an invalid token event.');
          }
          callbacks.onToken(event.data);
          break;
        case 'done':
          if (!isDoneEventData(event.data)) {
            throw new Error('The server returned an invalid completion event.');
          }
          terminalEventReceived = true;
          callbacks.onDone(event.data);
          break;
        case 'error':
          if (!isErrorEventData(event.data)) {
            throw new Error('The server returned an invalid error event.');
          }
          terminalEventReceived = true;
          callbacks.onError(event.data);
          break;
        default:
          throw new Error('The server returned an unknown streaming event.');
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';
        lines.forEach(processLine);
      }

      buffer += decoder.decode();
      if (buffer.trim()) {
        processLine(buffer);
      }

      if (!terminalEventReceived) {
        throw new Error(
          'The connection closed before the support agent finished responding.'
        );
      }
    } finally {
      reader.releaseLock();
    }
  },
};
