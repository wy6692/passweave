import { Check, Copy, Download } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  drawZeroSecretBlueprintCanvas,
  renderZeroSecretMarkdown,
} from '../core/blueprintCard';
import type { AccountTier, PatternSpec, SiteEntry } from '../core/types';
import { weavePassword } from '../core/weaver';
import { useI18n } from '../i18n/I18nContext';
import { TokenAnatomy } from './TokenAnatomy';

interface DrillAndExportProps {
  spec: PatternSpec;
  sites: SiteEntry[];
  tierOverrides: Record<string, AccountTier>;
}

export function DrillAndExport({ spec, sites, tierOverrides }: DrillAndExportProps) {
  const { locale, t } = useI18n();
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [streak, setStreak] = useState<number>(0);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentSite = sites[targetIndex % sites.length] ?? sites[0]!;
  const currentTier = tierOverrides[currentSite.id] ?? currentSite.defaultTier;
  const expected = weavePassword(spec, currentSite, currentTier);

  useEffect(() => {
    if (canvasRef.current) {
      drawZeroSecretBlueprintCanvas(canvasRef.current, spec, locale);
    }
  }, [spec, locale]);

  const nextTarget = () => {
    setTargetIndex((prev) => (prev + 1) % sites.length);
    setAnswer('');
    setStatus('idle');
    setShowHint(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') {
      nextTarget();
      return;
    }
    if (!answer.trim()) return;

    if (answer.trim() === expected.password) {
      setStatus('correct');
      setStreak((prev) => prev + 1);
    } else {
      setStatus('wrong');
      setStreak(0);
    }
  };

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `passweave-card-${locale}.png`;
    link.click();
  };

  const handleCopyText = async () => {
    const text = renderZeroSecretMarkdown(spec, locale);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      window.setTimeout(() => setCopiedText(false), 1600);
    } catch {
      // Ignore clipboard error.
    }
  };

  return (
    <section className="grid items-start gap-6 lg:grid-cols-12">
      {/* Left: Recall Test */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 lg:col-span-5 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">
            {t.save.practiceTitle}
          </span>

          <div className="flex items-center gap-3">
            {streak > 0 && (
              <span className="rounded-md bg-teal-500/12 px-2.5 py-0.5 font-mono text-sm font-medium text-teal-800 dark:text-teal-300">
                {t.save.streak} {streak}
              </span>
            )}
            {currentTier !== 'tier3' && (
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {showHint ? t.save.hideHintBtn : t.save.hintBtn}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {locale === 'zh' ? currentSite.nameZh : currentSite.nameEn}
            </span>
            <span className="rounded-md bg-zinc-200/70 px-2.5 py-0.5 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {t.tiers[currentTier]}
            </span>
          </div>
          <div className="mt-1 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            {currentSite.url}
          </div>

          {showHint && currentTier !== 'tier3' && (
            <div className="mt-3 border-t border-zinc-200 pt-3 font-mono text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              {expected.anchorWord} → {expected.siteToken}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            placeholder={t.save.inputPlaceholder}
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 font-mono text-lg text-zinc-900 placeholder:font-sans placeholder:text-sm placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-teal-400"
          />

          <div className="flex items-center gap-2.5">
            <button
              type="submit"
              className="flex-1 cursor-pointer rounded-xl bg-zinc-900 px-4 py-2.5 text-base font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
            >
              {status === 'idle' ? t.save.checkBtn : t.save.nextBtn}
            </button>

            {status === 'idle' && (
              <button
                type="button"
                onClick={nextTarget}
                className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-base font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {t.save.nextBtn}
              </button>
            )}
          </div>
        </form>

        {status !== 'idle' && (
          <div
            className={`mt-5 rounded-xl border p-4 ${
              status === 'correct'
                ? 'border-teal-500/35 bg-teal-500/8'
                : 'border-rose-500/35 bg-rose-500/8'
            }`}
          >
            <div
              className={`mb-2.5 text-sm font-medium ${
                status === 'correct'
                  ? 'text-teal-800 dark:text-teal-300'
                  : 'text-rose-800 dark:text-rose-300'
              }`}
            >
              {status === 'correct' ? t.save.correct : t.save.wrong}
            </div>
            <TokenAnatomy segments={expected.segments} size="sm" />
          </div>
        )}
      </div>

      {/* Right: Clean Reference Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 lg:col-span-7 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">
          {t.save.cardTitle}
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          <canvas ref={canvasRef} className="block h-auto w-full" />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-base font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
          >
            <Download className="h-4 w-4" />
            <span>{t.save.downloadPng}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-base font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            {copiedText ? (
              <Check className="h-4 w-4 text-teal-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>{copiedText ? t.save.copiedText : t.save.copyText}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
