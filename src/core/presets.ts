import type { DelimiterChar, PatternSpec } from './types';

export interface BlueprintPreset {
  id: string;
  nameEn: string;
  nameZh: string;
  tagEn: string;
  tagZh: string;
  descriptionEn: string;
  descriptionZh: string;
  spec: PatternSpec;
}

export interface DecoyBundle {
  label: string;
  tier1Head: string;
  tier1Tail: string;
  tier2Head: string;
  tier2Tail: string;
  tier3Decoy: string;
}

export const DECOY_BUNDLES: DecoyBundle[] = [
  {
    label: 'Cedar / Quartz',
    tier1Head: 'Quartz',
    tier1Tail: '91',
    tier2Head: 'Cedar',
    tier2Tail: '84',
    tier3Decoy: 'Pond-73-Mint!',
  },
  {
    label: 'Falcon / Cobalt',
    tier1Head: 'Cobalt',
    tier1Tail: '76',
    tier2Head: 'Falcon',
    tier2Tail: '39',
    tier3Decoy: 'Reed-48-Dusk!',
  },
  {
    label: 'Harbor / Basalt',
    tier1Head: 'Basalt',
    tier1Tail: '63',
    tier2Head: 'Harbor',
    tier2Tail: '52',
    tier3Decoy: 'Moss-29-Glen!',
  },
  {
    label: 'Maple / Amber',
    tier1Head: 'Amber',
    tier1Tail: '85',
    tier2Head: 'Maple',
    tier2Tail: '47',
    tier3Decoy: 'Cove-61-Surf!',
  },
];

export const DELIMITER_OPTIONS: DelimiterChar[] = ['#', '!', '@', '$', '%', ':', '-', '&'];

export const BLUEPRINT_PRESETS: BlueprintPreset[] = [
  {
    id: 'balanced-inlay',
    nameEn: 'Balanced Inlay',
    nameZh: '均衡三明治方案',
    tagEn: 'Recommended',
    tagZh: '推荐首选',
    descriptionEn:
      'Domain core + Consonant/Vowel count tucked inside a split personal anchor. Fast 2.9s recall with strong lexical masking.',
    descriptionZh:
      '主域名定名 +「前二辅音与元音数」夹在个人暗语首尾之间，约 2.9 秒心算，兼顾高抗反推与易记性。',
    spec: {
      naming: 'domain',
      transform: 'consonant-count',
      topology: 'split-inlay',
      tier1: { head: 'Quartz', tail: '91', sepA: '$', sepB: '!' },
      tier2: { head: 'Cedar', tail: '84', sepA: '#', sepB: '!' },
      tier3Decoy: 'Pond-73-Mint!',
    },
  },
  {
    id: 'hardened-weave',
    nameEn: 'Mirrored Split Weave',
    nameZh: '高强双点拆嵌方案',
    tagEn: 'Max Anti-Diff',
    tagZh: '极客防差分',
    descriptionEn:
      'Splits the derived site token across the front and interior of your anchor, eliminating static prefixes in breach dumps.',
    descriptionZh:
      '将平台特征码分拆至首尾两处，彻底消除固定公共前缀，即使两个日常站点泄露也难以差分还原。',
    spec: {
      naming: 'domain',
      transform: 'consonant-count',
      topology: 'mirrored-split',
      tier1: { head: 'Quartz', tail: '91', sepA: '$', sepB: ':' },
      tier2: { head: 'Cedar', tail: '84', sepA: '#', sepB: ':' },
      tier3Decoy: 'Pond-73-Mint!',
    },
  },
  {
    id: 'pinyin-shift',
    nameEn: 'Phonetic +1 Shift',
    nameZh: '中文拼音顺移方案',
    tagEn: 'CN Native',
    tagZh: '中文直觉',
    descriptionEn:
      'Uses 2-char Chinese pinyin initials shifted +1 in the alphabet (e.g. Taobao tb → Ub), natural for Chinese app recall.',
    descriptionZh:
      '按中文名读两字拼音首字母再向后顺移 1 位（如淘宝 tb → Ub），贴合母语直觉且不暴露原拼音缩写。',
    spec: {
      naming: 'pinyin',
      transform: 'caesar-pair',
      topology: 'split-inlay',
      tier1: { head: 'Basalt', tail: '63', sepA: '@', sepB: '!' },
      tier2: { head: 'Harbor', tail: '52', sepA: '#', sepB: '!' },
      tier3Decoy: 'Moss-29-Glen!',
    },
  },
];
