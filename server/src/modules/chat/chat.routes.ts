import { Router } from 'express';
import { validateBody, validateParams } from '../../middleware/validateRequest.js';
import { createSendMessageSchema, getHistoryParamsSchema } from './chat.schema.js';
import { createChatController } from './chat.controller.js';
import type { ChatService } from './chat.service.js';

export interface ChatRouterConfig {
  maxMessageLength: number;
}

export function createChatRouter(
  chatService: ChatService,
  config: ChatRouterConfig
): Router {
  const router = Router();
  const controller = createChatController(chatService);

  router.post(
    '/message',
    validateBody(createSendMessageSchema(config.maxMessageLength)),
    controller.sendMessage
  );

  router.get(
    '/history/:sessionId',
    validateParams(getHistoryParamsSchema),
    controller.getHistory
  );

  return router;
}
