import { useCallback, useEffect, useMemo, useState } from 'react';
import { DECOY_BUNDLES } from '../core/presets';
import {
  createDefaultWorkspace,
  isDefaultWorkspace,
  mergeSitesList,
  parseStageFromHash,
  parseStoredWorkspace,
  WORKSPACE_STORAGE_KEY,
  type StoredWorkspace,
  type WorkspaceStageId,
} from '../core/storage';
import type { AccountTier, PatternSpec, SiteEntry } from '../core/types';

function loadInitialWorkspace(): StoredWorkspace {
  if (typeof window === 'undefined') return createDefaultWorkspace();
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    const stored = parseStoredWorkspace(raw);
    const hashStage = parseStageFromHash(window.location.hash);
    return hashStage ? { ...stored, activeStage: hashStage } : stored;
  } catch {
    return createDefaultWorkspace();
  }
}

export function usePassWeaveStore() {
  const [workspace, setWorkspace] = useState<StoredWorkspace>(loadInitialWorkspace);
  const [decoyIndex, setDecoyIndex] = useState<number>(0);

  // Persist workspace to localStorage automatically whenever it changes
  useEffect(() => {
    try {
      window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      // Ignore storage quota / private mode restrictions.
    }
  }, [workspace]);

  // Listen to browser Back/Forward hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const stage = parseStageFromHash(window.location.hash);
      if (stage) {
        setWorkspace((prev) => (prev.activeStage === stage ? prev : { ...prev, activeStage: stage }));
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setActiveStage = useCallback((stage: WorkspaceStageId) => {
    setWorkspace((prev) => ({ ...prev, activeStage: stage }));
    if (typeof window !== 'undefined') {
      const nextHash = `#${stage}`;
      if (window.location.hash !== nextHash) {
        window.history.pushState(null, '', nextHash);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const setSpec = useCallback((next: PatternSpec | ((prev: PatternSpec) => PatternSpec)) => {
    setWorkspace((prev) => ({
      ...prev,
      spec: typeof next === 'function' ? next(prev.spec) : next,
    }));
  }, []);

  const setSelectedSiteId = useCallback((siteId: string) => {
    setWorkspace((prev) => ({ ...prev, selectedSiteId: siteId }));
  }, []);

  const addOrSelectCustomSite = useCallback((entry: SiteEntry, targetTier?: AccountTier) => {
    setWorkspace((prev) => {
      const allExisting = mergeSitesList(prev.customSites, prev.pinyinOverrides);
      const existing = allExisting.find(
        (s) => s.domainCore.toLowerCase() === entry.domainCore.toLowerCase(),
      );

      if (existing) {
        const nextOverrides = targetTier
          ? { ...prev.tierOverrides, [existing.id]: targetTier }
          : prev.tierOverrides;
        const nextPinyin = entry.pinyinPair
          ? { ...prev.pinyinOverrides, [existing.id]: entry.pinyinPair }
          : prev.pinyinOverrides;
        return {
          ...prev,
          tierOverrides: nextOverrides,
          pinyinOverrides: nextPinyin,
          selectedSiteId: existing.id,
        };
      }

      const finalEntry: SiteEntry = targetTier ? { ...entry, defaultTier: targetTier } : entry;
      return {
        ...prev,
        customSites: [finalEntry, ...prev.customSites],
        selectedSiteId: finalEntry.id,
      };
    });
  }, []);

  const removeCustomSite = useCallback((siteId: string) => {
    setWorkspace((prev) => {
      const nextCustom = prev.customSites.filter((s) => s.id !== siteId);
      const nextTiers = { ...prev.tierOverrides };
      const nextPinyins = { ...prev.pinyinOverrides };
      delete nextTiers[siteId];
      delete nextPinyins[siteId];
      return {
        ...prev,
        customSites: nextCustom,
        tierOverrides: nextTiers,
        pinyinOverrides: nextPinyins,
        selectedSiteId: prev.selectedSiteId === siteId ? 'github' : prev.selectedSiteId,
      };
    });
  }, []);

  const setSiteTier = useCallback((siteId: string, tier: AccountTier) => {
    setWorkspace((prev) => ({
      ...prev,
      tierOverrides: { ...prev.tierOverrides, [siteId]: tier },
    }));
  }, []);

  const setSitePinyin = useCallback((siteId: string, rawCode: string) => {
    const clean = rawCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
    if (!clean) return;
    setWorkspace((prev) => ({
      ...prev,
      pinyinOverrides: { ...prev.pinyinOverrides, [siteId]: clean },
    }));
  }, []);

  const togglePrivacyMask = useCallback(() => {
    setWorkspace((prev) => ({ ...prev, privacyMask: !prev.privacyMask }));
  }, []);

  const recordBestStreak = useCallback((streak: number) => {
    setWorkspace((prev) =>
      streak > prev.bestStreak ? { ...prev, bestStreak: streak } : prev,
    );
  }, []);

  const cycleDecoy = useCallback(() => {
    const nextIdx = (decoyIndex + 1) % DECOY_BUNDLES.length;
    const bundle = DECOY_BUNDLES[nextIdx]!;
    setDecoyIndex(nextIdx);
    setWorkspace((prev) => ({
      ...prev,
      spec: {
        ...prev.spec,
        tier1: { ...prev.spec.tier1, head: bundle.tier1Head, tail: bundle.tier1Tail },
        tier2: { ...prev.spec.tier2, head: bundle.tier2Head, tail: bundle.tier2Tail },
        tier3Decoy: bundle.tier3Decoy,
      },
    }));
  }, [decoyIndex]);

  const resetWorkspace = useCallback(() => {
    const fresh = createDefaultWorkspace();
    setWorkspace({ ...fresh, activeStage: workspace.activeStage });
    try {
      window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    } catch {
      // Ignore storage error.
    }
  }, [workspace.activeStage]);

  const sites = useMemo(
    () => mergeSitesList(workspace.customSites, workspace.pinyinOverrides),
    [workspace.customSites, workspace.pinyinOverrides],
  );

  const isCustomized = useMemo(() => !isDefaultWorkspace(workspace), [workspace]);

  return {
    activeStage: workspace.activeStage,
    setActiveStage,
    spec: workspace.spec,
    setSpec,
    sites,
    selectedSiteId: workspace.selectedSiteId,
    setSelectedSiteId,
    tierOverrides: workspace.tierOverrides,
    setSiteTier,
    setSitePinyin,
    addOrSelectCustomSite,
    removeCustomSite,
    privacyMask: workspace.privacyMask,
    togglePrivacyMask,
    bestStreak: workspace.bestStreak,
    recordBestStreak,
    cycleDecoy,
    resetWorkspace,
    isCustomized,
  };
}
