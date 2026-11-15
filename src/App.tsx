import { useState } from 'react';
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

  const [activeStage, setActiveStage] = useState<StageId>('design');
  const [spec, setSpec] = useState<PatternSpec>(BLUEPRINT_PRESETS[0]!.spec);
  const [decoyIndex, setDecoyIndex] = useState<number>(0);
  const [sites, setSites] = useState<SiteEntry[]>(BUILTIN_SITES);
  const [tierOverrides] = useState<Record<string, AccountTier>>({});

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
    <div className="flex min-h-screen flex-col">
      <TopBar
        activeStage={activeStage}
        onSelectStage={handleStageChange}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {activeStage === 'why' && (
          <BreachCascade spec={spec} onProceed={() => handleStageChange('design')} />
        )}

        {activeStage === 'design' && (
          <PatternWorkbench
            spec={spec}
            onChangeSpec={setSpec}
            sites={sites}
            onAddSite={(entry) => setSites((prev) => [entry, ...prev])}
            tierOverrides={tierOverrides}
            onCycleDecoy={handleCycleDecoy}
          />
        )}

        {activeStage === 'check' && (
          <AdversarialAudit spec={spec} onChangeSpec={setSpec} />
        )}

        {activeStage === 'save' && (
          <DrillAndExport spec={spec} sites={sites} tierOverrides={tierOverrides} />
        )}
      </main>

      <footer className="border-t border-zinc-200/70 py-5 dark:border-zinc-800/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 text-sm text-zinc-400 sm:px-6 dark:text-zinc-500">
          <span>PassWeave</span>
          <span>{t.footer.offline}</span>
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
