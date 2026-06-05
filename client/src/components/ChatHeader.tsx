interface ChatHeaderProps {
  onNewChat: () => void;
  isLoadingHistory: boolean;
}

export default function ChatHeader({ onNewChat, isLoadingHistory }: ChatHeaderProps) {
  return (
    <header className="flex-shrink-0 border-b border-[#1E293B] bg-[#111827]/80 backdrop-blur-md">
      <div className="h-[64px] flex items-center justify-between w-full" style={{ paddingLeft: 'max(1.5rem, 5vw)', paddingRight: 'max(1.5rem, 5vw)' }}>
        {/* ── Left: Brand Identity ── */}
        <div className="flex items-center gap-3">
          {/* Company Avatar */}
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold tracking-tight">A</span>
            </div>
            {/* Online Indicator */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] rounded-full bg-[#22C55E] border-2 border-[#111827]"
              style={{ animation: 'pulseOnline 2s ease-in-out infinite' }}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[15px] font-semibold text-[#F9FAFB]">
                Acme Support
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span className="text-[12px] text-[#22C55E] font-medium">
                  Online
                </span>
              </div>
            </div>
            {!isLoadingHistory && (
              <span className="text-[13px] text-[#94A3B8]">
                Typically replies in minutes
              </span>
            )}
          </div>
        </div>

        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-1">
          {/* Search Button */}
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#94A3B8] hover:bg-[#1E293B]/60 transition-all duration-150"
            aria-label="Search messages"
          >
            <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-medium text-[#94A3B8] hover:text-[#F9FAFB] hover:bg-[#1E293B]/60 transition-all duration-150"
          >
            <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Chat
          </button>

          {/* More Options */}
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#94A3B8] hover:bg-[#1E293B]/60 transition-all duration-150"
            aria-label="More options"
          >
            <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
