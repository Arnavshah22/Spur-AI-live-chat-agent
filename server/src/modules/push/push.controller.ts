import type { Request, Response, NextFunction } from 'express';
import { pushNotificationService } from '../../services/push/push.service.js';
import type { PushSubscriptionInput } from './push.schema.js';
import { logger } from '../../config/logger.js';

class PushController {
  /**
   * Get VAPID public key for client-side push subscription
   */
  getPublicKey = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const publicKey = pushNotificationService.getPublicKey();

      if (!publicKey) {
        res.status(503).json({
          status: 'error',
          message: 'Push notifications not configured',
        });
        return;
      }

      res.json({
        status: 'ok',
        publicKey,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Subscribe to push notifications
   */
  subscribe = async (
    req: Request<{}, {}, PushSubscriptionInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { conversationId, subscription } = req.body;
      const userAgent = req.get('user-agent');

      await pushNotificationService.subscribe(
        conversationId,
        subscription,
        userAgent
      );

      logger.info({ conversationId }, 'User subscribed to push notifications');

      res.json({
        status: 'ok',
        message: 'Subscribed to push notifications',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unsubscribe from push notifications
   */
  unsubscribe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { conversationId, endpoint } = req.body;

      if (!conversationId || !endpoint) {
        res.status(400).json({
          status: 'error',
          message: 'conversationId and endpoint are required',
        });
        return;
      }

      await pushNotificationService.unsubscribe(conversationId, endpoint);

      logger.info({ conversationId }, 'User unsubscribed from push notifications');

      res.json({
        status: 'ok',
        message: 'Unsubscribed from push notifications',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const pushController = new PushController();
