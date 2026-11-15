import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { computeChecklistStatus } from '../core/auditor';
import { BUILTIN_SITES } from '../core/sites';
import type { AccountTier, PatternSpec, SiteEntry } from '../core/types';
import { weavePassword } from '../core/weaver';
import { useI18n } from '../i18n/I18nContext';
import { SecurityShieldIllustration } from './visuals/SecurityShieldIllustration';
import { SiteAvatar } from './visuals/SiteAvatar';

interface AdversarialAuditProps {
  spec: PatternSpec;
  onChangeSpec: (next: PatternSpec) => void;
  sites: SiteEntry[];
  tierOverrides: Record<string, AccountTier>;
  onProceedSave: () => void;
}

function normalizeCompliantHead(raw: string): string {
  const cleaned = raw.replace(/\s/g, '');
  let next = cleaned || 'Cedar';
  if (!/[A-Z]/.test(next)) {
    next = next.charAt(0).toUpperCase() + next.slice(1);
  }
  if (!/[a-z]/.test(next)) {
    next = `${next}x`;
  }
  const padChars = 'maple';
  let idx = 0;
  while (next.length < 5) {
    next += padChars[idx % padChars.length];
    idx++;
  }
  return next;
}

export function AdversarialAudit({
  spec,
  onChangeSpec,
  sites,
  tierOverrides,
  onProceedSave,
}: AdversarialAuditProps) {
  const { locale, t } = useI18n();
  const { literalOk, formatOk, coreOk, prefixVaried, passed, total } =
    computeChecklistStatus(spec);

  const dailyPool = sites.filter(
    (s) => (tierOverrides[s.id] ?? s.defaultTier) === 'tier2',
  );
  const comparePool = dailyPool.length >= 2 ? dailyPool : BUILTIN_SITES.slice(0, 5);

  const [pairIds, setPairIds] = useState<[string, string]>(() => [
    comparePool[0]?.id ?? 'github',
    comparePool[1]?.id ?? 'taobao',
  ]);

  const siteA = comparePool.find((s) => s.id === pairIds[0]) ?? comparePool[0]!;
  const siteB =
    comparePool.find((s) => s.id === pairIds[1] && s.id !== siteA.id) ??
    comparePool.find((s) => s.id !== siteA.id) ??
    BUILTIN_SITES[3]!;

  const passwordA = weavePassword(spec, siteA, 'tier2').password;
  const passwordB = weavePassword(spec, siteB, 'tier2').password;
  const maxLen = Math.max(passwordA.length, passwordB.length);

  const handleToggleCompareSite = (clickedId: string) => {
    setPairIds(([a, b]) => {
      if (clickedId === a || clickedId === b) return [a, b];
      return [b, clickedId];
    });
  };

  const applyPatch = (patch: Partial<PatternSpec>) => {
    onChangeSpec({
      ...spec,
      ...patch,
      tier1: patch.tier1 ?? spec.tier1,
      tier2: patch.tier2 ?? spec.tier2,
    });
  };

  const rows = [
    {
      id: 'literal',
      ok: literalOk,
      text: literalOk ? t.check.items.noLiteral.pass : t.check.items.noLiteral.warn,
      fixLabel: t.check.items.noLiteral.fix,
      onFix: () => applyPatch({ transform: 'caesar-pair' }),
    },
    {
      id: 'format',
      ok: formatOk,
      text: formatOk ? t.check.items.formatOk.pass : t.check.items.formatOk.warn,
      fixLabel: t.check.items.formatOk.fix,
      onFix: () =>
        applyPatch({
          tier2: {
            ...spec.tier2,
            head: normalizeCompliantHead(spec.tier2.head),
            tail:
              /\d/.test(spec.tier2.tail) && spec.tier2.tail.length >= 2
                ? spec.tier2.tail
                : `${spec.tier2.tail.replace(/\D/g, '')}84`.slice(0, 4),
            sepA: /[^A-Za-z0-9]/.test(spec.tier2.sepA) ? spec.tier2.sepA : '#',
            sepB: /[^A-Za-z0-9]/.test(spec.tier2.sepB) ? spec.tier2.sepB : '!',
          },
        }),
    },
    {
      id: 'core',
      ok: coreOk,
      text: coreOk ? t.check.items.coreSeparated.pass : t.check.items.coreSeparated.fail,
      fixLabel: t.check.items.coreSeparated.fix,
      onFix: () => {
        const distinctHead =
          spec.tier1.head.toLowerCase() === spec.tier2.head.toLowerCase() || !spec.tier1.head.trim()
            ? `${normalizeCompliantHead(spec.tier2.head)}Key`
            : spec.tier1.head;
        const cleanDecoy =
          spec.tier3Decoy.trim().length >= 8 &&
          !spec.tier3Decoy.toLowerCase().includes(spec.tier2.head.toLowerCase()) &&
          !spec.tier3Decoy.toLowerCase().includes(distinctHead.toLowerCase())
            ? spec.tier3Decoy
            : 'Pond-73-Mint!';
        applyPatch({
          tier1: {
            ...spec.tier1,
            head: distinctHead,
            tail: spec.tier1.tail === spec.tier2.tail ? '91' : spec.tier1.tail || '91',
          },
          tier3Decoy: cleanDecoy,
        });
      },
    },
    {
      id: 'prefix',
      ok: prefixVaried,
      text: prefixVaried ? t.check.items.prefixVaried.pass : t.check.items.prefixVaried.tip,
      fixLabel: t.check.items.prefixVaried.fix,
      onFix: () =>
        applyPatch({
          topology: 'mirrored-split',
          tier2: { ...spec.tier2, sepB: ':' },
        }),
    },
  ];

  return (
    <section className="space-y-6">
      {/* Visual Alignment Card + Shield Dial */}
      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        <div className="surface-card flex flex-col items-center justify-center rounded-2xl border border-zinc-200/90 p-6 lg:col-span-4 dark:border-zinc-800">
          <SecurityShieldIllustration passedCount={passed} totalCount={total} />
        </div>

        <div className="surface-card flex flex-col justify-between rounded-2xl border border-zinc-200/90 p-6 sm:p-8 lg:col-span-8 dark:border-zinc-800">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {t.check.leakCompareTitle}
            </span>

            {/* Interactive 2-Site Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {comparePool.slice(0, 6).map((site) => {
                const selected = site.id === siteA.id || site.id === siteB.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => handleToggleCompareSite(site.id)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium transition-all ${
                      selected
                        ? 'border-amber-500/50 bg-amber-500/12 text-amber-900 dark:border-amber-400/50 dark:bg-amber-400/14 dark:text-amber-200'
                        : 'border-zinc-200/80 bg-zinc-50/70 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span>{locale === 'zh' ? site.nameZh : site.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 overflow-x-auto pb-1">
            {[
              { site: siteA, pw: passwordA, other: passwordB },
              { site: siteB, pw: passwordB, other: passwordA },
            ].map((row) => (
              <div key={row.site.id} className="flex items-center gap-3.5">
                <div className="flex w-40 shrink-0 items-center gap-2.5">
                  <SiteAvatar domainCore={row.site.domainCore} size="sm" />
                  <span className="truncate font-mono text-sm text-zinc-600 dark:text-zinc-400">
                    {row.site.url}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: maxLen }).map((_, idx) => {
                    const ch = row.pw[idx] ?? '';
                    const same = ch !== '' && ch === row.other[idx];
                    return (
                      <span
                        key={idx}
                        className={`inline-flex h-10 w-8.5 items-center justify-center rounded-lg border font-mono text-lg transition-all ${
                          same
                            ? 'border-zinc-200/80 bg-zinc-100/70 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500'
                            : 'keycap-amber border-amber-500/40 bg-amber-500/16 font-semibold text-amber-950 dark:border-amber-400/40 dark:bg-amber-400/18 dark:text-amber-200'
                        }`}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Plain-Language Checks */}
      <div className="surface-card rounded-2xl border border-zinc-200/90 p-6 sm:p-8 dark:border-zinc-800">
        <div className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {t.check.checklistTitle}
        </div>

        <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
          {rows.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div className="flex items-center gap-3">
                {item.ok ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                )}
                <span className="text-base text-zinc-800 dark:text-zinc-200">{item.text}</span>
              </div>

              {!item.ok && (
                <button
                  type="button"
                  onClick={item.onFix}
                  className="cursor-pointer rounded-xl border border-zinc-200/90 bg-white px-4 py-1.5 text-sm font-medium text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  {item.fixLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onProceedSave}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-base font-medium text-zinc-50 shadow-sm transition-all hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
        >
          <span>{t.check.nextSave}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
