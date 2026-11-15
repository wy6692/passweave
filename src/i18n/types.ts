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
    presets: {
      'balanced-inlay': string;
      'hardened-weave': string;
      'pinyin-shift': string;
    };
    copy: string;
    copied: string;
    maskHide: string;
    maskShow: string;
    fixedWord: string;
    delimiters: string;
    tailDigits: string;
    shuffleExample: string;
    resetBtn: string;
    resetConfirm: string;
    removeSite: string;
    nextCheck: string;
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
    nextSave: string;
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
    skipBtn: string;
    hintBtn: string;
    hideHintBtn: string;
    correct: string;
    wrong: string;
    streak: string;
    bestStreak: string;
    cardTitle: string;
    downloadPng: string;
    savedPng: string;
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
