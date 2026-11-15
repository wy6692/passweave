export type Locale = 'zh' | 'en';

export interface Messages {
  brandSub: string;
  tagline: string;
  nav: {
    cascade: string;
    workbench: string;
    audit: string;
    drill: string;
  };
  trust: {
    offlineBadge: string;
    sandboxActive: string;
    customAnchors: string;
    verifyTitle: string;
    verifyDesc: string;
    cspLabel: string;
    storageLabel: string;
    storageDesc: string;
    devToolsTip: string;
  };
  tokens: {
    anchorHead: string;
    anchorTail: string;
    siteToken: string;
    delimiter: string;
    decoyToken: string;
  };
  tiers: {
    tier1: string;
    tier1Short: string;
    tier1Desc: string;
    tier2: string;
    tier2Short: string;
    tier2Desc: string;
    tier3: string;
    tier3Short: string;
    tier3Desc: string;
  };
  cascade: {
    eyebrow: string;
    title: string;
    subtitle: string;
    leakSource: string;
    runTrace: string;
    replaying: string;
    nextToWorkbench: string;
    strategies: {
      reuse: {
        name: string;
        tag: string;
        summary: string;
        attackerLogic: string;
      };
      naive: {
        name: string;
        tag: string;
        summary: string;
        attackerLogic: string;
      };
      woven: {
        name: string;
        tag: string;
        summary: string;
        attackerLogic: string;
      };
    };
    table: {
      target: string;
      tier: string;
      credentialInUse: string;
      attackerAttempt: string;
      outcome: string;
      compromised: string;
      isolated: string;
      resisted: string;
      breachOrigin: string;
    };
    summaryLabel: string;
  };
  workbench: {
    eyebrow: string;
    title: string;
    subtitle: string;
    presetsTitle: string;
    namingTitle: string;
    namingDomain: string;
    namingDomainDesc: string;
    namingPinyin: string;
    namingPinyinDesc: string;
    transformTitle: string;
    topologyTitle: string;
    anchorsTitle: string;
    sandboxHint: string;
    cycleDecoy: string;
    tierTabsLabel: string;
    headLabel: string;
    tailLabel: string;
    sepALabel: string;
    sepBLabel: string;
    decoyLabel: string;
    inspectorTitle: string;
    recallEst: string;
    copyBtn: string;
    copied: string;
    matrixTitle: string;
    matrixHint: string;
    addSitePlaceholder: string;
    addSitePinyinPlaceholder: string;
    addSiteBtn: string;
    nextToAudit: string;
  };
  audit: {
    eyebrow: string;
    title: string;
    subtitle: string;
    antiReversal: string;
    recallEase: string;
    gradeLabel: string;
    diffTitle: string;
    diffSubtitle: string;
    sharedPrefix: string;
    sharedSuffix: string;
    commonSubstr: string;
    variableLoci: string;
    checksTitle: string;
    applyFix: string;
    nextToDrill: string;
  };
  drill: {
    eyebrow: string;
    title: string;
    subtitle: string;
    challengeTitle: string;
    promptPrefix: string;
    inputPlaceholder: string;
    submitBtn: string;
    skipBtn: string;
    peekSteps: string;
    hideSteps: string;
    correctMsg: string;
    mismatchMsg: string;
    expectedLabel: string;
    streakLabel: string;
    avgSpeedLabel: string;
    accuracyLabel: string;
    exportTitle: string;
    exportSubtitle: string;
    downloadPng: string;
    copyMarkdown: string;
    copiedMarkdown: string;
    downloadMarkdown: string;
  };
  footer: {
    boundaryNote: string;
    licenseNote: string;
  };
}
