export type Locale = 'zh' | 'en';

export interface Messages {
  nav: {
    why: string;
    design: string;
    check: string;
    save: string;
  };
  why: {
    modes: {
      reuse: string;
      suffix: string;
      weave: string;
    };
    breachBoxTitle: string;
    breachSite: string;
    leakedLabel: string;
    hintReuse: string;
    hintSuffix: string;
    hintWeave: string;
    accountsTitle: string;
    statusCompromised: string;
    statusGuessed: string;
    statusSafe: string;
    ctaDesign: string;
  };
  design: {
    copy: string;
    copied: string;
    fixedWord: string;
    delimiters: string;
    tailDigits: string;
    shuffleExample: string;
    namingLabel: string;
    namingDomain: string;
    namingPinyin: string;
    transformLabel: string;
    transforms: {
      'consonant-count': string;
      'edge-length': string;
      'caesar-pair': string;
      'outer-pair': string;
    };
    orderLabel: string;
    orders: {
      'split-inlay': string;
      'mirrored-split': string;
      'prefix-bridge': string;
    };
    dailySites: string;
    coreSites: string;
    coreWordLabel: string;
    throwawaySites: string;
    throwawayWordLabel: string;
    addSitePlaceholder: string;
    addPinyinPlaceholder: string;
    addBtn: string;
  };
  check: {
    leakCompareTitle: string;
    checklistTitle: string;
    items: {
      noLiteral: { pass: string; warn: string; fix: string };
      formatOk: { pass: string; warn: string; fix: string };
      coreSeparated: { pass: string; fail: string; fix: string };
      prefixVaried: { pass: string; tip: string; fix: string };
    };
  };
  save: {
    practiceTitle: string;
    inputPlaceholder: string;
    checkBtn: string;
    nextBtn: string;
    hintBtn: string;
    hideHintBtn: string;
    correct: string;
    wrong: string;
    streak: string;
    cardTitle: string;
    downloadPng: string;
    copyText: string;
    copiedText: string;
  };
  tiers: {
    tier1: string;
    tier2: string;
    tier3: string;
  };
  footer: {
    offline: string;
  };
}
