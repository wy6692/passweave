import { describe, expect, it } from 'vitest';
import { applySiteTransform } from '../transforms';

describe('applySiteTransform', () => {
  it('computes consonant-count accurately including edge cases', () => {
    expect(applySiteTransform('github', 'consonant-count').token).toBe('Gt2');
    expect(applySiteTransform('taobao', 'consonant-count').token).toBe('Tb4');
    expect(applySiteTransform('google', 'consonant-count').token).toBe('Gg3');
    // Single consonant padded with x
    expect(applySiteTransform('go', 'consonant-count').token).toBe('Gx1');
    // Zero consonants padded with xx
    expect(applySiteTransform('ai', 'consonant-count').token).toBe('Xx2');
    // Purely numeric domain distinguishes 163 vs 126
    expect(applySiteTransform('163', 'consonant-count').token).toBe('N16');
    expect(applySiteTransform('126', 'consonant-count').token).toBe('N12');
  });

  it('computes edge-length uniformly across standard and single-char domains', () => {
    expect(applySiteTransform('github', 'edge-length').token).toBe('G6b');
    expect(applySiteTransform('bilibili', 'edge-length').token).toBe('B8i');
    expect(applySiteTransform('x', 'edge-length').token).toBe('X1x');
  });

  it('computes caesar-pair with wrap-around for z and 9', () => {
    expect(applySiteTransform('github', 'caesar-pair').token).toBe('Hj');
    expect(applySiteTransform('taobao', 'caesar-pair').token).toBe('Ub');
    expect(applySiteTransform('zh', 'caesar-pair').token).toBe('Ai');
    expect(applySiteTransform('90', 'caesar-pair').token).toBe('01');
  });

  it('computes outer-pair cleanly', () => {
    expect(applySiteTransform('github', 'outer-pair').token).toBe('Gb');
    expect(applySiteTransform('wechat', 'outer-pair').token).toBe('Wt');
  });
});
