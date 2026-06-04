import type { Message } from '../types';
import MessageBubble from './MessageBubble';

interface MessageGroupProps {
  sender: 'user' | 'ai';
  messages: Message[];
}

export default function MessageGroup({ sender, messages }: MessageGroupProps) {
  const isUser = sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}>
      {/* Agent Avatar Column (only for agent messages) */}
      {!isUser && (
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] flex items-center justify-center shadow-sm">
            <span className="text-white text-[11px] font-bold">A</span>
          </div>
        </div>
      )}

      {/* Messages Column */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 max-w-[75%]`}>
        {/* Sender name (only for agent, first message) */}
        {!isUser && (
          <span className="text-[12px] font-medium text-[#94A3B8] mb-1 px-0.5">
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
