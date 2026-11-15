import { Check, Copy, Globe, Hash, KeyRound, Plus, RefreshCw, Shield } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { BLUEPRINT_PRESETS } from '../core/presets';
import { createCustomSiteEntry, resolveAnchorWord } from '../core/sites';
import { applySiteTransform } from '../core/transforms';
import type {
  AccountTier,
  PatternSpec,
  SiteEntry,
  TopologyId,
  TransformId,
} from '../core/types';
import { weavePassword } from '../core/weaver';
import { useI18n } from '../i18n/I18nContext';
import { TokenAnatomy } from './TokenAnatomy';
import { SymbolPicker } from './ui/SymbolPicker';
import { TactileInput } from './ui/TactileInput';
import {
  NamingGraphic,
  PlacementGraphic,
  TransformGraphic,
} from './visuals/RuleHeaderIcons';
import { SiteAvatar } from './visuals/SiteAvatar';

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

  const previewSite =
    selectedTier === 'tier3'
      ? (sites.find((s) => s.defaultTier === 'tier2') ?? sites[0]!)
      : selectedSite;
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
      <div className="surface-card relative z-20 rounded-3xl border border-zinc-200/90 p-6 sm:p-8 dark:border-zinc-800">
        {/* Subtle decorative radial highlight inside hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
        >
          <div className="absolute -top-24 right-12 h-56 w-80 rounded-full bg-teal-500/[0.08] blur-3xl dark:bg-teal-400/[0.09]" />
        </div>

        {/* Top Bar: App Icon + Site Identity + Quick Style Presets + Copy */}
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SiteAvatar domainCore={selectedSite.domainCore} size="md" />
            <div>
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {locale === 'zh' ? selectedSite.nameZh : selectedSite.nameEn}
              </div>
              <div className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                {selectedSite.url}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Style Pills */}
            <div className="flex items-center gap-1 rounded-xl border border-zinc-200/80 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-950/70">
              {BLUEPRINT_PRESETS.map((preset) => {
                const isActive =
                  spec.naming === preset.spec.naming &&
                  spec.transform === preset.spec.transform &&
                  spec.topology === preset.spec.topology;
                const presetId = preset.id as keyof typeof t.design.presets;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      onChangeSpec({
                        ...preset.spec,
                        tier1: {
                          ...preset.spec.tier1,
                          head: spec.tier1.head,
                          tail: spec.tier1.tail,
                        },
                        tier2: {
                          ...preset.spec.tier2,
                          head: spec.tier2.head,
                          tail: spec.tier2.tail,
                        },
                        tier3Decoy: spec.tier3Decoy,
                      })
                    }
                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    {t.design.presets[presetId]}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              {copied ? <Check className="h-4 w-4 text-teal-500" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? t.design.copied : t.design.copy}</span>
            </button>
          </div>
        </div>

        {/* Mechanical Keycap Output */}
        <div className="relative mt-7">
          <TokenAnatomy segments={selectedOutput.segments} size="lg" />
        </div>

        {/* Visual Derivation Breadcrumb */}
        {selectedTier !== 'tier3' && (
          <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200/70 bg-zinc-100/60 px-3.5 py-1.5 font-mono text-sm text-zinc-500 dark:border-zinc-800/90 dark:bg-zinc-950/60 dark:text-zinc-400">
            <span>{selectedSite.url}</span>
            <span className="text-zinc-400 dark:text-zinc-600">→</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {selectedOutput.anchorWord}
            </span>
            <span className="text-zinc-400 dark:text-zinc-600">→</span>
            <span className="rounded-md bg-amber-500/16 px-2 py-0.5 font-semibold text-amber-800 dark:text-amber-300">
              {selectedOutput.siteToken}
            </span>
          </div>
        )}

        {/* Custom Tactile Base Controls */}
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-zinc-200/80 pt-5 dark:border-zinc-800/80">
          <div className="flex flex-wrap items-end gap-3.5">
            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t.design.fixedWord}
              </span>
              <TactileInput
                mono
                accent="teal"
                leading={<KeyRound className="h-4 w-4" />}
                value={spec.tier2.head}
                maxLength={16}
                containerClassName="w-40"
                onChange={(e) =>
                  onChangeSpec({
                    ...spec,
                    tier2: { ...spec.tier2, head: e.target.value.replace(/\s/g, '') },
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t.design.delimiters}
              </span>
              <div className="flex items-center gap-2">
                <SymbolPicker
                  ariaLabel="First symbol"
                  value={spec.tier2.sepA}
                  onChange={(sym) =>
                    onChangeSpec({ ...spec, tier2: { ...spec.tier2, sepA: sym } })
                  }
                />
                <SymbolPicker
                  ariaLabel="Second symbol"
                  value={spec.tier2.sepB}
                  onChange={(sym) =>
                    onChangeSpec({ ...spec, tier2: { ...spec.tier2, sepB: sym } })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t.design.tailDigits}
              </span>
              <TactileInput
                mono
                accent="teal"
                leading={<Hash className="h-4 w-4" />}
                value={spec.tier2.tail}
                maxLength={8}
                containerClassName="w-28"
                onChange={(e) =>
                  onChangeSpec({
                    ...spec,
                    tier2: { ...spec.tier2, tail: e.target.value.replace(/\s/g, '') },
                  })
                }
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onCycleDecoy}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200/80 bg-zinc-100/70 px-3.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t.design.shuffleExample}</span>
          </button>
        </div>
      </div>

      {/* 2. Three-Column Rule Picker with Schematic Graphics */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Column 1: Site Name */}
        <div className="surface-card rounded-2xl border border-zinc-200/90 p-5 dark:border-zinc-800">
          <div className="mb-4 flex items-center gap-3">
            <NamingGraphic />
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {t.design.namingLabel}
            </span>
          </div>
          <div className="space-y-2.5">
            {(['domain', 'pinyin'] as const).map((mode) => {
              const active = spec.naming === mode;
              const sample = mode === 'domain' ? previewSite.domainCore : previewSite.pinyinPair;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChangeSpec({ ...spec, naming: mode })}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                    active
                      ? 'border-teal-500 bg-teal-500/[0.06] ring-1 ring-teal-500/25 dark:border-teal-400 dark:bg-teal-400/10'
                      : 'border-zinc-200/90 bg-zinc-50/50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                    {mode === 'domain' ? t.design.namingDomain : t.design.namingPinyin}
                  </span>
                  <span className="rounded-md bg-zinc-200/70 px-2 py-0.5 font-mono text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {sample}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Transform */}
        <div className="surface-card rounded-2xl border border-zinc-200/90 p-5 dark:border-zinc-800">
          <div className="mb-4 flex items-center gap-3">
            <TransformGraphic />
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {t.design.transformLabel}
            </span>
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
                  className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                    active
                      ? 'border-amber-500/80 bg-amber-500/[0.06] ring-1 ring-amber-500/25 dark:border-amber-400/80 dark:bg-amber-400/10'
                      : 'border-zinc-200/90 bg-zinc-50/50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {t.design.transforms[trId]}
                  </span>
                  <span className="rounded-md bg-amber-500/16 px-2.5 py-0.5 font-mono text-sm font-semibold text-amber-900 dark:text-amber-300">
                    {liveOut}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 3: Placement with Visual Block Strips */}
        <div className="surface-card rounded-2xl border border-zinc-200/90 p-5 dark:border-zinc-800">
          <div className="mb-4 flex items-center gap-3">
            <PlacementGraphic />
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {t.design.orderLabel}
            </span>
          </div>
          <div className="space-y-2.5">
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
                  className={`flex w-full cursor-pointer flex-col gap-1.5 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                    active
                      ? 'border-teal-500 bg-teal-500/[0.06] ring-1 ring-teal-500/25 dark:border-teal-400 dark:bg-teal-400/10'
                      : 'border-zinc-200/90 bg-zinc-50/50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {t.design.orders[topoId]}
                    </span>
                    {/* Mini visual color block bar */}
                    <span className="flex items-center gap-1" aria-hidden="true">
                      {topoId === 'split-inlay' && (
                        <>
                          <span className="h-2 w-4 rounded-xs bg-teal-500/75" />
                          <span className="h-2 w-3 rounded-xs bg-amber-500" />
                          <span className="h-2 w-2.5 rounded-xs bg-teal-500/75" />
                        </>
                      )}
                      {topoId === 'mirrored-split' && (
                        <>
                          <span className="h-2 w-2 rounded-xs bg-amber-500" />
                          <span className="h-2 w-4 rounded-xs bg-teal-500/75" />
                          <span className="h-2 w-2 rounded-xs bg-amber-500" />
                          <span className="h-2 w-2.5 rounded-xs bg-teal-500/75" />
                        </>
                      )}
                      {topoId === 'prefix-bridge' && (
                        <>
                          <span className="h-2 w-3 rounded-xs bg-amber-500" />
                          <span className="h-2 w-4 rounded-xs bg-teal-500/75" />
                          <span className="h-2 w-2.5 rounded-xs bg-teal-500/75" />
                        </>
                      )}
                    </span>
                  </div>

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

      {/* 3. Grouped Accounts with Brand Squircle Avatars */}
      <div className="grid items-start gap-6 md:grid-cols-12">
        {/* Everyday Accounts */}
        <div className="surface-card overflow-hidden rounded-2xl border border-zinc-200/90 md:col-span-7 dark:border-zinc-800">
          <div className="border-b border-zinc-200/80 px-5 py-4 text-base font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
            {t.design.dailySites}
          </div>

          <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/80">
            {dailySites.map((site) => {
              const out = weavePassword(spec, site, 'tier2');
              const active = site.id === selectedSite.id;
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3 text-left transition-colors ${
                    active
                      ? 'bg-teal-500/8 dark:bg-teal-400/10'
                      : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/45'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <SiteAvatar domainCore={site.domainCore} size="sm" />
                    <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                      {locale === 'zh' ? site.nameZh : site.nameEn}
                    </span>
                  </div>
                  <span className="font-mono text-base font-medium text-zinc-800 dark:text-zinc-200">
                    {out.password}
                  </span>
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleAddSite}
            className="flex flex-wrap items-center gap-2.5 border-t border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
          >
            <TactileInput
              leading={<Globe className="h-4 w-4" />}
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder={t.design.addSitePlaceholder}
              containerClassName="min-w-44 flex-1"
            />
            {spec.naming === 'pinyin' && (
              <TactileInput
                mono
                value={customPinyin}
                maxLength={4}
                onChange={(e) => setCustomPinyin(e.target.value)}
                placeholder={t.design.addPinyinPlaceholder}
                containerClassName="w-24"
              />
            )}
            <button
              type="submit"
              className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-4 text-sm font-medium text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <Plus className="h-4 w-4" />
              <span>{t.design.addBtn}</span>
            </button>
          </form>
        </div>

        {/* Critical & Throwaway Isolation Cards */}
        <div className="space-y-6 md:col-span-5">
          {/* Critical Accounts */}
          <div className="surface-card overflow-hidden rounded-2xl border border-zinc-200/90 dark:border-zinc-800">
            <div className="border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800">
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {t.design.coreSites}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 font-mono text-xs font-medium text-rose-700 dark:text-rose-300">
                  <Shield className="h-3 w-3" />
                  2FA
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                  {t.design.coreWordLabel}
                </span>
                <TactileInput
                  mono
                  value={spec.tier1.head}
                  maxLength={16}
                  containerClassName="h-9 flex-1"
                  onChange={(e) =>
                    onChangeSpec({
                      ...spec,
                      tier1: { ...spec.tier1, head: e.target.value.replace(/\s/g, '') },
                    })
                  }
                />
                <TactileInput
                  mono
                  value={spec.tier1.tail}
                  maxLength={8}
                  containerClassName="h-9 w-20"
                  onChange={(e) =>
                    onChangeSpec({
                      ...spec,
                      tier1: { ...spec.tier1, tail: e.target.value.replace(/\s/g, '') },
                    })
                  }
                />
              </div>
            </div>

            <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/80">
              {coreSites.map((site) => {
                const out = weavePassword(spec, site, 'tier1');
                const active = site.id === selectedSite.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => setSelectedSiteId(site.id)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 px-5 py-3 text-left transition-colors ${
                      active
                        ? 'bg-teal-500/8 dark:bg-teal-400/10'
                        : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/45'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <SiteAvatar domainCore={site.domainCore} size="sm" />
                      <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                        {locale === 'zh' ? site.nameZh : site.nameEn}
                      </span>
                    </div>
                    <span className="font-mono text-base font-medium text-zinc-800 dark:text-zinc-200">
                      {out.password}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Throwaway Sites */}
          <div className="surface-card overflow-hidden rounded-2xl border border-zinc-200/90 dark:border-zinc-800">
            <div className="border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800">
              <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {t.design.throwawaySites}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                  {t.design.throwawayWordLabel}
                </span>
                <TactileInput
                  mono
                  value={spec.tier3Decoy}
                  maxLength={28}
                  containerClassName="h-9 flex-1"
                  onChange={(e) => onChangeSpec({ ...spec, tier3Decoy: e.target.value })}
                />
              </div>
            </div>

            <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/80">
              {throwawaySites.map((site) => {
                const out = weavePassword(spec, site, 'tier3');
                const active = site.id === selectedSite.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => setSelectedSiteId(site.id)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 px-5 py-3 text-left transition-colors ${
                      active
                        ? 'bg-teal-500/8 dark:bg-teal-400/10'
                        : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/45'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <SiteAvatar domainCore={site.domainCore} size="sm" />
                      <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                        {locale === 'zh' ? site.nameZh : site.nameEn}
                      </span>
                    </div>
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
