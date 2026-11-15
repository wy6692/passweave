import {
  ArrowRight,
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Hash,
  KeyRound,
  Plus,
  RefreshCw,
  RotateCcw,
  Shield,
  X,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { BLUEPRINT_PRESETS } from '../core/presets';
import { createCustomSiteEntry, resolveAnchorWord } from '../core/sites';
import { applySiteTransform } from '../core/transforms';
import type {
  AccountTier,
  PatternSpec,
  SegmentRole,
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
  selectedSiteId: string;
  onSelectSite: (siteId: string) => void;
  onAddSite: (entry: SiteEntry, targetTier: AccountTier) => void;
  onRemoveSite: (siteId: string) => void;
  tierOverrides: Record<string, AccountTier>;
  onChangeSiteTier: (siteId: string, tier: AccountTier) => void;
  onChangeSitePinyin: (siteId: string, code: string) => void;
  privacyMask: boolean;
  onTogglePrivacyMask: () => void;
  onCycleDecoy: () => void;
  isCustomized: boolean;
  onResetWorkspace: () => void;
  checkSummary: { passed: number; total: number };
  onProceedCheck: () => void;
}

const TRANSFORM_IDS: TransformId[] = [
  'consonant-count',
  'edge-length',
  'caesar-pair',
  'outer-pair',
];

const TOPOLOGY_IDS: TopologyId[] = ['split-inlay', 'mirrored-split', 'prefix-bridge'];
const ALL_TIERS: AccountTier[] = ['tier1', 'tier2', 'tier3'];

export function PatternWorkbench({
  spec,
  onChangeSpec,
  sites,
  selectedSiteId,
  onSelectSite,
  onAddSite,
  onRemoveSite,
  tierOverrides,
  onChangeSiteTier,
  onChangeSitePinyin,
  privacyMask,
  onTogglePrivacyMask,
  onCycleDecoy,
  isCustomized,
  onResetWorkspace,
  checkSummary,
  onProceedCheck,
}: PatternWorkbenchProps) {
  const { locale, t } = useI18n();
  const [copiedHero, setCopiedHero] = useState<boolean>(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<SegmentRole | null>(null);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customPinyin, setCustomPinyin] = useState<string>('');
  const [newSiteTier, setNewSiteTier] = useState<AccountTier>('tier2');
  const [editingPinyinId, setEditingPinyinId] = useState<string | null>(null);
  const [editingPinyinDraft, setEditingPinyinDraft] = useState<string>('');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  useEffect(() => {
    if (!confirmReset) return;
    const timer = window.setTimeout(() => setConfirmReset(false), 3200);
    return () => window.clearTimeout(timer);
  }, [confirmReset]);

  const selectedSite = sites.find((s) => s.id === selectedSiteId) ?? sites[0]!;
  const selectedTier = tierOverrides[selectedSite.id] ?? selectedSite.defaultTier;
  const selectedOutput = weavePassword(spec, selectedSite, selectedTier);

  const previewSite =
    selectedTier === 'tier3'
      ? (sites.find((s) => (tierOverrides[s.id] ?? s.defaultTier) === 'tier2') ?? sites[0]!)
      : selectedSite;
  const previewWord = resolveAnchorWord(previewSite, spec.naming);
  const previewToken = applySiteTransform(previewWord, spec.transform).token;

  const copyTextToClipboard = async (text: string, target: 'hero' | string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (target === 'hero') {
        setCopiedHero(true);
        window.setTimeout(() => setCopiedHero(false), 1500);
      } else {
        setCopiedRowId(target);
        window.setTimeout(() => setCopiedRowId((prev) => (prev === target ? null : prev)), 1500);
      }
    } catch {
      // Ignore clipboard error.
    }
  };

  const handleAddSite = (e: FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const entry = createCustomSiteEntry(customUrl, newSiteTier, customPinyin);
    onAddSite(entry, newSiteTier);
    setCustomUrl('');
    setCustomPinyin('');
  };

  const commitInlinePinyin = (siteId: string) => {
    if (editingPinyinDraft.trim()) {
      onChangeSitePinyin(siteId, editingPinyinDraft);
    }
    setEditingPinyinId(null);
  };

  const handleResetClick = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setConfirmReset(false);
    onResetWorkspace();
  };

  const liveQuickEntry = customUrl.trim()
    ? createCustomSiteEntry(customUrl, newSiteTier, customPinyin)
    : null;
  const liveQuickOut = liveQuickEntry
    ? weavePassword(spec, liveQuickEntry, newSiteTier)
    : null;

  const dailySites = sites.filter((s) => (tierOverrides[s.id] ?? s.defaultTier) === 'tier2');
  const coreSites = sites.filter((s) => (tierOverrides[s.id] ?? s.defaultTier) === 'tier1');
  const throwawaySites = sites.filter((s) => (tierOverrides[s.id] ?? s.defaultTier) === 'tier3');

  const renderAccountRow = (site: SiteEntry, tier: AccountTier) => {
    const out = weavePassword(spec, site, tier);
    const active = site.id === selectedSite.id;
    const rowCopied = copiedRowId === site.id;

    return (
      <div
        key={site.id}
        role="button"
        tabIndex={0}
        onClick={() => onSelectSite(site.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectSite(site.id);
          }
        }}
        className={`group flex w-full cursor-pointer items-center justify-between gap-2 px-5 py-3 text-left transition-colors outline-none focus-visible:bg-teal-500/8 ${
          active
            ? 'bg-teal-500/8 dark:bg-teal-400/10'
            : 'hover:bg-zinc-100/65 dark:hover:bg-zinc-800/45'
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <SiteAvatar domainCore={site.domainCore} size="sm" />
          <span className="truncate text-base font-medium text-zinc-900 dark:text-zinc-100">
            {locale === 'zh' ? site.nameZh : site.nameEn}
          </span>

          {spec.naming === 'pinyin' && tier !== 'tier3' && (
            editingPinyinId === site.id ? (
              <input
                type="text"
                autoFocus
                maxLength={4}
                value={editingPinyinDraft}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setEditingPinyinDraft(e.target.value)}
                onBlur={() => commitInlinePinyin(site.id)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') commitInlinePinyin(site.id);
                  if (e.key === 'Escape') setEditingPinyinId(null);
                }}
                className="w-12 rounded-md border border-teal-500 bg-white px-1.5 py-0.5 font-mono text-xs font-semibold text-teal-800 outline-none dark:bg-zinc-900 dark:text-teal-300"
              />
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingPinyinId(site.id);
                  setEditingPinyinDraft(site.pinyinPair);
                }}
                className="cursor-pointer rounded-md bg-zinc-200/75 px-1.5 py-0.5 font-mono text-xs text-zinc-600 transition-colors hover:bg-teal-500/15 hover:text-teal-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-teal-300"
              >
                {site.pinyinPair}
              </button>
            )
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Hover-revealed Tier Switcher + Optional Remove for Custom Sites */}
          <div className="hidden items-center gap-1 group-hover:flex">
            <div className="flex items-center rounded-lg border border-zinc-200/90 bg-white/90 p-0.5 dark:border-zinc-700 dark:bg-zinc-900/90">
              {ALL_TIERS.map((cand) => {
                const isCurrent = cand === tier;
                return (
                  <button
                    key={cand}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeSiteTier(site.id, cand);
                    }}
                    className={`cursor-pointer rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'bg-zinc-900 text-white dark:bg-teal-500 dark:text-zinc-950'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    {t.tiers[cand]}
                  </button>
                );
              })}
            </div>

            {site.custom && (
              <button
                type="button"
                aria-label={t.design.removeSite}
                title={t.design.removeSite}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSite(site.id);
                }}
                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-500/12 hover:text-rose-600 dark:hover:text-rose-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Password Value (supports zero-flicker CSS hover reveal when privacyMask is active) */}
          {privacyMask ? (
            <>
              <span className="font-mono text-base tracking-widest text-zinc-400 group-hover:hidden dark:text-zinc-500">
                ••••••••••
              </span>
              <span className="hidden font-mono text-base font-medium text-zinc-800 group-hover:inline dark:text-zinc-200">
                {out.password}
              </span>
            </>
          ) : (
            <span className="font-mono text-base font-medium text-zinc-800 dark:text-zinc-200">
              {out.password}
            </span>
          )}

          <button
            type="button"
            aria-label={t.design.copy}
            title={t.design.copy}
            onClick={(e) => {
              e.stopPropagation();
              void copyTextToClipboard(out.password, site.id);
            }}
            className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-all ${
              rowCopied
                ? 'border-teal-500/40 bg-teal-500/12 text-teal-600 dark:text-teal-300'
                : 'border-transparent text-zinc-400 hover:border-zinc-200 hover:bg-white hover:text-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            }`}
          >
            {rowCopied ? <Check className="h-4 w-4" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    );
  };

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

        {/* Top Bar: App Icon + Site Identity + Quick Style Presets + Mask + Copy */}
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SiteAvatar domainCore={selectedSite.domainCore} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {locale === 'zh' ? selectedSite.nameZh : selectedSite.nameEn}
                </span>
                <span className="rounded-md bg-zinc-200/75 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {t.tiers[selectedTier]}
                </span>
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
              onClick={onTogglePrivacyMask}
              aria-label={privacyMask ? t.design.maskShow : t.design.maskHide}
              title={privacyMask ? t.design.maskShow : t.design.maskHide}
              className={`inline-flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-xl border transition-colors ${
                privacyMask
                  ? 'border-teal-500/45 bg-teal-500/12 text-teal-700 dark:border-teal-400/45 dark:bg-teal-400/14 dark:text-teal-300'
                  : 'border-zinc-200/90 bg-white text-zinc-600 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {privacyMask ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => void copyTextToClipboard(selectedOutput.password, 'hero')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              {copiedHero ? (
                <Check className="h-4 w-4 text-teal-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>{copiedHero ? t.design.copied : t.design.copy}</span>
            </button>
          </div>
        </div>

        {/* Mechanical Keycap Output (Click to copy) */}
        <div className="relative mt-7">
          <TokenAnatomy
            segments={selectedOutput.segments}
            size="lg"
            highlightRole={activeRole}
            masked={privacyMask}
            onClick={() => void copyTextToClipboard(selectedOutput.password, 'hero')}
          />
        </div>

        {/* Visual Derivation Breadcrumb */}
        {selectedTier !== 'tier3' && (
          <div
            className={`mt-5 inline-flex flex-wrap items-center gap-2 rounded-xl border px-3.5 py-1.5 font-mono text-sm transition-all ${
              activeRole === 'site'
                ? 'border-amber-500/50 bg-amber-500/10 text-zinc-700 dark:border-amber-400/45 dark:bg-amber-400/10 dark:text-zinc-200'
                : 'border-zinc-200/70 bg-zinc-100/60 text-zinc-500 dark:border-zinc-800/90 dark:bg-zinc-950/60 dark:text-zinc-400'
            }`}
          >
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
            <div
              className="space-y-1.5"
              onMouseEnter={() => setActiveRole('head')}
              onMouseLeave={() => setActiveRole(null)}
            >
              <span className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t.design.fixedWord}
              </span>
              <TactileInput
                mono
                accent="teal"
                maskWhenBlurred={privacyMask}
                leading={<KeyRound className="h-4 w-4" />}
                value={spec.tier2.head}
                maxLength={16}
                containerClassName="w-40"
                onFocus={() => setActiveRole('head')}
                onBlur={() => setActiveRole(null)}
                onChange={(e) =>
                  onChangeSpec({
                    ...spec,
                    tier2: { ...spec.tier2, head: e.target.value.replace(/\s/g, '') },
                  })
                }
              />
            </div>

            <div
              className="space-y-1.5"
              onMouseEnter={() => setActiveRole('delimiter')}
              onMouseLeave={() => setActiveRole(null)}
            >
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

            <div
              className="space-y-1.5"
              onMouseEnter={() => setActiveRole('tail')}
              onMouseLeave={() => setActiveRole(null)}
            >
              <span className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t.design.tailDigits}
              </span>
              <TactileInput
                mono
                accent="teal"
                maskWhenBlurred={privacyMask}
                leading={<Hash className="h-4 w-4" />}
                value={spec.tier2.tail}
                maxLength={8}
                containerClassName="w-28"
                onFocus={() => setActiveRole('tail')}
                onBlur={() => setActiveRole(null)}
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
        <div
          onMouseEnter={() => setActiveRole('site')}
          onMouseLeave={() => setActiveRole(null)}
          className="surface-card rounded-2xl border border-zinc-200/90 p-5 dark:border-zinc-800"
        >
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
        <div
          onMouseEnter={() => setActiveRole('site')}
          onMouseLeave={() => setActiveRole(null)}
          className="surface-card rounded-2xl border border-zinc-200/90 p-5 dark:border-zinc-800"
        >
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
              const h = privacyMask ? '••••' : spec.tier2.head || 'Word';
              const tl = privacyMask ? '••' : spec.tier2.tail || '84';
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
        {/* Everyday Accounts + Live Quick Password Calculator */}
        <div className="surface-card overflow-hidden rounded-2xl border border-zinc-200/90 md:col-span-7 dark:border-zinc-800">
          <div className="border-b border-zinc-200/80 px-5 py-4 text-base font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
            {t.design.dailySites}
          </div>

          <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/80">
            {dailySites.map((site) => renderAccountRow(site, 'tier2'))}
          </div>

          {/* Instant Live Preview Strip while typing a URL / App Name */}
          {liveQuickEntry && liveQuickOut && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-teal-500/30 bg-teal-500/[0.06] px-5 py-3 dark:border-teal-400/25 dark:bg-teal-400/[0.08]">
              <div className="flex items-center gap-3">
                <SiteAvatar domainCore={liveQuickEntry.domainCore} size="sm" />
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {locale === 'zh' ? liveQuickEntry.nameZh : liveQuickEntry.nameEn}
                  </div>
                  {newSiteTier !== 'tier3' && (
                    <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {liveQuickOut.anchorWord} → {liveQuickOut.siteToken}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-zinc-200/90 bg-white/90 p-0.5 dark:border-zinc-700 dark:bg-zinc-900">
                  {ALL_TIERS.map((cand) => (
                    <button
                      key={cand}
                      type="button"
                      onClick={() => setNewSiteTier(cand)}
                      className={`cursor-pointer rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                        newSiteTier === cand
                          ? 'bg-zinc-900 text-white dark:bg-teal-500 dark:text-zinc-950'
                          : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }`}
                    >
                      {t.tiers[cand]}
                    </button>
                  ))}
                </div>

                <span className="font-mono text-base font-semibold text-teal-800 dark:text-teal-300">
                  {liveQuickOut.password}
                </span>

                <button
                  type="button"
                  aria-label={t.design.copy}
                  onClick={() => void copyTextToClipboard(liveQuickOut.password, 'quick-preview')}
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-teal-500/35 bg-white text-teal-700 transition-colors hover:bg-teal-50 dark:border-teal-400/35 dark:bg-zinc-900 dark:text-teal-300"
                >
                  {copiedRowId === 'quick-preview' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

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
          {/* Critical Accounts (no overflow-hidden on outer container so SymbolPicker popover floats cleanly) */}
          <div className="surface-card relative z-10 rounded-2xl border border-zinc-200/90 dark:border-zinc-800">
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

              <div className="mt-3 flex items-center gap-1.5">
                <TactileInput
                  mono
                  maskWhenBlurred={privacyMask}
                  aria-label={t.design.coreWordLabel}
                  placeholder={t.design.coreWordLabel}
                  value={spec.tier1.head}
                  maxLength={16}
                  containerClassName="h-10 min-w-0 flex-1 px-3"
                  onChange={(e) =>
                    onChangeSpec({
                      ...spec,
                      tier1: { ...spec.tier1, head: e.target.value.replace(/\s/g, '') },
                    })
                  }
                />
                <SymbolPicker
                  compact
                  ariaLabel="Critical first symbol"
                  value={spec.tier1.sepA}
                  onChange={(sym) =>
                    onChangeSpec({ ...spec, tier1: { ...spec.tier1, sepA: sym } })
                  }
                />
                <SymbolPicker
                  compact
                  align="right"
                  ariaLabel="Critical second symbol"
                  value={spec.tier1.sepB}
                  onChange={(sym) =>
                    onChangeSpec({ ...spec, tier1: { ...spec.tier1, sepB: sym } })
                  }
                />
                <TactileInput
                  mono
                  maskWhenBlurred={privacyMask}
                  value={spec.tier1.tail}
                  maxLength={8}
                  containerClassName="h-10 w-15 shrink-0 px-2.5"
                  onChange={(e) =>
                    onChangeSpec({
                      ...spec,
                      tier1: { ...spec.tier1, tail: e.target.value.replace(/\s/g, '') },
                    })
                  }
                />
              </div>
            </div>

            <div className="divide-y divide-zinc-200/60 overflow-hidden rounded-b-2xl dark:divide-zinc-800/80">
              {coreSites.map((site) => renderAccountRow(site, 'tier1'))}
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
                  maskWhenBlurred={privacyMask}
                  value={spec.tier3Decoy}
                  maxLength={28}
                  containerClassName="h-10 flex-1"
                  onChange={(e) => onChangeSpec({ ...spec, tier3Decoy: e.target.value })}
                />
              </div>
            </div>

            <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/80">
              {throwawaySites.map((site) => renderAccountRow(site, 'tier3'))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Workspace Action Bar: Reset Cache + Proceed to Security Check */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div>
          {isCustomized && (
            <button
              type="button"
              onClick={handleResetClick}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                confirmReset
                  ? 'border-amber-500/50 bg-amber-500/12 text-amber-800 dark:border-amber-400/50 dark:bg-amber-400/15 dark:text-amber-300'
                  : 'border-zinc-200/80 bg-white/70 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{confirmReset ? t.design.resetConfirm : t.design.resetBtn}</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onProceedCheck}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-base font-medium text-zinc-50 shadow-sm transition-all hover:bg-zinc-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
        >
          <span>{t.design.nextCheck}</span>
          <span className="rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-xs font-semibold dark:bg-black/15">
            {checkSummary.passed}/{checkSummary.total}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
