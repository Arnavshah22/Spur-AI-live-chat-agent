import { z } from 'zod';

export const pushSubscriptionSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  subscription: z.object({
    endpoint: z.string().url('Invalid endpoint URL'),
    keys: z.object({
      p256dh: z.string().min(1, 'p256dh key is required'),
      auth: z.string().min(1, 'auth key is required'),
    }),
  }),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
