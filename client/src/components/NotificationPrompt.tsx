import type { NotificationStatus } from '../hooks/useChat';

interface NotificationPromptProps {
  status: NotificationStatus;
  disabled?: boolean;
  onEnable: () => void;
}

const COPY: Record<
  NotificationStatus,
  { title: string; body: string; action?: string }
> = {
  idle: {
    title: 'Get a reminder here',
    body: 'We can nudge you if this conversation goes quiet.',
    action: 'Enable',
  },
  enabling: {
    title: 'Opening notification prompt',
    body: 'Confirm in your browser to receive follow-ups.',
    action: 'Enabling',
  },
  enabled: {
    title: 'Reminders are on',
    body: 'You will get a push if the conversation goes stale.',
  },
  denied: {
    title: 'Notifications are blocked',
    body: 'Turn them on in browser settings to receive follow-ups.',
  },
  error: {
    title: 'Could not enable reminders',
    body: 'Try again from the browser or installed app.',
    action: 'Retry',
  },
  unsupported: {
    title: 'Push is not available',
    body: 'Use Chrome, Edge, or an installed iPhone web app.',
  },
};

export default function NotificationPrompt({
  status,
  disabled = false,
  onEnable,
}: NotificationPromptProps) {
  const copy = COPY[status];
  const canEnable = Boolean(copy.action) && !disabled && status !== 'enabling';

  return (
    <div className="chat-gutter">
      <div className="notification-prompt">
        <div className="notification-prompt__icon" aria-hidden="true">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.25 18.75a2.25 2.25 0 0 1-4.5 0m8.25-4.5V10.5a6 6 0 1 0-12 0v3.75L4.5 16.5h15l-1.5-2.25Z"
            />
          </svg>
        </div>

        <div className="notification-prompt__copy">
          <span className="notification-prompt__title">{copy.title}</span>
          <span className="notification-prompt__body">{copy.body}</span>
        </div>

        {copy.action && (
          <button
            className="notification-prompt__button"
            type="button"
            onClick={onEnable}
            disabled={!canEnable}
            aria-label="Enable follow-up notifications"
          >
            {copy.action}
          </button>
        )}
      </div>
    </div>
  );
}
