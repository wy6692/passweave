import { Check, Copy, Plus, RefreshCw } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { DELIMITER_OPTIONS } from '../core/presets';
import { createCustomSiteEntry, resolveAnchorWord } from '../core/sites';
import { applySiteTransform } from '../core/transforms';
import type {
  AccountTier,
  DelimiterChar,
  PatternSpec,
  SiteEntry,
  TopologyId,
  TransformId,
} from '../core/types';
import { weavePassword } from '../core/weaver';
import { useI18n } from '../i18n/I18nContext';
import { TokenAnatomy } from './TokenAnatomy';

interface PatternWorkbenchProps {
  spec: PatternSpec;
  onChangeSpec: (next: PatternSpec) => void;
  sites: SiteEntry[];
  onAddSite: (entry: SiteEntry) => void;
  tierOverrides: Record<string, AccountTier>;
  onCycleDecoy: () => void;
}

const TRANSFORM_IDS: TransformId[] = [
  'consonant-count',
  'edge-length',
  'caesar-pair',
  'outer-pair',
];

const TOPOLOGY_IDS: TopologyId[] = ['split-inlay', 'mirrored-split', 'prefix-bridge'];

export function PatternWorkbench({
  spec,
  onChangeSpec,
  sites,
  onAddSite,
  tierOverrides,
  onCycleDecoy,
}: PatternWorkbenchProps) {
  const { locale, t } = useI18n();
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id ?? 'github');
  const [copied, setCopied] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customPinyin, setCustomPinyin] = useState<string>('');

  const selectedSite = sites.find((s) => s.id === selectedSiteId) ?? sites[0]!;
  const selectedTier = tierOverrides[selectedSite.id] ?? selectedSite.defaultTier;
  const selectedOutput = weavePassword(spec, selectedSite, selectedTier);

  // Reference site for rule picker previews (always use a Tier-1/2 site so tokens stay meaningful)
  const previewSite =
    selectedTier === 'tier3' ? (sites.find((s) => s.defaultTier === 'tier2') ?? sites[0]!) : selectedSite;
  const previewWord = resolveAnchorWord(previewSite, spec.naming);
  const previewToken = applySiteTransform(previewWord, spec.transform).token;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedOutput.password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore clipboard error.
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

  const dailySites = sites.filter((s) => (tierOverrides[s.id] ?? s.defaultTier) === 'tier2');
  const coreSites = sites.filter((s) => (tierOverrides[s.id] ?? s.defaultTier) === 'tier1');
  const throwawaySites = sites.filter((s) => (tierOverrides[s.id] ?? s.defaultTier) === 'tier3');

  return (
    <section className="space-y-6">
      {/* 1. Hero Formula Stage */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {locale === 'zh' ? selectedSite.nameZh : selectedSite.nameEn}
            </span>
            <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
              {selectedSite.url}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            {copied ? <Check className="h-4 w-4 text-teal-500" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? t.design.copied : t.design.copy}</span>
          </button>
        </div>

        {/* Large Segmented Output */}
        <div className="mt-6">
          <TokenAnatomy segments={selectedOutput.segments} size="lg" />
        </div>

        {/* Single-line visual derivation */}
        {selectedTier !== 'tier3' && (
          <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            <span>{selectedSite.url}</span>
            <span>→</span>
            <span className="text-zinc-800 dark:text-zinc-200">{selectedOutput.anchorWord}</span>
            <span>→</span>
            <span className="rounded bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-800 dark:text-amber-300">
              {selectedOutput.siteToken}
            </span>
          </div>
        )}

        {/* Inline Base Inputs */}
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <div className="flex flex-wrap items-end gap-4">
            <label className="space-y-1.5">
              <span className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t.design.fixedWord}
              </span>
              <input
                type="text"
                value={spec.tier2.head}
                maxLength={16}
                onChange={(e) =>
                  onChangeSpec({
                    ...spec,
                    tier2: { ...spec.tier2, head: e.target.value.replace(/\s/g, '') },
                  })
                }
                className="w-32 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-base font-medium text-teal-800 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-teal-300 dark:focus:border-teal-400"
              />
            </label>

            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t.design.delimiters}
              </span>
              <div className="flex items-center gap-2">
                {(['sepA', 'sepB'] as const).map((sepKey) => (
                  <select
                    key={sepKey}
                    aria-label={sepKey}
                    value={spec.tier2[sepKey]}
                    onChange={(e) =>
                      onChangeSpec({
                        ...spec,
                        tier2: {
                          ...spec.tier2,
                          [sepKey]: e.target.value as DelimiterChar,
                        },
                      })
                    }
                    className="cursor-pointer rounded-lg border border-zinc-300 bg-zinc-50 px-2.5 py-2 font-mono text-base font-medium text-zinc-800 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    {DELIMITER_OPTIONS.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>

            <label className="space-y-1.5">
              <span className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t.design.tailDigits}
              </span>
              <input
                type="text"
                value={spec.tier2.tail}
                maxLength={8}
                onChange={(e) =>
                  onChangeSpec({
                    ...spec,
                    tier2: { ...spec.tier2, tail: e.target.value.replace(/\s/g, '') },
                  })
                }
                className="w-24 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-base font-medium text-teal-800 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-teal-300 dark:focus:border-teal-400"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={onCycleDecoy}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t.design.shuffleExample}</span>
          </button>
        </div>
      </div>

      {/* 2. Three-Column Live Visual Rule Picker */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Column 1: Site Name */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {t.design.namingLabel}
          </div>
          <div className="space-y-2">
            {(['domain', 'pinyin'] as const).map((mode) => {
              const active = spec.naming === mode;
              const sample = mode === 'domain' ? previewSite.domainCore : previewSite.pinyinPair;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChangeSpec({ ...spec, naming: mode })}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-3.5 py-3 text-left transition-colors ${
                    active
                      ? 'border-zinc-900 bg-zinc-900/4 dark:border-teal-400 dark:bg-teal-400/10'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                    {mode === 'domain' ? t.design.namingDomain : t.design.namingPinyin}
                  </span>
                  <span className="font-mono text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {sample}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Transform */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {t.design.transformLabel}
          </div>
          <div className="space-y-2">
            {TRANSFORM_IDS.map((trId) => {
              const active = spec.transform === trId;
              const liveOut = applySiteTransform(previewWord, trId).token;
              return (
                <button
                  key={trId}
                  type="button"
                  onClick={() => onChangeSpec({ ...spec, transform: trId })}
                  className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                    active
                      ? 'border-zinc-900 bg-zinc-900/4 dark:border-teal-400 dark:bg-teal-400/10'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {t.design.transforms[trId]}
                  </span>
                  <span className="rounded-md bg-amber-500/14 px-2 py-0.5 font-mono text-sm font-semibold text-amber-900 dark:text-amber-300">
                    {liveOut}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 3: Placement */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {t.design.orderLabel}
          </div>
          <div className="space-y-2">
            {TOPOLOGY_IDS.map((topoId) => {
              const active = spec.topology === topoId;
              const h = spec.tier2.head || 'Word';
              const tl = spec.tier2.tail || '84';
              const sA = spec.tier2.sepA;
              const sB = spec.tier2.sepB;
              const lead = previewToken.slice(0, 1);
              const rest = previewToken.slice(1) || 'x';

              return (
                <button
                  key={topoId}
                  type="button"
                  onClick={() => onChangeSpec({ ...spec, topology: topoId })}
                  className={`flex w-full cursor-pointer flex-col gap-1 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                    active
                      ? 'border-zinc-900 bg-zinc-900/4 dark:border-teal-400 dark:bg-teal-400/10'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {t.design.orders[topoId]}
                  </span>
                  <div className="font-mono text-sm">
                    {topoId === 'split-inlay' && (
                      <>
                        <span className="text-teal-700 dark:text-teal-300">{h}</span>
                        <span className="text-zinc-400">{sA}</span>
                        <span className="font-semibold text-amber-700 dark:text-amber-300">
                          {previewToken}
                        </span>
                        <span className="text-zinc-400">{sB}</span>
                        <span className="text-teal-700 dark:text-teal-300">{tl}</span>
                      </>
                    )}
                    {topoId === 'mirrored-split' && (
                      <>
                        <span className="font-semibold text-amber-700 dark:text-amber-300">
                          {lead}
                        </span>
                        <span className="text-zinc-400">{sA}</span>
                        <span className="text-teal-700 dark:text-teal-300">{h}</span>
                        <span className="text-zinc-400">{sB}</span>
                        <span className="font-semibold text-amber-700 dark:text-amber-300">
                          {rest}
                        </span>
                        <span className="text-teal-700 dark:text-teal-300">{tl}</span>
                      </>
                    )}
                    {topoId === 'prefix-bridge' && (
                      <>
                        <span className="font-semibold text-amber-700 dark:text-amber-300">
                          {previewToken}
                        </span>
                        <span className="text-zinc-400">{sA}</span>
                        <span className="text-teal-700 dark:text-teal-300">{h}</span>
                        <span className="text-zinc-400">{sB}</span>
                        <span className="text-teal-700 dark:text-teal-300">{tl}</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Grouped Accounts: Layout Explains 3-Tier Isolation */}
      <div className="grid items-start gap-6 md:grid-cols-12">
        {/* Everyday Accounts */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white md:col-span-7 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="border-b border-zinc-200 px-5 py-4 text-base font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
            {t.design.dailySites}
          </div>

          <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
            {dailySites.map((site) => {
              const out = weavePassword(spec, site, 'tier2');
              const active = site.id === selectedSite.id;
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors ${
                    active
                      ? 'bg-teal-500/8 dark:bg-teal-400/10'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                    {locale === 'zh' ? site.nameZh : site.nameEn}
                  </span>
                  <span className="font-mono text-base font-medium text-zinc-800 dark:text-zinc-200">
                    {out.password}
                  </span>
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleAddSite}
            className="flex flex-wrap items-center gap-2 border-t border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
          >
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder={t.design.addSitePlaceholder}
              className="min-w-44 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            {spec.naming === 'pinyin' && (
              <input
                type="text"
                value={customPinyin}
                maxLength={4}
                onChange={(e) => setCustomPinyin(e.target.value)}
                placeholder={t.design.addPinyinPlaceholder}
                className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            )}
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <Plus className="h-4 w-4" />
              <span>{t.design.addBtn}</span>
            </button>
          </form>
        </div>

        {/* Critical & Throwaway Isolation Cards */}
        <div className="space-y-6 md:col-span-5">
          {/* Critical Accounts */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                {t.design.coreSites}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t.design.coreWordLabel}
                </span>
                <input
                  type="text"
                  value={spec.tier1.head}
                  maxLength={16}
                  onChange={(e) =>
                    onChangeSpec({
                      ...spec,
                      tier1: { ...spec.tier1, head: e.target.value.replace(/\s/g, '') },
                    })
                  }
                  className="w-28 rounded-lg border border-zinc-300 bg-zinc-50 px-2.5 py-1 font-mono text-sm font-medium text-zinc-900 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
                <input
                  type="text"
                  value={spec.tier1.tail}
                  maxLength={8}
                  onChange={(e) =>
                    onChangeSpec({
                      ...spec,
                      tier1: { ...spec.tier1, tail: e.target.value.replace(/\s/g, '') },
                    })
                  }
                  className="w-16 rounded-lg border border-zinc-300 bg-zinc-50 px-2.5 py-1 font-mono text-sm font-medium text-zinc-900 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
              {coreSites.map((site) => {
                const out = weavePassword(spec, site, 'tier1');
                const active = site.id === selectedSite.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => setSelectedSiteId(site.id)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 px-5 py-3.5 text-left transition-colors ${
                      active
                        ? 'bg-teal-500/8 dark:bg-teal-400/10'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                      {locale === 'zh' ? site.nameZh : site.nameEn}
                    </span>
                    <span className="font-mono text-base font-medium text-zinc-800 dark:text-zinc-200">
                      {out.password}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Throwaway Sites */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                {t.design.throwawaySites}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                  {t.design.throwawayWordLabel}
                </span>
                <input
                  type="text"
                  value={spec.tier3Decoy}
                  maxLength={28}
                  onChange={(e) => onChangeSpec({ ...spec, tier3Decoy: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-2.5 py-1 font-mono text-sm font-medium text-zinc-900 focus:border-teal-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
              {throwawaySites.map((site) => {
                const out = weavePassword(spec, site, 'tier3');
                const active = site.id === selectedSite.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => setSelectedSiteId(site.id)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 px-5 py-3.5 text-left transition-colors ${
                      active
                        ? 'bg-teal-500/8 dark:bg-teal-400/10'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                      {locale === 'zh' ? site.nameZh : site.nameEn}
                    </span>
                    <span className="font-mono text-base text-zinc-600 dark:text-zinc-300">
                      {out.password}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
