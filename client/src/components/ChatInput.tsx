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

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 92)}px`;
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    el?.focus();
    if (el) adjustHeight();
  }, [adjustHeight]);

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
        adjustHeight();
      }
    });
  }, [text, disabled, onSend, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="chat-gutter min-w-0 flex-shrink-0">
      <div
        className={`chat-composer ${isFocused ? 'chat-composer--focused' : ''}`}
      >
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
          className="chat-composer__input"
          aria-label="Message"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={`chat-composer__send ${canSend ? 'chat-composer__send--active' : 'chat-composer__send--idle'}`}
          aria-label="Send message"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
