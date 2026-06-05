interface QuickRepliesProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export default function QuickReplies({ suggestions, onSelect }: QuickRepliesProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex-shrink-0 pt-4 pb-3">
      <div className="w-full" style={{ paddingLeft: 'max(1.5rem, 5vw)', paddingRight: 'max(1.5rem, 5vw)' }}>
        <div className="flex flex-col items-center gap-3">
          <span className="text-[12px] text-[#475569] font-medium uppercase tracking-wider">
            Suggestions
          </span>
          <div 
            className="w-full max-w-full overflow-x-auto pt-2 pb-4 text-center"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style>{`
              .overflow-x-auto::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            <div className="inline-flex items-center justify-center gap-3 px-4">
              {suggestions.map((suggestion, i) => (
                <button
                  key={suggestion}
                  onClick={() => onSelect(suggestion)}
                  className="flex-shrink-0 text-[13px] font-medium text-[#E2E8F0] bg-[#161D2F] border border-[#334155] hover:border-[#475569] hover:bg-[#1E293B] hover:text-[#F8FAFC] transition-all duration-200 shadow-md whitespace-nowrap"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    animation: `quickReplyIn 0.25s ease-out ${i * 0.05}s both`,
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
