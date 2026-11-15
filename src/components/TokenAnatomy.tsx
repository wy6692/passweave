import { useState } from 'react';
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

const ROLE_RING_STYLES: Record<SegmentRole, string> = {
  head: '-translate-y-0.5 ring-2 ring-teal-500/45 dark:ring-teal-400/55',
  tail: '-translate-y-0.5 ring-2 ring-teal-500/45 dark:ring-teal-400/55',
  site: '-translate-y-0.5 ring-2 ring-amber-500/50 dark:ring-amber-400/55',
  delimiter: '-translate-y-0.5 ring-2 ring-zinc-400/55 dark:ring-zinc-500/65',
  decoy: '-translate-y-0.5 ring-2 ring-zinc-400/55 dark:ring-zinc-500/65',
};

interface TokenAnatomyProps {
  segments: TokenSegment[];
  size?: 'sm' | 'lg';
  highlightRole?: SegmentRole | null;
  masked?: boolean;
  onClick?: () => void;
}

export function TokenAnatomy({
  segments,
  size = 'lg',
  highlightRole = null,
  masked = false,
  onClick,
}: TokenAnatomyProps) {
  const [hovered, setHovered] = useState(false);
  const shouldMask = masked && !hovered;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className={`inline-flex flex-wrap items-center gap-2 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {segments.map((seg, idx) => {
        const isHighlighted = highlightRole !== null && seg.role === highlightRole;
        const isDimmed = highlightRole !== null && seg.role !== highlightRole;
        const maskSecret =
          shouldMask && (seg.role === 'head' || seg.role === 'tail' || seg.role === 'decoy');
        const displayValue = maskSecret
          ? '•'.repeat(Math.min(8, Math.max(2, seg.value.length)))
          : seg.value;

        return (
          <span
            key={`${seg.role}-${idx}`}
            className={`inline-flex items-center justify-center rounded-xl border font-mono font-semibold tracking-tight transition-all duration-150 select-all ${
              size === 'sm'
                ? 'px-3 py-1.5 text-base'
                : 'min-w-11 px-4 py-2.5 text-2xl sm:text-3xl'
            } ${ROLE_STYLES[seg.role]} ${isHighlighted ? ROLE_RING_STYLES[seg.role] : ''} ${
              isDimmed ? 'opacity-50' : ''
            }`}
          >
            {displayValue}
          </span>
        );
      })}
    </div>
  );
}
