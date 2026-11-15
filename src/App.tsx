import { useMemo } from 'react';
import { AdversarialAudit } from './components/AdversarialAudit';
import { computeChecklistStatus } from './core/auditor';
import { BreachCascade } from './components/BreachCascade';
import { DrillAndExport } from './components/DrillAndExport';
import { PatternWorkbench } from './components/PatternWorkbench';
import { TopBar } from './components/TopBar';
import { usePassWeaveStore } from './hooks/usePassWeaveStore';
import { useTheme } from './hooks/useTheme';
import { I18nProvider, useI18n } from './i18n/I18nContext';

function PassWeaveWorkspace() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const store = usePassWeaveStore();

  const checkSummary = useMemo(() => {
    const res = computeChecklistStatus(store.spec);
    return {
      passed: res.passed,
      total: res.total,
      hasIssue: res.hasIssue,
    };
  }, [store.spec]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      {/* Subtle atmospheric top lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(20,184,166,0.10),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(20,184,166,0.12),transparent)]"
      />

      <TopBar
        activeStage={store.activeStage}
        onSelectStage={store.setActiveStage}
        theme={theme}
        onToggleTheme={toggleTheme}
        checkSummary={checkSummary}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {store.activeStage === 'why' && (
          <BreachCascade
            spec={store.spec}
            sites={store.sites}
            tierOverrides={store.tierOverrides}
            onProceed={() => store.setActiveStage('design')}
          />
        )}

        {store.activeStage === 'design' && (
          <PatternWorkbench
            spec={store.spec}
            onChangeSpec={store.setSpec}
            sites={store.sites}
            selectedSiteId={store.selectedSiteId}
            onSelectSite={store.setSelectedSiteId}
            onAddSite={store.addOrSelectCustomSite}
            onRemoveSite={store.removeCustomSite}
            tierOverrides={store.tierOverrides}
            onChangeSiteTier={store.setSiteTier}
            onChangeSitePinyin={store.setSitePinyin}
            privacyMask={store.privacyMask}
            onTogglePrivacyMask={store.togglePrivacyMask}
            onCycleDecoy={store.cycleDecoy}
            isCustomized={store.isCustomized}
            onResetWorkspace={store.resetWorkspace}
            checkSummary={checkSummary}
            onProceedCheck={() => store.setActiveStage('check')}
          />
        )}

        {store.activeStage === 'check' && (
          <AdversarialAudit
            spec={store.spec}
            onChangeSpec={store.setSpec}
            sites={store.sites}
            tierOverrides={store.tierOverrides}
            onProceedSave={() => store.setActiveStage('save')}
          />
        )}

        {store.activeStage === 'save' && (
          <DrillAndExport
            spec={store.spec}
            sites={store.sites}
            tierOverrides={store.tierOverrides}
            bestStreak={store.bestStreak}
            onRecordBestStreak={store.recordBestStreak}
            theme={theme}
          />
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
