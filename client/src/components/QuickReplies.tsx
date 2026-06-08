interface QuickRepliesProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export default function QuickReplies({ suggestions, onSelect }: QuickRepliesProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="chat-gutter quick-replies min-w-0 flex-shrink-0">
      <div className="quick-replies__inner">
        <span
          className="quick-replies__label text-center font-medium uppercase"
          style={{
            color: 'var(--color-text-faint)',
            fontFamily: 'SFMono-Regular, Roboto Mono, Consolas, monospace',
          }}
        >
          Suggestions
        </span>
        <div className="quick-replies__grid">
          {suggestions.map((suggestion, i) => (
            <button
              key={suggestion}
              onClick={() => onSelect(suggestion)}
              className="quick-replies__button font-medium text-center transition-all duration-200"
              style={{
                borderRadius: '4px',
                background: 'var(--color-graphite-2)',
                color: 'var(--color-champagne)',
                border: '1px solid var(--color-gold-hairline)',
                animation: `quickReplyIn 0.25s ease-out ${i * 0.05}s both`,
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
    </div>
  );
}
