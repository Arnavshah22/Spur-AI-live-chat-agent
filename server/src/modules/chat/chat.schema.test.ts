import { describe, expect, it } from 'vitest';
import { createSendMessageSchema } from './chat.schema.js';

describe('createSendMessageSchema', () => {
  const schema = createSendMessageSchema(10);

  it('rejects whitespace-only messages', () => {
    const result = schema.safeParse({ message: '   ' });
    expect(result.success).toBe(false);
  });

  it('trims valid messages before they reach the service', () => {
    const result = schema.parse({ message: '  hello  ' });
    expect(result.message).toBe('hello');
  });

  it('respects the configured maximum message length', () => {
    const result = schema.safeParse({ message: '12345678901' });
    expect(result.success).toBe(false);
  });
});
