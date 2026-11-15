import { ArrowRight, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { BUILTIN_SITES } from '../core/sites';
import type { AccountTier, PatternSpec, SiteEntry } from '../core/types';
import { weavePassword } from '../core/weaver';
import { useI18n } from '../i18n/I18nContext';
import { BreachTopologyIllustration } from './visuals/BreachTopologyIllustration';
import { SiteAvatar } from './visuals/SiteAvatar';

type ModeKey = 'reuse' | 'suffix' | 'weave';

interface BreachCascadeProps {
  spec: PatternSpec;
  sites: SiteEntry[];
  tierOverrides: Record<string, AccountTier>;
  onProceed: () => void;
}

export function BreachCascade({
  spec,
  sites,
  tierOverrides,
  onProceed,
}: BreachCascadeProps) {
  const { locale, t } = useI18n();
  const [mode, setMode] = useState<ModeKey>('reuse');

  const throwawayCandidates = sites.filter(
    (s) => (tierOverrides[s.id] ?? s.defaultTier) === 'tier3',
  );
  const forum =
    throwawayCandidates[0] ?? BUILTIN_SITES.find((s) => s.id === 'forum-decoy')!;

  const nonThrowaway = sites.filter(
    (s) => (tierOverrides[s.id] ?? s.defaultTier) !== 'tier3',
  );
  const targets = nonThrowaway.slice(0, 5);

  const demoBase = spec.tier2.head.trim() || 'Cedar';

  const leakedPassword =
    mode === 'reuse'
      ? `${demoBase}2026!`
      : mode === 'suffix'
        ? `${demoBase}_${forum.domainCore}`
        : weavePassword(spec, forum, 'tier3').password;

  const hintText =
    mode === 'reuse'
      ? t.why.hintReuse
      : mode === 'suffix'
        ? t.why.hintSuffix
        : t.why.hintWeave;

  const modes: ModeKey[] = ['reuse', 'suffix', 'weave'];

  return (
    <section className="space-y-6">
      {/* Segmented Mode Control */}
      <div className="grid grid-cols-1 gap-2 rounded-2xl border border-zinc-200/90 bg-zinc-100/90 p-1.5 sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900">
        {modes.map((key) => {
          const active = mode === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`cursor-pointer rounded-xl px-4 py-3 text-base font-medium transition-all ${
                active
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {t.why.modes[key]}
            </button>
          );
        })}
      </div>

      {/* Interactive Network Topology SVG Illustration */}
      <BreachTopologyIllustration
        mode={mode}
        leakedPassword={leakedPassword}
        targetLabels={targets.map((s) => (locale === 'zh' ? s.nameZh : s.nameEn))}
      />

      {/* Cause -> Effect Cards with Brand Avatars */}
      <div className="grid items-stretch gap-6 md:grid-cols-12">
        {/* Left: Breach Source */}
        <div className="surface-card flex flex-col justify-between rounded-2xl border border-zinc-200/90 p-6 md:col-span-5 dark:border-zinc-800">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SiteAvatar domainCore={forum.domainCore} size="md" />
              <div>
                <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {t.why.breachBoxTitle}
                </div>
                <div className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                  {forum.url}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200/90 bg-zinc-100/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/90">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t.why.leakedLabel}
              </div>
              <div className="mt-1.5 font-mono text-xl font-semibold text-amber-800 dark:text-amber-300">
                {leakedPassword}
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {hintText}
          </p>
        </div>

        {/* Right: Other Accounts with App Squircle Icons */}
        <div className="surface-card rounded-2xl border border-zinc-200/90 p-6 md:col-span-7 dark:border-zinc-800">
          <div className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {t.why.accountsTitle}
          </div>

          <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
            {targets.map((site) => {
              const name = locale === 'zh' ? site.nameZh : site.nameEn;
              const tier = tierOverrides[site.id] ?? site.defaultTier;
              const password =
                mode === 'reuse'
                  ? `${demoBase}2026!`
                  : mode === 'suffix'
                    ? `${demoBase}_${site.domainCore}`
                    : weavePassword(spec, site, tier).password;

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
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-36 items-center gap-3">
                    <SiteAvatar domainCore={site.domainCore} size="sm" />
                    <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                      {name}
                    </span>
                  </div>

                  <span className="font-mono text-base text-zinc-600 dark:text-zinc-300">
                    {password}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium ${
                      safe
                        ? 'bg-teal-500/12 text-teal-800 dark:bg-teal-400/12 dark:text-teal-300'
                        : 'bg-rose-500/12 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300'
                    }`}
                  >
                    {safe ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    <span>{statusLabel}</span>
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
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-base font-medium text-zinc-50 shadow-sm transition-all hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
        >
          <span>{t.why.ctaDesign}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
