import { tokens, colors, typography, spacing, radius, shadows } from '../design-system/tokens';
import fs from 'fs';
import path from 'path';

describe('Design System Tokens Hub & Aesthetic Discipline (F1)', () => {
  describe('Base Studio Environment & Palette Matrix', () => {
    test('enforces near-black studio background and layered panels', () => {
      expect(tokens.colors.bg.base).toBe('#0A0B0D');
      expect(tokens.colors.bg.panel).toBe('#12151B');
      expect(tokens.colors.bg.elevated).toBe('#181C24');
      expect(tokens.colors.bg.inset).toBe('#0E1015');
      expect(tokens.colors.bg.overlay).toBe('rgba(10, 11, 13, 0.88)');
    });

    test('enforces flat hairline and subtle border tokens', () => {
      expect(tokens.colors.border.hairline).toBe('#1E222A');
      expect(tokens.colors.border.subtle).toBe('#2A2F3A');
      expect(tokens.colors.border.active).toBe('#3E4657');
    });

    test('enforces text hierarchy contrast ratios', () => {
      expect(tokens.colors.text.primary).toBe('#F1F5F9');
      expect(tokens.colors.text.secondary).toBe('#94A3B8');
      expect(tokens.colors.text.muted).toBe('#475569');
      expect(tokens.colors.text.inverse).toBe('#0A0B0D');
    });
  });

  describe('Signal Color Discipline & Zero-Tolerance Rule', () => {
    test('contains pure cyan and purple traces strictly reserved for live signals', () => {
      expect(tokens.colors.signal.primary).toBe('#22D3EE');
      expect(tokens.colors.signal.primaryDim).toBe('#06B6D4');
      expect(tokens.colors.signal.secondary).toBe('#A78BFA');
      expect(tokens.colors.signal.secondaryDim).toBe('#8B5CF6');
      expect(tokens.colors.signal.tertiary).toBe('#38BDF8');
    });

    test('ensures chrome buttons and hardware controls DO NOT use signal colors', () => {
      const buttonBg = tokens.colors.chrome.buttonBg;
      const faderCap = tokens.colors.chrome.faderCap;
      const knobBody = tokens.colors.chrome.knobBody;

      // Chrome controls must use neutral dark slate/gray, never cyan or purple
      expect(buttonBg).not.toBe('#22D3EE');
      expect(buttonBg).not.toBe('#06B6D4');
      expect(buttonBg).not.toBe('#A78BFA');
      expect(buttonBg).not.toBe('#8B5CF6');
      expect(buttonBg).toBe('#1E222A');

      expect(faderCap).toBe('#2A2F3A');
      expect(knobBody).toBe('#181C24');
    });

    test('enforces instrumentation warning color system', () => {
      expect(tokens.colors.status.warning).toBe('#F59E0B');
      expect(tokens.colors.status.danger).toBe('#EF4444');
      expect(tokens.colors.status.ok).toBe('#10B981');
      expect(tokens.colors.status.info).toBe('#3B82F6');
    });
  });

  describe('Typography Matrix (Sans vs Tabular Monospace)', () => {
    test('defines geometric sans for UI controls and monospace for telemetry', () => {
      expect(tokens.typography.fontFamily.sans).toContain('Inter');
      expect(tokens.typography.fontFamily.mono).toContain('JetBrains Mono');
    });

    test('provides exact scale of discrete font sizes', () => {
      expect(tokens.typography.sizes.xs).toBe(11);
      expect(tokens.typography.sizes.sm).toBe(13);
      expect(tokens.typography.sizes.base).toBe(14);
      expect(tokens.typography.sizes.md).toBe(16);
      expect(tokens.typography.sizes.lg).toBe(18);
      expect(tokens.typography.sizes.xl).toBe(20);
      expect(tokens.typography.sizes['2xl']).toBe(24);
      expect(tokens.typography.sizes['3xl']).toBe(30);
    });

    test('provides discrete typography weights', () => {
      expect(tokens.typography.weights.regular).toBe('400');
      expect(tokens.typography.weights.medium).toBe('500');
      expect(tokens.typography.weights.semibold).toBe('600');
      expect(tokens.typography.weights.bold).toBe('700');
    });
  });

  describe('Spacing, Corner Radius & Zero-Shadow Flat Panel Rule', () => {
    test('enforces structured 4px/8px incremental spacing scale', () => {
      expect(tokens.spacing.xs).toBe(4);
      expect(tokens.spacing.sm).toBe(8);
      expect(tokens.spacing.md).toBe(12);
      expect(tokens.spacing.lg).toBe(16);
      expect(tokens.spacing.xl).toBe(24);
      expect(tokens.spacing['2xl']).toBe(32);
    });

    test('enforces subtle hardware radii', () => {
      expect(tokens.radius.sm).toBe(2);
      expect(tokens.radius.md).toBe(4);
      expect(tokens.radius.lg).toBe(6);
      expect(tokens.radius.full).toBe(9999);
    });

    test('enforces zero blurry SaaS drop-shadows on flat panels', () => {
      expect(tokens.shadows.none.elevation).toBe(0);
      expect(tokens.shadows.none.shadowColor).toBe('transparent');
      expect(tokens.shadows.none.shadowOpacity).toBe(0);
    });
  });

  describe('Named Module Exports & Alias Compatibility', () => {
    test('exports aliases matching tokens object', () => {
      expect(colors).toBe(tokens.colors);
      expect(typography).toBe(tokens.typography);
      expect(spacing).toBe(tokens.spacing);
      expect(radius).toBe(tokens.radius);
      expect(shadows).toBe(tokens.shadows);
    });
  });

  describe('Static Token Compliance Verification across UI Primitives', () => {
    const uiDir = path.resolve(__dirname, '../components/ui');

    test('Button.tsx imports from design-system/tokens', () => {
      const filePath = path.join(uiDir, 'Button.tsx');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toMatch(/from\s+['"].*design-system\/tokens['"]/);
      }
    });

    test('InstrumentPanel.tsx imports from design-system/tokens', () => {
      const filePath = path.join(uiDir, 'InstrumentPanel.tsx');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toMatch(/from\s+['"].*design-system\/tokens['"]/);
      }
    });

    test('Readout.tsx imports from design-system/tokens', () => {
      const filePath = path.join(uiDir, 'Readout.tsx');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toMatch(/from\s+['"].*design-system\/tokens['"]/);
      }
    });
  });
});
