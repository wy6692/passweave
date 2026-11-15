import { useId } from 'react';
import { BRAND_ICONS } from './brandIconsData';

interface SiteAvatarProps {
  domainCore: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 'h-9 w-9 rounded-xl',
  md: 'h-11 w-11 rounded-2xl',
  lg: 'h-14 w-14 rounded-2xl',
};

const CUSTOM_PALETTES = [
  'from-teal-500 to-emerald-600 text-white',
  'from-sky-500 to-blue-600 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-cyan-500 to-teal-600 text-white',
  'from-emerald-500 to-green-600 text-white',
  'from-rose-500 to-red-600 text-white',
];

function hashPalette(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return CUSTOM_PALETTES[h % CUSTOM_PALETTES.length]!;
}

const RIM_COLORED = 'ring-1 ring-inset ring-black/[0.08] dark:ring-white/[0.14]';
const RIM_WHITE = 'ring-1 ring-inset ring-zinc-900/10 dark:ring-white/20';

export function SiteAvatar({ domainCore, size = 'sm' }: SiteAvatarProps) {
  const uid = useId();
  const key = domainCore.toLowerCase();
  const box = `${SIZE_MAP[size]} flex shrink-0 items-center justify-center shadow-2xs`;

  if (key === 'github') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#181717] text-white`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[62%] w-[62%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.github} />
        </svg>
      </div>
    );
  }

  if (key === 'wechat') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#07C160] text-white`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[62%] w-[62%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.wechat} />
        </svg>
      </div>
    );
  }

  if (key === 'taobao') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-gradient-to-b from-[#FF6A00] to-[#FF5000] text-white`}>
        <svg
          viewBox="64 64 896 896"
          fill="currentColor"
          className="h-[68%] w-[68%]"
          aria-hidden="true"
        >
          <path d={BRAND_ICONS.antd.taobao} />
        </svg>
      </div>
    );
  }

  if (key === 'alipay') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#1677FF] text-white`}>
        <svg
          viewBox="64 64 896 896"
          fill="currentColor"
          fillRule="evenodd"
          className="h-[64%] w-[64%]"
          aria-hidden="true"
        >
          <path d={BRAND_ICONS.antd.alipay} />
        </svg>
      </div>
    );
  }

  if (key === 'bilibili') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#00A1D6] text-white`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[60%] w-[60%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.bilibili} />
        </svg>
      </div>
    );
  }

  if (key === 'steam' || key === 'steampowered') {
    const gradId = `steam-grad-${uid}`;
    const clipId = `steam-clip-${uid}`;
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#111D2E]`}>
        <svg viewBox="0 0 24 24" className="h-[74%] w-[74%]" aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#111D2E" />
              <stop offset="48%" stopColor="#0E4B80" />
              <stop offset="100%" stopColor="#1885B8" />
            </linearGradient>
            <clipPath id={clipId}>
              <circle cx="12" cy="12" r="11.85" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <circle cx="12" cy="12" r="12" fill="#FFFFFF" />
            <path d={BRAND_ICONS.si.steam} fill={`url(#${gradId})`} />
          </g>
        </svg>
      </div>
    );
  }

  if (key === '163') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#D43C33] text-white`}>
        <svg
          viewBox="3 2.5 18 19"
          fill="currentColor"
          fillRule="evenodd"
          className="h-[64%] w-[64%]"
          aria-hidden="true"
        >
          <path d={BRAND_ICONS.si.neteaseSpiral} />
        </svg>
      </div>
    );
  }

  if (key === 'google') {
    return (
      <div className={`${box} ${RIM_WHITE} bg-white`}>
        <svg viewBox="0 0 256 262" className="h-[56%] w-[56%]" aria-hidden="true">
          {BRAND_ICONS.google.map((seg, idx) => (
            <path key={idx} fill={seg.fill} d={seg.d} />
          ))}
        </svg>
      </div>
    );
  }

  if (key === 'microsoft') {
    return (
      <div className={`${box} ${RIM_WHITE} bg-white`}>
        <svg viewBox="0 0 256 256" className="h-[52%] w-[52%]" aria-hidden="true">
          {BRAND_ICONS.microsoft.map((seg, idx) => (
            <path key={idx} fill={seg.fill} d={seg.d} />
          ))}
        </svg>
      </div>
    );
  }

  if (key === 'zhihu') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#0066FF] text-white`}>
        <svg
          viewBox="64 64 896 896"
          fill="currentColor"
          className="h-[64%] w-[64%]"
          aria-hidden="true"
        >
          <path d={BRAND_ICONS.antd.zhihu} />
        </svg>
      </div>
    );
  }

  if (key === 'xiaohongshu') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#FF2442] text-white`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[74%] w-[74%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.xiaohongshu} />
        </svg>
      </div>
    );
  }

  if (key === 'weibo') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#E6162D] text-white`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[62%] w-[62%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.weibo} />
        </svg>
      </div>
    );
  }

  if (key === 'qq') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#12B7F5] text-white`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[60%] w-[60%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.qq} />
        </svg>
      </div>
    );
  }

  if (key === 'baidu') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#2932E1] text-white`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[60%] w-[60%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.baidu} />
        </svg>
      </div>
    );
  }

  if (key === 'douban') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#00B51D] text-white`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[56%] w-[56%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.douban} />
        </svg>
      </div>
    );
  }

  if (key === 'douyin') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#09090B]`}>
        <svg viewBox="-1 -1 26 26" className="h-[60%] w-[60%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.douyin} fill="#25F4EE" transform="translate(-0.75, -0.65)" />
          <path d={BRAND_ICONS.si.douyin} fill="#FE2C55" transform="translate(0.75, 0.65)" />
          <path d={BRAND_ICONS.si.douyin} fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  if (key === 'meituan') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#FFD100] text-[#111111]`}>
        <svg
          viewBox="2 6 20 12"
          fill="currentColor"
          className="h-[72%] w-[72%]"
          aria-hidden="true"
        >
          <path d={BRAND_ICONS.si.meituan} />
        </svg>
      </div>
    );
  }

  if (key === 'apple') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#18181B] text-white`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[58%] w-[58%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.apple} />
        </svg>
      </div>
    );
  }

  if (key === 'notion') {
    return (
      <div className={`${box} ${RIM_WHITE} bg-white text-[#111111]`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[60%] w-[60%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.notion} />
        </svg>
      </div>
    );
  }

  if (key === 'discord') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#5865F2] text-white`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[62%] w-[62%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.discord} />
        </svg>
      </div>
    );
  }

  if (key === 'x') {
    return (
      <div className={`${box} ${RIM_COLORED} bg-[#09090B] text-white`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[52%] w-[52%]" aria-hidden="true">
          <path d={BRAND_ICONS.si.x} />
        </svg>
      </div>
    );
  }

  if (key === 'indiemod') {
    return (
      <div
        className={`${box} ${RIM_COLORED} bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] text-white`}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[62%] w-[62%]" aria-hidden="true">
          <path d="M12 2.4 20.4 7.2 12 12 3.6 7.2Z" />
          <path d="M2.8 8.6 11.2 13.4v8.2L2.8 16.8Z" fillOpacity="0.82" />
          <path d="M21.2 8.6v8.2l-8.4 4.8v-8.2Z" fillOpacity="0.64" />
        </svg>
      </div>
    );
  }

  const monogram = (domainCore.slice(0, 2) || 'PW').toUpperCase();
  return (
    <div
      className={`${box} ${RIM_COLORED} bg-gradient-to-br font-mono text-xs font-bold ${hashPalette(key)}`}
    >
      {monogram}
    </div>
  );
}
