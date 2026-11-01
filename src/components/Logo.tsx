import { useId } from "react";

export function Monogram({ size = 36, className }: { size?: number; className?: string }) {
  const id = `hm-${useId().replace(/:/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffa86e" />
          <stop offset="1" stopColor="#f2762f" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="13" fill={`url(#${id})`} />
      <path d="M14 11.5v17M26 11.5v17" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M14 20.2c4-1.6 8-1.6 12 0" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="31.5" cy="9" r="2.2" fill="#ffe28a" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <Monogram />
      <div className="leading-tight">
        <p className="text-base font-extrabold text-ink">Haruka&rsquo;s</p>
        <p className="-mt-0.5 text-xs font-bold text-primary-strong">SAT Journey</p>
      </div>
    </div>
  );
}
