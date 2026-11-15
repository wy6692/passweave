import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { auditPatternSpec } from '../core/auditor';
import type { PatternSpec } from '../core/types';
import { useI18n } from '../i18n/I18nContext';
import { SecurityShieldIllustration } from './visuals/SecurityShieldIllustration';
import { SiteAvatar } from './visuals/SiteAvatar';

interface AdversarialAuditProps {
  spec: PatternSpec;
  onChangeSpec: (next: PatternSpec) => void;
}

export function AdversarialAudit({ spec, onChangeSpec }: AdversarialAuditProps) {
  const { t } = useI18n();
  const report = auditPatternSpec(spec);
  const { passwordA, passwordB, siteA, siteB, sharedPrefixLen } = report.sampleDiff;

  const findCheck = (id: string) => report.checks.find((c) => c.id === id);
  const literalOk = findCheck('literal-leak')?.severity === 'pass';
  const formatOk = findCheck('policy-compliance')?.severity === 'pass';
  const coreOk = findCheck('tier3-isolation')?.severity === 'pass';
  const prefixVaried = sharedPrefixLen === 0;

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
            head: spec.tier2.head.length < 5 ? 'Cedar' : spec.tier2.head,
            tail:
              /\d/.test(spec.tier2.tail) && spec.tier2.tail.length >= 2
                ? spec.tier2.tail
                : '84',
          },
        }),
    },
    {
      id: 'core',
      ok: coreOk,
      text: coreOk ? t.check.items.coreSeparated.pass : t.check.items.coreSeparated.fail,
      fixLabel: t.check.items.coreSeparated.fix,
      onFix: () =>
        applyPatch({
          tier1: { ...spec.tier1, head: `${spec.tier2.head}Key`, tail: '91' },
          tier3Decoy: 'Pond-73-Mint!',
        }),
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

  const passedCount = rows.filter((r) => r.ok).length;
  const maxLen = Math.max(passwordA.length, passwordB.length);

  return (
    <section className="space-y-6">
      {/* Visual Alignment Card + Shield Dial */}
      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        <div className="surface-card flex flex-col items-center justify-center rounded-2xl border border-zinc-200/90 p-6 lg:col-span-4 dark:border-zinc-800">
          <SecurityShieldIllustration passedCount={passedCount} totalCount={rows.length} />
        </div>

        <div className="surface-card flex flex-col justify-center rounded-2xl border border-zinc-200/90 p-6 sm:p-8 lg:col-span-8 dark:border-zinc-800">
          <div className="mb-5 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {t.check.leakCompareTitle}
          </div>

          <div className="space-y-4 overflow-x-auto pb-1">
            {[
              { site: siteA, pw: passwordA, other: passwordB },
              { site: siteB, pw: passwordB, other: passwordA },
            ].map((row) => (
              <div key={row.site.id} className="flex items-center gap-3.5">
                <div className="flex w-36 shrink-0 items-center gap-2.5">
                  <SiteAvatar domainCore={row.site.domainCore} size="sm" />
                  <span className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
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
                        className={`inline-flex h-10 w-8.5 items-center justify-center rounded-lg border font-mono text-lg ${
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
    </section>
  );
}
