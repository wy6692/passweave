import type { SegmentRole, TokenSegment } from '../core/types';

const ROLE_STYLES: Record<SegmentRole, string> = {
  head: 'bg-teal-500/10 text-teal-800 border-teal-600/25 dark:bg-teal-400/12 dark:text-teal-200 dark:border-teal-400/25',
  tail: 'bg-teal-500/10 text-teal-800 border-teal-600/25 dark:bg-teal-400/12 dark:text-teal-200 dark:border-teal-400/25',
  site: 'bg-amber-500/14 text-amber-900 border-amber-600/30 dark:bg-amber-400/15 dark:text-amber-200 dark:border-amber-400/35',
  delimiter:
    'bg-zinc-200/70 text-zinc-600 border-zinc-300/80 dark:bg-zinc-800/90 dark:text-zinc-400 dark:border-zinc-700',
  decoy:
    'bg-zinc-200/70 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
};

interface TokenAnatomyProps {
  segments: TokenSegment[];
  size?: 'sm' | 'lg';
}

export function TokenAnatomy({ segments, size = 'lg' }: TokenAnatomyProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {segments.map((seg, idx) => (
        <span
          key={`${seg.role}-${idx}`}
          className={`inline-flex items-center justify-center rounded-lg border font-mono font-semibold tracking-tight ${
            size === 'sm' ? 'px-2.5 py-1 text-base' : 'px-3.5 py-2 text-2xl sm:text-3xl'
          } ${ROLE_STYLES[seg.role]}`}
        >
          {seg.value}
        </span>
      ))}
    </div>
  );
}
