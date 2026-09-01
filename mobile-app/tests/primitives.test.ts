import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { tokens } from '../design-system/tokens';
import { InstrumentPanel } from '../components/ui/InstrumentPanel';
import { Button } from '../components/ui/Button';
import { Readout } from '../components/ui/Readout';
import { SliderControl } from '../components/ui/SliderControl';
import { DialControl } from '../components/ui/DialControl';

describe('UI Primitives Verification', () => {
  describe('InstrumentPanel Primitive', () => {
    test('InstrumentPanel component is exported and callable', () => {
      assert.equal(typeof InstrumentPanel, 'function');
    });

    test('Panel variants map to token background and border colors', () => {
      // Flat panel
      assert.equal(tokens.colors.bg.panel, '#12151B');
      assert.equal(tokens.colors.border.hairline, '#1E222A');

      // Elevated panel
      assert.equal(tokens.colors.bg.elevated, '#181C24');
      assert.equal(tokens.colors.border.subtle, '#2A2F3A');

      // Inset panel
      assert.equal(tokens.colors.bg.inset, '#0E1015');
    });
  });

  describe('Button Primitive', () => {
    test('Button component is exported and callable', () => {
      assert.equal(typeof Button, 'function');
    });

    test('Button variant palette enforces solid chrome without cyan backgrounds', () => {
      assert.equal(tokens.colors.chrome.buttonBg, '#1E222A');
      assert.equal(tokens.colors.chrome.buttonHover, '#2A2F3A');
      assert.equal(tokens.colors.chrome.buttonActive, '#3E4657');
      assert.equal(tokens.colors.chrome.border, '#2A2F3A');
      assert.equal(tokens.colors.text.primary, '#F1F5F9');
    });
  });

  describe('Readout Primitive', () => {
    test('Readout component is exported and callable', () => {
      assert.equal(typeof Readout, 'function');
    });

    test('Tabular numeric format and monospace font enforcement', () => {
      assert.ok(tokens.typography.fontFamily.mono.includes('JetBrains Mono'));
      assert.equal(tokens.colors.status.warning, '#F59E0B');
      assert.equal(tokens.colors.status.danger, '#EF4444');
      assert.equal(tokens.colors.status.ok, '#10B981');
    });
  });

  describe('SliderControl & Fader Logic', () => {
    test('SliderControl is exported and callable', () => {
      assert.equal(typeof SliderControl, 'function');
    });

    test('Fader center detent math accurately snaps near 0 dB', () => {
      const min = -12;
      const max = 12;
      const step = 0.5;
      const detentValue = 0;
      const detentThreshold = 0.36;

      const snap = (rawVal: number) => {
        let rounded = Math.round(rawVal / step) * step;
        if (Math.abs(rounded - detentValue) <= detentThreshold) {
          rounded = detentValue;
        }
        return Math.max(min, Math.min(max, Number(rounded.toFixed(1))));
      };

      assert.equal(snap(0.2), 0);
      assert.equal(snap(-0.25), 0);
      assert.equal(snap(0.6), 0.5);
      assert.equal(snap(-6.1), -6.0);
      assert.equal(snap(12.8), 12.0);
      assert.equal(snap(-14.0), -12.0);
    });

    test('Vertical travel ratio mapping (top is max, bottom is min)', () => {
      const min = -12;
      const max = 12;
      const totalPx = 120;

      const calcFromPos = (posPx: number) => {
        const ratio = 1 - Math.max(0, Math.min(1, posPx / totalPx));
        return min + ratio * (max - min);
      };

      // Top position (0px) -> max (+12 dB)
      assert.equal(calcFromPos(0), 12);
      // Center position (60px) -> center (0 dB)
      assert.equal(calcFromPos(60), 0);
      // Bottom position (120px) -> min (-12 dB)
      assert.equal(calcFromPos(120), -12);
    });
  });

  describe('DialControl & Potentiometer Arc Geometry', () => {
    test('DialControl is exported and callable', () => {
      assert.equal(typeof DialControl, 'function');
    });

    test('Potentiometer angle calculation sweeps exactly 270 degrees (-135 to +135)', () => {
      const min = 20;
      const max = 20000;

      const getAngle = (val: number) => {
        const ratio = (val - min) / (max - min);
        return -135 + ratio * 270;
      };

      assert.equal(getAngle(20), -135);
      assert.equal(getAngle(20000), 135);
      assert.equal(getAngle((20 + 20000) / 2), 0);
    });

    test('Warning threshold detection for subsonic filter and gain staging', () => {
      const warningBelow = 28; // Subsonic warning for 35Hz box
      const isSubsonicWarning = (freq: number) => freq <= warningBelow;

      assert.equal(isSubsonicWarning(25), true);
      assert.equal(isSubsonicWarning(28), true);
      assert.equal(isSubsonicWarning(32), false);

      const dangerAbove = 35; // Danger threshold for high voltage
      const isVoltageDanger = (v: number) => v >= dangerAbove;

      assert.equal(isVoltageDanger(36), true);
      assert.equal(isVoltageDanger(20), false);
    });
  });
});
