interface ChatHeaderProps {
  onNewChat: () => void;
  isLoadingHistory: boolean;
}

export default function ChatHeader({ onNewChat, isLoadingHistory }: ChatHeaderProps) {
  return (
    <header
      className="min-w-0 flex-shrink-0"
      style={{
        borderBottom: '1px solid var(--color-gold-hairline)',
        background: 'var(--color-raised-lacquer)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="chat-gutter flex min-h-[56px] w-full min-w-0 items-center justify-between gap-2 sm:min-h-[64px] sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="relative flex-shrink-0">
            <div
              className="flex h-9 w-9 items-center justify-center shadow-sm"
              style={{
                borderRadius: '6px',
                background: 'var(--color-kinpaku-gold)',
              }}
            >
              <span className="font-bold tracking-tight" style={{ color: 'var(--color-lacquer-deep)', fontSize: '0.875rem' }}>A</span>
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 rounded-full"
              style={{
                width: '10px',
                height: '10px',
                background: 'var(--color-verdigris-patina)',
                border: '2px solid var(--color-raised-lacquer)',
                animation: 'pulseOnline 2s ease-in-out infinite',
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex min-w-0 items-center gap-1.5 sm:gap-2">
              <span className="truncate font-semibold" style={{ fontSize: '0.95rem', color: 'var(--color-champagne)' }}>
                Acme Support
              </span>
              <div className="flex flex-shrink-0 items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-verdigris-patina)' }} />
                <span className="hidden font-medium min-[360px]:inline" style={{ fontSize: '0.75rem', color: 'var(--color-verdigris-patina)' }}>
                  Online
                </span>
              </div>
            </div>
            {!isLoadingHistory && (
              <span className="hidden truncate sm:block" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Typically replies in minutes
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-0.5 md:gap-1">
          <button
            className="hidden h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg transition-all duration-150 md:flex"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-champagne)';
              e.currentTarget.style.background = 'var(--color-graphite)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Search messages"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>

          <button
            onClick={onNewChat}
            className="flex h-11 min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-2 font-medium transition-all duration-150 sm:px-3"
            style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-champagne)';
              e.currentTarget.style.background = 'var(--color-graphite)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="New chat"
          >
            <svg className="h-3.5 w-3.5 sm:h-[14px] sm:w-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">New Chat</span>
          </button>

          <button
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg transition-all duration-150"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-champagne)';
              e.currentTarget.style.background = 'var(--color-graphite)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="More options"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
