import { useState } from 'react';
import type { Message } from '../types';
import { formatTime, classNames } from '../utils';
import MessageActions from './MessageActions';

interface MessageBubbleProps {
  message: Message;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  animationDelay?: number;
}

export default function MessageBubble({
  message,
  isFirstInGroup,
  isLastInGroup,
  animationDelay = 0,
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isUser = message.sender === 'user';
  const isError = message.isError;

  // Dynamic border radius — small, subtle tails (Impeccable style)
  const userRadius = isLastInGroup
    ? '8px 8px 2px 8px'   // tail on bottom-right for last
    : '8px 8px 8px 8px';
  const agentRadius = isLastInGroup
    ? '8px 8px 8px 2px'   // tail on bottom-left for last
    : '8px 8px 8px 8px';

  const bubbleTextStyle = {
    padding: '14px 16px',
    minHeight: '44px',
    maxWidth: '100%',
    overflowWrap: 'break-word' as const,
    wordBreak: 'break-word' as const,
    fontSize: '1.02rem',
    lineHeight: '1.65',
    fontWeight: 400,
    boxShadow: 'var(--shadow-bubble)',
  };

  if (isUser) {
    return (
      <div
        className={classNames(
          'relative flex w-full min-w-0 justify-end',
          isFirstInGroup ? '' : 'mt-[4px]'
        )}
        style={{ animation: `messageSlideIn 0.25s ease-out ${animationDelay}ms both` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex w-full min-w-0 max-w-full flex-col items-end">
          {/* Hover Actions */}
          {isHovered && <MessageActions isUser messageText={message.text} />}

          <div
            className="w-full min-w-0 whitespace-pre-wrap transition-all duration-150"
            style={{
              ...bubbleTextStyle,
              borderRadius: userRadius,
              background: 'var(--color-kinpaku-gold)',
              color: 'var(--color-lacquer-deep)',
              border: '1px solid var(--color-gold-hairline-strong)',
            }}
          >
            {message.text}
          </div>

          {/* Timestamp + Read Receipt (only on last in group) */}
          {isLastInGroup && (
            <div className="flex items-center gap-1 mt-2 px-0.5">
              <time className="text-[0.72rem] font-medium" style={{ color: 'var(--color-text-faint)', letterSpacing: '0.01em' }}>
                {formatTime(message.timestamp)}
              </time>
              {/* Read receipt — double check */}
              <svg className="w-3 h-3" style={{ color: 'var(--color-text-faint)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Agent message
  return (
    <div
      className={classNames(
        'relative flex w-full min-w-0',
        isFirstInGroup ? '' : 'mt-[4px]'
      )}
      style={{ animation: `messageSlideIn 0.25s ease-out ${animationDelay}ms both` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex w-full min-w-0 max-w-full flex-col">
        {/* Hover Actions */}
        {isHovered && <MessageActions isUser={false} messageText={message.text} />}

        <div
          className="w-full min-w-0 whitespace-pre-wrap transition-all duration-150"
          style={{
            ...bubbleTextStyle,
            borderRadius: agentRadius,
            background: isError ? 'oklch(58% 0.15 35 / 0.08)' : 'var(--color-raised-lacquer)',
            color: isError ? 'var(--color-vermilion-warning)' : 'var(--color-text-warm)',
            border: isError ? '1px solid oklch(58% 0.15 35 / 0.2)' : '1px solid var(--color-gold-hairline)',
          }}
        >
          {message.text}
          {message.isStreaming && message.text && (
            <span className="inline-block w-[2px] h-4 ml-1 align-text-bottom animate-pulse" style={{ background: 'var(--color-kinpaku-gold)' }} />
          )}
        </div>

        {/* Timestamp (only on last in group) */}
        {isLastInGroup && (
          <time className="text-[0.72rem] font-medium mt-2 px-0.5" style={{ color: 'var(--color-text-faint)', letterSpacing: '0.01em' }}>
            {formatTime(message.timestamp)}
          </time>
        )}
      </div>
    </div>
  );
}
