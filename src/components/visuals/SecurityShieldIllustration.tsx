interface SecurityShieldIllustrationProps {
  passedCount: number;
  totalCount: number;
}

export function SecurityShieldIllustration({
  passedCount,
  totalCount,
}: SecurityShieldIllustrationProps) {
  const arcs = [
    'M 80 14 A 66 66 0 0 1 146 80',
    'M 146 88 A 66 66 0 0 1 88 150',
    'M 72 150 A 66 66 0 0 1 14 88',
    'M 14 80 A 66 66 0 0 1 72 14',
  ];

  return (
    <div className="flex flex-col items-center justify-center">
      <svg viewBox="0 0 160 164" fill="none" className="h-40 w-40" aria-hidden="true">
        <circle
          cx="80"
          cy="82"
          r="52"
          className="fill-teal-500/[0.06] stroke-zinc-200 dark:fill-teal-400/[0.06] dark:stroke-zinc-800"
          strokeWidth="1.5"
        />

        {arcs.map((d, idx) => {
          const lit = idx < passedCount;
          return (
            <path
              key={idx}
              d={d}
              strokeWidth="6"
              strokeLinecap="round"
              className={
                lit
                  ? 'stroke-teal-500 transition-colors duration-300 dark:stroke-teal-400'
                  : 'stroke-amber-500/45 transition-colors duration-300 dark:stroke-amber-400/40'
              }
            />
          );
        })}

        {/* Central Shield Emblem */}
        <path
          d="M80 48 106 58v19c0 16.5-10.8 29.8-26 34.8-15.2-5-26-18.3-26-34.8V58L80 48Z"
          className="fill-white stroke-teal-600 dark:fill-zinc-900 dark:stroke-teal-400"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <text
          x="80"
          y="86"
          textAnchor="middle"
          className="fill-zinc-900 font-mono text-xl font-bold dark:fill-zinc-50"
        >
          {passedCount}/{totalCount}
        </text>
      </svg>
    </div>
  );
}
