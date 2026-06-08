import { useEffect, useRef } from 'react';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message, onDismiss]);

  return (
    <div
      className="flex-shrink-0"
      style={{ 
        background: 'oklch(58% 0.15 35 / 0.08)',
        borderBottom: '1px solid oklch(58% 0.15 35 / 0.15)',
        animation: 'fadeIn 0.2s ease-out' 
      }}
    >
      <div className="chat-gutter flex w-full min-w-0 items-center justify-between gap-2 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'oklch(58% 0.15 35 / 0.12)' }}
          >
            <svg className="w-3 h-3" style={{ color: 'var(--color-vermilion-warning)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="min-w-0" style={{ fontSize: '0.85rem', color: 'var(--color-vermilion-warning)' }}>{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-md flex items-center justify-center transition-all duration-150"
          style={{
            width: '44px',
            height: '44px',
            minWidth: '44px',
            minHeight: '44px',
            color: 'oklch(58% 0.15 35 / 0.6)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-vermilion-warning)';
            e.currentTarget.style.background = 'oklch(58% 0.15 35 / 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'oklch(58% 0.15 35 / 0.6)';
            e.currentTarget.style.background = 'transparent';
          }}
          aria-label="Dismiss error"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
