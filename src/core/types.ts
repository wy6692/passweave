export type AccountTier = 'tier1' | 'tier2' | 'tier3';

export type NamingConvention = 'domain' | 'pinyin';

export type TransformId =
  | 'consonant-count'
  | 'edge-length'
  | 'caesar-pair'
  | 'outer-pair';

export type TopologyId = 'split-inlay' | 'prefix-bridge' | 'mirrored-split';

export type DelimiterChar = '#' | '!' | '@' | '$' | '%' | ':' | '-' | '&';

export interface TierAnchors {
  head: string;
  tail: string;
  sepA: DelimiterChar;
  sepB: DelimiterChar;
}

export interface PatternSpec {
  naming: NamingConvention;
  transform: TransformId;
  topology: TopologyId;
  tier1: TierAnchors;
  tier2: TierAnchors;
  tier3Decoy: string;
}

export interface SiteEntry {
  id: string;
  nameEn: string;
  nameZh: string;
  url: string;
  domainCore: string;
  pinyinPair: string;
  defaultTier: AccountTier;
  custom?: boolean;
}

export type SegmentRole = 'head' | 'tail' | 'site' | 'delimiter' | 'decoy';

export interface TokenSegment {
  role: SegmentRole;
  value: string;
  labelKey: 'anchorHead' | 'anchorTail' | 'siteToken' | 'delimiter' | 'decoyToken';
}

export interface MentalStep {
  index: number;
  output: string;
  titleEn: string;
  titleZh: string;
  detailEn: string;
  detailZh: string;
}

export interface WeaveOutput {
  site: SiteEntry;
  tier: AccountTier;
  anchorWord: string;
  siteToken: string;
  password: string;
  segments: TokenSegment[];
  mentalSteps: MentalStep[];
  estimatedRecallSeconds: number;
}

export type AuditSeverity = 'pass' | 'warn' | 'fail';

export type AuditCheckId =
  | 'literal-leak'
  | 'affix-clustering'
  | 'locus-dispersion'
  | 'tier3-isolation'
  | 'policy-compliance'
  | 'cognitive-load';

export interface AuditCheck {
  id: AuditCheckId;
  severity: AuditSeverity;
  score: number;
  titleEn: string;
  titleZh: string;
  detailEn: string;
  detailZh: string;
  remediation?: Partial<PatternSpec>;
  remediationLabelEn?: string;
  remediationLabelZh?: string;
}

export interface SampleDiff {
  siteA: SiteEntry;
  siteB: SiteEntry;
  passwordA: string;
  passwordB: string;
  sharedPrefixLen: number;
  sharedSuffixLen: number;
  longestCommonSubstring: string;
  diffLociCount: number;
}

export interface AuditReport {
  antiReversalScore: number;
  recallEaseScore: number;
  overallGrade: 'A' | 'B' | 'C' | 'D';
  sampleDiff: SampleDiff;
  checks: AuditCheck[];
}
