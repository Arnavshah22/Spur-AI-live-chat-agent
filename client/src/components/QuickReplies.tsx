interface QuickRepliesProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export default function QuickReplies({ suggestions, onSelect }: QuickRepliesProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex-shrink-0 border-t border-[#1E293B]/50">
      <div className="max-w-[800px] mx-auto px-6 py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="flex-shrink-0 text-[11px] text-[#475569] font-medium">
            Suggestions
          </span>
          <div className="flex items-center gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={suggestion}
                onClick={() => onSelect(suggestion)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium text-[#94A3B8] bg-[#161D2F] border border-[#1E293B] hover:border-[#334155] hover:text-[#F9FAFB] transition-all duration-150 whitespace-nowrap"
                style={{
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
  );
}
