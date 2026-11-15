import type { SegmentRole, TokenSegment } from '../core/types';
import { useI18n } from '../i18n/I18nContext';

const ROLE_STYLES: Record<SegmentRole, string> = {
  head: 'bg-teal-500/10 text-teal-800 border-teal-600/25 dark:bg-teal-400/10 dark:text-teal-300 dark:border-teal-400/30',
  tail: 'bg-teal-500/10 text-teal-800 border-teal-600/25 dark:bg-teal-400/10 dark:text-teal-300 dark:border-teal-400/30',
  site: 'bg-amber-500/12 text-amber-900 border-amber-600/30 dark:bg-amber-400/12 dark:text-amber-300 dark:border-amber-400/35',
  delimiter:
    'bg-sky-500/10 text-sky-800 border-sky-600/25 dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-400/30',
  decoy:
    'bg-zinc-500/10 text-zinc-700 border-zinc-500/25 dark:bg-zinc-400/10 dark:text-zinc-300 dark:border-zinc-500/30',
};

interface TokenAnatomyProps {
  segments: TokenSegment[];
  showLabels?: boolean;
  compact?: boolean;
}

export function TokenAnatomy({
  segments,
  showLabels = true,
  compact = false,
}: TokenAnatomyProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-start gap-1.5">
      {segments.map((seg, idx) => (
        <div key={`${seg.role}-${idx}`} className="flex flex-col items-center">
          <span
            className={`inline-flex items-center justify-center rounded-md border font-mono font-semibold tracking-tight ${
              compact ? 'px-2 py-0.5 text-sm' : 'px-2.5 py-1.5 text-lg sm:text-xl'
            } ${ROLE_STYLES[seg.role]}`}
          >
            {seg.value}
          </span>
          {showLabels && (
            <span className="mt-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t.tokens[seg.labelKey]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
