import { useChat } from '../hooks/useChat';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';
import ErrorBanner from './ErrorBanner';

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
  } = useChat();

  const lastMessage = messages[messages.length - 1];
  const showQuickReplies =
    messages.length > 0 &&
    !isStreaming &&
    lastMessage?.sender === 'ai' &&
    !lastMessage?.isError;

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
