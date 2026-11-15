import { describe, expect, it } from 'vitest';
import {
  createDefaultWorkspace,
  isDefaultWorkspace,
  mergeSitesList,
  parseStageFromHash,
  parseStoredWorkspace,
} from '../storage';

describe('workspace storage serialization & validation', () => {
  it('returns clean default workspace when input is null or malformed', () => {
    const def = createDefaultWorkspace();
    expect(parseStoredWorkspace(null)).toEqual(def);
    expect(parseStoredWorkspace('{bad-json')).toEqual(def);
    expect(parseStoredWorkspace('[]')).toEqual(def);
  });

  it('persists and restores custom rules, custom sites, and tier overrides', () => {
    const base = createDefaultWorkspace();
    const modified = {
      ...base,
      activeStage: 'check' as const,
      spec: {
        ...base.spec,
        naming: 'pinyin' as const,
        transform: 'caesar-pair' as const,
        topology: 'mirrored-split' as const,
        tier2: { head: 'Maple', tail: '37', sepA: '@', sepB: ':' },
      },
      customSites: [
        {
          id: 'custom-zhihu-1',
          nameEn: 'Zhihu',
          nameZh: '知乎',
          url: 'zhihu.com',
          domainCore: 'zhihu',
          pinyinPair: 'zh',
          defaultTier: 'tier2' as const,
          custom: true,
        },
      ],
      tierOverrides: { github: 'tier1' as const },
      pinyinOverrides: { taobao: 'tb2' },
      selectedSiteId: 'custom-zhihu-1',
      privacyMask: true,
      bestStreak: 7,
    };

    const restored = parseStoredWorkspace(JSON.stringify(modified));
    expect(restored).toEqual(modified);
    expect(isDefaultWorkspace(restored)).toBe(false);

    const merged = mergeSitesList(restored.customSites, restored.pinyinOverrides);
    expect(merged[0]?.id).toBe('custom-zhihu-1');
    expect(merged.find((s) => s.id === 'taobao')?.pinyinPair).toBe('tb2');
  });

  it('falls back safely when enum fields contain unexpected values', () => {
    const restored = parseStoredWorkspace(
      JSON.stringify({
        activeStage: 'unknown-tab',
        spec: { naming: 'invalid', transform: 'bogus', topology: 'nope' },
      }),
    );
    const def = createDefaultWorkspace();
    expect(restored.activeStage).toBe('design');
    expect(restored.spec.naming).toBe(def.spec.naming);
    expect(restored.spec.transform).toBe(def.spec.transform);
    expect(restored.spec.topology).toBe(def.spec.topology);
  });

  it('parses valid stage hashes accurately', () => {
    expect(parseStageFromHash('#why')).toBe('why');
    expect(parseStageFromHash('#/save')).toBe('save');
    expect(parseStageFromHash('#invalid')).toBeNull();
  });
});
