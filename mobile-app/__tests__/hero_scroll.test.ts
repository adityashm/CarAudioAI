import { tokens } from '../design-system/tokens';
import fs from 'fs';
import path from 'path';

describe('HeroScrollSequence Polish & Scrollytelling Telemetry (Track 1 / Milestone 2)', () => {
  const componentPath = path.resolve(__dirname, '../components/HeroScrollSequence.jsx');
  const rootComponentPath = path.resolve(__dirname, '../../HeroScrollSequence.jsx');

  let code: string;
  let rootCode: string;

  beforeAll(() => {
    code = fs.readFileSync(componentPath, 'utf-8');
    rootCode = fs.readFileSync(rootComponentPath, 'utf-8');
  });

  describe('1. Token & UI Primitive Import Discipline', () => {
    test('imports tokens and UI primitives (InstrumentPanel, Button, Readout)', () => {
      expect(code).toMatch(/import\s*\{\s*tokens\s*\}\s*from/);
      expect(code).toMatch(/import\s*\{\s*InstrumentPanel\s*\}\s*from/);
      expect(code).toMatch(/import\s*\{\s*Button\s*\}\s*from/);
      expect(code).toMatch(/import\s*\{\s*Readout\s*\}\s*from/);

      expect(rootCode).toMatch(/import\s*\{\s*tokens\s*\}\s*from/);
      expect(rootCode).toMatch(/import\s*\{\s*InstrumentPanel\s*\}\s*from/);
      expect(rootCode).toMatch(/import\s*\{\s*Button\s*\}\s*from/);
      expect(rootCode).toMatch(/import\s*\{\s*Readout\s*\}\s*from/);
    });

    test('strictly uses studio base background (#0A0B0D / tokens.colors.bg.base)', () => {
      // Must not use old Tailwind slate-950 #020617
      expect(code).not.toContain('#020617');
      expect(rootCode).not.toContain('#020617');

      expect(code).toContain('tokens.colors.bg.base');
      expect(rootCode).toContain('tokens.colors.bg.base');
    });

    test('uses hairline borders and removes glowing cyan container borders', () => {
      // Must not contain glowing cyan borders
      expect(code).not.toContain('rgba(6, 182, 212, 0.3)');
      expect(rootCode).not.toContain('rgba(6, 182, 212, 0.3)');
      expect(code).not.toContain('rgba(168, 85, 247, 0.4)');
      expect(rootCode).not.toContain('rgba(168, 85, 247, 0.4)');
      expect(code).not.toContain('rgba(16, 185, 129, 0.6)');
      expect(rootCode).not.toContain('rgba(16, 185, 129, 0.6)');

      expect(code).toContain('tokens.colors.border.hairline');
      expect(rootCode).toContain('tokens.colors.border.hairline');
    });
  });

  describe('2. Signal Color & Primary CTA Button Rules', () => {
    test('Primary CTA button uses solid chrome Button primitive without cyan fill or blurry glow', () => {
      // Must NOT contain old cyan button style or blurry box shadow
      expect(code).not.toContain("backgroundColor: '#06b6d4'");
      expect(code).not.toContain("boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'");
      expect(code).not.toContain("boxShadow: '0 0 10px #06b6d4'");
      expect(code).not.toContain("boxShadow: '0 0 10px #10b981'");

      // Must render Button primitive
      expect(code).toContain('<Button');
      expect(code).toContain('label="Open Live Tuning Studio →"');
      expect(code).toContain('variant="solid"');
    });

    test('Signal colors (Cyan & Purple) are confined to live waveform shader and phase status', () => {
      expect(code).toContain('tokens.colors.signal.primary');
    });
  });

  describe('3. WebGL Concentric Soundwave Shader Precision', () => {
    test('shader fragment code uses token color vectors for Cyan and Purple', () => {
      // Cyan #22D3EE -> (0.133, 0.827, 0.933)
      expect(code).toMatch(/vec3\s+cyan\s*=\s*vec3\(\s*0\.133\s*,\s*0\.827\s*,\s*0\.933\s*\)/);
      // Purple #A78BFA -> (0.655, 0.545, 0.980)
      expect(code).toMatch(/vec3\s+purple\s*=\s*vec3\(\s*0\.655\s*,\s*0\.545\s*,\s*0\.980\s*\)/);

      // Same for root copy
      expect(rootCode).toMatch(/vec3\s+cyan\s*=\s*vec3\(\s*0\.133\s*,\s*0\.827\s*,\s*0\.933\s*\)/);
      expect(rootCode).toMatch(/vec3\s+purple\s*=\s*vec3\(\s*0\.655\s*,\s*0\.545\s*,\s*0\.980\s*\)/);
    });
  });

  describe('4. Telemetry & HUD Overlays per Stage', () => {
    test('Stage 0 renders InstrumentPanel with Chassis Volume, Resonance, and Seating readouts', () => {
      expect(code).toContain('The Precision Acoustic Baseline');
      expect(code).toContain('STAGE 01 // EXTERIOR SCAN');
      expect(code).toContain('label="Chassis Vol"');
      expect(code).toContain('value="3.20"');
      expect(code).toContain('unit="m³"');
      expect(code).toContain('label="Resonance"');
      expect(code).toContain('value="200"');
      expect(code).toContain('unit="Hz"');
    });

    test('Stage 1 renders InstrumentPanel with FL/FR distances and phase offset warning', () => {
      expect(code).toContain('Asymmetrical Seating Matrix');
      expect(code).toContain('STAGE 02 // COCKPIT INGRESS');
      expect(code).toContain('label="FL Distance"');
      expect(code).toContain('value="138"');
      expect(code).toContain('label="FR Distance"');
      expect(code).toContain('value="95"');
      expect(code).toContain('label="Phase Offset"');
      expect(code).toContain('value="1.25"');
      expect(code).toContain('unit="ms"');
      expect(code).toContain('status="warning"');
    });

    test('Stage 2 renders InstrumentPanel with 14-band parametric EQ acoustic compensation', () => {
      expect(code).toContain('Acoustic Notch Compensation');
      expect(code).toContain('STAGE 03 // 14-BAND PARAMETRIC DSP');
      expect(code).toContain('label="Port Boost"');
      expect(code).toContain('value="+5.5"');
      expect(code).toContain('label="Cabin Notch"');
      expect(code).toContain('value="-1.5"');
      expect(code).toContain('label="Glass Tamer"');
      expect(code).toContain('value="-1.0"');
    });

    test('Stage 3 renders InstrumentPanel with 99.8% phase coherence locked status and CTA', () => {
      expect(code).toContain('Laser Soundstage Focus');
      expect(code).toContain('PHASE COHERENCE: 99.8% LOCKED');
      expect(code).toContain('label="Coherence"');
      expect(code).toContain('value="99.8"');
      expect(code).toContain('unit="%"');
      expect(code).toContain('label="Wavefront"');
      expect(code).toContain('value="343"');
      expect(code).toContain('unit="m/s"');
      expect(code).toContain('status="ok"');
    });
  });

  describe('5. Native Fallback Slideshow Parity', () => {
    test('Native fallback renders InstrumentPanel, Readout, and Button primitives', () => {
      expect(code).toContain('function NativeFallbackSlideshow');
      expect(code).toContain('AI Soundfield Calibration');
      expect(code).toContain('CARAUDIO.AI NATIVE PREVIEW');
      expect(code).toContain('tokens.colors.bg.base');
      expect(code).toContain('tokens.colors.border.hairline');
    });
  });
});
