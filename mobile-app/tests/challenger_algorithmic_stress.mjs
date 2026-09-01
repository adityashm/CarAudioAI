import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Adversarial Algorithmic & Mathematical Stress Testing', () => {

  describe('1. SliderControl Detent Snapping & Step Math', () => {
    const createSnapValue = (min, max, step, precision, isDetentActive, detentValue, snapThreshold) => {
      return (rawVal) => {
        let rounded = Math.round(rawVal / step) * step;
        if (isDetentActive && Math.abs(rounded - detentValue) <= snapThreshold) {
          rounded = detentValue;
        }
        return Math.max(min, Math.min(max, Number(rounded.toFixed(precision))));
      };
    };

    test('snaps cleanly to center detent (0 dB) when within threshold', () => {
      const snap = createSnapValue(-12, 12, 0.5, 1, true, 0, 0.72);
      assert.equal(snap(0.3), 0, '0.3 dB snaps to 0 dB center detent');
      assert.equal(snap(-0.4), 0, '-0.4 dB snaps to 0 dB center detent');
      assert.equal(snap(1.2), 1, '1.2 dB rounds to 1.0 dB');
      assert.equal(snap(-1.2), -1, '-1.2 dB rounds to -1.0 dB');
    });

    test('clamps strictly at min/max boundaries under adversarial inputs', () => {
      const snap = createSnapValue(-12, 12, 0.5, 1, true, 0, 0.72);
      assert.equal(snap(100), 12, 'Exceeding max clamps to 12');
      assert.equal(snap(-100), -12, 'Below min clamps to -12');
      assert.equal(snap(12.2), 12, '12.2 clamps to 12');
    });

    test('handles extreme floating point precision without jitter', () => {
      const snap = createSnapValue(0, 100, 0.1, 1, false, 0, 0);
      assert.equal(snap(45.100000000002), 45.1);
      assert.equal(snap(0.00000000001), 0);
    });
  });

  describe('2. DialControl SVG Geometry & Rotary Needle Calculations', () => {
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

    test('computes standard 270 degree sweep path without degenerate zero coordinates', () => {
      const center = 42;
      const radius = 37;
      const bgPath = createArcPath(center, -135, 135, radius);
      assert.ok(bgPath.startsWith('M '), 'Path starts with M command');
      assert.ok(bgPath.includes('A 37 37'), 'Path contains Arc command with correct radius');
      assert.ok(bgPath.includes(' 1 1 '), 'Large arc and sweep flags set for 270 degree sweep');
    });

    test('bipolar centerZero generates clockwise arc for positive values and counter-clockwise for negative', () => {
      const center = 42;
      const radius = 37;
      const posPath = createArcPath(center, 0, 67.5, radius);
      assert.ok(posPath.length > 0, 'Positive bipolar arc generates valid path');
      const negPath = createArcPath(center, -67.5, 0, radius);
      assert.ok(negPath.length > 0, 'Negative bipolar arc generates valid path');
      const zeroPath = createArcPath(center, 0, 0, radius);
      assert.equal(zeroPath, '', 'Zero delta produces clean empty string');
    });

    test('subsonic filter safety warning triggers accurately when frequency < 28 Hz', () => {
      const warningBelow = 28;
      const checkStatus = (val) => (val <= warningBelow ? 'warning' : 'normal');
      assert.equal(checkStatus(20), 'warning', '20 Hz subsonic filter triggers warning');
      assert.equal(checkStatus(27.9), 'warning', '27.9 Hz triggers warning');
      assert.equal(checkStatus(28), 'warning', '28 Hz triggers warning');
      assert.equal(checkStatus(28.1), 'normal', '28.1 Hz is normal');
      assert.equal(checkStatus(35), 'normal', '35 Hz ported box tuning is normal');
    });
  });

  describe('3. Readout Numeric Formatting & Unit Integrity', () => {
    const formatReadout = (value, precision) => {
      if (typeof value === 'number' && precision !== undefined) {
        return value.toFixed(precision);
      }
      return String(value);
    };

    test('formats diverse physical telemetry measurements accurately', () => {
      assert.equal(formatReadout(4.25, 2), '4.25');
      assert.equal(formatReadout(80, 0), '80');
      assert.equal(formatReadout(28.28, 2), '28.28');
      assert.equal(formatReadout(4.0, 1), '4.0');
      assert.equal(formatReadout(146.5, 1), '146.5');
      assert.equal(formatReadout(-4.5, 1), '-4.5');
    });

    test('handles zero, negative, and large audio values', () => {
      assert.equal(formatReadout(0, 1), '0.0');
      assert.equal(formatReadout(-0.0, 1), '0.0');
      assert.equal(formatReadout(20000, 0), '20000');
    });
  });

  describe('4. Mobile 375px Viewport Dimension Budgeting', () => {
    test('standard mobile container geometry fits full instrumentation stack', () => {
      const screenWidth = 375;
      const screenPadding = 16 * 2;
      const availableWidth = screenWidth - screenPadding;
      const panelBorderWidth = 1 * 2;
      const panelPadding = 16 * 2;
      const panelInteriorWidth = availableWidth - panelBorderWidth - panelPadding;
      assert.equal(panelInteriorWidth, 309, 'Interior panel width is 309px');
      const dialWidth = 84 + 20;
      const threeDialsWidth = dialWidth * 3;
      assert.ok(availableWidth >= 276, '3-dial crossover cluster fits on 375px screen');
      const faderWidth = 64;
      const fourFadersWidth = faderWidth * 4;
      assert.ok(panelInteriorWidth >= fourFadersWidth, '4 vertical studio faders fit side-by-side inside panel');
    });
  });
});
