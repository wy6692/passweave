import type { TransformId } from './types';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

export interface TransformResult {
  token: string;
  ruleTraceEn: string;
  ruleTraceZh: string;
  cognitiveSteps: number;
}

export interface TransformMeta {
  id: TransformId;
  nameEn: string;
  nameZh: string;
  summaryEn: string;
  summaryZh: string;
  exampleInput: string;
  exampleOutput: string;
  resistanceStars: 3 | 4 | 5;
}

export const TRANSFORM_CATALOG: TransformMeta[] = [
  {
    id: 'consonant-count',
    nameEn: 'Consonant Pair + Vowel Count',
    nameZh: '前二辅音 + 元音计数',
    summaryEn: 'First 2 consonants (TitleCase, pad "x") + total vowel count. Numeric domains use "N" + first 2 digits.',
    summaryZh: '取前 2 个辅音（首大次小，不足补 x）+ 元音字母总数；纯数字域名取 N + 前两位数字。',
    exampleInput: 'github',
    exampleOutput: 'Gt2',
    resistanceStars: 5,
  },
  {
    id: 'edge-length',
    nameEn: 'First + Length + Last',
    nameZh: '首字母 + 字长 + 尾字母',
    summaryEn: '1st char uppercase + total character length + last char lowercase.',
    summaryZh: '首字符大写 + 核心词总字符数 + 尾字符小写。',
    exampleInput: 'github',
    exampleOutput: 'G6b',
    resistanceStars: 4,
  },
  {
    id: 'caesar-pair',
    nameEn: 'Alphabet +1 Shift Pair',
    nameZh: '前二字符顺移一位',
    summaryEn: 'Take first 2 chars and advance each by +1 (a→b, z→a, 9→0), formatted as TitleCase.',
    summaryZh: '取前 2 个字符在字母/数字表向后顺移 1 位（z→a，9→0），首大次小。',
    exampleInput: 'github',
    exampleOutput: 'Hj',
    resistanceStars: 4,
  },
  {
    id: 'outer-pair',
    nameEn: 'Outer Edge Pair',
    nameZh: '极简首尾双码',
    summaryEn: '1st char uppercase + last char lowercase. Minimal mental load; pair with split-anchor topology.',
    summaryZh: '首字符大写 + 尾字符小写。心算极快，建议搭配穿插或拆嵌拓扑使用。',
    exampleInput: 'github',
    exampleOutput: 'Gb',
    resistanceStars: 3,
  },
];

function shiftCharPlusOne(ch: string): string {
  const code = ch.charCodeAt(0);
  if (code >= 97 && code <= 122) {
    return code === 122 ? 'a' : String.fromCharCode(code + 1);
  }
  if (code >= 48 && code <= 57) {
    return code === 57 ? '0' : String.fromCharCode(code + 1);
  }
  return 'x';
}

/**
 * Computes a deterministic, human-calculable site token from a normalized site word.
 */
export function applySiteTransform(rawWord: string, transform: TransformId): TransformResult {
  const word = rawWord.toLowerCase().replace(/[^a-z0-9]/g, '') || 'site';
  const chars = Array.from(word);

  switch (transform) {
    case 'consonant-count': {
      const hasLetters = /[a-z]/.test(word);
      if (!hasLetters) {
        const d1 = chars[0] ?? '0';
        const d2 = chars[1] ?? d1;
        const token = `N${d1}${d2}`;
        return {
          token,
          ruleTraceEn: `"${word}" is numeric → prefix N + first two digits (${d1}${d2}) = ${token}`,
          ruleTraceZh: `"${word}" 为纯数字 → 固定前缀 N + 前两位数字 (${d1}${d2}) = ${token}`,
          cognitiveSteps: 2,
        };
      }

      const consonants = chars.filter((c) => /[a-z]/.test(c) && !VOWELS.has(c));
      const vowelCount = chars.filter((c) => VOWELS.has(c)).length;
      const c1 = (consonants[0] ?? 'x').toUpperCase();
      const c2 = (consonants[1] ?? 'x').toLowerCase();
      const token = `${c1}${c2}${vowelCount}`;
      const paddedNoteEn = consonants.length < 2 ? ' (padded with x)' : '';
      const paddedNoteZh = consonants.length < 2 ? '（不足两位补 x）' : '';

      return {
        token,
        ruleTraceEn: `Consonants [${c1.toLowerCase()}, ${c2}]${paddedNoteEn} + ${vowelCount} vowel(s) = ${token}`,
        ruleTraceZh: `提取前二辅音 [${c1.toLowerCase()}, ${c2}]${paddedNoteZh} + ${vowelCount} 个元音 = ${token}`,
        cognitiveSteps: 2,
      };
    }

    case 'edge-length': {
      const first = (chars[0] ?? 'x').toUpperCase();
      const last = (chars[chars.length - 1] ?? 'x').toLowerCase();
      const len = chars.length;
      const token = `${first}${len}${last}`;
      return {
        token,
        ruleTraceEn: `First "${first}" + length (${len}) + last "${last}" = ${token}`,
        ruleTraceZh: `首字符 "${first}" + 总长 (${len}) + 尾字符 "${last}" = ${token}`,
        cognitiveSteps: 2,
      };
    }

    case 'caesar-pair': {
      const p1 = chars[0] ?? 'a';
      const p2 = chars[1] ?? p1;
      const s1 = shiftCharPlusOne(p1).toUpperCase();
      const s2 = shiftCharPlusOne(p2).toLowerCase();
      const token = `${s1}${s2}`;
      return {
        token,
        ruleTraceEn: `Lead pair "${p1}${p2}" shifted +1 → "${s1}${s2}"`,
        ruleTraceZh: `前二字符 "${p1}${p2}" 顺移一位 → "${s1}${s2}"`,
        cognitiveSteps: 2,
      };
    }

    case 'outer-pair': {
      const first = (chars[0] ?? 'x').toUpperCase();
      const last = (chars[chars.length - 1] ?? 'x').toLowerCase();
      const token = `${first}${last}`;
      return {
        token,
        ruleTraceEn: `First "${first}" + last "${last}" = ${token}`,
        ruleTraceZh: `首字符 "${first}" + 尾字符 "${last}" = ${token}`,
        cognitiveSteps: 1,
      };
    }
  }
}
