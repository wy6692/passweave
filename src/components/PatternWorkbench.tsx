import { ArrowRight, Check, Copy, Plus, RefreshCw } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { BLUEPRINT_PRESETS, DECOY_BUNDLES, DELIMITER_OPTIONS } from '../core/presets';
import { createCustomSiteEntry } from '../core/sites';
import { TRANSFORM_CATALOG } from '../core/transforms';
import type {
  AccountTier,
  DelimiterChar,
  PatternSpec,
  SiteEntry,
} from '../core/types';
import { TOPOLOGY_CATALOG, weavePassword } from '../core/weaver';
import { useI18n } from '../i18n/I18nContext';
import { TokenAnatomy } from './TokenAnatomy';

interface PatternWorkbenchProps {
  spec: PatternSpec;
  onChangeSpec: (next: PatternSpec) => void;
  sites: SiteEntry[];
  onAddSite: (entry: SiteEntry) => void;
  tierOverrides: Record<string, AccountTier>;
  onChangeSiteTier: (siteId: string, tier: AccountTier) => void;
  onCycleDecoy: () => void;
  decoyIndex: number;
  onProceed: () => void;
}

export function PatternWorkbench({
  spec,
  onChangeSpec,
  sites,
  onAddSite,
  tierOverrides,
  onChangeSiteTier,
  onCycleDecoy,
  decoyIndex,
  onProceed,
}: PatternWorkbenchProps) {
  const { locale, t } = useI18n();
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id ?? 'github');
  const [editingTier, setEditingTier] = useState<AccountTier>('tier2');
  const [copied, setCopied] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customPinyin, setCustomPinyin] = useState<string>('');

  const selectedSite = sites.find((s) => s.id === selectedSiteId) ?? sites[0]!;
  const effectiveSelectedTier = tierOverrides[selectedSite.id] ?? selectedSite.defaultTier;
  const selectedOutput = weavePassword(spec, selectedSite, effectiveSelectedTier);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedOutput.password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable in non-secure context.
    }
  };

  const handleAddSite = (e: FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const entry = createCustomSiteEntry(customUrl, 'tier2', customPinyin);
    onAddSite(entry);
    setSelectedSiteId(entry.id);
    setCustomUrl('');
    setCustomPinyin('');
  };

  const updateTierAnchor = (
    tier: 'tier1' | 'tier2',
    patch: Partial<PatternSpec['tier1']>,
  ) => {
    onChangeSpec({
      ...spec,
      [tier]: { ...spec[tier], ...patch },
    });
  };

  const activeDecoyLabel = DECOY_BUNDLES[decoyIndex % DECOY_BUNDLES.length]?.label ?? '';

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <p className="font-mono text-xs font-semibold tracking-wider text-teal-700 uppercase dark:text-teal-400">
          {t.workbench.eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          {t.workbench.title}
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t.workbench.subtitle}
        </p>
      </div>

      {/* Blueprint Presets */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          {t.workbench.presetsTitle}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {BLUEPRINT_PRESETS.map((preset) => {
            const matches =
              spec.naming === preset.spec.naming &&
              spec.transform === preset.spec.transform &&
              spec.topology === preset.spec.topology;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  onChangeSpec({
                    ...preset.spec,
                    tier1: { ...preset.spec.tier1, head: spec.tier1.head, tail: spec.tier1.tail },
                    tier2: { ...preset.spec.tier2, head: spec.tier2.head, tail: spec.tier2.tail },
                    tier3Decoy: spec.tier3Decoy,
                  })
                }
                className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                  matches
                    ? 'border-teal-600 bg-teal-500/6 ring-1 ring-teal-600/25 dark:border-teal-400 dark:bg-teal-400/8 dark:ring-teal-400/25'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {locale === 'zh' ? preset.nameZh : preset.nameEn}
                  </span>
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {locale === 'zh' ? preset.tagZh : preset.tagEn}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {locale === 'zh' ? preset.descriptionZh : preset.descriptionEn}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Workbench Layout */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Rule Controls */}
        <div className="space-y-5 lg:col-span-6">
          {/* 1. Naming Anchor */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
            <h2 className="text-xs font-semibold tracking-wide text-zinc-900 uppercase dark:text-zinc-100">
              {t.workbench.namingTitle}
            </h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {(['domain', 'pinyin'] as const).map((mode) => {
                const active = spec.naming === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onChangeSpec({ ...spec, naming: mode })}
                    className={`cursor-pointer rounded-lg border p-3 text-left transition-colors ${
                      active
                        ? 'border-zinc-900 bg-zinc-900/4 dark:border-teal-400 dark:bg-teal-400/8'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {mode === 'domain' ? t.workbench.namingDomain : t.workbench.namingPinyin}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {mode === 'domain'
                        ? t.workbench.namingDomainDesc
                        : t.workbench.namingPinyinDesc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Site Token Transform */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
            <h2 className="text-xs font-semibold tracking-wide text-zinc-900 uppercase dark:text-zinc-100">
              {t.workbench.transformTitle}
            </h2>
            <div className="mt-3 space-y-2">
              {TRANSFORM_CATALOG.map((tr) => {
                const active = spec.transform === tr.id;
                return (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => onChangeSpec({ ...spec, transform: tr.id })}
                    className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-colors ${
                      active
                        ? 'border-zinc-900 bg-zinc-900/4 dark:border-teal-400 dark:bg-teal-400/8'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {locale === 'zh' ? tr.nameZh : tr.nameEn}
                      </span>
                      <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-amber-800 dark:text-amber-300">
                        {tr.exampleInput} → {tr.exampleOutput}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {locale === 'zh' ? tr.summaryZh : tr.summaryEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Weave Topology */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
            <h2 className="text-xs font-semibold tracking-wide text-zinc-900 uppercase dark:text-zinc-100">
              {t.workbench.topologyTitle}
            </h2>
            <div className="mt-3 space-y-2">
              {TOPOLOGY_CATALOG.map((topo) => {
                const active = spec.topology === topo.id;
                return (
                  <button
                    key={topo.id}
                    type="button"
                    onClick={() => onChangeSpec({ ...spec, topology: topo.id })}
                    className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-colors ${
                      active
                        ? 'border-zinc-900 bg-zinc-900/4 dark:border-teal-400 dark:bg-teal-400/8'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {locale === 'zh' ? topo.nameZh : topo.nameEn}
                      </span>
                      <span className="font-mono text-[11px] text-teal-700 dark:text-teal-400">
                        {topo.formulaPreview}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {locale === 'zh' ? topo.summaryZh : topo.summaryEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Three-Tier Personal Anchors */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-semibold tracking-wide text-zinc-900 uppercase dark:text-zinc-100">
                {t.workbench.anchorsTitle}
              </h2>
              <button
                type="button"
                onClick={onCycleDecoy}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[11px] text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <RefreshCw className="h-3 w-3" />
                <span>
                  {t.workbench.cycleDecoy} ({activeDecoyLabel})
                </span>
              </button>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              {t.workbench.sandboxHint}
            </p>

            {/* Tier Sub-Tabs */}
            <div className="mt-3 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-950">
              {(['tier2', 'tier1', 'tier3'] as const).map((tierKey) => {
                const active = editingTier === tierKey;
                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => setEditingTier(tierKey)}
                    className={`flex-1 cursor-pointer rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    {tierKey === 'tier1'
                      ? t.tiers.tier1Short
                      : tierKey === 'tier2'
                        ? t.tiers.tier2Short
                        : t.tiers.tier3Short}
                  </button>
                );
              })}
            </div>

            <p className="mt-2.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              {editingTier === 'tier1'
                ? t.tiers.tier1Desc
                : editingTier === 'tier2'
                  ? t.tiers.tier2Desc
                  : t.tiers.tier3Desc}
            </p>

            {editingTier === 'tier3' ? (
              <div className="mt-3">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {t.workbench.decoyLabel}
                </label>
                <input
                  type="text"
                  value={spec.tier3Decoy}
                  maxLength={28}
                  onChange={(e) => onChangeSpec({ ...spec, tier3Decoy: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-900 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-teal-400"
                />
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {t.workbench.headLabel}
                    </label>
                    <input
                      type="text"
                      value={spec[editingTier].head}
                      maxLength={16}
                      onChange={(e) =>
                        updateTierAnchor(editingTier, { head: e.target.value.replace(/\s/g, '') })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 font-mono text-sm text-zinc-900 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {t.workbench.tailLabel}
                    </label>
                    <input
                      type="text"
                      value={spec[editingTier].tail}
                      maxLength={8}
                      onChange={(e) =>
                        updateTierAnchor(editingTier, { tail: e.target.value.replace(/\s/g, '') })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 font-mono text-sm text-zinc-900 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-teal-400"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(['sepA', 'sepB'] as const).map((sepKey) => (
                    <div key={sepKey}>
                      <span className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {sepKey === 'sepA' ? t.workbench.sepALabel : t.workbench.sepBLabel}
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {DELIMITER_OPTIONS.map((ch: DelimiterChar) => {
                          const active = spec[editingTier][sepKey] === ch;
                          return (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => updateTierAnchor(editingTier, { [sepKey]: ch })}
                              className={`h-7 w-7 cursor-pointer rounded border font-mono text-xs font-semibold transition-colors ${
                                active
                                  ? 'border-teal-600 bg-teal-500/15 text-teal-800 dark:border-teal-400 dark:text-teal-300'
                                  : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800'
                              }`}
                            >
                              {ch}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Trace Inspector & Cross-Platform Matrix */}
        <div className="space-y-5 lg:sticky lg:top-20 lg:col-span-6">
          {/* Mental Computation Trace Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/90">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3.5 dark:border-zinc-800">
              <div>
                <div className="font-mono text-[11px] font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                  {t.workbench.inspectorTitle}
                </div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {locale === 'zh' ? selectedSite.nameZh : selectedSite.nameEn}
                  </span>
                  <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedSite.url}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[11px] text-zinc-700 tabular-nums dark:bg-zinc-800 dark:text-zinc-300">
                  {t.workbench.recallEst}: ~{selectedOutput.estimatedRecallSeconds}s
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-teal-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? t.workbench.copied : t.workbench.copyBtn}</span>
                </button>
              </div>
            </div>

            {/* Per-Site Tier Switcher */}
            <div className="mt-3 flex items-center gap-1.5">
              {(['tier1', 'tier2', 'tier3'] as const).map((tKey) => {
                const isCurr = effectiveSelectedTier === tKey;
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => onChangeSiteTier(selectedSite.id, tKey)}
                    className={`cursor-pointer rounded px-2 py-0.5 font-mono text-[11px] transition-colors ${
                      isCurr
                        ? tKey === 'tier1'
                          ? 'bg-rose-500/15 font-semibold text-rose-800 dark:text-rose-300'
                          : tKey === 'tier2'
                            ? 'bg-teal-500/15 font-semibold text-teal-800 dark:text-teal-300'
                            : 'bg-zinc-500/20 font-semibold text-zinc-800 dark:text-zinc-200'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {tKey === 'tier1'
                      ? t.tiers.tier1Short
                      : tKey === 'tier2'
                        ? t.tiers.tier2Short
                        : t.tiers.tier3Short}
                  </button>
                );
              })}
            </div>

            {/* Segmented Token Anatomy */}
            <div className="mt-4 rounded-lg border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
              <TokenAnatomy segments={selectedOutput.segments} />
            </div>

            {/* 3-Step Mental Trace */}
            <ol className="mt-4 space-y-2.5">
              {selectedOutput.mentalSteps.map((step) => (
                <li
                  key={step.index}
                  className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200/70 px-3 py-2.5 dark:border-zinc-800/80"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-100 font-mono text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      0{step.index}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {locale === 'zh' ? step.titleZh : step.titleEn}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {locale === 'zh' ? step.detailZh : step.detailEn}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                    {step.output}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Cross-Platform Matrix */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/90">
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <div className="text-xs font-semibold text-zinc-900 uppercase dark:text-zinc-100">
                {t.workbench.matrixTitle}
              </div>
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                {t.workbench.matrixHint}
              </p>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
              {sites.map((site) => {
                const siteTier = tierOverrides[site.id] ?? site.defaultTier;
                const out = weavePassword(spec, site, siteTier);
                const isSelected = site.id === selectedSite.id;

                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => setSelectedSiteId(site.id)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-teal-500/8 dark:bg-teal-400/10'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          siteTier === 'tier1'
                            ? 'bg-rose-500'
                            : siteTier === 'tier2'
                              ? 'bg-teal-500'
                              : 'bg-zinc-400'
                        }`}
                      />
                      <div className="truncate">
                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                          {locale === 'zh' ? site.nameZh : site.nameEn}
                        </span>
                        <span className="ml-2 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                          {out.anchorWord !== '—' ? `[${out.anchorWord} → ${out.siteToken}]` : '[decoy]'}
                        </span>
                      </div>
                    </div>

                    <span className="shrink-0 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {out.password}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Add Custom Site Bar */}
            <form
              onSubmit={handleAddSite}
              className="flex flex-wrap items-center gap-2 border-t border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/50"
            >
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder={t.workbench.addSitePlaceholder}
                className="min-w-44 flex-1 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-teal-400"
              />
              {spec.naming === 'pinyin' && (
                <input
                  type="text"
                  value={customPinyin}
                  maxLength={4}
                  onChange={(e) => setCustomPinyin(e.target.value)}
                  placeholder={t.workbench.addSitePinyinPlaceholder}
                  className="w-28 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-teal-400"
                />
              )}
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.workbench.addSiteBtn}</span>
              </button>
            </form>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onProceed}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
            >
              <span>{t.workbench.nextToAudit}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
