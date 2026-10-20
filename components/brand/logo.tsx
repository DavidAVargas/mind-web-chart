import { cn } from "@/lib/utils";

/**
 * The mark: a center bubble with thoughts branching off it, and one curved
 * thread tying two of them together, like the app itself.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-6", className)}
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.45"
      >
        <line x1="16" y1="16" x2="6" y2="7.5" />
        <line x1="16" y1="16" x2="26.5" y2="9" />
        <line x1="16" y1="16" x2="22" y2="27" />
      </g>
      <path
        d="M6 7.5 Q 10 22 22 27"
        fill="none"
        stroke="#10b981"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="6" cy="7.5" r="3.2" fill="#9e77ed" />
      <circle cx="26.5" cy="9" r="3.6" fill="#0ea5e9" />
      <circle cx="22" cy="27" r="3" fill="#f43f5e" />
      <circle cx="16" cy="16" r="6.5" fill="currentColor" />
    </svg>
  );
}

/** The mark plus the name, for headers. */
export function Logo({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold", className)}>
      <LogoMark />
      <span className="tracking-tight">{name}</span>
    </span>
  );
}
