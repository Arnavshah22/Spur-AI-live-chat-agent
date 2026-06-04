import { useMemo } from 'react';
import type { Message } from '../types';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { formatDate, shouldShowDaySeparator } from '../utils';
import MessageGroup from './MessageGroup';
import DaySeparator from './DaySeparator';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  onSuggestedClick?: (text: string) => void;
}

const EMPTY_SUGGESTIONS = [
  "What's your return policy?",
  'Do you ship internationally?',
  'What payment methods do you accept?',
  'What are your support hours?',
];

function EmptyState({ onSuggestedClick }: { onSuggestedClick?: (text: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      {/* Brand Avatar */}
      <div
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] flex items-center justify-center mb-5 shadow-lg"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      >
        <span className="text-white text-xl font-bold">A</span>
      </div>

      <h2
        className="text-[16px] font-semibold text-[#F9FAFB] mb-1.5"
        style={{ animation: 'fadeIn 0.3s ease-out 0.05s both' }}
      >
        Welcome to Acme Support
      </h2>
      <p
        className="text-[13px] text-[#94A3B8] mb-8 text-center max-w-xs leading-relaxed"
        style={{ animation: 'fadeIn 0.3s ease-out 0.1s both' }}
      >
        We're here to help. Choose a topic below or type your question.
      </p>

      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {EMPTY_SUGGESTIONS.map((suggestion, i) => (
          <button
            key={suggestion}
            onClick={() => onSuggestedClick?.(suggestion)}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#94A3B8] bg-[#161D2F] border border-[#1E293B] hover:border-[#334155] hover:text-[#F9FAFB] hover:bg-[#1E293B] transition-all duration-150"
            style={{
              animation: `quickReplyIn 0.3s ease-out ${0.15 + i * 0.05}s both`,
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Builds a render list interleaving day separators and message groups.
 */
function useRenderItems(messages: Message[], isStreaming: boolean) {
  return useMemo(() => {
    const items: Array<
      | { type: 'separator'; key: string; label: string }
      | { type: 'group'; key: string; sender: 'user' | 'ai'; messages: Message[] }
    > = [];

    let groupBuffer: Message[] = [];
    let currentSender: 'user' | 'ai' | null = null;

    const flushGroup = () => {
      if (groupBuffer.length > 0 && currentSender) {
        items.push({
          type: 'group',
          key: `group-${groupBuffer[0]!.id}`,
          sender: currentSender,
          messages: [...groupBuffer],
        });
        groupBuffer = [];
      }
    };

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]!;
      const prev = i > 0 ? messages[i - 1] : undefined;

      // Insert day separator if needed
      if (shouldShowDaySeparator(prev, msg)) {
        flushGroup();
        items.push({
          type: 'separator',
          key: `sep-${msg.id}`,
          label: formatDate(msg.timestamp),
        });
        currentSender = null;
      }

      // Group or start new group
      if (msg.sender === currentSender) {
        groupBuffer.push(msg);
      } else {
        flushGroup();
        currentSender = msg.sender;
        groupBuffer = [msg];
      }
    }

    flushGroup();
    return items;
  }, [messages, isStreaming]);
}

export default function MessageList({ messages, isStreaming, onSuggestedClick }: MessageListProps) {
  const { containerRef, handleScroll } = useAutoScroll([messages]);
  const lastMessage = messages[messages.length - 1];
  const showTypingIndicator = isStreaming && lastMessage?.sender === 'ai' && lastMessage.text === '';
  const renderItems = useRenderItems(messages, isStreaming);

  if (messages.length === 0) {
    return <EmptyState onSuggestedClick={onSuggestedClick} />;
  }

  return (
    <div ref={containerRef} onScroll={handleScroll} className="h-full overflow-y-auto">
      <div className="max-w-[800px] mx-auto px-6 py-6">
        <div className="flex flex-col gap-4">
          {renderItems.map((item) => {
            if (item.type === 'separator') {
              return <DaySeparator key={item.key} label={item.label} />;
            }
            return (
              <MessageGroup
                key={item.key}
                sender={item.sender}
                messages={item.messages}
              />
            );
          })}
        </div>

        {showTypingIndicator && <TypingIndicator />}
      </div>
    </div>
  );
}
