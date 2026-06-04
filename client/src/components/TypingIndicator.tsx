export default function TypingIndicator() {
  return (
    <div
      className="flex items-start gap-3 mt-4"
      style={{ animation: 'messageSlideIn 0.25s ease-out both' }}
    >
      {/* Agent Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] flex items-center justify-center shadow-sm">
          <span className="text-white text-[11px] font-bold">A</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-[#94A3B8]">Acme Support</span>

        <div className="px-4 py-3 rounded-2xl rounded-bl-[4px] bg-[#161D2F] border border-[#1E293B]">
          <div className="flex items-center gap-1.5">
            <span
              className="w-[5px] h-[5px] rounded-full bg-[#94A3B8]"
              style={{ animation: 'typingBounce 1.4s ease-in-out infinite 0s' }}
            />
            <span
              className="w-[5px] h-[5px] rounded-full bg-[#94A3B8]"
              style={{ animation: 'typingBounce 1.4s ease-in-out infinite 0.2s' }}
            />
            <span
              className="w-[5px] h-[5px] rounded-full bg-[#94A3B8]"
              style={{ animation: 'typingBounce 1.4s ease-in-out infinite 0.4s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
