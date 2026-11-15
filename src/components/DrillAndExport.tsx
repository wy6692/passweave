import { Check, Copy, CornerDownLeft, Download, KeyRound } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  drawZeroSecretBlueprintCanvas,
  renderZeroSecretMarkdown,
} from '../core/blueprintCard';
import type { AccountTier, PatternSpec, SiteEntry } from '../core/types';
import { weavePassword } from '../core/weaver';
import { useI18n } from '../i18n/I18nContext';
import { TokenAnatomy } from './TokenAnatomy';
import { TactileInput } from './ui/TactileInput';
import { SiteAvatar } from './visuals/SiteAvatar';

interface DrillAndExportProps {
  spec: PatternSpec;
  sites: SiteEntry[];
  tierOverrides: Record<string, AccountTier>;
  bestStreak: number;
  onRecordBestStreak: (streak: number) => void;
}

export function DrillAndExport({
  spec,
  sites,
  tierOverrides,
  bestStreak,
  onRecordBestStreak,
}: DrillAndExportProps) {
  const { locale, t } = useI18n();
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showWrongGuide, setShowWrongGuide] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => new Set());
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [savedPng, setSavedPng] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSite = sites[targetIndex % sites.length] ?? sites[0]!;
  const currentTier = tierOverrides[currentSite.id] ?? currentSite.defaultTier;
  const expected = weavePassword(spec, currentSite, currentTier);

  useEffect(() => {
    if (canvasRef.current) {
      drawZeroSecretBlueprintCanvas(canvasRef.current, spec, locale);
    }
  }, [spec, locale]);

  const selectSiteIndex = (idx: number) => {
    setTargetIndex(idx);
    setAnswer('');
    setStatus('idle');
    setShowWrongGuide(false);
    setShowHint(false);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const nextTarget = () => {
    selectSiteIndex((targetIndex + 1) % sites.length);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (status === 'correct') {
      nextTarget();
      return;
    }
    if (!answer.trim()) return;

    if (answer.trim() === expected.password) {
      const nextStreak = streak + 1;
      setStatus('correct');
      setShowWrongGuide(false);
      setStreak(nextStreak);
      onRecordBestStreak(nextStreak);
      setMasteredIds((prev) => {
        const next = new Set(prev);
        next.add(currentSite.id);
        return next;
      });
    } else {
      setStatus('wrong');
      setShowWrongGuide(true);
      setStreak(0);
      inputRef.current?.select();
    }
  };

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `passweave-card-${locale}.png`;
    link.click();
    setSavedPng(true);
    window.setTimeout(() => setSavedPng(false), 1600);
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
      {/* Left: App-Unlock Style Recall Test */}
      <div className="surface-card rounded-2xl border border-zinc-200/90 p-6 sm:p-7 lg:col-span-5 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {t.save.practiceTitle}
          </span>

          <div className="flex items-center gap-2.5">
            {(streak > 0 || bestStreak > 0) && (
              <span className="rounded-lg bg-teal-500/12 px-2.5 py-0.5 font-mono text-xs font-medium text-teal-800 dark:text-teal-300">
                {streak > 0
                  ? `${t.save.streak} ${streak}`
                  : `${t.save.bestStreak} ${bestStreak}`}
              </span>
            )}
            {currentTier !== 'tier3' && (
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="cursor-pointer text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {showHint ? t.save.hideHintBtn : t.save.hintBtn}
              </button>
            )}
          </div>
        </div>

        {/* Clickable Site Avatar Picker Strip */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1.5">
          {sites.map((site, idx) => {
            const active = idx === targetIndex % sites.length;
            const done = masteredIds.has(site.id);
            return (
              <button
                key={site.id}
                type="button"
                onClick={() => selectSiteIndex(idx)}
                title={locale === 'zh' ? site.nameZh : site.nameEn}
                className={`relative shrink-0 cursor-pointer rounded-xl p-0.5 transition-all ${
                  active
                    ? 'ring-2 ring-teal-500 dark:ring-teal-400'
                    : 'opacity-65 hover:opacity-100'
                }`}
              >
                <SiteAvatar domainCore={site.domainCore} size="sm" />
                {done && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-white shadow-xs">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col items-center rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-6 text-center dark:border-zinc-800 dark:bg-zinc-950/60">
          <SiteAvatar domainCore={currentSite.domainCore} size="lg" />

          <div className="mt-3.5 flex items-center gap-2">
            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {locale === 'zh' ? currentSite.nameZh : currentSite.nameEn}
            </span>
            <span className="rounded-md bg-zinc-200/80 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {t.tiers[currentTier]}
            </span>
          </div>

          <div className="mt-1 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            {currentSite.url}
          </div>

          {showHint && currentTier !== 'tier3' && (
            <div className="mt-3.5 rounded-lg bg-amber-500/12 px-3 py-1 font-mono text-sm font-medium text-amber-800 dark:text-amber-300">
              {expected.anchorWord} → {expected.siteToken}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <TactileInput
            ref={inputRef}
            mono
            autoComplete="off"
            spellCheck={false}
            leading={<KeyRound className="h-4 w-4" />}
            trailing={
              <kbd className="inline-flex h-6 items-center rounded-md border border-zinc-300/80 bg-white px-1.5 font-mono text-xs text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
                <CornerDownLeft className="h-3 w-3" />
              </kbd>
            }
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            placeholder={t.save.inputPlaceholder}
            containerClassName="h-12"
          />

          <div className="flex items-center gap-2.5">
            <button
              type="submit"
              className="flex-1 cursor-pointer rounded-xl bg-zinc-900 px-4 py-2.5 text-base font-medium text-zinc-50 shadow-xs transition-colors hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
            >
              {status === 'correct' ? t.save.nextBtn : t.save.checkBtn}
            </button>

            {status !== 'correct' && (
              <button
                type="button"
                onClick={nextTarget}
                className="cursor-pointer rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {showWrongGuide ? t.save.skipBtn : t.save.nextBtn}
              </button>
            )}
          </div>
        </form>

        {(status === 'correct' || showWrongGuide) && (
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

      {/* Right: Metallic Visual Reference Card */}
      <div className="surface-card rounded-2xl border border-zinc-200/90 p-6 sm:p-7 lg:col-span-7 dark:border-zinc-800">
        <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {t.save.cardTitle}
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-lg">
          <canvas ref={canvasRef} className="block h-auto w-full" />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-base font-medium text-zinc-50 shadow-xs transition-colors hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
          >
            {savedPng ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            <span>{savedPng ? t.save.savedPng : t.save.downloadPng}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-base font-medium text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
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
