import { createCustomSiteEntry } from './sites';
import type { PatternSpec } from './types';
import { weavePassword } from './weaver';

const TRANSFORM_LABEL_ZH: Record<PatternSpec['transform'], string> = {
  'consonant-count': '前两辅音 + 元音数（github → Gt2）',
  'edge-length': '首尾字母 + 长度（github → G6b）',
  'caesar-pair': '前两字母后移一位（github → Hj）',
  'outer-pair': '首尾两字母（github → Gb）',
};

const TRANSFORM_LABEL_EN: Record<PatternSpec['transform'], string> = {
  'consonant-count': '2 consonants + vowel count (github → Gt2)',
  'edge-length': 'First + length + last (github → G6b)',
  'caesar-pair': 'First 2 letters shifted +1 (github → Hj)',
  'outer-pair': 'First + last letter (github → Gb)',
};

interface CardChip {
  text: string;
  tone: 'teal' | 'amber' | 'neutral';
}

function buildMaskChips(spec: PatternSpec, locale: 'zh' | 'en'): CardChip[] {
  const head = locale === 'zh' ? '固定词' : 'Word';
  const site = locale === 'zh' ? '网站码' : 'Site';
  const s0 = locale === 'zh' ? '首码' : 'S1';
  const sRest = locale === 'zh' ? '余码' : 'S2';
  const tail = locale === 'zh' ? '尾数' : 'Digits';

  if (spec.topology === 'split-inlay') {
    return [
      { text: head, tone: 'teal' },
      { text: spec.tier2.sepA, tone: 'neutral' },
      { text: site, tone: 'amber' },
      { text: spec.tier2.sepB, tone: 'neutral' },
      { text: tail, tone: 'teal' },
    ];
  }
  if (spec.topology === 'prefix-bridge') {
    return [
      { text: site, tone: 'amber' },
      { text: spec.tier2.sepA, tone: 'neutral' },
      { text: head, tone: 'teal' },
      { text: spec.tier2.sepB, tone: 'neutral' },
      { text: tail, tone: 'teal' },
    ];
  }
  return [
    { text: s0, tone: 'amber' },
    { text: spec.tier2.sepA, tone: 'neutral' },
    { text: head, tone: 'teal' },
    { text: spec.tier2.sepB, tone: 'neutral' },
    { text: sRest, tone: 'amber' },
    { text: tail, tone: 'teal' },
  ];
}

export function renderZeroSecretMarkdown(spec: PatternSpec, locale: 'zh' | 'en'): string {
  const dummySpec: PatternSpec = {
    ...spec,
    tier1: { ...spec.tier1, head: 'Vault', tail: '99' },
    tier2: { ...spec.tier2, head: 'Sample', tail: '00' },
    tier3Decoy: '<FIXED_PASSWORD>',
  };
  const demoOut = weavePassword(
    dummySpec,
    createCustomSiteEntry('github.com', 'tier2', 'gh'),
    'tier2',
  );
  const mask = buildMaskChips(spec, locale)
    .map((c) => c.text)
    .join(' ');

  if (locale === 'zh') {
    return [
      '# 密码规律备忘',
      '',
      `结构：\`${mask}\``,
      '',
      `- 网站取名：${spec.naming === 'domain' ? '网址主词（github.com → github）' : '中文首字母（淘宝 → tb）'}`,
      `- 变形方式：${TRANSFORM_LABEL_ZH[spec.transform]}`,
      `- 示例（假定底词 Sample / 00，网站 github.com）：\`${demoOut.password}\``,
      '',
      '分级习惯：',
      '- 重要账号（邮箱 / 支付）：换用另一组专用底词，并开启双重验证',
      '- 临时小站：统一用固定无关密码，不用上述规律',
      '',
    ].join('\n');
  }

  return [
    '# Password Pattern Note',
    '',
    `Structure: \`${mask}\``,
    '',
    `- Site name: ${spec.naming === 'domain' ? 'Domain word (github.com → github)' : '2-letter code (Taobao → tb)'}`,
    `- Transform: ${TRANSFORM_LABEL_EN[spec.transform]}`,
    `- Example ("Sample" / "00" on github.com): \`${demoOut.password}\``,
    '',
    'Tiers:',
    '- Critical accounts: separate base word + 2FA',
    '- Throwaway sites: single unrelated password',
    '',
  ].join('\n');
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawZeroSecretBlueprintCanvas(
  canvas: HTMLCanvasElement,
  spec: PatternSpec,
  locale: 'zh' | 'en',
  theme: 'light' | 'dark' = 'dark',
): void {
  const isDark = theme === 'dark';
  const scale = 2;
  const width = 820;
  const height = 460;
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  const sans = `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`;
  const mono = `"JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace`;

  // Theme-adaptive surface background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  if (isDark) {
    bgGrad.addColorStop(0, '#131419');
    bgGrad.addColorStop(1, '#09090C');
  } else {
    bgGrad.addColorStop(0, '#FFFFFF');
    bgGrad.addColorStop(1, '#F8FAFC');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width - 120, 80, 10, width - 120, 80, 260);
  glow.addColorStop(0, isDark ? 'rgba(20, 184, 166, 0.14)' : 'rgba(20, 184, 166, 0.09)');
  glow.addColorStop(1, 'rgba(20, 184, 166, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Subtle dot grid
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.06)';
  for (let gx = 28; gx < width - 20; gx += 24) {
    for (let gy = 28; gy < height - 20; gy += 24) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // PassWeave Brand Mark top-left + Title
  ctx.save();
  ctx.translate(48, 36);
  roundRect(ctx, 0, 0, 38, 38, 10);
  ctx.fillStyle = '#09090B';
  ctx.fill();

  ctx.strokeStyle = '#F4F4F5';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(10.5, 19, 4.8, Math.PI * 0.5, Math.PI * 1.5);
  ctx.lineTo(20, 14.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(27.5, 19, 4.8, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.lineTo(18, 23.8);
  ctx.stroke();

  ctx.strokeStyle = '#14B8A6';
  ctx.beginPath();
  ctx.arc(19, 10.5, 4.8, Math.PI, 0);
  ctx.lineTo(23.8, 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(19, 27.5, 4.8, 0, Math.PI);
  ctx.lineTo(14.2, 18);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = isDark ? '#FAFAFA' : '#09090B';
  ctx.font = `600 22px ${sans}`;
  ctx.fillText(locale === 'zh' ? 'PassWeave 规律卡' : 'PassWeave Rule Card', 100, 62);

  // Colored Keycap Chips Row
  const chips = buildMaskChips(spec, locale);
  let chipX = 48;
  const chipY = 100;
  ctx.font = `600 21px ${mono}`;

  for (const chip of chips) {
    const textW = ctx.measureText(chip.text).width;
    const boxW = Math.max(46, textW + 32);
    const boxH = 58;

    roundRect(ctx, chipX, chipY, boxW, boxH, 12);
    if (chip.tone === 'teal') {
      ctx.fillStyle = isDark ? 'rgba(20, 184, 166, 0.14)' : 'rgba(20, 184, 166, 0.10)';
      ctx.strokeStyle = isDark ? 'rgba(45, 212, 191, 0.42)' : 'rgba(13, 148, 136, 0.35)';
    } else if (chip.tone === 'amber') {
      ctx.fillStyle = isDark ? 'rgba(245, 158, 11, 0.16)' : 'rgba(245, 158, 11, 0.12)';
      ctx.strokeStyle = isDark ? 'rgba(251, 191, 36, 0.45)' : 'rgba(217, 119, 6, 0.38)';
    } else {
      ctx.fillStyle = isDark ? 'rgba(63, 63, 70, 0.45)' : '#F4F4F5';
      ctx.strokeStyle = isDark ? 'rgba(113, 113, 122, 0.45)' : '#D4D4D8';
    }
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle =
      chip.tone === 'teal'
        ? isDark
          ? '#99F6E4'
          : '#115E59'
        : chip.tone === 'amber'
          ? isDark
            ? '#FDE68A'
            : '#92400E'
          : isDark
            ? '#D4D4D8'
            : '#3F3F46';
    ctx.textAlign = 'center';
    ctx.fillText(chip.text, chipX + boxW / 2, chipY + 36);
    ctx.textAlign = 'left';

    chipX += boxW + 12;
  }

  // Rule Rows
  const dummySpec: PatternSpec = {
    ...spec,
    tier1: { ...spec.tier1, head: 'Vault', tail: '99' },
    tier2: { ...spec.tier2, head: 'Sample', tail: '00' },
    tier3Decoy: 'Fixed',
  };
  const demoOut = weavePassword(
    dummySpec,
    createCustomSiteEntry('github.com', 'tier2', 'gh'),
    'tier2',
  );

  const items: Array<[string, string]> =
    locale === 'zh'
      ? [
          [
            '网站取名',
            spec.naming === 'domain'
              ? '网址主词  (github.com → github)'
              : '中文首字母  (淘宝 → tb)',
          ],
          ['变形方式', TRANSFORM_LABEL_ZH[spec.transform]],
          ['演练示例', `Sample / 00 @ github.com  →  ${demoOut.password}`],
        ]
      : [
          [
            'Site name',
            spec.naming === 'domain'
              ? 'Domain word  (github.com → github)'
              : '2-letter code  (Taobao → tb)',
          ],
          ['Transform', TRANSFORM_LABEL_EN[spec.transform]],
          ['Example', `Sample / 00 @ github.com  →  ${demoOut.password}`],
        ];

  let y = 216;
  for (const [label, value] of items) {
    ctx.fillStyle = isDark ? '#71717A' : '#64748B';
    ctx.font = `500 16px ${sans}`;
    ctx.fillText(label, 48, y);

    ctx.fillStyle = isDark ? '#F4F4F5' : '#09090B';
    ctx.font = `500 17px ${sans}`;
    ctx.fillText(value, 168, y);
    y += 50;
  }

  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(48, 376);
  ctx.lineTo(width - 48, 376);
  ctx.stroke();

  ctx.fillStyle = isDark ? '#A1A1AA' : '#71717A';
  ctx.font = `400 15px ${sans}`;
  ctx.fillText(
    locale === 'zh'
      ? '重要账号换用另一组专用底词  ·  临时小网站统一用固定无关密码'
      : 'Critical accounts: separate base word  ·  Throwaway sites: unrelated password',
    48,
    414,
  );
}
