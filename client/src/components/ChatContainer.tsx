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

  // Show quick replies when agent just responded and user hasn't typed yet
  const lastMessage = messages[messages.length - 1];
  const showQuickReplies =
    messages.length > 0 &&
    !isStreaming &&
    lastMessage?.sender === 'ai' &&
    !lastMessage?.isError;

  return (
    <div className="h-full w-full bg-[#0B1020] flex justify-center">
      <div className="w-full h-full flex flex-col relative bg-[#0B1020]">
        {/* ── Header ── */}
        <ChatHeader
          onNewChat={startNewConversation}
          isLoadingHistory={isLoadingHistory}
        />

        {/* ── Error Banner ── */}
        {error && <ErrorBanner message={error} onDismiss={clearError} />}

        {/* ── Message Area ── */}
        <div className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            onSuggestedClick={sendMessage}
          />
        </div>

        {/* ── Footer (Quick Replies + Input) ── */}
        <div className="flex-shrink-0 flex flex-col gap-4 pb-4 lg:pb-6">
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
