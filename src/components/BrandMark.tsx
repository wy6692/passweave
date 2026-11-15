interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className = 'w-8 h-8' }: BrandMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#09090B" />
      <rect
        x="2.75"
        y="2.75"
        width="58.5"
        height="58.5"
        rx="13.25"
        stroke="#27272A"
        strokeWidth="1.5"
      />
      <g strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 17.25 40 L 17 40 A 8 8 0 0 1 17 24 L 33.25 24" stroke="#F4F4F5" />
        <path d="M 46.75 24 L 47 24 A 8 8 0 0 1 47 40 L 30.75 40" stroke="#F4F4F5" />
        <path d="M 24 17.25 L 24 17 A 8 8 0 0 1 40 17 L 40 33.25" stroke="#14B8A6" />
        <path d="M 40 46.75 L 40 47 A 8 8 0 0 1 24 47 L 24 30.75" stroke="#14B8A6" />
      </g>
      <path d="M 32 29.2 L 34.8 32 L 32 34.8 L 29.2 32 Z" fill="#14B8A6" />
    </svg>
  );
}
