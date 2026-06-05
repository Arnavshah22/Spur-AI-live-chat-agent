import { useState, useRef, useCallback, useEffect } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const MAX_CHARS = Number(import.meta.env.VITE_MAX_MESSAGE_LENGTH ?? 2000);

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    requestAnimationFrame(adjustHeight);
  };

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    });
  }, [text, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="flex-shrink-0" style={{ paddingLeft: 'max(1.5rem, 5vw)', paddingRight: 'max(1.5rem, 5vw)', paddingBottom: '2rem' }}>
      <div className="w-full">
        <div
          className={`
            relative flex items-center gap-3 px-4 py-3 rounded-2xl
            bg-[#161D2F] shadow-sm transition-all duration-200
            ${isFocused ? 'border-[#635BFF]/60 shadow-[0_0_0_1px_rgba(99,91,255,0.4)]' : 'border border-[#1E293B] hover:border-[#334155]'}
          `}
        >
          {/* Attachment Button */}
          <button
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#94A3B8] hover:bg-[#1E293B] transition-all duration-150"
            aria-label="Attach file"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Send a message..."
            disabled={disabled}
            maxLength={MAX_CHARS}
            rows={1}
            className="flex-1 py-1.5 bg-transparent text-[#F9FAFB] text-[14px] leading-[1.5] placeholder-[#475569] resize-none disabled:opacity-50"
            style={{ 
              height: 'auto', 
              minHeight: '24px', 
              maxHeight: '120px',
              outline: 'none',
              border: 'none',
              boxShadow: 'none'
            }}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
              ${canSend
                ? 'bg-[#635BFF] hover:bg-[#5B52E8] text-white shadow-sm hover:shadow-md scale-100 hover:scale-105'
                : 'bg-[#1E293B] text-[#475569] cursor-not-allowed'
              }
            `}
            aria-label="Send message"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
