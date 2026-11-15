import { Moon, Sun } from 'lucide-react';
import type { WorkspaceStageId } from '../core/storage';
import type { ThemeMode } from '../hooks/useTheme';
import { useI18n } from '../i18n/I18nContext';
import { BrandMark } from './BrandMark';

export type StageId = WorkspaceStageId;

interface TopBarProps {
  activeStage: StageId;
  onSelectStage: (stage: StageId) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  checkSummary: { passed: number; total: number; hasIssue: boolean };
}

export function TopBar({
  activeStage,
  onSelectStage,
  theme,
  onToggleTheme,
  checkSummary,
}: TopBarProps) {
  const { locale, toggleLocale, t } = useI18n();
  const allPassed = checkSummary.passed === checkSummary.total;

  const stages: Array<{ id: StageId; label: string }> = [
    { id: 'why', label: t.nav.why },
    { id: 'design', label: t.nav.design },
    { id: 'check', label: t.nav.check },
    { id: 'save', label: t.nav.save },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={() => onSelectStage('design')}
          className="flex cursor-pointer items-center gap-2.5"
        >
          <BrandMark className="h-8 w-8 shrink-0 shadow-xs" />
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            PassWeave
          </span>
        </button>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 rounded-xl border border-zinc-200/90 bg-zinc-100/85 p-1 sm:flex dark:border-zinc-800 dark:bg-zinc-900/90"
        >
          {stages.map((stage) => {
            const active = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(stage.id)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-zinc-50'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <span>{stage.label}</span>
                {stage.id === 'check' && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 font-mono text-xs font-semibold ${
                      allPassed
                        ? 'bg-teal-500/14 text-teal-700 dark:bg-teal-400/16 dark:text-teal-300'
                        : checkSummary.hasIssue
                          ? 'bg-amber-500/18 text-amber-800 dark:bg-amber-400/20 dark:text-amber-300'
                          : 'bg-zinc-200/80 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {checkSummary.passed}/{checkSummary.total}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLocale}
            className="cursor-pointer rounded-xl border border-zinc-200/90 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {locale === 'zh' ? 'EN' : '中文'}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-zinc-200/90 bg-white p-2 text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex border-t border-zinc-200/70 px-4 py-2 sm:hidden dark:border-zinc-800/70">
        <div className="grid w-full grid-cols-4 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
          {stages.map((stage) => {
            const active = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(stage.id)}
                className={`inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg py-1.5 text-center text-sm font-medium ${
                  active
                    ? 'bg-white text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-zinc-50'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span>{stage.label}</span>
                {stage.id === 'check' && checkSummary.hasIssue && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
