export default function TypingIndicator() {
  return (
    <div
      className="mt-6 flex w-full min-w-0 items-start gap-2"
      style={{ animation: 'messageSlideIn 0.25s ease-out both' }}
    >
      {/* Agent Avatar */}
      <div className="flex-shrink-0">
        <div 
          className="flex items-center justify-center shadow-sm" 
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'var(--color-kinpaku-gold)'
          }}
        >
          <span className="font-bold" style={{ color: 'var(--color-lacquer-deep)', fontSize: '0.7rem' }}>A</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="font-medium" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Acme Support
        </span>

        <div 
          className="rounded-lg rounded-bl-[2px]"
          style={{
            padding: '14px 16px',
            minHeight: '44px',
            background: 'var(--color-raised-lacquer)',
            border: '1px solid var(--color-gold-hairline)'
          }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{ 
                background: 'var(--color-text-muted)',
                animation: 'typingBounce 1.4s ease-in-out infinite 0s' 
              }}
            />
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{ 
                background: 'var(--color-text-muted)',
                animation: 'typingBounce 1.4s ease-in-out infinite 0.2s' 
              }}
            />
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{ 
                background: 'var(--color-text-muted)',
                animation: 'typingBounce 1.4s ease-in-out infinite 0.4s' 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
