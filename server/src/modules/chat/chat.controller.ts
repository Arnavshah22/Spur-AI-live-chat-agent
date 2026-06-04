import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service.js';
import { createChildLogger } from '../../config/logger.js';
import type { SendMessageInput, GetHistoryParams } from './chat.schema.js';

const log = createChildLogger('chatController');

export function createChatController(chatService: ChatService) {
  return {
    async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
      const abortController = new AbortController();
      const handleClose = () => {
        if (!res.writableEnded) {
          abortController.abort();
        }
      };
      res.on('close', handleClose);

      try {
        const input = req.body as SendMessageInput;
        const wantsStream = req.get('accept')?.includes('text/event-stream');

        if (!wantsStream) {
          for await (const event of chatService.sendMessage(
            input,
            abortController.signal
          )) {
            if (event.type === 'done') {
              res.json(event.data);
              return;
            }
            if (event.type === 'error') {
              const { statusCode, ...body } = event.data;
              res.status(statusCode).json({
                status: 'error',
                ...body,
              });
              return;
            }
          }

          if (!res.destroyed && !res.writableEnded && !res.headersSent) {
            res.status(499).json({
              status: 'error',
              code: 'REQUEST_CANCELLED',
              message: 'Request cancelled',
            });
          }
          return;
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        for await (const event of chatService.sendMessage(
          input,
          abortController.signal
        )) {
          if (res.destroyed || res.writableEnded) {
            break;
          }
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }

        if (!res.destroyed && !res.writableEnded) {
          res.end();
        }
      } catch (error) {
        log.error({ err: error }, 'Unexpected error in sendMessage handler');

        if (!res.headersSent) {
          next(error);
          return;
        }

        if (!res.destroyed && !res.writableEnded) {
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              data: {
                message:
                  'Something went wrong while contacting our support agent. Please try again.',
              },
            })}\n\n`
          );
          res.end();
        }
      } finally {
        res.off('close', handleClose);
      }
    },

    async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { sessionId } = req.params as unknown as GetHistoryParams;
        const conversation = await chatService.getHistory(sessionId);
        res.json({ status: 'ok', data: conversation });
      } catch (error) {
        next(error);
      }
    },
  };
}

export type ChatController = ReturnType<typeof createChatController>;
