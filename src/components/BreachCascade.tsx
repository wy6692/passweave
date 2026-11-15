import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { BUILTIN_SITES } from '../core/sites';
import type { PatternSpec } from '../core/types';
import { weavePassword } from '../core/weaver';
import { useI18n } from '../i18n/I18nContext';

type ModeKey = 'reuse' | 'suffix' | 'weave';

interface BreachCascadeProps {
  spec: PatternSpec;
  onProceed: () => void;
}

export function BreachCascade({ spec, onProceed }: BreachCascadeProps) {
  const { locale, t } = useI18n();
  const [mode, setMode] = useState<ModeKey>('reuse');

  const forum = BUILTIN_SITES.find((s) => s.id === 'forum-decoy')!;
  const targets = [
    BUILTIN_SITES.find((s) => s.id === 'github')!,
    BUILTIN_SITES.find((s) => s.id === 'wechat')!,
    BUILTIN_SITES.find((s) => s.id === 'taobao')!,
    BUILTIN_SITES.find((s) => s.id === 'google')!,
    BUILTIN_SITES.find((s) => s.id === 'alipay')!,
  ];

  const leakedPassword =
    mode === 'reuse'
      ? 'Cedar2026!'
      : mode === 'suffix'
        ? `Cedar_${forum.domainCore}`
        : weavePassword(spec, forum, 'tier3').password;

  const hintText =
    mode === 'reuse'
      ? t.why.hintReuse
      : mode === 'suffix'
        ? t.why.hintSuffix
        : t.why.hintWeave;

  const modes: ModeKey[] = ['reuse', 'suffix', 'weave'];

  return (
    <section className="space-y-8">
      {/* Mode Switcher */}
      <div className="grid grid-cols-1 gap-2 rounded-2xl border border-zinc-200 bg-zinc-100/80 p-1.5 sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900">
        {modes.map((key) => {
          const active = mode === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`cursor-pointer rounded-xl px-4 py-3 text-base font-medium transition-all ${
                active
                  ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {t.why.modes[key]}
            </button>
          );
        })}
      </div>

      {/* Cause -> Effect Layout */}
      <div className="grid items-stretch gap-6 md:grid-cols-12">
        {/* Left: Breach Source */}
        <div className="flex flex-col justify-between rounded-2xl border border-amber-500/35 bg-amber-500/[0.04] p-6 md:col-span-5 dark:border-amber-400/25 dark:bg-amber-400/[0.04]">
          <div className="space-y-4">
            <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">
              {t.why.breachBoxTitle}
            </div>

            <div className="rounded-xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                {t.why.breachSite}
              </div>
              <div className="mt-2 font-mono text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {leakedPassword}
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {hintText}
          </p>
        </div>

        {/* Right: Other Accounts */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:col-span-7 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="mb-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            {t.why.accountsTitle}
          </div>

          <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
            {targets.map((site) => {
              const name = locale === 'zh' ? site.nameZh : site.nameEn;
              const password =
                mode === 'reuse'
                  ? 'Cedar2026!'
                  : mode === 'suffix'
                    ? `Cedar_${site.domainCore}`
                    : weavePassword(spec, site).password;

              const safe = mode === 'weave';
              const statusLabel =
                mode === 'reuse'
                  ? t.why.statusCompromised
                  : mode === 'suffix'
                    ? t.why.statusGuessed
                    : t.why.statusSafe;

              return (
                <div
                  key={site.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                >
                  <span className="min-w-28 text-base font-medium text-zinc-900 dark:text-zinc-100">
                    {name}
                  </span>

                  <span className="font-mono text-base text-zinc-600 dark:text-zinc-300">
                    {password}
                  </span>

                  <span
                    className={`rounded-lg px-2.5 py-1 text-sm font-medium ${
                      safe
                        ? 'bg-teal-500/12 text-teal-800 dark:bg-teal-400/12 dark:text-teal-300'
                        : 'bg-rose-500/12 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onProceed}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-base font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
        >
          <span>{t.why.ctaDesign}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
