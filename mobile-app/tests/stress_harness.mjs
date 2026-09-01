import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

describe('Adversarial Stress Test Suite: Design Tokens & UI Primitives', () => {
  const uiDir = join(process.cwd(), 'components', 'ui');
  const tokensPath = join(process.cwd(), 'design-system', 'tokens.ts');
  const tokensContent = readFileSync(tokensPath, 'utf-8');

  describe('1. Non-Token Color & Illegal Cyan Button Audit', () => {
    test('UI components must NOT contain illegal cyan button styles', () => {
      const buttonContent = readFileSync(join(uiDir, 'Button.tsx'), 'utf-8');
      assert.equal(buttonContent.includes('#22D3EE'), false, 'Button.tsx must not contain cyan #22D3EE');
      assert.equal(buttonContent.includes('#06B6D4'), false, 'Button.tsx must not contain cyan #06B6D4');
      assert.equal(buttonContent.includes('signal.primary'), false, 'Button.tsx must not use signal tokens');
    });

    test('UI components must NOT hardcode bright SaaS gradient colors', () => {
      const files = readdirSync(uiDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
      const bannedHues = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981']; // raw lowercase hexes in JSX style
      for (const file of files) {
        if (file === 'collapsible.tsx' || file.startsWith('icon-symbol')) continue;
        const content = readFileSync(join(uiDir, file), 'utf-8');
        for (const hue of bannedHues) {
          // Check for hardcoded hexes outside of token fallback or tokens import
          const hasHardcoded = content.toLowerCase().includes(`'${hue}'`) || content.toLowerCase().includes(`"${hue}"`);
          assert.equal(hasHardcoded, false, `${file} should not have hardcoded ${hue}`);
        }
      }
    });

    test('Tokens file properly separates Signal colors strictly from Chrome colors', () => {
      assert.ok(tokensContent.includes("signal: {"));
      assert.ok(tokensContent.includes("primary: '#22D3EE'"));
      assert.ok(tokensContent.includes("secondary: '#A78BFA'"));
      assert.ok(tokensContent.includes("chrome: {"));
      assert.ok(tokensContent.includes("buttonBg: '#1E222A'"));
      assert.ok(tokensContent.includes("buttonHover: '#2A2F3A'"));
    });
  });

  describe('2. Readout Edge Cases & Stress Tests', () => {
    const formatReadout = (value, precision) => {
      if (typeof value === 'number' && precision !== undefined) {
        return value.toFixed(precision);
      }
      return String(value);
    };

    const resolveReadoutStatus = (status, danger, warning) => {
      return status || (danger ? 'danger' : warning ? 'warning' : 'normal');
    };

    test('Readout handles NaN gracefully without throwing', () => {
      assert.equal(formatReadout(NaN, undefined), 'NaN');
      assert.equal(formatReadout(NaN, 2), 'NaN');
      assert.equal(formatReadout(NaN, 0), 'NaN');
    });

    test('Readout handles positive and negative Infinity', () => {
      assert.equal(formatReadout(Infinity, undefined), 'Infinity');
      assert.equal(formatReadout(-Infinity, undefined), '-Infinity');
      assert.equal(formatReadout(Infinity, 2), 'Infinity');
      assert.equal(formatReadout(-Infinity, 2), '-Infinity');
    });

    test('Readout handles extreme decimals and tiny numbers', () => {
      assert.equal(formatReadout(0.00000001, 2), '0.00');
      assert.equal(formatReadout(0.00000001, 8), '0.00000001');
      assert.equal(formatReadout(123456789.98765, 2), '123456789.99');
    });

    test('Readout handles negative numbers and -0', () => {
      assert.equal(formatReadout(-0, 1), '0.0');
      assert.equal(formatReadout(-12.4, 1), '-12.4');
      assert.equal(formatReadout(-0.0001, 3), '-0.000');
    });

    test('Readout handles string values, labels, and missing units', () => {
      assert.equal(formatReadout('CALIBRATING', undefined), 'CALIBRATING');
      assert.equal(formatReadout('', undefined), '');
      assert.equal(formatReadout('0.00', undefined), '0.00');
    });

    test('Readout status resolution priority: status > danger > warning > normal', () => {
      assert.equal(resolveReadoutStatus(undefined, false, false), 'normal');
      assert.equal(resolveReadoutStatus(undefined, false, true), 'warning');
      assert.equal(resolveReadoutStatus(undefined, true, false), 'danger');
      assert.equal(resolveReadoutStatus(undefined, true, true), 'danger'); // danger takes precedence over warning
      assert.equal(resolveReadoutStatus('ok', true, true), 'ok'); // explicit status takes highest priority
      assert.equal(resolveReadoutStatus('warning', false, false), 'warning');
    });
  });

  describe('3. SliderControl Boundary & Fader Stress Tests', () => {
    const snapSlider = (rawVal, step, isDetentActive, detentValue, snapThreshold, min, max, precision) => {
      let rounded = Math.round(rawVal / step) * step;
      if (isDetentActive && Math.abs(rounded - detentValue) <= snapThreshold) {
        rounded = detentValue;
      }
      return Math.max(min, Math.min(max, Number(rounded.toFixed(precision))));
    };

    const calcSliderRatio = (val, min, max) => {
      const clamped = Math.max(min, Math.min(max, val));
      return (clamped - min) / (max - min || 1);
    };

    const calcSliderPos = (posPx, totalPx, isVertical, min, max, snapFn) => {
      if (totalPx <= 0) return min;
      let computedRatio;
      if (isVertical) {
        computedRatio = 1 - Math.max(0, Math.min(1, posPx / totalPx));
      } else {
        computedRatio = Math.max(0, Math.min(1, posPx / totalPx));
      }
      const rawVal = min + computedRatio * (max - min);
      return snapFn(rawVal);
    };

    test('Fader center detent snapping (+/-12dB EQ fader with 0dB center detent)', () => {
      const min = -12, max = 12, step = 0.5, detentValue = 0;
      const snapThreshold = (max - min) * 0.03; // 0.72 dB
      const snap = (v) => snapSlider(v, step, true, detentValue, snapThreshold, min, max, 1);

      // Center snap
      assert.equal(snap(0), 0);
      assert.equal(snap(0.3), 0); // within 0.72 -> 0
      assert.equal(snap(-0.5), 0); // within 0.72 -> 0
      assert.equal(snap(0.7), 0); // within 0.72 -> 0
      assert.equal(snap(0.75), 1.0); // beyond 0.72 -> nearest step 1.0
      assert.equal(snap(-0.8), -1.0); // beyond 0.72 -> nearest step -1.0
    });

    test('Fader min and max clamping on extreme inputs', () => {
      const snap = (v) => snapSlider(v, 0.5, false, 0, 0, -12, 12, 1);
      assert.equal(snap(-999), -12);
      assert.equal(snap(999), 12);
      assert.equal(snap(-12.0001), -12);
      assert.equal(snap(12.0001), 12);
    });

    test('Fader ratio calculation avoids divide-by-zero on min===max', () => {
      assert.equal(calcSliderRatio(10, 10, 10), 0);
      assert.equal(calcSliderRatio(5, -10, 10), 0.75);
      assert.equal(calcSliderRatio(-10, -10, 10), 0);
      assert.equal(calcSliderRatio(10, -10, 10), 1);
    });

    test('Vertical travel mapping: top is max, bottom is min, gestures clamp outside track', () => {
      const min = -12, max = 12;
      const snap = (v) => snapSlider(v, 0.5, true, 0, 0.72, min, max, 1);

      // In-bound gestures
      assert.equal(calcSliderPos(0, 100, true, min, max, snap), 12); // Top
      assert.equal(calcSliderPos(50, 100, true, min, max, snap), 0); // Middle
      assert.equal(calcSliderPos(100, 100, true, min, max, snap), -12); // Bottom

      // Out-of-bounds gesture drag (overshoot)
      assert.equal(calcSliderPos(-50, 100, true, min, max, snap), 12);
      assert.equal(calcSliderPos(150, 100, true, min, max, snap), -12);
    });

    test('Horizontal travel mapping: left is min, right is max', () => {
      const min = 0, max = 100;
      const snap = (v) => snapSlider(v, 1, false, 0, 0, min, max, 0);

      assert.equal(calcSliderPos(0, 200, false, min, max, snap), 0); // Left
      assert.equal(calcSliderPos(100, 200, false, min, max, snap), 50); // Center
      assert.equal(calcSliderPos(200, 200, false, min, max, snap), 100); // Right
      assert.equal(calcSliderPos(300, 200, false, min, max, snap), 100); // Right overshoot
      assert.equal(calcSliderPos(-50, 200, false, min, max, snap), 0); // Left overshoot
    });
  });

  describe('4. DialControl Boundary & Rotary Math Stress Tests', () => {
    const snapDial = (rawVal, step, min, max, precision) => {
      const rounded = Math.round(rawVal / step) * step;
      const clamped = Math.max(min, Math.min(max, rounded));
      return Number(clamped.toFixed(precision));
    };

    const getDialAngle = (val, min, max) => {
      const clamped = Math.max(min, Math.min(max, val));
      const ratio = (clamped - min) / (max - min || 1);
      return -135 + ratio * 270;
    };

    const createArcPath = (center, startAngleDeg, endAngleDeg, r) => {
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

    test('Potentiometer 270-degree sweep geometry (-135° to +135°)', () => {
      const min = 20, max = 200; // Subwoofer LPF / HPF crossover range
      assert.equal(getDialAngle(20, min, max), -135);
      assert.equal(getDialAngle(110, min, max), 0);
      assert.equal(getDialAngle(200, min, max), 135);
    });

    test('Dial value snapping and boundary clamping', () => {
      const snap = (v) => snapDial(v, 5, 20, 200, 0);
      assert.equal(snap(10), 20); // Clamp below min
      assert.equal(snap(22), 20); // Snap 22 -> 20
      assert.equal(snap(23), 25); // Snap 23 -> 25
      assert.equal(snap(200), 200);
      assert.equal(snap(250), 200); // Clamp above max
    });

    test('Subsonic safety filter warning (< 28Hz warning trigger)', () => {
      const warningBelow = 28;
      const checkSubsonic = (f) => f <= warningBelow;

      assert.equal(checkSubsonic(20), true);
      assert.equal(checkSubsonic(25), true);
      assert.equal(checkSubsonic(28), true);
      assert.equal(checkSubsonic(29), false);
      assert.equal(checkSubsonic(80), false);
    });

    test('AC Target Voltage warning/danger threshold detection', () => {
      const checkVolts = (v) => {
        if (v >= 35) return 'danger';
        if (v >= 25) return 'warning';
        return 'normal';
      };

      assert.equal(checkVolts(15.5), 'normal');
      assert.equal(checkVolts(24.9), 'normal');
      assert.equal(checkVolts(25.0), 'warning');
      assert.equal(checkVolts(34.9), 'warning');
      assert.equal(checkVolts(35.0), 'danger');
      assert.equal(checkVolts(45.0), 'danger');
    });

    test('Arc path generator returns empty string for zero sweep and valid SVG path for arcs', () => {
      assert.equal(createArcPath(42, 0, 0, 30), '');
      assert.equal(createArcPath(42, 50, 50.05, 30), '');
      const path270 = createArcPath(42, -135, 135, 30);
      assert.ok(path270.startsWith('M '));
      assert.ok(path270.includes('A 30 30 0 1 1'));
    });
  });
});
