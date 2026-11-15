import { Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../hooks/useTheme';
import { useI18n } from '../i18n/I18nContext';
import { BrandMark } from './BrandMark';

export type StageId = 'why' | 'design' | 'check' | 'save';

interface TopBarProps {
  activeStage: StageId;
  onSelectStage: (stage: StageId) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function TopBar({
  activeStage,
  onSelectStage,
  theme,
  onToggleTheme,
}: TopBarProps) {
  const { locale, toggleLocale, t } = useI18n();

  const stages: Array<{ id: StageId; label: string }> = [
    { id: 'why', label: t.nav.why },
    { id: 'design', label: t.nav.design },
    { id: 'check', label: t.nav.check },
    { id: 'save', label: t.nav.save },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-zinc-50/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={() => onSelectStage('design')}
          className="flex cursor-pointer items-center gap-2.5"
        >
          <BrandMark className="h-7 w-7 shrink-0" />
          <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            PassWeave
          </span>
        </button>

        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          {stages.map((stage) => {
            const active = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(stage.id)}
                className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100'
                }`}
              >
                {stage.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLocale}
            className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {locale === 'zh' ? 'EN' : '中文'}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex border-t border-zinc-200/70 px-4 py-2 sm:hidden dark:border-zinc-800/70">
        <div className="grid w-full grid-cols-4 gap-1">
          {stages.map((stage) => {
            const active = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(stage.id)}
                className={`cursor-pointer rounded-md py-1.5 text-center text-sm font-medium ${
                  active
                    ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 dark:text-zinc-400'
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
