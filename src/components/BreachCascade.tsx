import { ArrowRight, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BUILTIN_SITES } from '../core/sites';
import type { AccountTier, PatternSpec } from '../core/types';
import { weavePassword } from '../core/weaver';
import { useI18n } from '../i18n/I18nContext';

type StrategyKey = 'reuse' | 'naive' | 'woven';

interface TraceRow {
  id: string;
  targetName: string;
  url: string;
  tier: AccountTier;
  activeCredential: string;
  attackerPayload: string;
  status: 'origin' | 'compromised' | 'isolated' | 'resisted';
  latencyMs: number;
}

interface BreachCascadeProps {
  spec: PatternSpec;
  onProceed: () => void;
}

export function BreachCascade({ spec, onProceed }: BreachCascadeProps) {
  const { locale, t } = useI18n();
  const [strategy, setStrategy] = useState<StrategyKey>('reuse');
  const [visibleRows, setVisibleRows] = useState<number>(6);
  const [replaying, setReplaying] = useState<boolean>(false);

  const forum = BUILTIN_SITES.find((s) => s.id === 'forum-decoy')!;
  const github = BUILTIN_SITES.find((s) => s.id === 'github')!;
  const taobao = BUILTIN_SITES.find((s) => s.id === 'taobao')!;
  const wechat = BUILTIN_SITES.find((s) => s.id === 'wechat')!;
  const google = BUILTIN_SITES.find((s) => s.id === 'google')!;
  const alipay = BUILTIN_SITES.find((s) => s.id === 'alipay')!;

  const targets = [forum, github, taobao, wechat, google, alipay];

  const rows: TraceRow[] = targets.map((site, index) => {
    const label = locale === 'zh' ? site.nameZh : site.nameEn;

    if (strategy === 'reuse') {
      const shared = 'Cedar2026!';
      return {
        id: site.id,
        targetName: label,
        url: site.url,
        tier: site.defaultTier,
        activeCredential: shared,
        attackerPayload: index === 0 ? 'SELECT pass FROM users' : shared,
        status: index === 0 ? 'origin' : 'compromised',
        latencyMs: index * 190,
      };
    }

    if (strategy === 'naive') {
      const cred = `Cedar_${site.domainCore}`;
      return {
        id: site.id,
        targetName: label,
        url: site.url,
        tier: site.defaultTier,
        activeCredential: cred,
        attackerPayload: index === 0 ? 'SELECT pass FROM users' : `Cedar_${site.domainCore}`,
        status: index === 0 ? 'origin' : 'compromised',
        latencyMs: index * 340,
      };
    }

    const woven = weavePassword(spec, site).password;
    const decoy = weavePassword(spec, forum, 'tier3').password;
    const mutatedGuess = `${decoy.replace(/!$/, '')}_${site.domainCore}`;

    return {
      id: site.id,
      targetName: label,
      url: site.url,
      tier: site.defaultTier,
      activeCredential: woven,
      attackerPayload: index === 0 ? 'SELECT pass FROM users' : mutatedGuess,
      status: index === 0 ? 'origin' : site.defaultTier === 'tier1' ? 'isolated' : 'resisted',
      latencyMs: index * 260,
    };
  });

  useEffect(() => {
    setVisibleRows(1);
    setReplaying(true);
    let current = 1;
    const timer = window.setInterval(() => {
      current += 1;
      setVisibleRows(current);
      if (current >= 6) {
        window.clearInterval(timer);
        setReplaying(false);
      }
    }, 150);
    return () => window.clearInterval(timer);
  }, [strategy]);

  const triggerReplay = () => {
    setVisibleRows(1);
    setReplaying(true);
    let current = 1;
    const timer = window.setInterval(() => {
      current += 1;
      setVisibleRows(current);
      if (current >= 6) {
        window.clearInterval(timer);
        setReplaying(false);
      }
    }, 150);
  };

  const compromisedCount = rows.filter((r) => r.status === 'compromised').length;
  const strategyList: StrategyKey[] = ['reuse', 'naive', 'woven'];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end dark:border-zinc-800">
        <div className="max-w-3xl space-y-1.5">
          <p className="font-mono text-xs font-semibold tracking-wider text-teal-700 uppercase dark:text-teal-400">
            {t.cascade.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            {t.cascade.title}
          </h1>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t.cascade.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={triggerReplay}
          disabled={replaying}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 disabled:opacity-50 sm:self-auto dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${replaying ? 'animate-spin' : ''}`} />
          <span>{replaying ? t.cascade.replaying : t.cascade.runTrace}</span>
        </button>
      </div>

      {/* Strategy Switcher Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        {strategyList.map((key) => {
          const item = t.cascade.strategies[key];
          const active = strategy === key;
          const isSafe = key === 'woven';

          return (
            <button
              key={key}
              type="button"
              onClick={() => setStrategy(key)}
              className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                active
                  ? isSafe
                    ? 'border-teal-600 bg-teal-500/6 ring-1 ring-teal-600/30 dark:border-teal-400 dark:bg-teal-400/8 dark:ring-teal-400/30'
                    : 'border-rose-600/80 bg-rose-500/5 ring-1 ring-rose-600/20 dark:border-rose-400/80 dark:bg-rose-400/8 dark:ring-rose-400/25'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.name}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                      isSafe
                        ? 'bg-teal-500/15 text-teal-800 dark:text-teal-300'
                        : 'bg-rose-500/15 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.summary}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Trace Console & Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/80">
        {/* Console Top Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>{t.cascade.leakSource}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">{t.cascade.summaryLabel}:</span>
            {compromisedCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                {compromisedCount} / 5 {t.cascade.table.compromised}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400">
                <ShieldCheck className="h-3.5 w-3.5" />0 / 5 {t.cascade.table.compromised}
              </span>
            )}
          </div>
        </div>

        {/* Attacker Logic Banner */}
        <div className="border-b border-zinc-200 bg-zinc-100/60 px-4 py-2.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300">
          <span className="mr-2 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            [TRACE]
          </span>
          {t.cascade.strategies[strategy].attackerLogic}
        </div>

        {/* Trace Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                <th className="px-4 py-2.5 font-medium">{t.cascade.table.target}</th>
                <th className="px-4 py-2.5 font-medium">{t.cascade.table.tier}</th>
                <th className="px-4 py-2.5 font-medium">{t.cascade.table.credentialInUse}</th>
                <th className="px-4 py-2.5 font-medium">{t.cascade.table.attackerAttempt}</th>
                <th className="px-4 py-2.5 text-right font-medium">{t.cascade.table.outcome}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
              {rows.map((row, idx) => {
                const shown = idx < visibleRows;
                return (
                  <tr
                    key={row.id}
                    className={`transition-opacity duration-200 ${
                      shown ? 'opacity-100' : 'opacity-15'
                    } ${
                      row.status === 'compromised'
                        ? 'bg-rose-500/[0.03] dark:bg-rose-500/[0.04]'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {row.targetName}
                      </div>
                      <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                        {row.url}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      {row.tier === 'tier1'
                        ? t.tiers.tier1Short
                        : row.tier === 'tier2'
                          ? t.tiers.tier2Short
                          : t.tiers.tier3Short}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {row.activeCredential}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      <span>{row.attackerPayload}</span>
                      {idx > 0 && (
                        <span className="ml-2 text-[10px] text-zinc-400 tabular-nums dark:text-zinc-500">
                          +{row.latencyMs}ms
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] font-semibold">
                      {row.status === 'origin' && (
                        <span className="inline-flex items-center rounded bg-amber-500/15 px-2 py-0.5 text-amber-800 dark:text-amber-300">
                          {t.cascade.table.breachOrigin}
                        </span>
                      )}
                      {row.status === 'compromised' && (
                        <span className="inline-flex items-center rounded bg-rose-500/15 px-2 py-0.5 text-rose-700 dark:text-rose-300">
                          {t.cascade.table.compromised}
                        </span>
                      )}
                      {row.status === 'isolated' && (
                        <span className="inline-flex items-center rounded bg-teal-500/15 px-2 py-0.5 text-teal-800 dark:text-teal-300">
                          {t.cascade.table.isolated}
                        </span>
                      )}
                      {row.status === 'resisted' && (
                        <span className="inline-flex items-center rounded bg-zinc-200/80 px-2 py-0.5 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                          {t.cascade.table.resisted}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onProceed}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
        >
          <span>{t.cascade.nextToWorkbench}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
