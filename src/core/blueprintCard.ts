import { createCustomSiteEntry } from './sites';
import { TOPOLOGY_CATALOG, weavePassword } from './weaver';
import { TRANSFORM_CATALOG } from './transforms';
import type { PatternSpec } from './types';

/**
 * Builds a zero-secret Markdown reference sheet using placeholder tokens
 * (`<CORE_HEAD>`, `<DAILY_HEAD>`) and a synthetic `Sample` / `example.com` walkthrough
 * so the exported file never contains the user's real secret anchor.
 */
export function renderZeroSecretMarkdown(spec: PatternSpec, locale: 'zh' | 'en'): string {
  const transformMeta =
    TRANSFORM_CATALOG.find((t) => t.id === spec.transform) ?? TRANSFORM_CATALOG[0]!;
  const topologyMeta =
    TOPOLOGY_CATALOG.find((t) => t.id === spec.topology) ?? TOPOLOGY_CATALOG[0]!;

  const dummySpec: PatternSpec = {
    ...spec,
    tier1: { ...spec.tier1, head: 'VaultWord', tail: '99' },
    tier2: { ...spec.tier2, head: 'SampleWord', tail: '00' },
    tier3Decoy: '<STATIC_DECOY_PASSWORD>',
  };
  const demoSite = createCustomSiteEntry('example.com', 'tier2', 'sl');
  const demoOut = weavePassword(dummySpec, demoSite, 'tier2');

  const structuralMask =
    spec.topology === 'split-inlay'
      ? `<HEAD>${spec.tier2.sepA}[SITE_TOKEN]${spec.tier2.sepB}<TAIL>`
      : spec.topology === 'prefix-bridge'
        ? `[SITE_TOKEN]${spec.tier2.sepA}<HEAD>${spec.tier2.sepB}<TAIL>`
        : `[SITE_0]${spec.tier2.sepA}<HEAD>${spec.tier2.sepB}[SITE_REST]<TAIL>`;

  if (locale === 'zh') {
    return [
      '# PassWeave 个人密码规律助记卡（零敏感脱敏版）',
      '',
      '> 安全说明：本卡片仅记录「规律结构与算法步骤」，不含你的真实暗语词根，可安全存档于备忘录或打印保存。',
      '',
      '## 1. 核心编织结构',
      `- **平台定名锚点**：${spec.naming === 'domain' ? '主域名核心词（如 `github.com` → `github`）' : '中文名双字拼音首字母（如 `淘宝` → `tb`）'}`,
      `- **特征编码规则**：${transformMeta.nameZh} — ${transformMeta.summaryZh}`,
      `- **穿插拓扑结构**：${topologyMeta.nameZh}（\`${structuralMask}\`）`,
      `- **定界符配置**：日常级 \`${spec.tier2.sepA}\` / \`${spec.tier2.sepB}\` · 核心级 \`${spec.tier1.sepA}\` / \`${spec.tier1.sepB}\``,
      '',
      '## 2. 演练示例（以虚构词 `SampleWord` / `00` 登录 `example.com` 为例）',
      `1. 锁定名称：\`${demoOut.anchorWord}\``,
      `2. 特征编码：\`${demoOut.siteToken}\``,
      `3. 合成结果：\`${demoOut.password}\`（使用时将 \`SampleWord\` 与 \`00\` 替换为你脑海中的真实暗语）`,
      '',
      '## 3. 账号三级隔离准则',
      '- **Tier 1 核心级（主邮箱 / 银行 / 支付 / 密码库）**：使用独立 `<CORE_HEAD>` + `<CORE_TAIL>`，必须开启 2FA。',
      '- **Tier 2 日常级（常用社交 / 购物 / 开发平台）**：套用上方标准编织公式。',
      '- **Tier 3 抛弃级（小论坛 / 临时下载站）**：统一使用与个人暗语完全无关的固定一次性口令。',
      '',
    ].join('\n');
  }

  return [
    '# PassWeave Mental Pattern Reference Card (Zero-Secret)',
    '',
    '> Privacy Note: This sheet records only your structural grammar and public dummy examples. Your personal anchor words are omitted.',
    '',
    '## 1. Pattern Grammar',
    `- **Site Naming Anchor**: ${spec.naming === 'domain' ? 'Registrable domain core (`github.com` → `github`)' : 'Two-syllable phonetic initials (`Taobao` → `tb`)'}`,
    `- **Site Token Transform**: ${transformMeta.nameEn} — ${transformMeta.summaryEn}`,
    `- **Weave Topology**: ${topologyMeta.nameEn} (\`${structuralMask}\`)`,
    `- **Delimiters**: Tier 2 \`${spec.tier2.sepA}\` / \`${spec.tier2.sepB}\` · Tier 1 \`${spec.tier1.sepA}\` / \`${spec.tier1.sepB}\``,
    '',
    '## 2. Worked Dummy Example (`SampleWord` / `00` on `example.com`)',
    `1. Canonical Name: \`${demoOut.anchorWord}\``,
    `2. Derived Token: \`${demoOut.siteToken}\``,
    `3. Assembled Output: \`${demoOut.password}\` (mentally substitute your private anchor for \`SampleWord\` & \`00\`)`,
    '',
    '## 3. Three-Tier Isolation Protocol',
    '- **Tier 1 — Core Vault (Primary Email, Banking, Cloud Root)**: Dedicated `<CORE_HEAD>` + `<CORE_TAIL>` + mandatory 2FA.',
    '- **Tier 2 — Standard Everyday**: Standard woven pattern above.',
    '- **Tier 3 — Disposable / Untrusted**: Unrelated static decoy credential; never apply Tier 1/2 rules.',
    '',
  ].join('\n');
}

/**
 * Renders a high-DPI (2x) Swiss-grid typographic reference card onto an HTMLCanvasElement
 * with zero secret material for offline PNG export.
 */
export function drawZeroSecretBlueprintCanvas(
  canvas: HTMLCanvasElement,
  spec: PatternSpec,
  locale: 'zh' | 'en',
): void {
  const scale = 2;
  const width = 880;
  const height = 520;
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  const sans = `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`;
  const mono = `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;

  // Background & frame
  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Header band
  ctx.fillStyle = '#111113';
  ctx.fillRect(21, 21, width - 42, 68);
  ctx.beginPath();
  ctx.moveTo(20, 89);
  ctx.lineTo(width - 20, 89);
  ctx.stroke();

  // Accent indicator
  ctx.fillStyle = '#14B8A6';
  ctx.fillRect(44, 43, 10, 24);

  ctx.fillStyle = '#FAFAFA';
  ctx.font = `700 20px ${sans}`;
  ctx.fillText(
    locale === 'zh' ? 'PassWeave · 零敏感规律助记卡' : 'PassWeave · Zero-Secret Pattern Blueprint',
    66,
    61,
  );

  ctx.fillStyle = '#14B8A6';
  ctx.font = `600 11px ${mono}`;
  ctx.textAlign = 'right';
  ctx.fillText('ZERO SECRET MATERIAL · SAFE TO ARCHIVE', width - 44, 59);
  ctx.textAlign = 'left';

  const transformMeta =
    TRANSFORM_CATALOG.find((t) => t.id === spec.transform) ?? TRANSFORM_CATALOG[0]!;
  const topologyMeta =
    TOPOLOGY_CATALOG.find((t) => t.id === spec.topology) ?? TOPOLOGY_CATALOG[0]!;

  const structuralMask =
    spec.topology === 'split-inlay'
      ? `<HEAD>  ${spec.tier2.sepA}  [SITE]  ${spec.tier2.sepB}  <TAIL>`
      : spec.topology === 'prefix-bridge'
        ? `[SITE]  ${spec.tier2.sepA}  <HEAD>  ${spec.tier2.sepB}  <TAIL>`
        : `[SITE_0]  ${spec.tier2.sepA}  <HEAD>  ${spec.tier2.sepB}  [SITE_1..]  <TAIL>`;

  // Formula box
  ctx.fillStyle = '#141417';
  ctx.fillRect(44, 112, width - 88, 86);
  ctx.strokeStyle = '#27272A';
  ctx.strokeRect(44, 112, width - 88, 86);

  ctx.fillStyle = '#71717A';
  ctx.font = `600 11px ${mono}`;
  ctx.fillText(
    locale === 'zh' ? 'GRAMMAR TEMPLATE / 编织结构掩码' : 'GRAMMAR TEMPLATE',
    64,
    136,
  );

  ctx.fillStyle = '#5EEAD4';
  ctx.font = `700 22px ${mono}`;
  ctx.fillText(structuralMask, 64, 174);

  // Two-column spec details
  const rows: Array<[string, string]> =
    locale === 'zh'
      ? [
          [
            '01 平台定名锚点',
            spec.naming === 'domain'
              ? '取主域名核心词 (github.com → github)'
              : '取中文名双字拼音首字母 (淘宝 → tb)',
          ],
          ['02 特征提取积木', `${transformMeta.nameZh} (${transformMeta.exampleInput} → ${transformMeta.exampleOutput})`],
          ['03 穿插拓扑模式', `${topologyMeta.nameZh} · 日常定界符 [ ${spec.tier2.sepA} ] 与 [ ${spec.tier2.sepB} ]`],
        ]
      : [
          [
            '01 NAMING ANCHOR',
            spec.naming === 'domain'
              ? 'Registrable domain core (github.com → github)'
              : 'Two-syllable phonetic initials (Taobao → tb)',
          ],
          ['02 SITE TRANSFORM', `${transformMeta.nameEn} (${transformMeta.exampleInput} → ${transformMeta.exampleOutput})`],
          ['03 WEAVE TOPOLOGY', `${topologyMeta.nameEn} · Delimiters [ ${spec.tier2.sepA} ] & [ ${spec.tier2.sepB} ]`],
        ];

  let y = 234;
  for (const [label, val] of rows) {
    ctx.fillStyle = '#A1A1AA';
    ctx.font = `600 12px ${mono}`;
    ctx.fillText(label, 44, y);

    ctx.fillStyle = '#F4F4F5';
    ctx.font = `500 14px ${sans}`;
    ctx.fillText(val, 230, y);

    ctx.strokeStyle = '#1F1F23';
    ctx.beginPath();
    ctx.moveTo(44, y + 16);
    ctx.lineTo(width - 44, y + 16);
    ctx.stroke();
    y += 44;
  }

  // Dummy example & 3-tier footer
  const dummySpec: PatternSpec = {
    ...spec,
    tier1: { ...spec.tier1, head: 'Vault', tail: '99' },
    tier2: { ...spec.tier2, head: 'Sample', tail: '00' },
    tier3Decoy: 'Decoy',
  };
  const demoOut = weavePassword(
    dummySpec,
    createCustomSiteEntry('example.com', 'tier2', 'ex'),
    'tier2',
  );

  ctx.fillStyle = '#111113';
  ctx.fillRect(44, 372, width - 88, 102);
  ctx.strokeStyle = '#27272A';
  ctx.strokeRect(44, 372, width - 88, 102);

  ctx.fillStyle = '#FBBF24';
  ctx.font = `600 12px ${mono}`;
  ctx.fillText(
    locale === 'zh'
      ? `虚构词演练 (Sample / 00 @ example.com)  →  ${demoOut.password}`
      : `DUMMY WALKTHROUGH (Sample / 00 @ example.com)  →  ${demoOut.password}`,
    64,
    402,
  );

  ctx.fillStyle = '#A1A1AA';
  ctx.font = `400 12.5px ${sans}`;
  ctx.fillText(
    locale === 'zh'
      ? 'Tier 1 核心资产：独立暗语 + 2FA   |   Tier 2 日常主力：套用本卡公式   |   Tier 3 临时小站：固定无关一次性口令'
      : 'Tier 1 Core: Dedicated Anchor + 2FA  |  Tier 2 Daily: Standard Weave  |  Tier 3 Untrusted: Unrelated Static Decoy',
    64,
    434,
  );

  ctx.fillStyle = '#52525B';
  ctx.font = `500 11px ${mono}`;
  ctx.fillText('Generated locally by PassWeave (offline CSP-locked runtime)', 64, 458);
}
