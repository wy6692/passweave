export function NamingGraphic() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9 shrink-0" aria-hidden="true">
      <rect
        x="2"
        y="6"
        width="36"
        height="28"
        rx="8"
        className="fill-teal-500/10 stroke-teal-600/35 dark:fill-teal-400/10 dark:stroke-teal-400/35"
        strokeWidth="1.5"
      />
      <circle cx="8.5" cy="12.5" r="1.5" className="fill-teal-600/50 dark:fill-teal-400/60" />
      <circle cx="13.5" cy="12.5" r="1.5" className="fill-teal-600/50 dark:fill-teal-400/60" />
      <rect
        x="7"
        y="18.5"
        width="26"
        height="9.5"
        rx="4"
        className="fill-white stroke-teal-600/30 dark:fill-zinc-950 dark:stroke-teal-400/30"
      />
      <rect
        x="12"
        y="21.25"
        width="12"
        height="4"
        rx="2"
        className="fill-teal-600 dark:fill-teal-400"
      />
    </svg>
  );
}

export function TransformGraphic() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9 shrink-0" aria-hidden="true">
      <rect
        x="2"
        y="6"
        width="36"
        height="28"
        rx="8"
        className="fill-amber-500/10 stroke-amber-600/35 dark:fill-amber-400/10 dark:stroke-amber-400/35"
        strokeWidth="1.5"
      />
      <path
        d="M8 16h7M8 20h5M8 24h7"
        className="stroke-zinc-400 dark:stroke-zinc-500"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M20 13 26.5 20 20 27 16.5 20Z"
        className="fill-amber-500/25 stroke-amber-600 dark:fill-amber-400/25 dark:stroke-amber-400"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="31" cy="20" r="2.6" className="fill-amber-600 dark:fill-amber-400" />
    </svg>
  );
}

export function PlacementGraphic() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9 shrink-0" aria-hidden="true">
      <rect
        x="2"
        y="6"
        width="36"
        height="28"
        rx="8"
        className="fill-sky-500/10 stroke-sky-600/35 dark:fill-sky-400/10 dark:stroke-sky-400/35"
        strokeWidth="1.5"
      />
      <rect x="6.5" y="15.5" width="8.5" height="9" rx="2.5" className="fill-teal-500/80" />
      <rect x="16.75" y="13.5" width="6.5" height="13" rx="2.5" className="fill-amber-500" />
      <rect x="25" y="15.5" width="8.5" height="9" rx="2.5" className="fill-teal-500/80" />
    </svg>
  );
}
