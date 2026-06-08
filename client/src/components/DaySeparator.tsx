interface DaySeparatorProps {
  label: string;
}

export default function DaySeparator({ label }: DaySeparatorProps) {
  return (
    <div className="flex items-center gap-3 py-4 select-none" role="separator">
      <div className="flex-1 h-px" style={{ background: 'var(--color-gold-hairline)' }} />
      <span 
        className="font-medium uppercase tracking-wider" 
        style={{ 
          fontSize: '0.7rem',
          letterSpacing: '0.18em',
          color: 'var(--color-text-faint)',
          fontFamily: 'SFMono-Regular, Roboto Mono, Consolas, monospace'
        }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-gold-hairline)' }} />
    </div>
  );
}
