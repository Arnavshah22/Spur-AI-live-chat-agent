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

  // Dynamic border radius — message tails
  const userRadius = isLastInGroup
    ? '16px 16px 4px 16px'   // tail on bottom-right for last
    : '16px 16px 16px 16px';
  const agentRadius = isLastInGroup
    ? '16px 16px 16px 4px'   // tail on bottom-left for last
    : '16px 16px 16px 16px';

  if (isUser) {
    return (
      <div
        className={classNames(
          'flex justify-end relative',
          isFirstInGroup ? '' : 'mt-[3px]'
        )}
        style={{ animation: `messageSlideIn 0.25s ease-out ${animationDelay}ms both` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col items-end relative">
          {/* Hover Actions */}
          {isHovered && <MessageActions isUser messageText={message.text} />}

          <div
            className="bg-[#635BFF] text-white text-[14px] leading-[1.6] shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#5B52E8] whitespace-pre-wrap"
            style={{ padding: '8px 12px', borderRadius: userRadius, wordBreak: 'break-word' }}
          >
            {message.text}
          </div>

          {/* Timestamp + Read Receipt (only on last in group) */}
          {isLastInGroup && (
            <div className="flex items-center gap-1 mt-1 px-0.5">
              <time className="text-[11px] text-[#64748B]/70">
                {formatTime(message.timestamp)}
              </time>
              {/* Read receipt — double check */}
              <svg className="w-3 h-3 text-[#94A3B8]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
        'flex relative',
        isFirstInGroup ? '' : 'mt-[3px]'
      )}
      style={{ animation: `messageSlideIn 0.25s ease-out ${animationDelay}ms both` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col relative">
        {/* Hover Actions */}
        {isHovered && <MessageActions isUser={false} messageText={message.text} />}

        <div
          className={classNames(
            'text-[14px] leading-[1.6] shadow-[0_1px_2px_rgba(0,0,0,0.08)] whitespace-pre-wrap',
            isError
              ? 'bg-red-500/5 border border-red-500/15 text-red-300'
              : 'bg-[#161D2F] text-[#F9FAFB] border border-[#1E293B]'
          )}
          style={{ padding: '8px 12px', borderRadius: agentRadius, wordBreak: 'break-word' }}
        >
          {message.text}
          {message.isStreaming && message.text && (
            <span className="inline-block w-[2px] h-4 bg-[#94A3B8] ml-1 align-text-bottom animate-pulse" />
          )}
        </div>

        {/* Timestamp (only on last in group) */}
        {isLastInGroup && (
          <time className="text-[11px] text-[#64748B]/70 mt-1 px-0.5">
            {formatTime(message.timestamp)}
          </time>
        )}
      </div>
    </div>
  );
}
