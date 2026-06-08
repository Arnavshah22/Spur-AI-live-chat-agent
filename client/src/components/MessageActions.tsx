import { useState, useCallback } from 'react';

interface MessageActionsProps {
  isUser: boolean;
  messageText: string;
}

export default function MessageActions({ isUser, messageText }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API not available — silent fail
    }
  }, [messageText]);

  return (
    <div
      className={`absolute -top-9 ${isUser ? 'right-0' : 'left-0'} flex items-center gap-0.5 rounded-lg z-10`}
      style={{ 
        padding: '4px',
        background: 'var(--color-graphite)',
        border: '1px solid var(--color-gold-hairline)',
        boxShadow: 'var(--shadow-actions)',
        animation: 'fadeIn 0.12s ease-out' 
      }}
    >
      {/* Copy */}
      <button
        onClick={handleCopy}
        className="rounded-md flex items-center justify-center transition-all duration-150"
        style={{
          width: '44px',
          height: '44px',
          minWidth: '44px',
          minHeight: '44px',
          color: 'var(--color-text-muted)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-champagne)';
          e.currentTarget.style.background = 'var(--color-graphite-2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
        aria-label="Copy message"
        title={copied ? 'Copied!' : 'Copy'}
      >
        {copied ? (
          <svg className="w-3.5 h-3.5" style={{ color: 'var(--color-verdigris-patina)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
        )}
      </button>

      {/* Reply */}
      <button
        className="rounded-md flex items-center justify-center transition-all duration-150"
        style={{
          width: '44px',
          height: '44px',
          minWidth: '44px',
          minHeight: '44px',
          color: 'var(--color-text-muted)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-champagne)';
          e.currentTarget.style.background = 'var(--color-graphite-2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
        aria-label="Reply"
        title="Reply"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
      </button>

      {/* React */}
      <button
        className="rounded-md flex items-center justify-center transition-all duration-150"
        style={{
          width: '44px',
          height: '44px',
          minWidth: '44px',
          minHeight: '44px',
          color: 'var(--color-text-muted)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-champagne)';
          e.currentTarget.style.background = 'var(--color-graphite-2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
        aria-label="Add reaction"
        title="React"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
      </button>
    </div>
  );
}
