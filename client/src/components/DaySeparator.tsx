interface DaySeparatorProps {
  label: string;
}

export default function DaySeparator({ label }: DaySeparatorProps) {
  return (
    <div className="flex items-center gap-3 py-5 select-none" role="separator">
      <div className="flex-1 h-px bg-[#1E293B]" />
      <span className="text-[11px] font-medium text-[#475569] tracking-wide uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#1E293B]" />
    </div>
  );
}
