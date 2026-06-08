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
    <div className="chat-gutter flex h-full w-full min-w-0 flex-col items-center justify-center py-8">
      {/* Brand Avatar */}
      <div
        className="flex items-center justify-center mb-5"
        style={{ 
          width: '56px',
          height: '56px',
          borderRadius: '8px',
          background: 'var(--color-kinpaku-gold)',
          boxShadow: 'var(--shadow-bubble)',
          animation: 'fadeIn 0.3s ease-out' 
        }}
      >
        <span className="font-bold" style={{ color: 'var(--color-lacquer-deep)', fontSize: '1.25rem' }}>A</span>
      </div>

      <h2
        className="font-semibold mb-1.5"
        style={{ 
          fontSize: '1.02rem',
          color: 'var(--color-champagne)',
          animation: 'fadeIn 0.3s ease-out 0.05s both' 
        }}
      >
        Welcome to Acme Support
      </h2>
      <p
        className="mb-8 max-w-xs text-center sm:max-w-sm"
        style={{ 
          fontSize: '0.85rem',
          lineHeight: '1.65',
          color: 'var(--color-text-muted)',
          animation: 'fadeIn 0.3s ease-out 0.1s both' 
        }}
      >
        Choose a topic below or type your question.
      </p>

      <div className="flex w-full max-w-md flex-wrap justify-center gap-2 sm:max-w-lg">
        {EMPTY_SUGGESTIONS.map((suggestion, i) => (
          <button
            key={suggestion}
            onClick={() => onSuggestedClick?.(suggestion)}
            className="max-w-full font-medium text-center transition-all duration-200"
            style={{
              fontSize: '0.85rem',
              padding: '10px 18px',
              minHeight: '44px',
              borderRadius: '20px',
              background: 'var(--color-graphite-2)',
              color: 'var(--color-champagne)',
              border: '1px solid var(--color-gold-hairline)',
              animation: `quickReplyIn 0.3s ease-out ${0.15 + i * 0.05}s both`,
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-graphite)';
              e.currentTarget.style.borderColor = 'var(--color-gold-hairline-strong)';
              e.currentTarget.style.color = 'var(--color-kinpaku-gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-graphite-2)';
              e.currentTarget.style.borderColor = 'var(--color-gold-hairline)';
              e.currentTarget.style.color = 'var(--color-champagne)';
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

      // Skip empty streaming AI messages (typing indicator will show instead)
      if (msg.sender === 'ai' && msg.isStreaming && msg.text === '') {
        continue;
      }

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
    <div ref={containerRef} onScroll={handleScroll} className="h-full min-w-0 overflow-x-hidden overflow-y-auto">
      <div className="chat-gutter w-full min-w-0 py-6">
        <div className="flex flex-col" style={{ gap: '24px' }}>
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
