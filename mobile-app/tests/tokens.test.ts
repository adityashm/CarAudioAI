import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { tokens, colors, typography, spacing, radius, shadows } from '../design-system/tokens';

describe('CarAudioAI Design System Tokens', () => {
  describe('Color Token Integrity', () => {
    test('Base environment colors adhere to studio palette', () => {
      assert.equal(tokens.colors.bg.base, '#0A0B0D');
      assert.equal(tokens.colors.bg.panel, '#12151B');
      assert.equal(tokens.colors.bg.elevated, '#181C24');
      assert.equal(tokens.colors.bg.inset, '#0E1015');
    });

    test('Border tokens provide flat hairline separation', () => {
      assert.equal(tokens.colors.border.hairline, '#1E222A');
      assert.equal(tokens.colors.border.subtle, '#2A2F3A');
      assert.equal(tokens.colors.border.active, '#3E4657');
    });

    test('Signal colors are strictly defined for traces/waveforms', () => {
      assert.equal(tokens.colors.signal.primary, '#22D3EE');
      assert.equal(tokens.colors.signal.secondary, '#A78BFA');
      assert.equal(tokens.colors.signal.tertiary, '#38BDF8');
    });

    test('Hardware chrome button colors are neutral dark slate and NEVER cyan/purple', () => {
      assert.equal(tokens.colors.chrome.buttonBg, '#1E222A');
      assert.equal(tokens.colors.chrome.buttonHover, '#2A2F3A');
      assert.equal(tokens.colors.chrome.buttonActive, '#3E4657');
      assert.equal(tokens.colors.chrome.border, '#2A2F3A');

      // Zero cyan in chrome button colors
      assert.notEqual(tokens.colors.chrome.buttonBg, '#22D3EE');
      assert.notEqual(tokens.colors.chrome.buttonBg, '#06B6D4');
      assert.notEqual(tokens.colors.chrome.buttonHover, '#22D3EE');
    });

    test('Instrumentation warning colors are clearly defined', () => {
      assert.equal(tokens.colors.status.ok, '#10B981');
      assert.equal(tokens.colors.status.warning, '#F59E0B');
      assert.equal(tokens.colors.status.danger, '#EF4444');
      assert.equal(tokens.colors.status.info, '#3B82F6');
    });
  });

  describe('Typography Matrix', () => {
    test('Font families contain sans and mono', () => {
      assert.ok(tokens.typography.fontFamily.sans.includes('Inter'));
      assert.ok(tokens.typography.fontFamily.mono.includes('JetBrains Mono'));
    });

    test('Font sizes provide full range xs through 4xl', () => {
      assert.equal(tokens.typography.sizes.xs, 11);
      assert.equal(tokens.typography.sizes.sm, 13);
      assert.equal(tokens.typography.sizes.base, 14);
      assert.equal(tokens.typography.sizes.md, 16);
      assert.equal(tokens.typography.sizes.lg, 18);
      assert.equal(tokens.typography.sizes.xl, 20);
      assert.equal(tokens.typography.sizes['2xl'], 24);
      assert.equal(tokens.typography.sizes['3xl'], 30);
      assert.equal(tokens.typography.sizes['4xl'], 36);
    });

    test('Font weights and line heights are properly structured', () => {
      assert.equal(tokens.typography.weights.regular, '400');
      assert.equal(tokens.typography.weights.medium, '500');
      assert.equal(tokens.typography.weights.semibold, '600');
      assert.equal(tokens.typography.weights.bold, '700');
      assert.equal(tokens.typography.lineHeights.tight, 1.2);
    });
  });

  describe('Spacing, Radius, and Shadow Constraints', () => {
    test('Spacing metrics strictly follow 4px base grid', () => {
      assert.equal(tokens.spacing.xs, 4);
      assert.equal(tokens.spacing.sm, 8);
      assert.equal(tokens.spacing.md, 12);
      assert.equal(tokens.spacing.lg, 16);
      assert.equal(tokens.spacing.xl, 24);
      assert.equal(tokens.spacing['2xl'], 32);
      assert.equal(tokens.spacing['3xl'], 48);
    });

    test('Radius metrics provide crisp hardware corners', () => {
      assert.equal(tokens.radius.sm, 2);
      assert.equal(tokens.radius.md, 4);
      assert.equal(tokens.radius.lg, 6);
      assert.equal(tokens.radius.full, 9999);
    });

    test('Shadows eliminate soft blurry drop-shadows', () => {
      assert.equal(tokens.shadows.none.elevation, 0);
      assert.equal(tokens.shadows.none.shadowOpacity, 0);
      assert.equal(tokens.shadows.none.shadowRadius, 0);
    });
  });

  describe('Exported Constants and Aliases', () => {
    test('Direct exports match tokens properties', () => {
      assert.deepEqual(colors, tokens.colors);
      assert.deepEqual(typography, tokens.typography);
      assert.deepEqual(spacing, tokens.spacing);
      assert.deepEqual(radius, tokens.radius);
      assert.deepEqual(shadows, tokens.shadows);
    });
  });
});
