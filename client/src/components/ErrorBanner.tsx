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
      className="flex-shrink-0 bg-red-500/5 border-b border-red-500/10"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div className="max-w-[800px] mx-auto px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-[13px] text-red-300/90">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="w-6 h-6 rounded-md flex items-center justify-center text-red-400/60 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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
