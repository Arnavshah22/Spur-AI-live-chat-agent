import { describe, expect, it, vi } from 'vitest';
import { chatApi } from './chatApi';

function streamResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
        controller.close();
      },
    })
  );
}

describe('chatApi.parseStream', () => {
  it('parses token and completion events split across chunks', async () => {
    const onToken = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();
    const response = streamResponse([
      'data: {"type":"token","data":"Hel',
      'lo"}\n\n',
      'data: {"type":"done","data":{"sessionId":"session-1","reply":"Hello"}}\n\n',
    ]);

    await chatApi.parseStream(response, { onToken, onDone, onError });

    expect(onToken).toHaveBeenCalledWith('Hello');
    expect(onDone).toHaveBeenCalledWith({
      sessionId: 'session-1',
      reply: 'Hello',
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it('passes session IDs through error events', async () => {
    const onError = vi.fn();
    const response = streamResponse([
      'data: {"type":"error","data":{"message":"Try again","sessionId":"session-1"}}\n\n',
    ]);

    await chatApi.parseStream(response, {
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError,
    });

    expect(onError).toHaveBeenCalledWith({
      message: 'Try again',
      sessionId: 'session-1',
    });
  });

  it('rejects a stream that closes without a terminal event', async () => {
    const response = streamResponse([
      'data: {"type":"token","data":"partial"}\n\n',
    ]);

    await expect(
      chatApi.parseStream(response, {
        onToken: vi.fn(),
        onDone: vi.fn(),
        onError: vi.fn(),
      })
    ).rejects.toThrow('connection closed');
  });
});
