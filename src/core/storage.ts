import { BLUEPRINT_PRESETS } from './presets';
import { BUILTIN_SITES } from './sites';
import type {
  AccountTier,
  DelimiterChar,
  NamingConvention,
  PatternSpec,
  SiteEntry,
  TierAnchors,
  TopologyId,
  TransformId,
} from './types';

export const WORKSPACE_STORAGE_KEY = 'passweave:workspace:v1';

export type WorkspaceStageId = 'why' | 'design' | 'check' | 'save';

export interface StoredWorkspace {
  version: 1;
  activeStage: WorkspaceStageId;
  spec: PatternSpec;
  customSites: SiteEntry[];
  tierOverrides: Record<string, AccountTier>;
  pinyinOverrides: Record<string, string>;
  selectedSiteId: string;
  privacyMask: boolean;
  bestStreak: number;
}

const VALID_STAGES = new Set<WorkspaceStageId>(['why', 'design', 'check', 'save']);
const VALID_NAMING = new Set<NamingConvention>(['domain', 'pinyin']);
const VALID_TRANSFORMS = new Set<TransformId>([
  'consonant-count',
  'edge-length',
  'caesar-pair',
  'outer-pair',
]);
const VALID_TOPOLOGIES = new Set<TopologyId>([
  'split-inlay',
  'mirrored-split',
  'prefix-bridge',
]);
const VALID_TIERS = new Set<AccountTier>(['tier1', 'tier2', 'tier3']);
const VALID_DELIMITERS = new Set<DelimiterChar>(['#', '!', '@', '$', '%', ':', '-', '&']);

export function createDefaultWorkspace(): StoredWorkspace {
  const baseSpec = BLUEPRINT_PRESETS[0]!.spec;
  return {
    version: 1,
    activeStage: 'design',
    spec: {
      naming: baseSpec.naming,
      transform: baseSpec.transform,
      topology: baseSpec.topology,
      tier1: { ...baseSpec.tier1 },
      tier2: { ...baseSpec.tier2 },
      tier3Decoy: baseSpec.tier3Decoy,
    },
    customSites: [],
    tierOverrides: {},
    pinyinOverrides: {},
    selectedSiteId: BUILTIN_SITES[0]!.id,
    privacyMask: false,
    bestStreak: 0,
  };
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function sanitizeTierSecret(raw: unknown, fallback: TierAnchors): TierAnchors {
  if (!isObject(raw)) return { ...fallback };
  return {
    head: typeof raw.head === 'string' ? raw.head.slice(0, 24) : fallback.head,
    tail: typeof raw.tail === 'string' ? raw.tail.slice(0, 12) : fallback.tail,
    sepA: VALID_DELIMITERS.has(raw.sepA as DelimiterChar)
      ? (raw.sepA as DelimiterChar)
      : fallback.sepA,
    sepB: VALID_DELIMITERS.has(raw.sepB as DelimiterChar)
      ? (raw.sepB as DelimiterChar)
      : fallback.sepB,
  };
}

function sanitizeSpec(raw: unknown, fallback: PatternSpec): PatternSpec {
  if (!isObject(raw)) return fallback;
  return {
    naming: VALID_NAMING.has(raw.naming as NamingConvention)
      ? (raw.naming as NamingConvention)
      : fallback.naming,
    transform: VALID_TRANSFORMS.has(raw.transform as TransformId)
      ? (raw.transform as TransformId)
      : fallback.transform,
    topology: VALID_TOPOLOGIES.has(raw.topology as TopologyId)
      ? (raw.topology as TopologyId)
      : fallback.topology,
    tier1: sanitizeTierSecret(raw.tier1, fallback.tier1),
    tier2: sanitizeTierSecret(raw.tier2, fallback.tier2),
    tier3Decoy:
      typeof raw.tier3Decoy === 'string' ? raw.tier3Decoy.slice(0, 36) : fallback.tier3Decoy,
  };
}

function sanitizeCustomSites(raw: unknown): SiteEntry[] {
  if (!Array.isArray(raw)) return [];
  const builtinIds = new Set(BUILTIN_SITES.map((s) => s.id));
  const seenIds = new Set<string>();
  const out: SiteEntry[] = [];

  for (const item of raw) {
    if (!isObject(item)) continue;
    const id = typeof item.id === 'string' ? item.id.trim() : '';
    const domainCore = typeof item.domainCore === 'string' ? item.domainCore.trim() : '';
    const pinyinPair = typeof item.pinyinPair === 'string' ? item.pinyinPair.trim() : '';
    const url = typeof item.url === 'string' ? item.url.trim() : '';
    const nameEn = typeof item.nameEn === 'string' ? item.nameEn.trim() : domainCore;
    const nameZh = typeof item.nameZh === 'string' ? item.nameZh.trim() : domainCore;
    const defaultTier = VALID_TIERS.has(item.defaultTier as AccountTier)
      ? (item.defaultTier as AccountTier)
      : 'tier2';

    if (!id || !domainCore || !pinyinPair || builtinIds.has(id) || seenIds.has(id)) continue;
    seenIds.add(id);
    out.push({
      id,
      nameEn: nameEn || domainCore,
      nameZh: nameZh || domainCore,
      url: url || `${domainCore}.com`,
      domainCore,
      pinyinPair,
      defaultTier,
      custom: true,
    });
    if (out.length >= 60) break;
  }

  return out;
}

export function parseStoredWorkspace(rawJson: string | null): StoredWorkspace {
  const defaults = createDefaultWorkspace();
  if (!rawJson) return defaults;

  try {
    const parsed: unknown = JSON.parse(rawJson);
    if (!isObject(parsed)) return defaults;

    const tierOverrides: Record<string, AccountTier> = {};
    if (isObject(parsed.tierOverrides)) {
      for (const [k, v] of Object.entries(parsed.tierOverrides)) {
        if (VALID_TIERS.has(v as AccountTier)) {
          tierOverrides[k] = v as AccountTier;
        }
      }
    }

    const pinyinOverrides: Record<string, string> = {};
    if (isObject(parsed.pinyinOverrides)) {
      for (const [k, v] of Object.entries(parsed.pinyinOverrides)) {
        if (typeof v === 'string') {
          const clean = v.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
          if (clean) pinyinOverrides[k] = clean;
        }
      }
    }

    return {
      version: 1,
      activeStage: VALID_STAGES.has(parsed.activeStage as WorkspaceStageId)
        ? (parsed.activeStage as WorkspaceStageId)
        : defaults.activeStage,
      spec: sanitizeSpec(parsed.spec, defaults.spec),
      customSites: sanitizeCustomSites(parsed.customSites),
      tierOverrides,
      pinyinOverrides,
      selectedSiteId:
        typeof parsed.selectedSiteId === 'string' && parsed.selectedSiteId
          ? parsed.selectedSiteId
          : defaults.selectedSiteId,
      privacyMask: typeof parsed.privacyMask === 'boolean' ? parsed.privacyMask : false,
      bestStreak:
        typeof parsed.bestStreak === 'number' && Number.isFinite(parsed.bestStreak) && parsed.bestStreak >= 0
          ? Math.floor(parsed.bestStreak)
          : 0,
    };
  } catch {
    return defaults;
  }
}

export function mergeSitesList(
  customSites: SiteEntry[],
  pinyinOverrides: Record<string, string>,
): SiteEntry[] {
  const combined = [...customSites, ...BUILTIN_SITES];
  return combined.map((site) => {
    const override = pinyinOverrides[site.id];
    return override ? { ...site, pinyinPair: override } : site;
  });
}

export function isDefaultWorkspace(ws: StoredWorkspace): boolean {
  const def = createDefaultWorkspace();
  return (
    JSON.stringify(ws.spec) === JSON.stringify(def.spec) &&
    ws.customSites.length === 0 &&
    Object.keys(ws.tierOverrides).length === 0 &&
    Object.keys(ws.pinyinOverrides).length === 0
  );
}

export function parseStageFromHash(hash: string): WorkspaceStageId | null {
  const cleaned = hash.replace(/^#\/?/, '').trim().toLowerCase();
  return VALID_STAGES.has(cleaned as WorkspaceStageId) ? (cleaned as WorkspaceStageId) : null;
}
