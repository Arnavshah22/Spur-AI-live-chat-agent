import type { Message } from '../types';
import MessageBubble from './MessageBubble';

interface MessageGroupProps {
  sender: 'user' | 'ai';
  messages: Message[];
}

export default function MessageGroup({ sender, messages }: MessageGroupProps) {
  const isUser = sender === 'user';

  return (
    <div className={`flex w-full min-w-0 ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && (
        <div className="mt-6 flex-shrink-0">
          <div
            className="flex items-center justify-center shadow-sm"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'var(--color-kinpaku-gold)',
            }}
          >
            <span className="font-bold" style={{ color: 'var(--color-lacquer-deep)', fontSize: '0.7rem' }}>A</span>
          </div>
        </div>
      )}

      <div
        className={`chat-message-column ${
          isUser ? 'chat-message-column--user' : 'chat-message-column--agent'
        }`}
      >
        {!isUser && (
          <span className="mb-1 px-0.5 font-medium" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Acme Support
          </span>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isFirstInGroup={index === 0}
            isLastInGroup={index === messages.length - 1}
            animationDelay={index * 30}
          />
        ))}
      </div>
    </div>
  );
}
