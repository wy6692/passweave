import { Check, Copy, Download, Eye, EyeOff, FileText, SkipForward } from 'lucide-react';
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
  const [showHints, setShowHints] = useState<boolean>(false);
  const [submittedState, setSubmittedState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const [attempts, setAttempts] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [elapsedSamplesSec, setElapsedSamplesSec] = useState<number[]>([]);
  const promptStartedAt = useRef<number>(Date.now());

  const [copiedMd, setCopiedMd] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentSite = sites[targetIndex % sites.length] ?? sites[0]!;
  const currentTier = tierOverrides[currentSite.id] ?? currentSite.defaultTier;
  const expected = weavePassword(spec, currentSite, currentTier);

  useEffect(() => {
    if (canvasRef.current) {
      drawZeroSecretBlueprintCanvas(canvasRef.current, spec, locale);
    }
  }, [spec, locale]);

  const advanceTarget = () => {
    setTargetIndex((prev) => (prev + 1) % sites.length);
    setAnswer('');
    setSubmittedState('idle');
    setShowHints(false);
    promptStartedAt.current = Date.now();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (submittedState !== 'idle') {
      advanceTarget();
      return;
    }
    if (!answer.trim()) return;

    const elapsedSec = Math.min(25, Math.max(0.5, (Date.now() - promptStartedAt.current) / 1000));
    setAttempts((prev) => prev + 1);

    if (answer.trim() === expected.password) {
      setSubmittedState('correct');
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setElapsedSamplesSec((prev) => [...prev, elapsedSec]);
    } else {
      setSubmittedState('wrong');
      setStreak(0);
    }
  };

  const avgSpeed =
    elapsedSamplesSec.length > 0
      ? (elapsedSamplesSec.reduce((a, b) => a + b, 0) / elapsedSamplesSec.length).toFixed(1)
      : '—';

  const accuracy =
    attempts > 0 ? `${Math.round((correctCount / attempts) * 100)}%` : '—';

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `passweave-blueprint-${locale}.png`;
    link.click();
  };

  const handleCopyMarkdown = async () => {
    const md = renderZeroSecretMarkdown(spec, locale);
    try {
      await navigator.clipboard.writeText(md);
      setCopiedMd(true);
      window.setTimeout(() => setCopiedMd(false), 1800);
    } catch {
      // Ignore clipboard failures.
    }
  };

  const handleDownloadMarkdown = () => {
    const md = renderZeroSecretMarkdown(spec, locale);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `passweave-blueprint-${locale}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <p className="font-mono text-xs font-semibold tracking-wider text-teal-700 uppercase dark:text-teal-400">
          {t.drill.eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          {t.drill.title}
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t.drill.subtitle}
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Blind Recall Drill */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-6 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-3.5 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t.drill.challengeTitle}
            </h2>
            <button
              type="button"
              onClick={() => setShowHints((prev) => !prev)}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {showHints ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{showHints ? t.drill.hideSteps : t.drill.peekSteps}</span>
            </button>
          </div>

          {/* Drill Metrics */}
          <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/70">
            <div>
              <div className="font-mono text-[10px] text-zinc-500 uppercase dark:text-zinc-400">
                {t.drill.streakLabel}
              </div>
              <div className="mt-0.5 font-mono text-lg font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
                {streak}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-zinc-500 uppercase dark:text-zinc-400">
                {t.drill.accuracyLabel}
              </div>
              <div className="mt-0.5 font-mono text-lg font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
                {accuracy}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-zinc-500 uppercase dark:text-zinc-400">
                {t.drill.avgSpeedLabel}
              </div>
              <div className="mt-0.5 font-mono text-lg font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
                {avgSpeed === '—' ? '—' : `${avgSpeed}s`}
              </div>
            </div>
          </div>

          {/* Target Prompt */}
          <div className="mt-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.drill.promptPrefix}
              </span>
              <span
                className={`rounded px-2 py-0.5 font-mono text-[11px] font-semibold ${
                  currentTier === 'tier1'
                    ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300'
                    : currentTier === 'tier2'
                      ? 'bg-teal-500/15 text-teal-800 dark:text-teal-300'
                      : 'bg-zinc-500/20 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                {currentTier === 'tier1'
                  ? t.tiers.tier1Short
                  : currentTier === 'tier2'
                    ? t.tiers.tier2Short
                    : t.tiers.tier3Short}
              </span>
            </div>

            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {locale === 'zh' ? currentSite.nameZh : currentSite.nameEn}
              </span>
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                ({currentSite.url})
              </span>
            </div>

            {showHints && (
              <div className="mt-3 space-y-1.5 border-t border-zinc-200 pt-3 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                {expected.mentalSteps.slice(0, 2).map((step) => (
                  <div key={step.index} className="flex items-center justify-between font-mono">
                    <span>
                      0{step.index}. {locale === 'zh' ? step.titleZh : step.titleEn}
                    </span>
                    <span className="font-semibold text-teal-700 dark:text-teal-300">
                      {step.output}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (submittedState !== 'idle') setSubmittedState('idle');
              }}
              placeholder={t.drill.inputPlaceholder}
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3.5 py-2.5 font-mono text-sm text-zinc-900 placeholder:font-sans placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-teal-400"
            />

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
              >
                {submittedState === 'idle' ? t.drill.submitBtn : t.drill.skipBtn}
              </button>
              {submittedState === 'idle' && (
                <button
                  type="button"
                  onClick={advanceTarget}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  <span>{t.drill.skipBtn}</span>
                </button>
              )}
            </div>
          </form>

          {submittedState !== 'idle' && (
            <div
              className={`mt-4 rounded-lg border p-3.5 ${
                submittedState === 'correct'
                  ? 'border-teal-500/35 bg-teal-500/8'
                  : 'border-rose-500/35 bg-rose-500/8'
              }`}
            >
              <div
                className={`text-xs font-semibold ${
                  submittedState === 'correct'
                    ? 'text-teal-800 dark:text-teal-300'
                    : 'text-rose-800 dark:text-rose-300'
                }`}
              >
                {submittedState === 'correct' ? t.drill.correctMsg : t.drill.mismatchMsg}
              </div>
              <div className="mt-2.5">
                <TokenAnatomy segments={expected.segments} compact />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Zero-Secret Blueprint Card Export */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-6 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="border-b border-zinc-200 pb-3.5 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t.drill.exportTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t.drill.exportSubtitle}
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
            <canvas ref={canvasRef} className="block h-auto w-full" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t.drill.downloadPng}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              {copiedMd ? <Check className="h-3.5 w-3.5 text-teal-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedMd ? t.drill.copiedMarkdown : t.drill.copyMarkdown}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{t.drill.downloadMarkdown}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
