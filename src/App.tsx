import { useMemo, useState } from 'react';
import { AdversarialAudit } from './components/AdversarialAudit';
import { BreachCascade } from './components/BreachCascade';
import { DrillAndExport } from './components/DrillAndExport';
import { PatternWorkbench } from './components/PatternWorkbench';
import { TopBar, type StageId } from './components/TopBar';
import { BLUEPRINT_PRESETS, DECOY_BUNDLES } from './core/presets';
import { BUILTIN_SITES } from './core/sites';
import type { AccountTier, PatternSpec, SiteEntry } from './core/types';
import { useTheme } from './hooks/useTheme';
import { I18nProvider, useI18n } from './i18n/I18nContext';

function PassWeaveWorkspace() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  const [activeStage, setActiveStage] = useState<StageId>('cascade');
  const [spec, setSpec] = useState<PatternSpec>(BLUEPRINT_PRESETS[0]!.spec);
  const [decoyIndex, setDecoyIndex] = useState<number>(0);
  const [sites, setSites] = useState<SiteEntry[]>(BUILTIN_SITES);
  const [tierOverrides, setTierOverrides] = useState<Record<string, AccountTier>>({});

  const isUsingDecoy = useMemo(() => {
    return DECOY_BUNDLES.some(
      (b) =>
        b.tier2Head === spec.tier2.head &&
        b.tier2Tail === spec.tier2.tail &&
        b.tier1Head === spec.tier1.head,
    );
  }, [spec.tier1.head, spec.tier2.head, spec.tier2.tail]);

  const handleCycleDecoy = () => {
    const nextIdx = (decoyIndex + 1) % DECOY_BUNDLES.length;
    const bundle = DECOY_BUNDLES[nextIdx]!;
    setDecoyIndex(nextIdx);
    setSpec((prev) => ({
      ...prev,
      tier1: { ...prev.tier1, head: bundle.tier1Head, tail: bundle.tier1Tail },
      tier2: { ...prev.tier2, head: bundle.tier2Head, tail: bundle.tier2Tail },
      tier3Decoy: bundle.tier3Decoy,
    }));
  };

  const handleStageChange = (stage: StageId) => {
    setActiveStage(stage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-dot-grid">
      <TopBar
        activeStage={activeStage}
        onSelectStage={handleStageChange}
        theme={theme}
        onToggleTheme={toggleTheme}
        isUsingDecoy={isUsingDecoy}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {activeStage === 'cascade' && (
          <BreachCascade spec={spec} onProceed={() => handleStageChange('workbench')} />
        )}

        {activeStage === 'workbench' && (
          <PatternWorkbench
            spec={spec}
            onChangeSpec={setSpec}
            sites={sites}
            onAddSite={(entry) => setSites((prev) => [entry, ...prev])}
            tierOverrides={tierOverrides}
            onChangeSiteTier={(siteId, tier) =>
              setTierOverrides((prev) => ({ ...prev, [siteId]: tier }))
            }
            onCycleDecoy={handleCycleDecoy}
            decoyIndex={decoyIndex}
            onProceed={() => handleStageChange('audit')}
          />
        )}

        {activeStage === 'audit' && (
          <AdversarialAudit
            spec={spec}
            onChangeSpec={setSpec}
            onProceed={() => handleStageChange('drill')}
          />
        )}

        {activeStage === 'drill' && (
          <DrillAndExport spec={spec} sites={sites} tierOverrides={tierOverrides} />
        )}
      </main>

      <footer className="border-t border-zinc-200/80 bg-zinc-50/90 py-6 dark:border-zinc-800/80 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:px-6 dark:text-zinc-400">
          <p className="max-w-3xl leading-relaxed">{t.footer.boundaryNote}</p>
          <p className="shrink-0 font-mono text-[11px]">{t.footer.licenseNote}</p>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <I18nProvider>
      <PassWeaveWorkspace />
    </I18nProvider>
  );
}

export default App;
