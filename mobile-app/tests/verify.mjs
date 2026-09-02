import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Design System and UI Primitives Verification', () => {
  const tokensContent = readFileSync(join(process.cwd(), 'design-system', 'tokens.ts'), 'utf-8');
  const panelContent = readFileSync(join(process.cwd(), 'components', 'ui', 'InstrumentPanel.tsx'), 'utf-8');
  const buttonContent = readFileSync(join(process.cwd(), 'components', 'ui', 'Button.tsx'), 'utf-8');
  const readoutContent = readFileSync(join(process.cwd(), 'components', 'ui', 'Readout.tsx'), 'utf-8');
  const sliderContent = readFileSync(join(process.cwd(), 'components', 'ui', 'SliderControl.tsx'), 'utf-8');
  const dialContent = readFileSync(join(process.cwd(), 'components', 'ui', 'DialControl.tsx'), 'utf-8');

  describe('Tokens Specification', () => {
    test('Tokens file defines exact studio background colors', () => {
      assert.ok(tokensContent.includes("base: '#0A0B0D'"));
      assert.ok(tokensContent.includes("panel: '#12151B'"));
      assert.ok(tokensContent.includes("elevated: '#181C24'"));
      assert.ok(tokensContent.includes("inset: '#0E1015'"));
    });

    test('Tokens file defines hairline neutral borders', () => {
      assert.ok(tokensContent.includes("hairline: '#1E222A'"));
      assert.ok(tokensContent.includes("subtle: '#2A2F3A'"));
      assert.ok(tokensContent.includes("active: '#3E4657'"));
    });

    test('Tokens file defines strict signal colors', () => {
      assert.ok(tokensContent.includes("primary: '#22D3EE'"));
      assert.ok(tokensContent.includes("secondary: '#A78BFA'"));
      assert.ok(tokensContent.includes("tertiary: '#38BDF8'"));
    });

    test('Tokens chrome buttons are neutral dark chrome and not glowing cyan', () => {
      assert.ok(tokensContent.includes("buttonBg: '#1E222A'"));
      assert.ok(tokensContent.includes("buttonHover: '#2A2F3A'"));
      assert.ok(tokensContent.includes("buttonActive: '#3E4657'"));
      assert.ok(tokensContent.includes("border: '#2A2F3A'"));
    });

    test('Tokens typography defines Inter and JetBrains Mono', () => {
      assert.ok(tokensContent.includes('Inter'));
      assert.ok(tokensContent.includes('JetBrains Mono'));
    });

    test('Tokens spacing and radius match spec', () => {
      assert.ok(tokensContent.includes('xs: 4'));
      assert.ok(tokensContent.includes('sm: 8'));
      assert.ok(tokensContent.includes('md: 12'));
      assert.ok(tokensContent.includes('lg: 16'));
      assert.ok(tokensContent.includes('xl: 24'));
      assert.ok(tokensContent.includes("'2xl': 32"));
      assert.ok(tokensContent.includes("'3xl': 48"));
      assert.ok(tokensContent.includes('sm: 2'));
      assert.ok(tokensContent.includes('md: 4'));
      assert.ok(tokensContent.includes('lg: 6'));
      assert.ok(tokensContent.includes('full: 9999'));
    });
  });

  describe('InstrumentPanel Primitive', () => {
    test('InstrumentPanel exports flat, elevated, and inset variants', () => {
      assert.ok(panelContent.includes("export const InstrumentPanel"));
      assert.ok(panelContent.includes("variantFlat"));
      assert.ok(panelContent.includes("variantElevated"));
      assert.ok(panelContent.includes("variantInset"));
      assert.ok(panelContent.includes("badgeDot"));
    });
  });

  describe('Button Primitive', () => {
    test('Button exports solid chrome, outline, danger, and ghost variants', () => {
      assert.ok(buttonContent.includes("export const Button"));
      assert.ok(buttonContent.includes("normalizedVariant === 'solid'"));
      assert.ok(buttonContent.includes("normalizedVariant === 'outline'"));
      assert.ok(buttonContent.includes("normalizedVariant === 'danger'"));
      assert.ok(buttonContent.includes("normalizedVariant === 'ghost'"));
      assert.ok(buttonContent.includes("tokens.colors.chrome.buttonBg"));
    });
  });

  describe('Readout Primitive', () => {
    test('Readout displays tabular numbers in monospace font with unit and status colors', () => {
      assert.ok(readoutContent.includes("export const Readout"));
      assert.ok(readoutContent.includes("fontVariant: ['tabular-nums']"));
      assert.ok(readoutContent.includes("tokens.typography.fontFamily.mono"));
      assert.ok(readoutContent.includes("tokens.colors.status.warning"));
      assert.ok(readoutContent.includes("tokens.colors.status.danger"));
    });
  });

  describe('SliderControl & DialControl Primitives', () => {
    test('SliderControl supports center detent (0 dB) and fader cap', () => {
      assert.ok(sliderContent.includes("export const SliderControl"));
      assert.ok(sliderContent.includes("centerDetent"));
      assert.ok(sliderContent.includes("detentLine"));
      assert.ok(sliderContent.includes("faderThumb"));
      assert.ok(sliderContent.includes("PanResponder.create"));
    });

    test('DialControl supports 270 degree rotary potentiometer with arc track and warnings', () => {
      assert.ok(dialContent.includes("export const DialControl"));
      assert.ok(dialContent.includes("createArcPath"));
      assert.ok(dialContent.includes("warningBelow"));
      assert.ok(dialContent.includes("dangerAbove"));
      assert.ok(dialContent.includes("centerZero"));
    });
  });

  describe('CarBrandLogo & Vehicle Catalog Verification', () => {
    const logoContent = readFileSync(join(process.cwd(), 'components', 'ui', 'CarBrandLogo.tsx'), 'utf-8');
    const catalogContent = readFileSync(join(process.cwd(), 'constants', 'catalog.ts'), 'utf-8');

    test('CarBrandLogo exports vector SVG logo component with all 25 brand cases', () => {
      assert.ok(logoContent.includes('export const CarBrandLogo'));
      const brandIds = [
        'skoda', 'suzuki', 'hyundai', 'tata', 'mahindra', 'toyota', 'kia', 'volkswagen', 'honda',
        'mg', 'renault', 'nissan', 'jeep', 'bmw', 'mercedes', 'audi', 'volvo', 'byd',
        'landrover', 'porsche', 'ford', 'citroen', 'force', 'lexus', 'jaguar'
      ];
      brandIds.forEach((id) => {
        assert.ok(logoContent.includes(`"${id}":`), `Missing logo path for: ${id}`);
      });
    });

    test('catalog.ts contains at least 25 makes and over 50 car models with acoustic specs', () => {
      assert.ok(catalogContent.includes("export const INDIAN_CAR_MAKES"));
      const brandIds = [
        'skoda', 'maruti', 'hyundai', 'tata', 'mahindra', 'toyota', 'kia', 'vw', 'honda',
        'mg', 'renault', 'nissan', 'jeep', 'bmw', 'mercedes', 'audi', 'volvo', 'byd',
        'landrover', 'porsche', 'ford', 'citroen', 'force', 'lexus', 'jaguar'
      ];
      brandIds.forEach((id) => {
        assert.ok(catalogContent.includes(`id: '${id}'`), `Missing make id in catalog: ${id}`);
      });
    });
  });

  describe('Hardware DSP Exporters & Installer Blueprint (Phase 2)', () => {
    const exportContent = readFileSync(join(process.cwd(), 'services', 'exportService.ts'), 'utf-8');

    test('exportService.ts generates Helix, Musway, Android DSP, Pioneer, and MiniDSP configs', () => {
      assert.ok(exportContent.includes('export function generateHelixAfpcXml'));
      assert.ok(exportContent.includes('export function generateMuswayPresetJson'));
      assert.ok(exportContent.includes('export function generateAndroidDspCsv'));
      assert.ok(exportContent.includes('export function generatePioneerXml'));
      assert.ok(exportContent.includes('export function generateMiniDspJson'));
    });

    test('exportService.ts generates and prints Professional Installer Blueprint Spec Sheet HTML', () => {
      assert.ok(exportContent.includes('export function generateInstallerBlueprintHtml'));
      assert.ok(exportContent.includes('export function downloadInstallerBlueprintHtml'));
      assert.ok(exportContent.includes('export function printInstallerBlueprint'));
      assert.ok(exportContent.includes('Professional Installer Acoustic Calibration Blueprint'));
      assert.ok(exportContent.includes('Amplifier Gain Potentiometer Calibration'));
    });
  });

  describe('Real-Time Microphone RTA & Auto-Tune Engine (Phase 1)', () => {
    const audioContent = readFileSync(join(process.cwd(), 'services', 'webAudioEngine.ts'), 'utf-8');
    const rtaModalContent = readFileSync(join(process.cwd(), 'components', 'RtaMeasurementModal.tsx'), 'utf-8');

    test('webAudioEngine.ts supports live mic capture, 31-band FFT binning, and target curve auto-tuning', () => {
      assert.ok(audioContent.includes('startMicRtaCapture'));
      assert.ok(audioContent.includes('stopMicRtaCapture'));
      assert.ok(audioContent.includes('getMic31BandRtaData'));
      assert.ok(audioContent.includes('getTargetCurveSpl'));
      assert.ok(audioContent.includes('ISO_31_FREQUENCIES'));
    });

    test('RtaMeasurementModal.tsx renders live 31-band canvas, pink noise toggle, and 1-click Auto-Tune', () => {
      assert.ok(rtaModalContent.includes('handleToggleMicCapture'));
      assert.ok(rtaModalContent.includes('handleTogglePinkNoise'));
      assert.ok(rtaModalContent.includes('handleApplyAutoTune'));
      assert.ok(rtaModalContent.includes('1-Click Auto-Tune Inverse Correction'));
    });
  });
});


