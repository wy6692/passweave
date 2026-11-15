import { AlertTriangle, ArrowRight, CheckCircle2, Wrench, XCircle } from 'lucide-react';
import { auditPatternSpec } from '../core/auditor';
import type { PatternSpec } from '../core/types';
import { weavePassword } from '../core/weaver';
import { useI18n } from '../i18n/I18nContext';
import { TokenAnatomy } from './TokenAnatomy';

interface AdversarialAuditProps {
  spec: PatternSpec;
  onChangeSpec: (next: PatternSpec) => void;
  onProceed: () => void;
}

export function AdversarialAudit({ spec, onChangeSpec, onProceed }: AdversarialAuditProps) {
  const { locale, t } = useI18n();
  const report = auditPatternSpec(spec);
  const { sampleDiff } = report;

  const outA = weavePassword(spec, sampleDiff.siteA, 'tier2');
  const outB = weavePassword(spec, sampleDiff.siteB, 'tier2');

  const applyRemediation = (patch: Partial<PatternSpec>) => {
    onChangeSpec({
      ...spec,
      ...patch,
      tier1: patch.tier1 ?? spec.tier1,
      tier2: patch.tier2 ?? spec.tier2,
    });
  };

  const gradeColor =
    report.overallGrade === 'A'
      ? 'text-teal-600 dark:text-teal-400'
      : report.overallGrade === 'B'
        ? 'text-sky-600 dark:text-sky-400'
        : report.overallGrade === 'C'
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-rose-600 dark:text-rose-400';

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <p className="font-mono text-xs font-semibold tracking-wider text-teal-700 uppercase dark:text-teal-400">
          {t.audit.eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          {t.audit.title}
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t.audit.subtitle}
        </p>
      </div>

      {/* Top Score Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="font-mono text-xs text-zinc-500 uppercase dark:text-zinc-400">
            {t.audit.gradeLabel}
          </div>
          <div className={`mt-1 font-mono text-4xl font-bold ${gradeColor}`}>
            {report.overallGrade}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="font-mono text-xs text-zinc-500 uppercase dark:text-zinc-400">
            {t.audit.antiReversal}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-4xl font-bold text-zinc-900 tabular-nums dark:text-zinc-50">
              {report.antiReversalScore}
            </span>
            <span className="font-mono text-sm text-zinc-400">/ 100</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="font-mono text-xs text-zinc-500 uppercase dark:text-zinc-400">
            {t.audit.recallEase}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-4xl font-bold text-zinc-900 tabular-nums dark:text-zinc-50">
              {report.recallEaseScore}
            </span>
            <span className="font-mono text-sm text-zinc-400">/ 100</span>
          </div>
        </div>
      </div>

      {/* Two-Sample Differential View */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="border-b border-zinc-200 pb-3.5 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t.audit.diffTitle}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
            {t.audit.diffSubtitle}
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[outA, outB].map((out) => (
            <div
              key={out.site.id}
              className="rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/70"
            >
              <div className="mb-2 flex items-center justify-between font-mono text-xs">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {out.site.url}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {out.anchorWord} → {out.siteToken}
                </span>
              </div>
              <TokenAnatomy segments={out.segments} compact showLabels={false} />
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 sm:grid-cols-4 dark:border-zinc-800">
          <div>
            <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              {t.audit.sharedPrefix}
            </div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 tabular-nums dark:text-zinc-100">
              {sampleDiff.sharedPrefixLen} chars
            </div>
          </div>

          <div>
            <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              {t.audit.sharedSuffix}
            </div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 tabular-nums dark:text-zinc-100">
              {sampleDiff.sharedSuffixLen} chars
            </div>
          </div>

          <div>
            <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              {t.audit.commonSubstr}
            </div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              "{sampleDiff.longestCommonSubstring || '—'}"
            </div>
          </div>

          <div>
            <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              {t.audit.variableLoci}
            </div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 tabular-nums dark:text-zinc-100">
              {sampleDiff.diffLociCount} slot(s)
            </div>
          </div>
        </div>
      </div>

      {/* 6 Heuristic Audit Checks */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          {t.audit.checksTitle}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {report.checks.map((check) => {
            const Icon =
              check.severity === 'pass'
                ? CheckCircle2
                : check.severity === 'warn'
                  ? AlertTriangle
                  : XCircle;

            const iconColor =
              check.severity === 'pass'
                ? 'text-teal-600 dark:text-teal-400'
                : check.severity === 'warn'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400';

            return (
              <div
                key={check.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {locale === 'zh' ? check.titleZh : check.titleEn}
                      </h3>
                    </div>
                    <span className="font-mono text-xs font-semibold text-zinc-500 tabular-nums dark:text-zinc-400">
                      {check.score}/100
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {locale === 'zh' ? check.detailZh : check.detailEn}
                  </p>
                </div>

                {check.remediation && (
                  <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => applyRemediation(check.remediation!)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-teal-600/30 bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-800 transition-colors hover:bg-teal-500/20 dark:border-teal-400/30 dark:text-teal-300"
                    >
                      <Wrench className="h-3 w-3" />
                      <span>
                        {locale === 'zh'
                          ? (check.remediationLabelZh ?? t.audit.applyFix)
                          : (check.remediationLabelEn ?? t.audit.applyFix)}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onProceed}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
        >
          <span>{t.audit.nextToDrill}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
