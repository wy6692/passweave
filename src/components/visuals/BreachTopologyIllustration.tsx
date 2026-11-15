import { useId } from 'react';

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
  const uid = useId();
  const safe = mode === 'weave';
  const yPositions = [38, 82, 126, 170, 214];

  const glowId = `breach-glow-${uid}`;
  const dotsId = `topo-dots-${uid}`;
  const shadowId = `node-shadow-${uid}`;
  const accentHex = safe ? '#14B8A6' : '#F43F5E';

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-zinc-200/90 p-4 sm:p-6 dark:border-zinc-800">
      <svg
        viewBox="0 0 780 252"
        fill="none"
        className="h-auto w-full select-none"
        role="img"
        aria-label="Breach propagation diagram"
      >
        <defs>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentHex} stopOpacity="0.18" />
            <stop offset="100%" stopColor={accentHex} stopOpacity="0" />
          </radialGradient>
          <pattern id={dotsId} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle
              cx="2"
              cy="2"
              r="1"
              className="fill-zinc-300/75 dark:fill-zinc-800"
            />
          </pattern>
          <filter id={shadowId} x="-12%" y="-12%" width="124%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#09090B" floodOpacity="0.06" />
          </filter>
        </defs>

        <rect width="780" height="252" fill={`url(#${dotsId})`} />
        <circle cx="385" cy="126" r="132" fill={`url(#${glowId})`} />

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
                strokeWidth={safe ? '1.6' : '2.2'}
                strokeDasharray={safe ? undefined : '7 7'}
                className={
                  safe
                    ? 'stroke-zinc-200 dark:stroke-zinc-800'
                    : 'animate-dash-flow stroke-rose-400 dark:stroke-rose-500/80'
                }
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
        <g transform="translate(24, 66)" filter={`url(#${shadowId})`}>
          <rect
            width="182"
            height="120"
            rx="16"
            className="fill-white stroke-zinc-200 dark:fill-zinc-900 dark:stroke-zinc-700/80"
            strokeWidth="1.5"
          />
          {/* Mini Violet 3D Cube Avatar inside SVG */}
          <g transform="translate(16, 16)">
            <rect width="28" height="28" rx="8" fill="#7C3AED" />
            <g transform="translate(4, 4) scale(0.833)" fill="#FFFFFF">
              <path d="M12 2.4 20.4 7.2 12 12 3.6 7.2Z" />
              <path d="M2.8 8.6 11.2 13.4v8.2L2.8 16.8Z" fillOpacity="0.82" />
              <path d="M21.2 8.6v8.2l-8.4 4.8v-8.2Z" fillOpacity="0.64" />
            </g>
          </g>
          <text
            x="52"
            y="34"
            className="fill-zinc-800 dark:fill-zinc-100"
            fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace"
            fontSize="12"
            fontWeight="600"
          >
            bbs.indie-mod
          </text>
          <rect
            x="16"
            y="64"
            width="150"
            height="38"
            rx="9"
            className="fill-amber-500/10 stroke-amber-500/30 dark:fill-amber-400/10 dark:stroke-amber-400/25"
            strokeWidth="1.2"
          />
          <text
            x="91"
            y="88"
            textAnchor="middle"
            className="fill-amber-900 dark:fill-amber-300"
            fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace"
            fontSize="13"
            fontWeight="600"
          >
            {leakedPassword.slice(0, 16)}
          </text>
        </g>

        {/* Center Node: Bot Cracker vs PassWeave Shield */}
        <g transform="translate(332, 73)" filter={`url(#${shadowId})`}>
          <rect
            width="106"
            height="106"
            rx="24"
            className={
              safe
                ? 'fill-white stroke-teal-500/55 dark:fill-zinc-900 dark:stroke-teal-400/55'
                : 'fill-white stroke-rose-400/65 dark:fill-zinc-900 dark:stroke-rose-500/55'
            }
            strokeWidth="1.8"
          />
          {safe ? (
            <g transform="translate(29, 25)">
              <path
                d="M24 3 43 10v14c0 12.5-8.1 22.8-19 26.5C13.1 46.8 5 36.5 5 24V10L24 3Z"
                className="fill-teal-500/14 stroke-teal-600 dark:fill-teal-400/16 dark:stroke-teal-400"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path
                d="m16.5 25.5 5 5 10.5-11"
                className="stroke-teal-600 dark:stroke-teal-300"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ) : (
            <g
              transform="translate(29, 27)"
              className="stroke-rose-500 dark:stroke-rose-400"
              strokeWidth="2.2"
            >
              <circle
                cx="24"
                cy="24"
                r="18"
                className="fill-rose-500/12 dark:fill-rose-500/16"
              />
              <path strokeLinecap="round" d="M24 14v11M24 31.5v1" />
            </g>
          )}
        </g>

        {/* Right Target Pills */}
        {yPositions.map((y, idx) => {
          const label = targetLabels[idx] ?? '';
          return (
            <g key={idx} transform={`translate(594, ${y - 17})`} filter={`url(#${shadowId})`}>
              <rect
                width="162"
                height="34"
                rx="10"
                className={
                  safe
                    ? 'fill-white stroke-teal-500/35 dark:fill-zinc-900 dark:stroke-teal-400/35'
                    : 'fill-white stroke-rose-400/45 dark:fill-zinc-900 dark:stroke-rose-500/40'
                }
                strokeWidth="1.3"
              />
              <circle
                cx="17"
                cy="17"
                r="4"
                fill={safe ? '#14B8A6' : '#F43F5E'}
              />
              <text
                x="30"
                y="21.5"
                className="fill-zinc-800 dark:fill-zinc-100"
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
