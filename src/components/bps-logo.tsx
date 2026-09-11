import { cn } from "@/lib/utils";

/**
 * BPS-style tri-color mark (Blue / Orange / Green).
 * Placeholder for the official BPS logo asset — drop the official file in and
 * replace the SVG below without changing the component API.
 */
export function BpsMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Logo BPS"
      className={cn("h-8 w-8 shrink-0", className)}
    >
      <rect width="48" height="48" rx="12" fill="var(--bps-blue-deep)" />
      <path
        d="M12 33.5c0-8.6 6.9-15.5 15.4-15.5h8.6v6.4h-8.6a9.1 9.1 0 0 0-9.1 9.1V36H12z"
        fill="var(--bps-blue)"
      />
      <path
        d="M12 22.6c0-6 4.8-10.9 10.8-10.9h13.2v5.6H22.8a5.3 5.3 0 0 0-5.3 5.3v2.2H12z"
        fill="var(--bps-orange)"
      />
      <rect x="12" y="30" width="5.5" height="6" rx="1.4" fill="var(--bps-green)" />
    </svg>
  );
}

export function BpsWordmark({
  collapsed = false,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BpsMark />
      {!collapsed && (
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold tracking-tight">BPS AI Assistant</div>
          <div className="truncate text-[11px] text-muted-foreground">AI Work Assistant</div>
        </div>
      )}
    </div>
  );
}
