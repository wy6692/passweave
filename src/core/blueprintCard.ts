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

function buildStructureMask(spec: PatternSpec, locale: 'zh' | 'en'): string {
  const head = locale === 'zh' ? '固定词' : 'Word';
  const site = locale === 'zh' ? '网站码' : 'Site';
  const s0 = locale === 'zh' ? '首码' : 'S1';
  const sRest = locale === 'zh' ? '余码' : 'S2';
  const tail = locale === 'zh' ? '尾数' : 'Digits';

  if (spec.topology === 'split-inlay') {
    return `${head}  ${spec.tier2.sepA}  ${site}  ${spec.tier2.sepB}  ${tail}`;
  }
  if (spec.topology === 'prefix-bridge') {
    return `${site}  ${spec.tier2.sepA}  ${head}  ${spec.tier2.sepB}  ${tail}`;
  }
  return `${s0}  ${spec.tier2.sepA}  ${head}  ${spec.tier2.sepB}  ${sRest}  ${tail}`;
}

/**
 * Exports a clean plain-text / Markdown reference note omitting private base words.
 */
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
  const mask = buildStructureMask(spec, locale);

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

/**
 * Draws a clean, high-contrast reference card with comfortable reading sizes
 * and zero private anchor strings.
 */
export function drawZeroSecretBlueprintCanvas(
  canvas: HTMLCanvasElement,
  spec: PatternSpec,
  locale: 'zh' | 'en',
): void {
  const scale = 2;
  const width = 800;
  const height = 440;
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  const sans = `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`;
  const mono = `"JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace`;

  ctx.fillStyle = '#0C0C0E';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Title
  ctx.fillStyle = '#FAFAFA';
  ctx.font = `600 22px ${sans}`;
  ctx.fillText(locale === 'zh' ? '密码规律备忘卡' : 'Password Pattern Card', 48, 62);

  // Structure Formula Box
  ctx.fillStyle = '#141418';
  ctx.fillRect(48, 90, width - 96, 84);
  ctx.strokeStyle = '#27272A';
  ctx.strokeRect(48, 90, width - 96, 84);

  ctx.fillStyle = '#5EEAD4';
  ctx.font = `600 26px ${mono}`;
  ctx.fillText(buildStructureMask(spec, locale), 72, 141);

  // 3 clean rows
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
          ['推演示例', `Sample / 00 @ github.com  →  ${demoOut.password}`],
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

  let y = 224;
  for (const [label, value] of items) {
    ctx.fillStyle = '#71717A';
    ctx.font = `500 16px ${sans}`;
    ctx.fillText(label, 48, y);

    ctx.fillStyle = '#F4F4F5';
    ctx.font = `500 17px ${sans}`;
    ctx.fillText(value, 168, y);
    y += 48;
  }

  // Quiet divider & single-line tier note
  ctx.strokeStyle = '#222226';
  ctx.beginPath();
  ctx.moveTo(48, 366);
  ctx.lineTo(width - 48, 366);
  ctx.stroke();

  ctx.fillStyle = '#A1A1AA';
  ctx.font = `400 15px ${sans}`;
  ctx.fillText(
    locale === 'zh'
      ? '重要账号换用另一组专用底词  ·  临时小网站统一用固定无关密码'
      : 'Critical accounts: separate base word  ·  Throwaway sites: unrelated password',
    48,
    400,
  );
}
