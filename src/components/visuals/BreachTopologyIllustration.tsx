interface BreachTopologyProps {
  mode: 'reuse' | 'suffix' | 'weave';
  leakedPassword: string;
  targetLabels: string[];
}

export function BreachTopologyIllustration({
  mode,
  leakedPassword,
  targetLabels,
}: BreachTopologyProps) {
  const safe = mode === 'weave';
  const yPositions = [38, 82, 126, 170, 214];

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-950 p-4 sm:p-6 dark:border-zinc-800">
      <svg
        viewBox="0 0 780 252"
        fill="none"
        className="h-auto w-full select-none"
        role="img"
        aria-label="Breach propagation diagram"
      >
        <defs>
          <radialGradient id="breachGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={safe ? '#14B8A6' : '#F43F5E'} stopOpacity="0.24" />
            <stop offset="100%" stopColor="#09090B" stopOpacity="0" />
          </radialGradient>
          <pattern id="topoDots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#27272A" />
          </pattern>
        </defs>

        <rect width="780" height="252" fill="url(#topoDots)" opacity="0.65" />
        <circle cx="385" cy="126" r="130" fill="url(#breachGlow)" />

        {/* Connection Line: Leak Source -> Center Node */}
        <path
          d="M 206 126 L 332 126"
          stroke={safe ? '#F59E0B' : '#F43F5E'}
          strokeWidth="2.2"
          strokeDasharray="6 6"
          className="animate-dash-flow"
        />

        {/* Fan-out Bezier Curves: Center Node -> 5 Accounts */}
        {yPositions.map((y, idx) => {
          const d = `M 438 126 C 505 126, 515 ${y}, 584 ${y}`;
          return (
            <g key={idx}>
              <path
                d={d}
                stroke={safe ? '#27272A' : '#F43F5E'}
                strokeOpacity={safe ? 0.85 : 0.75}
                strokeWidth={safe ? '1.6' : '2.2'}
                strokeDasharray={safe ? undefined : '7 7'}
                className={safe ? undefined : 'animate-dash-flow'}
              />
              <circle
                cx="584"
                cy={y}
                r="4"
                fill={safe ? '#14B8A6' : '#F43F5E'}
              />
            </g>
          );
        })}

        {/* Left Node: Leaked Forum Database */}
        <g transform="translate(26, 68)">
          <rect
            width="180"
            height="116"
            rx="16"
            fill="#121216"
            stroke="#F59E0B"
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />
          {/* Database Cylinder Icon */}
          <g transform="translate(20, 20)" stroke="#FBBF24" strokeWidth="1.8">
            <ellipse cx="12" cy="5" rx="9" ry="3.5" />
            <path d="M3 5v6c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5V5" />
            <path d="M3 11v6c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5v-6" />
          </g>
          <text
            x="52"
            y="36"
            fill="#E4E4E7"
            fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace"
            fontSize="12"
            fontWeight="600"
          >
            bbs.indie-mod
          </text>
          <rect x="18" y="62" width="144" height="36" rx="8" fill="#18181D" stroke="#27272A" />
          <text
            x="90"
            y="85"
            textAnchor="middle"
            fill="#FDE68A"
            fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace"
            fontSize="13"
            fontWeight="600"
          >
            {leakedPassword.slice(0, 16)}
          </text>
        </g>

        {/* Center Node: Bot Cracker vs PassWeave Shield */}
        <g transform="translate(332, 73)">
          <rect
            width="106"
            height="106"
            rx="24"
            fill="#121216"
            stroke={safe ? '#14B8A6' : '#F43F5E'}
            strokeOpacity="0.6"
            strokeWidth="1.8"
          />
          {safe ? (
            <g transform="translate(29, 25)">
              <path
                d="M24 3 43 10v14c0 12.5-8.1 22.8-19 26.5C13.1 46.8 5 36.5 5 24V10L24 3Z"
                fill="#14B8A6"
                fillOpacity="0.16"
                stroke="#2DD4BF"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path
                d="m16.5 25.5 5 5 10.5-11"
                stroke="#5EEAD4"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ) : (
            <g transform="translate(29, 27)" stroke="#FB7185" strokeWidth="2.2">
              <circle cx="24" cy="24" r="18" fill="#F43F5E" fillOpacity="0.14" />
              <path strokeLinecap="round" d="M24 14v11M24 31.5v1" />
            </g>
          )}
        </g>

        {/* Right Target Pills */}
        {yPositions.map((y, idx) => {
          const label = targetLabels[idx] ?? '';
          return (
            <g key={idx} transform={`translate(594, ${y - 16})`}>
              <rect
                width="160"
                height="32"
                rx="9"
                fill="#131317"
                stroke={safe ? '#14B8A6' : '#F43F5E'}
                strokeOpacity={safe ? 0.35 : 0.45}
              />
              <circle
                cx="16"
                cy="16"
                r="4"
                fill={safe ? '#14B8A6' : '#F43F5E'}
              />
              <text
                x="28"
                y="20.5"
                fill="#F4F4F5"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif"
                fontSize="12.5"
                fontWeight="500"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
