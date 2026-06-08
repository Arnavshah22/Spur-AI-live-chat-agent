import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { pushNotificationService } from '../push/push.service.js';

/**
 * Follow-up Service
 * Detects stale conversations and sends automated follow-up notifications
 */

const STALE_THRESHOLD_MINUTES = 30; // Conversation becomes stale after 30 minutes
const FOLLOW_UP_MESSAGES = [
  "Still there? 👋 Let me know if you need any help!",
  "Hey! Did you find what you were looking for? Happy to help if you have more questions!",
  "We're here if you need us! Feel free to continue the conversation anytime.",
];

export class FollowUpService {
  /**
   * Find conversations that have gone stale and haven't received a follow-up yet
   */
  async findStaleConversations(): Promise<
    Array<{ id: string; lastActivityAt: Date }>
  > {
    const thresholdDate = new Date(Date.now() - STALE_THRESHOLD_MINUTES * 60 * 1000);

    const staleConversations = await prisma.conversation.findMany({
      where: {
        isActive: true,
        lastActivityAt: {
          lt: thresholdDate,
        },
        followUpSentAt: null,
      },
      select: {
        id: true,
        lastActivityAt: true,
      },
    });

    return staleConversations;
  }

  /**
   * Send follow-up notification for a stale conversation
   */
  async sendFollowUp(conversationId: string): Promise<void> {
    try {
      // Get random follow-up message
      const message =
        FOLLOW_UP_MESSAGES[Math.floor(Math.random() * FOLLOW_UP_MESSAGES.length)];

      // Send push notification
      await pushNotificationService.sendNotification(conversationId, {
        title: 'Acme Support',
        body: message,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'follow-up',
        data: {
          url: '/',
          conversationId,
          type: 'follow-up',
        },
      });

      // Mark follow-up as sent
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { followUpSentAt: new Date() },
      });

      logger.info({ conversationId }, 'Follow-up notification sent');
    } catch (error) {
      logger.error({ error, conversationId }, 'Failed to send follow-up');
      throw error;
    }
  }

  /**
   * Process all stale conversations and send follow-ups
   */
  async processStaleConversations(): Promise<{
    processed: number;
    sent: number;
    failed: number;
  }> {
    try {
      const staleConversations = await this.findStaleConversations();

      logger.info(
        { count: staleConversations.length },
        'Processing stale conversations'
      );

      let sent = 0;
      let failed = 0;

      for (const conversation of staleConversations) {
        try {
          await this.sendFollowUp(conversation.id);
          sent++;
        } catch (error) {
          failed++;
          logger.error(
            { error, conversationId: conversation.id },
            'Failed to process stale conversation'
          );
        }
      }

      logger.info(
        { processed: staleConversations.length, sent, failed },
        'Stale conversations processed'
      );

      return {
        processed: staleConversations.length,
        sent,
        failed,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to process stale conversations');
      throw error;
    }
  }

  /**
   * Update conversation activity timestamp
   */
  async updateActivity(conversationId: string): Promise<void> {
    try {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastActivityAt: new Date(),
          isActive: true,
        },
      });
    } catch (error) {
      logger.error({ error, conversationId }, 'Failed to update conversation activity');
      // Don't throw - this is non-critical
    }
  }

  /**
   * Mark conversation as inactive (user closed chat, etc.)
   */
  async markInactive(conversationId: string): Promise<void> {
    try {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { isActive: false },
      });

      logger.info({ conversationId }, 'Conversation marked as inactive');
    } catch (error) {
      logger.error({ error, conversationId }, 'Failed to mark conversation inactive');
    }
  }
}

export const followUpService = new FollowUpService();
