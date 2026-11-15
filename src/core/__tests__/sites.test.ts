import { describe, expect, it } from 'vitest';
import { createCustomSiteEntry, extractDomainCore } from '../sites';

describe('extractDomainCore', () => {
  it('extracts registrable core from standard URLs and subdomains', () => {
    expect(extractDomainCore('https://github.com/login')).toBe('github');
    expect(extractDomainCore('https://accounts.google.com/signin?hl=zh')).toBe('google');
    expect(extractDomainCore('http://space.bilibili.com:8080/123')).toBe('bilibili');
    expect(extractDomainCore('www.163.com')).toBe('163');
  });

  it('handles multi-part country-code TLDs accurately', () => {
    expect(extractDomainCore('https://mail.sina.com.cn')).toBe('sina');
    expect(extractDomainCore('https://portal.ox.ac.uk/auth')).toBe('ox');
    expect(extractDomainCore('shop.rakuten.co.jp')).toBe('rakuten');
  });

  it('resolves known Chinese and English service aliases', () => {
    expect(extractDomainCore('微信')).toBe('wechat');
    expect(extractDomainCore('淘宝')).toBe('taobao');
    expect(extractDomainCore('B站')).toBe('bilibili');
    expect(extractDomainCore('x.com')).toBe('x');
  });

  it('creates custom site entries with fallback phonetic pairs', () => {
    const known = createCustomSiteEntry('小红书');
    expect(known.domainCore).toBe('xiaohongshu');
    expect(known.pinyinPair).toBe('xh');

    const custom = createCustomSiteEntry('https://app.linear.app');
    expect(custom.domainCore).toBe('linear');
    expect(custom.pinyinPair).toBe('li');
  });
});
