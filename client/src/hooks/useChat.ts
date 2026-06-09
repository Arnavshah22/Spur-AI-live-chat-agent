import { useState, useCallback, useEffect, useRef } from 'react';
import { chatApi } from '../services/chatApi';
import { generateId } from '../utils';
import {
  isPushNotificationSupported,
  subscribeToPush,
  hasActiveSubscription,
} from '../services/pushNotifications';
import type { ErrorEventData, Message } from '../types';

const SESSION_KEY = 'spur_session_id';

export type NotificationStatus =
  | 'unsupported'
  | 'idle'
  | 'enabling'
  | 'enabled'
  | 'denied'
  | 'error';

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] =
    useState<NotificationStatus>(() => {
      if (!isPushNotificationSupported()) return 'unsupported';
      return Notification.permission === 'denied' ? 'denied' : 'idle';
    });
  const sessionIdRef = useRef<string | null>(localStorage.getItem(SESSION_KEY));
  const messageAbortControllerRef = useRef<AbortController | null>(null);
  const historyAbortControllerRef = useRef<AbortController | null>(null);
  const conversationVersionRef = useRef(0);

  const storeSessionId = useCallback((sessionId: string) => {
    sessionIdRef.current = sessionId;
    localStorage.setItem(SESSION_KEY, sessionId);
  }, []);

  // Check for existing push subscription on mount
  useEffect(() => {
    if (!isPushNotificationSupported()) return;
    
    const checkSubscriptionStatus = async () => {
      const isSubscribed = await hasActiveSubscription();
      
      if (isSubscribed && Notification.permission === 'granted') {
        setNotificationStatus('enabled');
      } else if (Notification.permission === 'denied') {
        setNotificationStatus('denied');
      } else if (!isSubscribed && Notification.permission === 'granted') {
        // Permission granted but no subscription - show prompt
        setNotificationStatus('idle');
      }
    };

    // Check immediately on mount
    checkSubscriptionStatus();

    // Recheck when app becomes visible (user returns to app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSubscriptionStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    const abortController = new AbortController();
    const version = conversationVersionRef.current;
    historyAbortControllerRef.current = abortController;
    setIsLoadingHistory(true);

    chatApi
      .getHistory(sessionId, abortController.signal)
      .then((data) => {
        if (
          abortController.signal.aborted ||
          conversationVersionRef.current !== version
        ) {
          return;
        }

        if (!data) {
          localStorage.removeItem(SESSION_KEY);
          sessionIdRef.current = null;
          return;
        }

        setMessages(
          data.messages.map((message) => ({
            id: message.id,
            sender: message.sender,
            text: message.text,
            timestamp: message.createdAt,
            isError: message.status === 'failed',
          }))
        );
      })
      .catch((historyError) => {
        if (
          !isAbortError(historyError) &&
          conversationVersionRef.current === version
        ) {
          setError(
            'We could not load your conversation history. Your session has been preserved.'
          );
        }
      })
      .finally(() => {
        if (
          conversationVersionRef.current === version &&
          historyAbortControllerRef.current === abortController
        ) {
          setIsLoadingHistory(false);
          historyAbortControllerRef.current = null;
        }
      });

    return () => abortController.abort();
  }, []);

  useEffect(() => {
    return () => {
      messageAbortControllerRef.current?.abort();
      historyAbortControllerRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming || isLoadingHistory) return;

      const version = conversationVersionRef.current;
      const abortController = new AbortController();
      messageAbortControllerRef.current = abortController;

      const userMessage: Message = {
        id: generateId(),
        sender: 'user',
        text: trimmed,
        timestamp: new Date().toISOString(),
      };

      const aiMessageId = generateId();
      const aiMessage: Message = {
        id: aiMessageId,
        sender: 'ai',
        text: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((previous) => [...previous, userMessage, aiMessage]);
      setIsStreaming(true);
      setError(null);

      const isCurrentConversation = () =>
        !abortController.signal.aborted &&
        conversationVersionRef.current === version;

      const handleErrorEvent = (data: ErrorEventData) => {
        if (!isCurrentConversation()) return;
        if (data.sessionId) storeSessionId(data.sessionId);

        setMessages((previous) =>
          previous.map((message) =>
            message.id === aiMessageId
              ? {
                  ...message,
                  isStreaming: false,
                  text: data.message,
                  isError: true,
                }
              : message
          )
        );
        setError(data.message);
      };

      try {
        const response = await chatApi.sendMessage(
          trimmed,
          sessionIdRef.current || undefined,
          abortController.signal
        );

        await chatApi.parseStream(response, {
          onToken: (token) => {
            if (!isCurrentConversation()) return;
            setMessages((previous) =>
              previous.map((message) =>
                message.id === aiMessageId
                  ? { ...message, text: message.text + token }
                  : message
              )
            );
          },
          onDone: (data) => {
            if (!isCurrentConversation()) return;
            storeSessionId(data.sessionId);
            setMessages((previous) =>
              previous.map((message) =>
                message.id === aiMessageId
                  ? { ...message, isStreaming: false, text: data.reply }
                  : message
              )
            );
          },
          onError: handleErrorEvent,
        });
      } catch (requestError) {
        if (!isCurrentConversation() || isAbortError(requestError)) return;

        const errorMessage =
          requestError instanceof Error
            ? requestError.message
            : 'Something went wrong. Please try again.';
        handleErrorEvent({ message: errorMessage });
      } finally {
        if (conversationVersionRef.current === version) {
          setIsStreaming(false);
        }
        if (messageAbortControllerRef.current === abortController) {
          messageAbortControllerRef.current = null;
        }
      }
    },
    [isLoadingHistory, isStreaming, storeSessionId]
  );

  const clearError = useCallback(() => setError(null), []);

  const enableNotifications = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    if (!sessionId || notificationStatus === 'enabling') return false;

    if (!isPushNotificationSupported()) {
      setNotificationStatus('unsupported');
      return false;
    }

    setNotificationStatus('enabling');
    const isSubscribed = await subscribeToPush(sessionId);

    if (isSubscribed) {
      setNotificationStatus('enabled');
      return true;
    }

    setNotificationStatus(
      Notification.permission === 'denied' ? 'denied' : 'error'
    );
    return false;
  }, [notificationStatus]);

  const startNewConversation = useCallback(() => {
    conversationVersionRef.current += 1;
    messageAbortControllerRef.current?.abort();
    historyAbortControllerRef.current?.abort();
    messageAbortControllerRef.current = null;
    historyAbortControllerRef.current = null;
    localStorage.removeItem(SESSION_KEY);
    sessionIdRef.current = null;
    setMessages([]);
    setError(null);
    setIsStreaming(false);
    setIsLoadingHistory(false);
    setNotificationStatus((current) =>
      current === 'unsupported' || current === 'denied' ? current : 'idle'
    );
  }, []);

  return {
    messages,
    isStreaming,
    isLoadingHistory,
    isBusy: isStreaming || isLoadingHistory,
    error,
    sessionId: sessionIdRef.current,
    sendMessage,
    clearError,
    startNewConversation,
    enableNotifications,
    notificationStatus,
  };
}
