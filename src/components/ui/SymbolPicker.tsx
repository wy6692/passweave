import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DELIMITER_OPTIONS } from '../../core/presets';
import type { DelimiterChar } from '../../core/types';

interface SymbolPickerProps {
  value: DelimiterChar;
  onChange: (next: DelimiterChar) => void;
  ariaLabel: string;
  compact?: boolean;
  align?: 'left' | 'right';
}

export function SymbolPicker({
  value,
  onChange,
  ariaLabel,
  compact = false,
  align = 'left',
}: SymbolPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex cursor-pointer items-center justify-between rounded-xl border font-mono text-base font-semibold transition-all ${
          compact ? 'h-10 min-w-12.5 gap-1 px-2.5' : 'h-11 min-w-15 gap-2 px-3'
        } ${
          open
            ? 'border-teal-500 bg-white ring-3 ring-teal-500/15 dark:border-teal-400 dark:bg-zinc-900 dark:ring-teal-400/15'
            : 'border-zinc-200/90 bg-zinc-100/80 text-zinc-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:border-zinc-300 hover:bg-white dark:border-zinc-700/90 dark:bg-zinc-950/90 dark:text-zinc-100 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)] dark:hover:border-zinc-600'
        }`}
      >
        <span>{value}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-150 ${
            open ? 'rotate-180 text-teal-500' : ''
          }`}
        />
      </button>

      {open && (
        <div
          className={`surface-card absolute z-50 w-48 rounded-2xl border border-zinc-200 p-2 shadow-xl dark:border-zinc-700/90 ${
            compact ? 'top-11.5' : 'top-12.5'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          <div className="grid grid-cols-4 gap-1.5">
            {DELIMITER_OPTIONS.map((sym) => {
              const active = sym === value;
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => {
                    onChange(sym);
                    setOpen(false);
                  }}
                  className={`flex h-10 w-full cursor-pointer items-center justify-center rounded-xl font-mono text-base font-semibold transition-all ${
                    active
                      ? 'bg-teal-500 text-zinc-950 shadow-xs'
                      : 'bg-zinc-100/70 text-zinc-700 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
