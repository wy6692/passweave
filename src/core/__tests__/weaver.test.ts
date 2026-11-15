import { describe, expect, it } from 'vitest';
import { renderZeroSecretMarkdown } from '../blueprintCard';
import { BLUEPRINT_PRESETS } from '../presets';
import { BUILTIN_SITES } from '../sites';
import type { PatternSpec } from '../types';
import { weavePassword } from '../weaver';

describe('weavePassword & zero-secret export', () => {
  const baseSpec: PatternSpec = BLUEPRINT_PRESETS[0]!.spec;
  const github = BUILTIN_SITES.find((s) => s.id === 'github')!;
  const google = BUILTIN_SITES.find((s) => s.id === 'google')!;
  const forum = BUILTIN_SITES.find((s) => s.id === 'forum-decoy')!;

  it('weaves split-inlay, prefix-bridge, and mirrored-split topologies', () => {
    expect(weavePassword(baseSpec, github, 'tier2').password).toBe('Cedar#Gt2!84');

    const bridgeSpec: PatternSpec = { ...baseSpec, topology: 'prefix-bridge' };
    expect(weavePassword(bridgeSpec, github, 'tier2').password).toBe('Gt2#Cedar!84');

    const mirrorSpec: PatternSpec = {
      ...baseSpec,
      topology: 'mirrored-split',
      tier2: { ...baseSpec.tier2, sepB: ':' },
    };
    expect(weavePassword(mirrorSpec, github, 'tier2').password).toBe('G#Cedar:t284');
  });

  it('isolates tier1, tier2, and tier3 outputs strictly', () => {
    const t1 = weavePassword(baseSpec, google, 'tier1').password;
    const t2 = weavePassword(baseSpec, github, 'tier2').password;
    const t3 = weavePassword(baseSpec, forum, 'tier3').password;

    expect(t1).toBe('Quartz$Gg3!91');
    expect(t2).toBe('Cedar#Gt2!84');
    expect(t3).toBe('Pond-73-Mint!');
    expect(t3).not.toContain(baseSpec.tier2.head);
    expect(t3).not.toContain(baseSpec.tier1.head);
  });

  it('never leaks user secret anchors in exported Markdown reference cards', () => {
    const secretSpec: PatternSpec = {
      ...baseSpec,
      tier1: { head: 'UltraPrivateVaultKey', tail: '79', sepA: '$', sepB: '!' },
      tier2: { head: 'PersonalSecretRoot', tail: '42', sepA: '#', sepB: '!' },
      tier3Decoy: 'ThrowawayDecoy999!',
    };

    for (const locale of ['en', 'zh'] as const) {
      const md = renderZeroSecretMarkdown(secretSpec, locale);
      expect(md).not.toContain('UltraPrivateVaultKey');
      expect(md).not.toContain('PersonalSecretRoot');
      expect(md).not.toContain('ThrowawayDecoy999!');
    }
  });
});
