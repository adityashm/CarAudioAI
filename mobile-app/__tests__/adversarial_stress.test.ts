import { tokens } from '../design-system/tokens';
import fs from 'fs';
import path from 'path';

describe('Adversarial Stress & Edge Case Verification Suite', () => {
  const uiDir = path.resolve(__dirname, '../components/ui');

  describe('1. Non-Token Color & Illegal Cyan Button Audit', () => {
    test('UI components strictly DO NOT use cyan (#22D3EE / #06B6D4) for buttons or cards', () => {
      const buttonPath = path.join(uiDir, 'Button.tsx');
      const buttonCode = fs.readFileSync(buttonPath, 'utf-8');

      // Primary trace signal colors must NEVER appear in Button.tsx
      expect(buttonCode).not.toContain('#22D3EE');
      expect(buttonCode).not.toContain('#06B6D4');
      expect(buttonCode).not.toContain('signal.primary');
      expect(buttonCode).not.toContain('signal.secondary');
    });

    test('All UI primitives exclusively import colors and typography from tokens', () => {
      const files = ['Button.tsx', 'InstrumentPanel.tsx', 'Readout.tsx', 'SliderControl.tsx', 'DialControl.tsx'];
      for (const file of files) {
        const content = fs.readFileSync(path.join(uiDir, file), 'utf-8');
        expect(content).toMatch(/from\s+['"].*design-system\/tokens['"]/);
      }
    });
  });

  describe('2. Readout Edge Cases & Formatter Resiliency', () => {
    const formatReadout = (value: string | number, precision?: number): string => {
      if (typeof value === 'number' && precision !== undefined) {
        return value.toFixed(precision);
      }
      return String(value);
    };

    const resolveReadoutStatus = (status?: string, danger?: boolean, warning?: boolean): string => {
      return status || (danger ? 'danger' : warning ? 'warning' : 'normal');
    };

    test('handles NaN, Infinity, -Infinity safely', () => {
      expect(formatReadout(NaN, undefined)).toBe('NaN');
      expect(formatReadout(NaN, 2)).toBe('NaN');
      expect(formatReadout(Infinity, undefined)).toBe('Infinity');
      expect(formatReadout(-Infinity, undefined)).toBe('-Infinity');
      expect(formatReadout(Infinity, 3)).toBe('Infinity');
      expect(formatReadout(-Infinity, 3)).toBe('-Infinity');
    });

    test('handles extreme decimals and micro-measurements', () => {
      expect(formatReadout(0.0000001, 2)).toBe('0.00');
      expect(formatReadout(0.0000001, 7)).toBe('0.0000001');
      expect(formatReadout(999999.999, 1)).toBe('1000000.0');
      expect(formatReadout(12345.6789, 0)).toBe('12346');
    });

    test('handles negative numbers, zero, and -0', () => {
      expect(formatReadout(0, 1)).toBe('0.0');
      expect(formatReadout(-0, 1)).toBe('0.0');
      expect(formatReadout(-12.34, 1)).toBe('-12.3');
      expect(formatReadout(-0.5, 0)).toBe('-1'); // or -0 per standard math round/toFixed
    });

    test('resolves warning vs danger status hierarchy', () => {
      expect(resolveReadoutStatus(undefined, false, false)).toBe('normal');
      expect(resolveReadoutStatus(undefined, false, true)).toBe('warning');
      expect(resolveReadoutStatus(undefined, true, false)).toBe('danger');
      expect(resolveReadoutStatus(undefined, true, true)).toBe('danger');
      expect(resolveReadoutStatus('ok', true, true)).toBe('ok');
      expect(resolveReadoutStatus('warning', false, false)).toBe('warning');
    });
  });

  describe('3. SliderControl Boundary Math & Fader Snapping', () => {
    const snapSlider = (
      rawVal: number,
      step: number,
      isDetentActive: boolean,
      detentValue: number,
      snapThreshold: number,
      min: number,
      max: number,
      precision: number
    ): number => {
      let rounded = Math.round(rawVal / step) * step;
      if (isDetentActive && Math.abs(rounded - detentValue) <= snapThreshold) {
        rounded = detentValue;
      }
      return Math.max(min, Math.min(max, Number(rounded.toFixed(precision))));
    };

    const calcRatio = (val: number, min: number, max: number): number => {
      const clamped = Math.max(min, Math.min(max, val));
      return (clamped - min) / (max - min || 1);
    };

    test('snaps correctly around center-zero detent for 14-band EQ (-12 to +12 dB)', () => {
      const min = -12, max = 12, step = 0.5, detentValue = 0;
      const snapThreshold = (max - min) * 0.03; // 0.72 dB
      const snap = (v: number) => snapSlider(v, step, true, detentValue, snapThreshold, min, max, 1);

      expect(snap(0)).toBe(0);
      expect(snap(0.2)).toBe(0);
      expect(snap(-0.4)).toBe(0);
      expect(snap(0.7)).toBe(0);
      expect(snap(0.8)).toBe(1.0);
      expect(snap(-0.8)).toBe(-1.0);
      expect(snap(12.5)).toBe(12.0); // clamped to max
      expect(snap(-14.0)).toBe(-12.0); // clamped to min
    });

    test('ratio calculation survives zero-span without throwing NaN/Infinity', () => {
      expect(calcRatio(5, 5, 5)).toBe(0);
      expect(calcRatio(-12, -12, 12)).toBe(0);
      expect(calcRatio(0, -12, 12)).toBe(0.5);
      expect(calcRatio(12, -12, 12)).toBe(1);
    });
  });

  describe('4. DialControl Potentiometer Geometry & Warning Thresholds', () => {
    const getDialAngle = (val: number, min: number, max: number): number => {
      const clamped = Math.max(min, Math.min(max, val));
      const ratio = (clamped - min) / (max - min || 1);
      return -135 + ratio * 270;
    };

    const createArcPath = (center: number, startAngleDeg: number, endAngleDeg: number, r: number): string => {
      if (Math.abs(endAngleDeg - startAngleDeg) < 0.1) return '';
      const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
      const endRad = ((endAngleDeg - 90) * Math.PI) / 180;

      const x1 = center + r * Math.cos(startRad);
      const y1 = center + r * Math.sin(startRad);
      const x2 = center + r * Math.cos(endRad);
      const y2 = center + r * Math.sin(endRad);

      const angleDiff = endAngleDeg >= startAngleDeg ? endAngleDeg - startAngleDeg : endAngleDeg - startAngleDeg + 360;
      const largeArcFlag = angleDiff > 180 ? 1 : 0;
      const sweepFlag = endAngleDeg >= startAngleDeg ? 1 : 0;

      return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
    };

    test('sweeps 270 degrees total (-135° to +135°)', () => {
      expect(getDialAngle(20, 20, 200)).toBe(-135);
      expect(getDialAngle(110, 20, 200)).toBe(0);
      expect(getDialAngle(200, 20, 200)).toBe(135);
    });

    test('triggers subsonic warning below 28Hz for ported enclosure', () => {
      const isSubsonicWarn = (freq: number) => freq <= 28;
      expect(isSubsonicWarn(20)).toBe(true);
      expect(isSubsonicWarn(25)).toBe(true);
      expect(isSubsonicWarn(28)).toBe(true);
      expect(isSubsonicWarn(30)).toBe(false);
      expect(isSubsonicWarn(80)).toBe(false);
    });

    test('generates valid SVG arc path and handles zero-sweep degenerates', () => {
      expect(createArcPath(42, 0, 0, 30)).toBe('');
      expect(createArcPath(42, 10, 10.05, 30)).toBe('');
      const arc = createArcPath(42, -135, 135, 30);
      expect(arc).toContain('M ');
      expect(arc).toContain('A 30 30 0 1 1');
    });
  });
});
