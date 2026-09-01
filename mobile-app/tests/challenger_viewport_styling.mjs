import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Adversarial Challenge: Viewport Responsiveness, Typography, & InstrumentPanel Integrity', () => {
  const cwd = process.cwd();
  const tokensContent = readFileSync(join(cwd, 'design-system', 'tokens.ts'), 'utf-8');
  const panelContent = readFileSync(join(cwd, 'components', 'ui', 'InstrumentPanel.tsx'), 'utf-8');
  const buttonContent = readFileSync(join(cwd, 'components', 'ui', 'Button.tsx'), 'utf-8');
  const readoutContent = readFileSync(join(cwd, 'components', 'ui', 'Readout.tsx'), 'utf-8');
  const sliderContent = readFileSync(join(cwd, 'components', 'ui', 'SliderControl.tsx'), 'utf-8');
  const dialContent = readFileSync(join(cwd, 'components', 'ui', 'DialControl.tsx'), 'utf-8');

  describe('1. Viewport Responsiveness Down to 375px Mobile Viewport', () => {
    test('InstrumentPanel supports responsive width down to 375px with bounded padding', () => {
      assert.ok(panelContent.includes('padding: tokens.spacing.lg'), 'Content padding must use standard spacing.lg (16px)');
      assert.ok(panelContent.includes('paddingHorizontal: tokens.spacing.lg'), 'Header horizontal padding must use spacing.lg (16px)');
      assert.ok(panelContent.includes('overflow: \'hidden\''), 'Container must clip overflow to avoid leaking on narrow viewports');
      assert.ok(panelContent.includes('flex: 1') || panelContent.includes('flexDirection: \'row\''), 'Header title group must flex properly');
    });

    test('Readout component scales cleanly for mobile 375px without horizontal overflow', () => {
      assert.ok(readoutContent.includes('frameSm:'), 'Readout sm frame padding defined');
      assert.ok(readoutContent.includes('frameMd:'), 'Readout md frame padding defined');
      assert.ok(readoutContent.includes('frameLg:'), 'Readout lg frame padding defined');
      assert.ok(readoutContent.includes('frameXl:'), 'Readout xl frame padding defined');
      assert.ok(readoutContent.includes('containerHorizontal:'), 'Horizontal orientation layout defined');
      assert.ok(readoutContent.includes('numberOfLines={1}'), 'Label must truncate with numberOfLines to prevent overflowing on mobile');
    });

    test('Rotary DialControl and SliderControl can tile on 375px mobile screen', () => {
      assert.ok(dialContent.includes('size = 84'), 'Dial default diameter is 84px for 3-up mobile grid layout');
      assert.ok(dialContent.includes('width: size + 20'), 'Dial wrapper width is bounded');
      assert.ok(sliderContent.includes('width = 64'), 'Slider default width is 64px for multi-fader mobile rack');
      assert.ok(sliderContent.includes('height = 180'), 'Slider default height fits within mobile viewport');
    });

    test('Button sizes (sm, md, lg) fit mobile touch targets (min 30px, 38px, 46px)', () => {
      assert.ok(buttonContent.includes('height: 30'), 'Small button height 30px');
      assert.ok(buttonContent.includes('height: 38'), 'Medium button height 38px');
      assert.ok(buttonContent.includes('height: 46'), 'Large button height 46px');
      assert.ok(buttonContent.includes('flexDirection: \'row\''), 'Button arranges contents in row layout');
    });
  });

  describe('2. Numeric Measurements Monospace Typography & Unit Separation', () => {
    test('Readout value uses Tabular JetBrains Mono font', () => {
      assert.ok(readoutContent.includes('fontFamily: tokens.typography.fontFamily.mono'), 'Readout value MUST use tokens monospace font');
      assert.ok(readoutContent.includes('fontVariant: [\'tabular-nums\']'), 'Readout value MUST use tabular-nums font variant');
    });

    test('Readout unit is rendered in a separate Text element and NOT concatenated into value string', () => {
      assert.ok(readoutContent.includes('{unit ? ('), 'Unit must have its own conditional JSX block');
      assert.ok(readoutContent.includes('styles.unitText'), 'Unit must have distinct unitText styling');
      assert.ok(!readoutContent.includes('{${formattedValue}}'), 'Unit must not be concatenated directly into value string');
      assert.ok(!readoutContent.includes('{formattedValue + unit}'), 'Unit must not be string-concatenated with formattedValue');
    });

    test('Readout secondary value & secondary unit are strictly separated', () => {
      assert.ok(readoutContent.includes('secondaryValue !== undefined'), 'Secondary value is conditionally rendered');
      assert.ok(readoutContent.includes('styles.secondaryValueText'), 'Secondary value has dedicated style');
      assert.ok(readoutContent.includes('styles.secondaryUnitText'), 'Secondary unit has dedicated style');
    });

    test('SliderControl header readout uses monospace font and separate unit text', () => {
      assert.ok(sliderContent.includes('readoutValue: {'), 'SliderControl defines readoutValue style');
      assert.ok(sliderContent.includes('fontFamily: tokens.typography.fontFamily.mono'), 'SliderControl readout value uses monospace font');
      assert.ok(sliderContent.includes('fontVariant: [\'tabular-nums\']'), 'SliderControl readout value uses tabular-nums');
      assert.ok(sliderContent.includes('{unit ? <Text style={styles.readoutUnit}>{unit}</Text> : null}'), 'SliderControl unit is separated from numeric value');
      assert.ok(sliderContent.includes('tickText: {'), 'Tick labels have dedicated styling');
    });

    test('DialControl readout uses monospace font and separate unit text', () => {
      assert.ok(dialContent.includes('readoutText: {'), 'DialControl defines readoutText style');
      assert.ok(dialContent.includes('fontFamily: tokens.typography.fontFamily.mono'), 'DialControl readout uses monospace font');
      assert.ok(dialContent.includes('fontVariant: [\'tabular-nums\']'), 'DialControl readout uses tabular-nums');
      assert.ok(dialContent.includes('{unit ? ('), 'DialControl unit is rendered in separate Text element');
      assert.ok(dialContent.includes('styles.unitText'), 'DialControl unit has dedicated unitText style');
    });
  });

  describe('3. InstrumentPanel Permutations & Clean Rendering', () => {
    test('InstrumentPanel cleanly omits header when no header props are passed', () => {
      assert.ok(panelContent.includes('const hasHeader = Boolean(title || subtitle || badge || action);'), 'hasHeader calculates whether any header element exists');
      assert.ok(panelContent.includes('{hasHeader && ('), 'Header View must be conditionally rendered only when hasHeader is true');
    });

    test('InstrumentPanel supports all 3 required variants (flat, elevated, inset)', () => {
      assert.ok(panelContent.includes('variant === \'flat\' && styles.variantFlat'), 'Supports flat variant');
      assert.ok(panelContent.includes('variant === \'elevated\' && styles.variantElevated'), 'Supports elevated variant');
      assert.ok(panelContent.includes('variant === \'inset\' && styles.variantInset'), 'Supports inset variant');
      assert.ok(panelContent.includes('tokens.colors.bg.panel'), 'Flat uses panel background');
      assert.ok(panelContent.includes('tokens.colors.bg.elevated'), 'Elevated uses elevated background');
      assert.ok(panelContent.includes('tokens.colors.bg.inset'), 'Inset uses inset background');
    });

    test('InstrumentPanel handles status badge colors accurately', () => {
      assert.ok(panelContent.includes('tokens.colors.status.ok'), 'Maps ok status to status.ok color');
      assert.ok(panelContent.includes('tokens.colors.status.warning'), 'Maps warning status to status.warning color');
      assert.ok(panelContent.includes('tokens.colors.status.danger'), 'Maps danger status to status.danger color');
      assert.ok(panelContent.includes('tokens.colors.status.info'), 'Maps info status to status.info color');
      assert.ok(panelContent.includes('styles.badgeDot'), 'Renders status indicator dot in badge');
    });

    test('InstrumentPanel handles noPadding prop for edge-to-edge content', () => {
      assert.ok(panelContent.includes('noPadding && styles.contentNoPadding'), 'noPadding applies contentNoPadding');
      assert.ok(panelContent.includes('padding: 0'), 'contentNoPadding sets padding to 0');
    });

    test('InstrumentPanel renders action slot cleanly when provided', () => {
      assert.ok(panelContent.includes('{action ? <View style={styles.actionSlot}>{action}</View> : null}'), 'Action slot is rendered cleanly');
    });
  });

  describe('4. Zero-Tolerance Signal Color Discipline', () => {
    test('Button does not use signal colors for background or borders in solid/outline/ghost variants', () => {
      assert.ok(!buttonContent.includes('tokens.colors.signal.primary'), 'Button must NOT use signal primary color');
      assert.ok(!buttonContent.includes('tokens.colors.signal.secondary'), 'Button must NOT use signal secondary color');
      assert.ok(buttonContent.includes('tokens.colors.chrome.buttonBg'), 'Button uses dark chrome background');
    });

    test('InstrumentPanel does not use signal colors for container backgrounds or borders', () => {
      assert.ok(!panelContent.includes('tokens.colors.signal.primary'), 'Panel must NOT use signal primary color');
      assert.ok(!panelContent.includes('tokens.colors.signal.secondary'), 'Panel must NOT use signal secondary color');
    });
  });
});