import { Languages, Lock, Moon, ShieldCheck, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ThemeMode } from '../hooks/useTheme';
import { useI18n } from '../i18n/I18nContext';
import { BrandMark } from './BrandMark';

export type StageId = 'cascade' | 'workbench' | 'audit' | 'drill';

interface TopBarProps {
  activeStage: StageId;
  onSelectStage: (stage: StageId) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  isUsingDecoy: boolean;
}

export function TopBar({
  activeStage,
  onSelectStage,
  theme,
  onToggleTheme,
  isUsingDecoy,
}: TopBarProps) {
  const { locale, toggleLocale, t } = useI18n();
  const [cspOpen, setCspOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const activeCsp =
    typeof document !== 'undefined'
      ? (document
          .querySelector('meta[http-equiv="Content-Security-Policy"]')
          ?.getAttribute('content') ?? "connect-src 'none'")
      : "connect-src 'none'";

  useEffect(() => {
    if (!cspOpen) return;
    function handleOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setCspOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [cspOpen]);

  const stages: Array<{ id: StageId; label: string }> = [
    { id: 'cascade', label: t.nav.cascade },
    { id: 'workbench', label: t.nav.workbench },
    { id: 'audit', label: t.nav.audit },
    { id: 'drill', label: t.nav.drill },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-zinc-50/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8 shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                PassWeave
              </span>
              {locale === 'zh' && (
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  织密
                </span>
              )}
            </div>
            <span className="hidden text-[11px] text-zinc-500 sm:inline dark:text-zinc-400">
              {t.brandSub}
            </span>
          </div>
        </div>

        {/* Stage Navigation (Desktop) */}
        <nav
          aria-label="Stages"
          className="hidden items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100/80 p-1 lg:flex dark:border-zinc-800 dark:bg-zinc-900/90"
        >
          {stages.map((stage) => {
            const active = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(stage.id)}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-white text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-zinc-50'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {stage.label}
              </button>
            );
          })}
        </nav>

        {/* Utility Controls */}
        <div className="relative flex items-center gap-2" ref={popoverRef}>
          <span
            className="hidden items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 font-mono text-[11px] text-zinc-600 md:inline-flex dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            title={t.workbench.sandboxHint}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isUsingDecoy ? 'bg-teal-500' : 'bg-amber-500'
              }`}
            />
            {isUsingDecoy ? t.trust.sandboxActive : t.trust.customAnchors}
          </span>

          <button
            type="button"
            onClick={() => setCspOpen((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-teal-600/25 bg-teal-500/8 px-2.5 py-1 font-mono text-[11px] font-medium text-teal-800 transition-colors hover:bg-teal-500/15 dark:border-teal-400/25 dark:bg-teal-400/10 dark:text-teal-300 dark:hover:bg-teal-400/15"
          >
            <Lock className="h-3 w-3" />
            <span className="hidden sm:inline">{t.trust.offlineBadge}</span>
            <span className="sm:hidden">CSP</span>
          </button>

          <button
            type="button"
            onClick={toggleLocale}
            aria-label="Switch language"
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{locale === 'zh' ? 'EN' : '中文'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
            className="inline-flex cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white p-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* CSP Verification Popover */}
          {cspOpen && (
            <div className="absolute top-11 right-0 z-40 w-80 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl sm:w-96 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t.trust.verifyTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCspOpen(false)}
                  className="cursor-pointer rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {t.trust.verifyDesc}
              </p>
              <div className="mt-3">
                <div className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  {t.trust.cspLabel}
                </div>
                <pre className="mt-1 overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-teal-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-teal-300">
                  {activeCsp}
                </pre>
              </div>
              <div className="mt-3 border-t border-zinc-200 pt-2.5 dark:border-zinc-800">
                <div className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  {t.trust.storageLabel}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t.trust.storageDesc}
                </p>
                <p className="mt-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  {t.trust.devToolsTip}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Stage Navigation */}
      <div className="flex overflow-x-auto border-t border-zinc-200/70 px-4 py-2 lg:hidden dark:border-zinc-800/70">
        <div className="flex items-center gap-1.5">
          {stages.map((stage) => {
            const active = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(stage.id)}
                className={`shrink-0 cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                {stage.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
