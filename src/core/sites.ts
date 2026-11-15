import type { AccountTier, NamingConvention, SiteEntry } from './types';

const MULTI_PART_TLDS = new Set([
  'com.cn',
  'net.cn',
  'org.cn',
  'gov.cn',
  'edu.cn',
  'co.uk',
  'org.uk',
  'ac.uk',
  'co.jp',
  'ne.jp',
  'or.jp',
  'com.hk',
  'com.tw',
  'com.au',
  'co.kr',
  'com.sg',
]);

interface KnownAlias {
  domainCore: string;
  pinyinPair: string;
  nameEn: string;
  nameZh: string;
}

const KNOWN_ALIASES: Record<string, KnownAlias> = {
  github: { domainCore: 'github', pinyinPair: 'gh', nameEn: 'GitHub', nameZh: 'GitHub' },
  google: { domainCore: 'google', pinyinPair: 'gg', nameEn: 'Google', nameZh: '谷歌' },
  gmail: { domainCore: 'google', pinyinPair: 'gg', nameEn: 'Google / Gmail', nameZh: '谷歌邮箱' },
  apple: { domainCore: 'apple', pinyinPair: 'pg', nameEn: 'Apple ID', nameZh: '苹果 Apple' },
  icloud: { domainCore: 'apple', pinyinPair: 'pg', nameEn: 'Apple iCloud', nameZh: '苹果 iCloud' },
  wechat: { domainCore: 'wechat', pinyinPair: 'wx', nameEn: 'WeChat', nameZh: '微信' },
  weixin: { domainCore: 'wechat', pinyinPair: 'wx', nameEn: 'WeChat', nameZh: '微信' },
  '微信': { domainCore: 'wechat', pinyinPair: 'wx', nameEn: 'WeChat', nameZh: '微信' },
  taobao: { domainCore: 'taobao', pinyinPair: 'tb', nameEn: 'Taobao', nameZh: '淘宝' },
  '淘宝': { domainCore: 'taobao', pinyinPair: 'tb', nameEn: 'Taobao', nameZh: '淘宝' },
  alipay: { domainCore: 'alipay', pinyinPair: 'zf', nameEn: 'Alipay', nameZh: '支付宝' },
  '支付宝': { domainCore: 'alipay', pinyinPair: 'zf', nameEn: 'Alipay', nameZh: '支付宝' },
  bilibili: { domainCore: 'bilibili', pinyinPair: 'bl', nameEn: 'Bilibili', nameZh: '哔哩哔哩' },
  '哔哩哔哩': { domainCore: 'bilibili', pinyinPair: 'bl', nameEn: 'Bilibili', nameZh: '哔哩哔哩' },
  'b站': { domainCore: 'bilibili', pinyinPair: 'bl', nameEn: 'Bilibili', nameZh: '哔哩哔哩' },
  steam: { domainCore: 'steampowered', pinyinPair: 'st', nameEn: 'Steam', nameZh: 'Steam' },
  steampowered: { domainCore: 'steampowered', pinyinPair: 'st', nameEn: 'Steam', nameZh: 'Steam' },
  jd: { domainCore: 'jd', pinyinPair: 'jd', nameEn: 'JD.com', nameZh: '京东' },
  '京东': { domainCore: 'jd', pinyinPair: 'jd', nameEn: 'JD.com', nameZh: '京东' },
  zhihu: { domainCore: 'zhihu', pinyinPair: 'zh', nameEn: 'Zhihu', nameZh: '知乎' },
  '知乎': { domainCore: 'zhihu', pinyinPair: 'zh', nameEn: 'Zhihu', nameZh: '知乎' },
  xiaohongshu: { domainCore: 'xiaohongshu', pinyinPair: 'xh', nameEn: 'Xiaohongshu', nameZh: '小红书' },
  '小红书': { domainCore: 'xiaohongshu', pinyinPair: 'xh', nameEn: 'Xiaohongshu', nameZh: '小红书' },
  douyin: { domainCore: 'douyin', pinyinPair: 'dy', nameEn: 'Douyin', nameZh: '抖音' },
  '抖音': { domainCore: 'douyin', pinyinPair: 'dy', nameEn: 'Douyin', nameZh: '抖音' },
  meituan: { domainCore: 'meituan', pinyinPair: 'mt', nameEn: 'Meituan', nameZh: '美团' },
  '美团': { domainCore: 'meituan', pinyinPair: 'mt', nameEn: 'Meituan', nameZh: '美团' },
  '163': { domainCore: '163', pinyinPair: 'wy', nameEn: 'NetEase 163', nameZh: '网易邮箱' },
  '网易': { domainCore: '163', pinyinPair: 'wy', nameEn: 'NetEase 163', nameZh: '网易邮箱' },
  qq: { domainCore: 'qq', pinyinPair: 'qq', nameEn: 'Tencent QQ', nameZh: '腾讯 QQ' },
  weibo: { domainCore: 'weibo', pinyinPair: 'wb', nameEn: 'Weibo', nameZh: '微博' },
  '微博': { domainCore: 'weibo', pinyinPair: 'wb', nameEn: 'Weibo', nameZh: '微博' },
  baidu: { domainCore: 'baidu', pinyinPair: 'bd', nameEn: 'Baidu', nameZh: '百度' },
  '百度': { domainCore: 'baidu', pinyinPair: 'bd', nameEn: 'Baidu', nameZh: '百度' },
  douban: { domainCore: 'douban', pinyinPair: 'db', nameEn: 'Douban', nameZh: '豆瓣' },
  '豆瓣': { domainCore: 'douban', pinyinPair: 'db', nameEn: '豆瓣', nameZh: '豆瓣' },
  microsoft: { domainCore: 'microsoft', pinyinPair: 'wr', nameEn: 'Microsoft', nameZh: '微软' },
  '微软': { domainCore: 'microsoft', pinyinPair: 'wr', nameEn: 'Microsoft', nameZh: '微软' },
  notion: { domainCore: 'notion', pinyinPair: 'nt', nameEn: 'Notion', nameZh: 'Notion' },
  discord: { domainCore: 'discord', pinyinPair: 'dc', nameEn: 'Discord', nameZh: 'Discord' },
  x: { domainCore: 'x', pinyinPair: 'tw', nameEn: 'X (Twitter)', nameZh: 'X (推特)' },
  twitter: { domainCore: 'x', pinyinPair: 'tw', nameEn: 'X (Twitter)', nameZh: 'X (推特)' },
  cmbchina: { domainCore: 'cmbchina', pinyinPair: 'zs', nameEn: 'CMB Bank', nameZh: '招商银行' },
  '招商银行': { domainCore: 'cmbchina', pinyinPair: 'zs', nameEn: 'CMB Bank', nameZh: '招商银行' },
};

export const BUILTIN_SITES: SiteEntry[] = [
  {
    id: 'github',
    nameEn: 'GitHub',
    nameZh: 'GitHub',
    url: 'github.com',
    domainCore: 'github',
    pinyinPair: 'gh',
    defaultTier: 'tier2',
  },
  {
    id: 'google',
    nameEn: 'Google Mail',
    nameZh: 'Google 主邮箱',
    url: 'accounts.google.com',
    domainCore: 'google',
    pinyinPair: 'gg',
    defaultTier: 'tier1',
  },
  {
    id: 'wechat',
    nameEn: 'WeChat',
    nameZh: '微信',
    url: 'weixin.qq.com',
    domainCore: 'wechat',
    pinyinPair: 'wx',
    defaultTier: 'tier2',
  },
  {
    id: 'taobao',
    nameEn: 'Taobao',
    nameZh: '淘宝',
    url: 'taobao.com',
    domainCore: 'taobao',
    pinyinPair: 'tb',
    defaultTier: 'tier2',
  },
  {
    id: 'bilibili',
    nameEn: 'Bilibili',
    nameZh: '哔哩哔哩',
    url: 'bilibili.com',
    domainCore: 'bilibili',
    pinyinPair: 'bl',
    defaultTier: 'tier2',
  },
  {
    id: 'alipay',
    nameEn: 'Alipay',
    nameZh: '支付宝',
    url: 'alipay.com',
    domainCore: 'alipay',
    pinyinPair: 'zf',
    defaultTier: 'tier1',
  },
  {
    id: 'steam',
    nameEn: 'Steam',
    nameZh: 'Steam',
    url: 'store.steampowered.com',
    domainCore: 'steam',
    pinyinPair: 'st',
    defaultTier: 'tier2',
  },
  {
    id: 'netease-163',
    nameEn: 'NetEase 163',
    nameZh: '网易 163',
    url: 'mail.163.com',
    domainCore: '163',
    pinyinPair: 'wy',
    defaultTier: 'tier2',
  },
  {
    id: 'forum-decoy',
    nameEn: 'Indie Game Forum',
    nameZh: '某临时资源论坛',
    url: 'bbs.indie-mod.net',
    domainCore: 'indiemod',
    pinyinPair: 'lt',
    defaultTier: 'tier3',
  },
];

/**
 * Extracts the canonical registrable label from a URL, hostname, or service name.
 * For example, `https://accounts.google.com/login` resolves to `google`,
 * and `https://mail.sina.com.cn` resolves to `sina`.
 */
export function extractDomainCore(rawInput: string): string {
  const trimmed = rawInput.trim().toLowerCase();
  if (!trimmed) return 'example';

  const directAlias = KNOWN_ALIASES[trimmed];
  if (directAlias) return directAlias.domainCore;

  const withoutProtocol = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
  const hostPart = (withoutProtocol.split(/[/?#]/)[0] ?? '').split(':')[0] ?? '';

  if (!hostPart.includes('.')) {
    const cleaned = hostPart.replace(/[^a-z0-9]/g, '');
    return cleaned || 'site';
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostPart)) {
    return hostPart.replace(/\./g, '').slice(0, 6);
  }

  const labels = hostPart.split('.').filter(Boolean);
  if (labels.length < 2) {
    return (labels[0] ?? 'site').replace(/[^a-z0-9]/g, '') || 'site';
  }

  const lastTwo = `${labels[labels.length - 2]}.${labels[labels.length - 1]}`;
  const coreIndex =
    MULTI_PART_TLDS.has(lastTwo) && labels.length >= 3
      ? labels.length - 3
      : labels.length - 2;

  const candidate = (labels[coreIndex] ?? labels[0] ?? 'site').replace(/[^a-z0-9]/g, '');
  return candidate || 'site';
}

export function deriveDefaultPinyinPair(domainCore: string, rawInput?: string): string {
  if (rawInput) {
    const rawAlias = KNOWN_ALIASES[rawInput.trim().toLowerCase()];
    if (rawAlias) return rawAlias.pinyinPair;
  }
  const coreAlias = KNOWN_ALIASES[domainCore.toLowerCase()];
  if (coreAlias) return coreAlias.pinyinPair;

  const letters = domainCore.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (letters.length >= 2) return letters.slice(0, 2);
  if (letters.length === 1) return `${letters}${letters}`;
  return 'xx';
}

export function createCustomSiteEntry(
  rawInput: string,
  tier: AccountTier = 'tier2',
  customPinyin?: string,
): SiteEntry {
  const trimmed = rawInput.trim();
  const alias = KNOWN_ALIASES[trimmed.toLowerCase()];
  const domainCore = alias ? alias.domainCore : extractDomainCore(trimmed);
  const sanitizedPinyin = customPinyin
    ? customPinyin.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4)
    : '';
  const pinyinPair =
    sanitizedPinyin || (alias ? alias.pinyinPair : deriveDefaultPinyinPair(domainCore, trimmed));

  const displayTitle = alias ? alias.nameEn : trimmed || domainCore;
  const displayZh = alias ? alias.nameZh : trimmed || domainCore;

  return {
    id: `custom-${domainCore}-${Date.now().toString(36)}`,
    nameEn: displayTitle,
    nameZh: displayZh,
    url: trimmed.includes('.') ? trimmed : `${domainCore}.com`,
    domainCore,
    pinyinPair,
    defaultTier: tier,
    custom: true,
  };
}

export function resolveAnchorWord(site: SiteEntry, naming: NamingConvention): string {
  return naming === 'pinyin' ? site.pinyinPair : site.domainCore;
}
