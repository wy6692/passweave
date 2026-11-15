import { resolveAnchorWord } from './sites';
import { applySiteTransform } from './transforms';
import type {
  AccountTier,
  MentalStep,
  PatternSpec,
  SiteEntry,
  TokenSegment,
  TopologyId,
  WeaveOutput,
} from './types';

export interface TopologyMeta {
  id: TopologyId;
  nameEn: string;
  nameZh: string;
  formulaPreview: string;
  summaryEn: string;
  summaryZh: string;
}

export const TOPOLOGY_CATALOG: TopologyMeta[] = [
  {
    id: 'split-inlay',
    nameEn: 'Split-Anchor Inlay',
    nameZh: '三明治内嵌式',
    formulaPreview: 'Head · SepA · Site · SepB · Tail',
    summaryEn: 'Embeds the derived site token inside your split personal anchor, defeating suffix/prefix strippers.',
    summaryZh: '将个人暗语拆为首尾两段，把平台特征码夹在中间，规避传统前后缀字典剥离。',
  },
  {
    id: 'mirrored-split',
    nameEn: 'Mirrored Token Split',
    nameZh: '经纬双点拆嵌式',
    formulaPreview: 'Site[0] · SepA · Head · SepB · Site[1..] · Tail',
    summaryEn: 'Splits the site token itself across two non-adjacent positions, eliminating static prefixes and single-locus diffs.',
    summaryZh: '将平台特征码拆成首字符与余下部分，跨暗语两端穿插，消除固定前缀与单点差分。',
  },
  {
    id: 'prefix-bridge',
    nameEn: 'Dynamic Lead Bridge',
    nameZh: '动态前缀桥接式',
    formulaPreview: 'Site · SepA · Head · SepB · Tail',
    summaryEn: 'Places the variable site token upfront so leaked hashes never cluster alphabetically by prefix.',
    summaryZh: '以变化特征码打头，避免多个密码在泄露库按字母排序时因相同前缀而聚集。',
  },
];

function assembleSegments(
  topology: TopologyId,
  head: string,
  tail: string,
  sepA: string,
  sepB: string,
  siteToken: string,
): TokenSegment[] {
  switch (topology) {
    case 'split-inlay':
      return [
        { role: 'head', value: head, labelKey: 'anchorHead' },
        { role: 'delimiter', value: sepA, labelKey: 'delimiter' },
        { role: 'site', value: siteToken, labelKey: 'siteToken' },
        { role: 'delimiter', value: sepB, labelKey: 'delimiter' },
        { role: 'tail', value: tail, labelKey: 'anchorTail' },
      ];

    case 'prefix-bridge':
      return [
        { role: 'site', value: siteToken, labelKey: 'siteToken' },
        { role: 'delimiter', value: sepA, labelKey: 'delimiter' },
        { role: 'head', value: head, labelKey: 'anchorHead' },
        { role: 'delimiter', value: sepB, labelKey: 'delimiter' },
        { role: 'tail', value: tail, labelKey: 'anchorTail' },
      ];

    case 'mirrored-split': {
      const lead = siteToken.slice(0, 1);
      const rest = siteToken.slice(1) || 'x';
      return [
        { role: 'site', value: lead, labelKey: 'siteToken' },
        { role: 'delimiter', value: sepA, labelKey: 'delimiter' },
        { role: 'head', value: head, labelKey: 'anchorHead' },
        { role: 'delimiter', value: sepB, labelKey: 'delimiter' },
        { role: 'site', value: rest, labelKey: 'siteToken' },
        { role: 'tail', value: tail, labelKey: 'anchorTail' },
      ];
    }
  }
}

export function weavePassword(
  spec: PatternSpec,
  site: SiteEntry,
  overrideTier?: AccountTier,
): WeaveOutput {
  const tier = overrideTier ?? site.defaultTier;

  if (tier === 'tier3') {
    const decoy = spec.tier3Decoy || 'Pond-73-Mint!';
    return {
      site,
      tier: 'tier3',
      anchorWord: '—',
      siteToken: '—',
      password: decoy,
      segments: [{ role: 'decoy', value: decoy, labelKey: 'decoyToken' }],
      mentalSteps: [
        {
          index: 1,
          output: 'TIER 3',
          titleEn: 'Classify as Untrusted / Disposable',
          titleZh: '判定为抛弃级（低信任站点）',
          detailEn: 'Never expose your Tier 1/2 pattern to throwaway signups or small forums.',
          detailZh: '绝不在小型论坛或临时注册站点暴露日常编织规律。',
        },
        {
          index: 2,
          output: decoy,
          titleEn: 'Use Static Decoy Credential',
          titleZh: '输入固定一次性隔离口令',
          detailEn: 'If this database leaks in plaintext, attackers gain zero signal about your real formula.',
          detailZh: '即使该站数据库明文脱库，攻击者也拿不到任何可用于反推主规律的样本。',
        },
      ],
      estimatedRecallSeconds: 1.2,
    };
  }

  const anchors = tier === 'tier1' ? spec.tier1 : spec.tier2;
  const anchorWord = resolveAnchorWord(site, spec.naming);
  const transformed = applySiteTransform(anchorWord, spec.transform);

  const segments = assembleSegments(
    spec.topology,
    anchors.head,
    anchors.tail,
    anchors.sepA,
    anchors.sepB,
    transformed.token,
  ).filter((seg) => seg.value.length > 0);

  const password = segments.map((s) => s.value).join('');

  const namingStepEn =
    spec.naming === 'domain'
      ? `Extract core domain label from "${site.url}" → "${anchorWord}"`
      : `Take two-syllable pinyin initials for "${site.nameZh}" → "${anchorWord}"`;

  const namingStepZh =
    spec.naming === 'domain'
      ? `从 "${site.url}" 提取主域名核心词 → "${anchorWord}"`
      : `按中文常用名 "${site.nameZh}" 取双字拼音首字母 → "${anchorWord}"`;

  const topologyBonus = spec.topology === 'mirrored-split' ? 0.8 : 0.4;
  const estimatedRecallSeconds = Number(
    (1.4 + transformed.cognitiveSteps * 0.55 + topologyBonus).toFixed(1),
  );

  const mentalSteps: MentalStep[] = [
    {
      index: 1,
      output: anchorWord,
      titleEn: 'Anchor Site Name',
      titleZh: '锁定平台唯一定名',
      detailEn: namingStepEn,
      detailZh: namingStepZh,
    },
    {
      index: 2,
      output: transformed.token,
      titleEn: 'Compute Non-Linear Token',
      titleZh: '心算特征编码',
      detailEn: transformed.ruleTraceEn,
      detailZh: transformed.ruleTraceZh,
    },
    {
      index: 3,
      output: password,
      titleEn: tier === 'tier1' ? 'Weave with Core Vault Anchor' : 'Weave with Standard Anchor',
      titleZh: tier === 'tier1' ? '穿插核心级独立暗语' : '穿插日常级固定暗语',
      detailEn:
        tier === 'tier1'
          ? `Combine Core anchor (${anchors.head}…${anchors.tail}) + enable hardware/app 2FA.`
          : `Insert "${transformed.token}" into (${anchors.head}…${anchors.tail}) via ${spec.topology}.`,
      detailZh:
        tier === 'tier1'
          ? `套用核心级独立暗语 (${anchors.head}…${anchors.tail})，并务必配合双重验证 (2FA)。`
          : `将 "${transformed.token}" 按所选拓扑织入日常暗语 (${anchors.head}…${anchors.tail})。`,
    },
  ];

  return {
    site,
    tier,
    anchorWord,
    siteToken: transformed.token,
    password,
    segments,
    mentalSteps,
    estimatedRecallSeconds,
  };
}
