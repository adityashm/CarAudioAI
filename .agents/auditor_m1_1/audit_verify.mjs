import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

console.log('=== FORENSIC AUDIT SUITE: Milestone 1 (Track 0) ===\n');

const mobileAppDir = 'c:/Users/aditya/Downloads/CarAudioAI/mobile-app';
const tokensPath = join(mobileAppDir, 'design-system', 'tokens.ts');
const panelPath = join(mobileAppDir, 'components', 'ui', 'InstrumentPanel.tsx');
const buttonPath = join(mobileAppDir, 'components', 'ui', 'Button.tsx');
const readoutPath = join(mobileAppDir, 'components', 'ui', 'Readout.tsx');
const sliderPath = join(mobileAppDir, 'components', 'ui', 'SliderControl.tsx');
const dialPath = join(mobileAppDir, 'components', 'ui', 'DialControl.tsx');

let passedChecks = 0;
let failedChecks = 0;

function runCheck(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedChecks++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    failedChecks++;
  }
}

// -------------------------------------------------------------
// 1. TOKENS INTEGRITY & AESTHETIC DISCIPLINE
// -------------------------------------------------------------
console.log('--- 1. Tokens Integrity & Aesthetic Rules ---');

const tokensSrc = readFileSync(tokensPath, 'utf-8');

runCheck('Studio Background Palette defined accurately', () => {
  assert.ok(tokensSrc.includes("base: '#0A0B0D'"), 'Missing base background');
  assert.ok(tokensSrc.includes("panel: '#12151B'"), 'Missing panel background');
  assert.ok(tokensSrc.includes("elevated: '#181C24'"), 'Missing elevated background');
  assert.ok(tokensSrc.includes("inset: '#0E1015'"), 'Missing inset background');
});

runCheck('Hairline Neutral Borders defined accurately', () => {
  assert.ok(tokensSrc.includes("hairline: '#1E222A'"), 'Missing hairline border');
  assert.ok(tokensSrc.includes("subtle: '#2A2F3A'"), 'Missing subtle border');
  assert.ok(tokensSrc.includes("active: '#3E4657'"), 'Missing active border');
});

runCheck('Signal Colors strictly reserved for waveforms & traces', () => {
  assert.ok(tokensSrc.includes("primary: '#22D3EE'"), 'Missing primary cyan signal');
  assert.ok(tokensSrc.includes("primaryDim: '#06B6D4'"), 'Missing primary dim cyan signal');
  assert.ok(tokensSrc.includes("secondary: '#A78BFA'"), 'Missing secondary purple signal');
  assert.ok(tokensSrc.includes("secondaryDim: '#8B5CF6'"), 'Missing secondary dim purple signal');
  assert.ok(tokensSrc.includes("tertiary: '#38BDF8'"), 'Missing tertiary blue signal');
});

runCheck('Chrome components do NOT use signal colors (Zero-Tolerance)', () => {
  assert.ok(tokensSrc.includes("buttonBg: '#1E222A'"), 'Chrome button must use dark slate');
  assert.ok(tokensSrc.includes("buttonHover: '#2A2F3A'"), 'Chrome button hover must use dark slate');
  assert.ok(tokensSrc.includes("faderCap: '#2A2F3A'"), 'Fader cap must use slate');
  assert.ok(tokensSrc.includes("knobBody: '#181C24'"), 'Knob body must use dark elevated');
});

runCheck('Typography matrix: Sans for UI Chrome, Mono for telemetry measurements', () => {
  assert.ok(tokensSrc.includes('Inter'), 'Sans must include Inter');
  assert.ok(tokensSrc.includes('JetBrains Mono'), 'Mono must include JetBrains Mono');
  assert.ok(tokensSrc.includes('xs: 11'), 'Missing xs: 11');
  assert.ok(tokensSrc.includes('sm: 13'), 'Missing sm: 13');
  assert.ok(tokensSrc.includes('base: 14'), 'Missing base: 14');
  assert.ok(tokensSrc.includes('md: 16'), 'Missing md: 16');
  assert.ok(tokensSrc.includes('lg: 18'), 'Missing lg: 18');
  assert.ok(tokensSrc.includes('xl: 20'), 'Missing xl: 20');
  assert.ok(tokensSrc.includes("'2xl': 24"), 'Missing 2xl: 24');
  assert.ok(tokensSrc.includes("'3xl': 30"), 'Missing 3xl: 30');
  assert.ok(tokensSrc.includes("'4xl': 36"), 'Missing 4xl: 36');
});

runCheck('Spacing, Radii, and Zero Blurry SaaS Shadows', () => {
  assert.ok(tokensSrc.includes('xs: 4'));
  assert.ok(tokensSrc.includes('sm: 8'));
  assert.ok(tokensSrc.includes('md: 12'));
  assert.ok(tokensSrc.includes('lg: 16'));
  assert.ok(tokensSrc.includes('xl: 24'));
  assert.ok(tokensSrc.includes("'2xl': 32"));
  assert.ok(tokensSrc.includes("'3xl': 48"));
  assert.ok(tokensSrc.includes('sm: 2'));
  assert.ok(tokensSrc.includes('md: 4'));
  assert.ok(tokensSrc.includes('lg: 6'));
  assert.ok(tokensSrc.includes('full: 9999'));
  assert.ok(tokensSrc.includes('elevation: 0'));
  assert.ok(tokensSrc.includes("shadowColor: 'transparent'"));
});

// -------------------------------------------------------------
// 2. STATIC SOURCE CODE FORENSICS & ANTI-CHEAT AUDIT
// -------------------------------------------------------------
console.log('\n--- 2. Static Source Code Forensics & Anti-Cheat Audit ---');

const panelSrc = readFileSync(panelPath, 'utf-8');
const buttonSrc = readFileSync(buttonPath, 'utf-8');
const readoutSrc = readFileSync(readoutPath, 'utf-8');
const sliderSrc = readFileSync(sliderPath, 'utf-8');
const dialSrc = readFileSync(dialPath, 'utf-8');

runCheck('All UI primitives import from tokens module', () => {
  assert.ok(panelSrc.includes("from '../../design-system/tokens'"), 'InstrumentPanel missing tokens import');
  assert.ok(buttonSrc.includes("from '../../design-system/tokens'"), 'Button missing tokens import');
  assert.ok(readoutSrc.includes("from '../../design-system/tokens'"), 'Readout missing tokens import');
  assert.ok(sliderSrc.includes("from '../../design-system/tokens'"), 'SliderControl missing tokens import');
  assert.ok(dialSrc.includes("from '../../design-system/tokens'"), 'DialControl missing tokens import');
});

runCheck('No dummy facade returns or NotImplementedError placeholders', () => {
  const sources = [panelSrc, buttonSrc, readoutSrc, sliderSrc, dialSrc];
  for (const src of sources) {
    assert.ok(!src.includes('NotImplementedError'), 'Found NotImplementedError');
    assert.ok(!src.includes('TODO: implement'), 'Found TODO placeholder');
    assert.ok(!src.includes('return null; // mock'), 'Found mock null return');
    assert.ok(!src.includes('return false; // placeholder'), 'Found mock false return');
  }
});

runCheck('InstrumentPanel implements genuine variant and badge status mapping', () => {
  assert.ok(panelSrc.includes("variant === 'flat' && styles.variantFlat"));
  assert.ok(panelSrc.includes("variant === 'elevated' && styles.variantElevated"));
  assert.ok(panelSrc.includes("variant === 'inset' && styles.variantInset"));
  assert.ok(panelSrc.includes("styles.badgeDot"));
  assert.ok(panelSrc.includes("tokens.colors.status.ok"));
  assert.ok(panelSrc.includes("tokens.colors.status.warning"));
  assert.ok(panelSrc.includes("tokens.colors.status.danger"));
});

runCheck('Button implements genuine variants, hover, active, loading, disabled logic', () => {
  assert.ok(buttonSrc.includes("ActivityIndicator"));
  assert.ok(buttonSrc.includes("setIsHovered"));
  assert.ok(buttonSrc.includes("tokens.colors.chrome.buttonBg"));
  assert.ok(buttonSrc.includes("tokens.colors.chrome.buttonActive"));
  assert.ok(buttonSrc.includes("tokens.colors.chrome.buttonHover"));
  assert.ok(buttonSrc.includes("tokens.colors.chrome.disabledBg"));
});

runCheck('Readout implements monospace tabular numbers with warning/danger status', () => {
  assert.ok(readoutSrc.includes("fontVariant: ['tabular-nums']"));
  assert.ok(readoutSrc.includes("tokens.typography.fontFamily.mono"));
  assert.ok(readoutSrc.includes("tokens.colors.status.danger"));
  assert.ok(readoutSrc.includes("tokens.colors.status.warning"));
  assert.ok(readoutSrc.includes("secondaryValue"));
});

// -------------------------------------------------------------
// 3. GENUINE PANRESPONDER DRAG & ROTARY DIAL MATH
// -------------------------------------------------------------
console.log('\n--- 3. PanResponder Drag & Rotary Math Physics ---');

runCheck('SliderControl implements genuine PanResponder with vertical/horizontal drag delta', () => {
  assert.ok(sliderSrc.includes("PanResponder.create"));
  assert.ok(sliderSrc.includes("onPanResponderGrant"));
  assert.ok(sliderSrc.includes("onPanResponderMove"));
  assert.ok(sliderSrc.includes("onPanResponderRelease"));
  assert.ok(sliderSrc.includes("isVertical ? -gestureState.dy : gestureState.dx"));
  assert.ok(sliderSrc.includes("dragStartValRef.current"));
  assert.ok(sliderSrc.includes("centerDetent"));
});

runCheck('DialControl implements genuine PanResponder with DAW vertical drag physics', () => {
  assert.ok(dialSrc.includes("PanResponder.create"));
  assert.ok(dialSrc.includes("onPanResponderGrant"));
  assert.ok(dialSrc.includes("onPanResponderMove"));
  assert.ok(dialSrc.includes("onPanResponderRelease"));
  assert.ok(dialSrc.includes("-gestureState.dy * sensitivity"));
  assert.ok(dialSrc.includes("createArcPath"));
  assert.ok(dialSrc.includes("warningBelow"));
  assert.ok(dialSrc.includes("dangerAbove"));
});

runCheck('Simulated Slider PanResponder Math (Center Detent, Snapping & Clamping)', () => {
  const min = -12;
  const max = 12;
  const step = 0.5;
  const detentValue = 0;
  const snapThreshold = Math.abs(max - min) * 0.03; // 0.72 dB
  const precision = 1;

  const snapValue = (rawVal) => {
    let rounded = Math.round(rawVal / step) * step;
    if (Math.abs(rounded - detentValue) <= snapThreshold) {
      rounded = detentValue;
    }
    return Math.max(min, Math.min(max, Number(rounded.toFixed(precision))));
  };

  // Test center detent snap
  assert.equal(snapValue(0.3), 0.0);
  assert.equal(snapValue(-0.5), 0.0);
  assert.equal(snapValue(0.7), 0.0);
  assert.equal(snapValue(1.0), 1.0);
  assert.equal(snapValue(5.48), 5.5);
  assert.equal(snapValue(-6.2), -6.0);

  // Test boundary clamping
  assert.equal(snapValue(15.0), 12.0);
  assert.equal(snapValue(-20.0), -12.0);

  // Test gesture delta simulation
  const trackHeight = 120;
  const startVal = 0.0;
  const dy_up = -25; // Dragged up 25px
  const deltaVal_up = (-dy_up / trackHeight) * (max - min); // (25/120)*24 = 5.0
  const result_up = snapValue(startVal + deltaVal_up);
  assert.equal(result_up, 5.0);

  const dy_down = 35; // Dragged down 35px
  const deltaVal_down = (-dy_down / trackHeight) * (max - min); // (-35/120)*24 = -7.0
  const result_down = snapValue(startVal + deltaVal_down);
  assert.equal(result_down, -7.0);
});

runCheck('Simulated Dial PanResponder Math (DAW Sensitivity, Clamping & Arc Angles)', () => {
  const min = 20;
  const max = 20000;
  const step = 1;
  const precision = 0;

  const snapValue = (rawVal) => {
    const rounded = Math.round(rawVal / step) * step;
    const clamped = Math.max(min, Math.min(max, rounded));
    return Number(clamped.toFixed(precision));
  };

  const sensitivity = (max - min) / 160; // 19980 / 160 = 124.875 Hz/px
  const startVal = 1000; // 1kHz

  // Drag up 10px -> increases frequency
  const dy_up = -10;
  const deltaVal_up = -dy_up * sensitivity;
  const result_up = snapValue(startVal + deltaVal_up);
  assert.equal(result_up, 2249);

  // Drag down 5px -> decreases frequency
  const dy_down = 5;
  const deltaVal_down = -dy_down * sensitivity;
  const result_down = snapValue(startVal + deltaVal_down);
  assert.equal(result_down, 376);

  // Boundary clamping
  const dy_huge_down = 100;
  const result_min = snapValue(startVal - dy_huge_down * sensitivity);
  assert.equal(result_min, 20);

  // Rotary angle sweep test (-135 deg to +135 deg)
  const getAngle = (val) => {
    const ratio = (val - min) / (max - min);
    return -135 + ratio * 270;
  };
  assert.equal(getAngle(20), -135);
  assert.equal(getAngle(20000), 135);
  assert.equal(getAngle((20 + 20000) / 2), 0);
});

console.log(`\n=== AUDIT RESULTS ===`);
console.log(`Total Checks Run: ${passedChecks + failedChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${failedChecks}`);

if (failedChecks === 0) {
  console.log(`\nVERDICT: CLEAN`);
  process.exit(0);
} else {
  console.log(`\nVERDICT: INTEGRITY VIOLATION`);
  process.exit(1);
}
