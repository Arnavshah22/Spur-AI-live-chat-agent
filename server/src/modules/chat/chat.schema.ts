import { z } from 'zod';

export function createSendMessageSchema(maxMessageLength: number) {
  return z.object({
    message: z
      .string()
      .trim()
      .min(1, 'Message cannot be empty')
      .max(
        maxMessageLength,
        `Message too long (max ${maxMessageLength} characters)`
      ),
    sessionId: z.string().uuid('Invalid session ID').optional(),
  });
}

export const sendMessageSchema = createSendMessageSchema(2000);

export const getHistoryParamsSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetHistoryParams = z.infer<typeof getHistoryParamsSchema>;
