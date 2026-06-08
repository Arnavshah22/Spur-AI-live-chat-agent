import webpush from 'web-push';
import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

/**
 * Push Notification Service
 * Handles Web Push API notifications for stale conversation follow-ups
 */

// Configure web-push with VAPID keys
if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    env.VAPID_SUBJECT || 'mailto:support@acmestore.com',
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  /**
   * Subscribe a user to push notifications
   */
  async subscribe(
    conversationId: string,
    subscription: PushSubscriptionData,
    userAgent?: string
  ): Promise<void> {
    try {
      await prisma.pushSubscription.upsert({
        where: {
          conversationId_endpoint: {
            conversationId,
            endpoint: subscription.endpoint,
          },
        },
        create: {
          conversationId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent,
        },
        update: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent,
        },
      });

      logger.info({ conversationId }, 'Push subscription created');
    } catch (error) {
      logger.error({ error, conversationId }, 'Failed to create push subscription');
      throw error;
    }
  }

  /**
   * Send push notification to all subscribers of a conversation
   */
  async sendNotification(
    conversationId: string,
    payload: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: Record<string, unknown>;
    }
  ): Promise<void> {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { conversationId },
      });

      if (subscriptions.length === 0) {
        logger.debug({ conversationId }, 'No push subscriptions found');
        return;
      }

      const notificationPayload = JSON.stringify(payload);

      const results = await Promise.allSettled(
        subscriptions.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              notificationPayload
            );

            logger.info(
              { conversationId, endpoint: sub.endpoint },
              'Push notification sent'
            );
          } catch (error: any) {
            // Handle expired/invalid subscriptions
            if (error.statusCode === 410 || error.statusCode === 404) {
              logger.info(
                { conversationId, endpoint: sub.endpoint },
                'Removing expired push subscription'
              );
              await prisma.pushSubscription.delete({ where: { id: sub.id } });
            } else {
              logger.error(
                { error, conversationId, endpoint: sub.endpoint },
                'Failed to send push notification'
              );
              throw error;
            }
          }
        })
      );

      const successCount = results.filter((r: PromiseSettledResult<void>) => r.status === 'fulfilled').length;
      const failureCount = results.filter((r: PromiseSettledResult<void>) => r.status === 'rejected').length;

      logger.info(
        { conversationId, successCount, failureCount },
        'Push notifications sent'
      );
    } catch (error) {
      logger.error({ error, conversationId }, 'Failed to send push notifications');
      throw error;
    }
  }

  /**
   * Unsubscribe a user from push notifications
   */
  async unsubscribe(conversationId: string, endpoint: string): Promise<void> {
    try {
      await prisma.pushSubscription.deleteMany({
        where: {
          conversationId,
          endpoint,
        },
      });

      logger.info({ conversationId, endpoint }, 'Push subscription removed');
    } catch (error) {
      logger.error({ error, conversationId }, 'Failed to remove push subscription');
      throw error;
    }
  }

  /**
   * Get VAPID public key for client-side subscription
   */
  getPublicKey(): string | null {
    return env.VAPID_PUBLIC_KEY || null;
  }
}

export const pushNotificationService = new PushNotificationService();
