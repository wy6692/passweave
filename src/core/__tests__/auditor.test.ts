import { describe, expect, it } from 'vitest';
import { auditPatternSpec } from '../auditor';
import { BLUEPRINT_PRESETS } from '../presets';
import type { PatternSpec } from '../types';

describe('auditPatternSpec', () => {
  it('grades recommended presets as Grade A with zero failures', () => {
    for (const preset of BLUEPRINT_PRESETS) {
      const report = auditPatternSpec(preset.spec);
      expect(report.overallGrade).toBe('A');
      expect(report.checks.every((c) => c.severity !== 'fail')).toBe(true);
    }
  });

  it('flags shared Tier 1 / Tier 2 anchors as an isolation failure', () => {
    const unsafeSpec: PatternSpec = {
      ...BLUEPRINT_PRESETS[0]!.spec,
      tier1: { head: 'Cedar', tail: '84', sepA: '#', sepB: '!' },
    };
    const report = auditPatternSpec(unsafeSpec);
    const isolation = report.checks.find((c) => c.id === 'tier3-isolation')!;
    expect(isolation.severity).toBe('fail');
    expect(report.overallGrade).toBe('D');
    expect(isolation.remediation).toBeDefined();
  });

  it('detects weak policy compliance when digits or symbols are stripped', () => {
    const shortSpec: PatternSpec = {
      ...BLUEPRINT_PRESETS[0]!.spec,
      transform: 'outer-pair',
      tier2: { head: 'abc', tail: '', sepA: '#' as const, sepB: '!' as const },
    };
    const report = auditPatternSpec(shortSpec);
    const compliance = report.checks.find((c) => c.id === 'policy-compliance')!;
    expect(compliance.severity).not.toBe('pass');
  });
});
