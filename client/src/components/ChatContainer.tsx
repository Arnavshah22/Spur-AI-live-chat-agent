import { useChat } from '../hooks/useChat';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';
import ErrorBanner from './ErrorBanner';
import NotificationPrompt from './NotificationPrompt';

const QUICK_SUGGESTIONS = [
  "What's your return policy?",
  'Do you ship internationally?',
  'Track my order',
  'Speak to a human',
];

export default function ChatContainer() {
  const {
    messages,
    isStreaming,
    isLoadingHistory,
    isBusy,
    error,
    sendMessage,
    clearError,
    startNewConversation,
    enableNotifications,
    notificationStatus,
  } = useChat();

  const lastMessage = messages[messages.length - 1];
  const showQuickReplies =
    messages.length > 0 &&
    !isStreaming &&
    lastMessage?.sender === 'ai' &&
    !lastMessage?.isError;
  const showNotificationPrompt =
    messages.length >= 2 && !isLoadingHistory && notificationStatus !== 'enabled';

  return (
    <div className="chat-app">
      <div className="chat-shell">
        <ChatHeader
          onNewChat={startNewConversation}
          isLoadingHistory={isLoadingHistory}
        />

        {error && <ErrorBanner message={error} onDismiss={clearError} />}

        <div className="min-w-0 flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            onSuggestedClick={sendMessage}
          />
        </div>

        <div className="chat-footer flex min-w-0 w-full max-w-full flex-shrink-0 flex-col overflow-x-hidden">
          {showNotificationPrompt && (
            <NotificationPrompt
              status={notificationStatus}
              disabled={isBusy}
              onEnable={enableNotifications}
            />
          )}
          {showQuickReplies && (
            <QuickReplies
              suggestions={QUICK_SUGGESTIONS}
              onSelect={sendMessage}
            />
          )}
          <ChatInput onSend={sendMessage} disabled={isBusy} />
        </div>
      </div>
    </div>
  );
}
