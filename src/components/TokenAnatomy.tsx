import type { SegmentRole, TokenSegment } from '../core/types';

const ROLE_STYLES: Record<SegmentRole, string> = {
  head: 'keycap-teal border-teal-500/35 bg-gradient-to-b from-teal-500/16 to-teal-500/8 text-teal-900 dark:border-teal-400/35 dark:from-teal-400/18 dark:to-teal-500/8 dark:text-teal-200',
  tail: 'keycap-teal border-teal-500/35 bg-gradient-to-b from-teal-500/16 to-teal-500/8 text-teal-900 dark:border-teal-400/35 dark:from-teal-400/18 dark:to-teal-500/8 dark:text-teal-200',
  site: 'keycap-amber border-amber-500/40 bg-gradient-to-b from-amber-500/20 to-amber-500/10 text-amber-950 dark:border-amber-400/40 dark:from-amber-400/22 dark:to-amber-500/10 dark:text-amber-200',
  delimiter:
    'keycap-neutral border-zinc-300/90 bg-gradient-to-b from-white to-zinc-100 text-zinc-600 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-300',
  decoy:
    'keycap-neutral border-zinc-300/90 bg-gradient-to-b from-white to-zinc-100 text-zinc-800 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-200',
};

interface TokenAnatomyProps {
  segments: TokenSegment[];
  size?: 'sm' | 'lg';
}

export function TokenAnatomy({ segments, size = 'lg' }: TokenAnatomyProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {segments.map((seg, idx) => (
        <span
          key={`${seg.role}-${idx}`}
          className={`inline-flex items-center justify-center rounded-xl border font-mono font-semibold tracking-tight select-all ${
            size === 'sm'
              ? 'px-3 py-1.5 text-base'
              : 'min-w-11 px-4 py-2.5 text-2xl sm:text-3xl'
          } ${ROLE_STYLES[seg.role]}`}
        >
          {seg.value}
        </span>
      ))}
    </div>
  );
}
