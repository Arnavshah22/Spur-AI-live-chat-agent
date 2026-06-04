import type { Message } from '../types';

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Returns "Today", "Yesterday", or a formatted date string like "Mon, Jun 2".
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const stripTime = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const today = stripTime(now);
  const target = stripTime(date);
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Checks if two messages fall on different calendar days.
 */
export function shouldShowDaySeparator(
  prev: Message | undefined,
  current: Message
): boolean {
  if (!prev) return true; // always show separator before the first message
  const prevDate = new Date(prev.timestamp).toDateString();
  const currDate = new Date(current.timestamp).toDateString();
  return prevDate !== currDate;
}

export interface MessageGroupData {
  sender: 'user' | 'ai';
  messages: Message[];
}

/**
 * Groups consecutive messages from the same sender together.
 */
export function groupMessagesBySender(messages: Message[]): MessageGroupData[] {
  const groups: MessageGroupData[] = [];

  for (const message of messages) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.sender === message.sender) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ sender: message.sender, messages: [message] });
    }
  }

  return groups;
}
