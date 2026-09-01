# CarAudioAI — Precision Automotive Acoustic Tuning & DSP Calibration Platform

## Architecture & Design Foundations

### Visual & Aesthetic System Rules
- **Base Environment**: Near-black studio background (`#0A0B0D`), dark garage / test bench aesthetic. Elevated panels at `#12151B` / `#181C24`. Inset displays at `#0E1015`.
- **Signal Color Discipline**:
  - Primary trace / waveform: Cyan (`#22D3EE` / `#06B6D4`).
  - Secondary / phase trace: Purple (`#A78BFA` / `#8B5CF6`).
  - **Zero-Tolerance Rule**: Signal colors are strictly reserved for live audio waveforms, EQ response curves, FFT spectrum traces, and phase meters. NEVER used for buttons, background cards, or decorative SaaS gradient blobs.
- **Chrome & Structure**: Flat panels with neutral hairline borders (`#1E222A` hairline, `#2A2F3A` subtle border). Zero soft blurry SaaS drop-shadows.
- **Instrumentation Warning System**: Amber-red (`#F59E0B` warning, `#EF4444` danger) strictly reserved for clipping, voice-coil thermal overload, and cone-unloading warnings (subsonic filter < ported box tuning frequency).
- **Typography Matrix**:
  - UI Chrome & Controls: Geometric Sans (`Inter`, `System-UI`, sans-serif).
  - Telemetry & Measurements: Tabular Data Monospace (`JetBrains Mono`, `Fira Code`, `Courier New`, monospace) for ALL numeric measurements (`dB`, `Hz`, `ms`, `Ω`, `V AC`, `cm`).

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Design System & Token Hub | Token constants (`colors`, `typography`, `spacing`, `borders`, `shadows`) in `mobile-app/design-system/tokens.ts` | M1 (Track 0) | ORIGINAL_REQUEST R1 |
| F2 | Hardware-styled UI Primitives | `InstrumentPanel`, `Button` (solid chrome vs outline), `Readout`, `SliderControl` (studio vertical fader), `DialControl` (rotary potentiometer knob) | M1 (Track 0) | ORIGINAL_REQUEST R1 |
| F3 | Scrollytelling Hero Refactor | `HeroScrollSequence.jsx` refactored with design tokens, studio background (`#0A0B0D`), neutral borders, chrome CTA button, and WebGL shader cyan/purple color alignment | M2 (Track 1) | ORIGINAL_REQUEST R2 |
| F4 | HUD Scrollytelling Telemetry | Real-time acoustic stage HUD cards, phase coherence meters, and telemetry overlays in monospace font | M2 (Track 1) | ORIGINAL_REQUEST R2 |
| F5 | 14-Band Parametric/Graphic EQ Visualizer | Interactive 14-band EQ curve with draggable nodes, Catmull-Rom/Hermite spline interpolation, $\pm 12\text{ dB}$ gain, $Q$ factor, frequency tags, and reset presets | M3 (Track 2) | ORIGINAL_REQUEST R3 |
| F6 | Web Audio FFT Spectrum & Tone Generator | Live real-time spectrum analyzer powered by `AnalyserNode` + synthetic tone generator (sine sweeps / pink noise / test frequencies) | M3 (Track 2) | ORIGINAL_REQUEST R3 |
| F7 | Linkwitz-Riley 24dB Crossover & Subsonic Filter | Active crossover console with high-pass, low-pass, bandpass filter dials, and 35Hz ported enclosure subsonic safety warning (< 28Hz warning banner) | M3 (Track 2) | ORIGINAL_REQUEST R3 |
| F8 | Asymmetric RHD Time Alignment Engine | Millisecond driver-focused delay calculations ($\tau = \Delta d / 34.34\text{ cm/ms}$) with visual soundstage center shifting | M3 (Track 2) | ORIGINAL_REQUEST R3 |
| F9 | Multimeter DMM Gain-Staging Calculator | AC Target Voltage calculator ($V = \sqrt{P \times R}$) with interactive probe measurement guide and clipping protection rules | M3 (Track 2) | ORIGINAL_REQUEST R3 |
| F10 | 4-Step Vehicle Onboarding Flow | Step-by-step wizard (Make ➔ Model ➔ Hardware ➔ Calibration) featuring Indian car models (Skoda Kylaq, Maruti Swift, Hyundai Creta, Mahindra Thar) with acoustic dimensions | M4 (Track 3) | ORIGINAL_REQUEST R4 |
| F11 | Minimal Indian Phone OTP Auth | Phone number verification modal with 6-digit OTP inputs, resend timer, and instant session persistence | M4 (Track 3) | ORIGINAL_REQUEST R4 |
| F12 | High-Trust Razorpay Checkout & Invoicing | Subscription tier selection (₹99/mo Pro, ₹999/yr Installer) with 18% GST line items formatted in monospace numerals and secure Razorpay payment trigger | M5 (Track 4) | ORIGINAL_REQUEST R5 |
| F13 | Complete DSP Configuration Exporters | Multi-target export generators: Pioneer DEQ/DEX XML, MiniDSP JSON, and printable installer PDF / text calibration sheet | M3 / M6 | ORIGINAL_REQUEST R3 |
| F14 | Static Web Export & Mobile Responsive Layout | Zero-error Expo static web export (`npx expo export --platform web`) and responsive layout down to 375px viewport | M6 (Integration) | ORIGINAL_REQUEST Guardrails |

---

## Milestones

| # | Milestone Name | Scope | Dependencies | Status |
|---|----------------|-------|--------------|--------|
| M1 | Track 0 — Design System Foundation & UI Primitives | Create `mobile-app/design-system/tokens.ts`, `InstrumentPanel.tsx`, `Button.tsx`, `Readout.tsx`, `SliderControl.tsx`, `DialControl.tsx` | None | DONE |
| M2 | Track 1 — Hero Scrollytelling Polish | Refactor `HeroScrollSequence.jsx` (and web/native integrations) with design tokens, chrome styling, and HUD telemetry | M1 | PLANNED |
| M3 | Track 2 — Precision DSP Instrumentation Dashboard | Build 14-band EQ visualizer with draggable nodes, Web Audio `AnalyserNode` spectrum bar analyzer & tone generator, Linkwitz-Riley crossover dials, subsonic safety warning, time alignment readouts, and DMM gain staging calculator | M1 | PLANNED |
| M4 | Track 3 — Vehicle Seating & Geometry Onboarding Flow | Implement 4-step Indian vehicle onboarding wizard (Kylaq, Swift, Creta, Thar), RHD driver distance mapping, and phone OTP authentication | M1 | PLANNED |
| M5 | Track 4 — High-Trust Payment & Checkout Screen | Build high-trust Razorpay checkout modal with ₹99/mo and ₹999/yr subscription cards, 18% GST monospace breakdown, and secure payment simulation | M1 | PLANNED |
| M6 | Integration, E2E Testing & Static Web Build Export | Integrate all tracks into main navigation / tabs, run full E2E test verification, execute `npx expo export --platform web`, and verify mobile responsiveness down to 375px | M1, M2, M3, M4, M5 | PLANNED |

---

## Interface Contracts

### 1. `mobile-app/design-system/tokens.ts`
```typescript
export const tokens = {
  colors: {
    bg: { base: '#0A0B0D', panel: '#12151B', elevated: '#181C24', inset: '#0E1015' },
    border: { hairline: '#1E222A', subtle: '#2A2F3A', active: '#3E4657' },
    text: { primary: '#F1F5F9', secondary: '#94A3B8', muted: '#475569', inverse: '#0A0B0D' },
    signal: { primary: '#22D3EE', secondary: '#A78BFA', tertiary: '#38BDF8' }, // Strictly for waveforms / traces
    status: { ok: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' },
    chrome: { buttonBg: '#1E222A', buttonHover: '#2A2F3A', buttonActive: '#3E4657' },
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
    },
    sizes: { xs: 11, sm: 13, base: 14, md: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 },
  radius: { sm: 2, md: 4, lg: 6, full: 9999 },
} as const;
```

### 2. UI Primitives Contract
- `InstrumentPanel`: Props `{ title?: string, subtitle?: string, badge?: string, variant?: 'flat' | 'elevated' | 'inset', children: ReactNode, style?: ViewStyle }`
- `Button`: Props `{ label: string, variant?: 'solid' | 'outline' | 'danger' | 'ghost', size?: 'sm' | 'md' | 'lg', disabled?: boolean, onPress: () => void, icon?: string }`
- `Readout`: Props `{ label: string, value: string | number, unit?: string, warning?: boolean, danger?: boolean, size?: 'sm' | 'md' | 'lg' }`
- `SliderControl`: Props `{ value: number, min: number, max: number, step?: number, label: string, unit?: string, onChange: (val: number) => void }`
- `DialControl`: Props `{ value: number, min: number, max: number, step?: number, label: string, unit?: string, onChange: (val: number) => void }`

---

## Code Layout

```
mobile-app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                # Main Tuning Studio & Hero integration
│   │   └── explore.tsx              # Vehicle Catalog & Presets Browser
│   └── _layout.tsx
├── components/
│   ├── HeroScrollSequence.jsx       # Refactored Scrollytelling hero sequence
│   ├── dsp/
│   │   ├── EqCurveVisualizer.tsx    # 14-band interactive spline & draggable nodes
│   │   ├── SpectrumAnalyzer.tsx     # Web Audio AnalyserNode 60fps canvas FFT
│   │   ├── CrossoverSubsonic.tsx    # Linkwitz-Riley 24dB dials + subsonic warning
│   │   ├── TimeAlignmentView.tsx    # Asymmetric RHD delay matrix & visual cabin
│   │   └── MultimeterGainStaging.tsx # AC Volts calculator & probe calibration
│   ├── onboarding/
│   │   ├── WizardContainer.tsx      # 4-step wizard orchestration
│   │   ├── StepMakeModel.tsx        # Indian vehicle selector (Kylaq, Swift, Creta, Thar)
│   │   ├── StepHardware.tsx         # Speakers, amps, subwoofers & enclosure tuning
│   │   └── StepCalibration.tsx      # Acoustic curve selection & driver seating
│   ├── checkout/
│   │   └── HighTrustCheckout.tsx    # Monospace line-item Razorpay payment screen
│   ├── auth/
│   │   └── PhoneOtpModal.tsx        # Clean Indian OTP auth modal
│   └── ui/
│       ├── InstrumentPanel.tsx
│       ├── Button.tsx
│       ├── Readout.tsx
│       ├── SliderControl.tsx
│       └── DialControl.tsx
├── design-system/
│   └── tokens.ts                    # Single source of truth for design tokens
├── constants/
│   ├── catalog.ts                   # 9 Indian makes & 26 vehicle models
│   └── dspConstants.ts              # 14-band frequencies, LR4 filters, formula helpers
└── services/
    ├── webAudioEngine.ts            # Web Audio API context, oscillator & analyzer
    ├── tuningService.ts             # DSP acoustic algorithms
    └── paymentService.ts            # Razorpay integration
```
