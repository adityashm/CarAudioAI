# CarAudioAI UI/UX & Component Architecture Survey

**Author**: Survey Explorer 2  
**Target Workspace**: `c:/Users/aditya/Downloads/CarAudioAI`  
**Date**: 2026-09-01  
**Scope**: UI Component Audit, `HeroScrollSequence.jsx` Forensic Inspection, Design System Token Architecture (`tokens.ts`), UI Primitives (`InstrumentPanel`, `Button`, `Readout`, `SliderControl`, `DialControl`), and Implementation Roadmaps.

---

## 1. Executive Summary & Design System Foundations

The CarAudioAI platform is an AI-powered automotive acoustic tuning and DSP calibration platform engineered specifically for Indian car environments (e.g. Skoda Kylaq, Hyundai Creta, Maruti Swift, Mahindra Thar). 

### Core Aesthetic Directive
The UI/UX must embody the precision of professional studio mixing consoles, automotive HMI instrumentation, audio analyzers, and hardware DSPs rather than generic consumer SaaS dashboards. 

### Fundamental Design Rules & Strict Boundaries
1. **Base Environment**: Near-black studio background (`#0A0B0D`), dark garage aesthetic. Panels use flat layered dark neutral grays (`#12151B`, `#181C24`).
2. **Signal Color Discipline**: Cyan (`#22D3EE` / `#06B6D4`) for primary live waveform and EQ splines, Purple (`#A78BFA` / `#8B5CF6`) for secondary/phase data and reference overlays. **Signal colors are strictly reserved for live signal visualization and must NEVER be used for buttons, background panels, or decorative card borders.**
3. **Chrome & Structure**: Flat panels with hairline neutral gray borders (`#1E222A`, `#2A2F3A`). Zero soft blurry SaaS drop-shadows or floating glow gradients.
4. **Instrumentation Warning**: Amber-Red (`#F59E0B` / `#EF4444`) strictly reserved for clipping, voice-coil overheating, cone-unloading warnings, and out-of-phase alerts.
5. **Typography Matrix**: 
   - **Geometric Sans** (`Inter`, system sans) for UI chrome, navigation, headers, field labels, and descriptions.
   - **Tabular Monospace** (`JetBrains Mono`, `SF Mono`, `Menlo`, monospace) for **ALL** numeric measurements (e.g., `dB`, `Hz`, `ms`, `Ω`, `V AC`, `cm`, `m³`, `mm`, `₹`, `%`).

---

## 2. Forensic Audit of Existing UI Components

### 2.1 `HeroScrollSequence.jsx` (Root & `mobile-app/components/HeroScrollSequence.jsx`)
Both files are identical 646-line components implementing a 4-stage Framer Motion scrollytelling sequence on Web with WebGL concentric wave shader and an automated timer-based Native fallback.

#### Key Code Locations & Violations

| Line(s) | Current Implementation | Design System Violation | Required Refactoring |
| :--- | :--- | :--- | :--- |
| **L277, L296** | `backgroundColor: '#020617'` | Uses Tailwind slate-950 instead of `#0A0B0D` studio base. | Migrate to `tokens.color.surface.base` (`#0A0B0D`). |
| **L295** | `border: '1px solid rgba(6, 182, 212, 0.3)'` | **Signal color violation**: Container border is glowing cyan. | Change to hairline neutral border `tokens.color.border.hairline` (`#1E222A`). |
| **L411** | `backgroundColor: '#06b6d4'`, `boxShadow: '0 0 10px #06b6d4'` | Blurry SaaS glow shadow on indicator dot. | Remove box shadow; use flat solid dot `#22D3EE` with crisp 1px ring `#1E222A`. |
| **L425** | `backgroundColor: activeStage >= step ? '#06b6d4' : 'rgba(255,255,255,0.2)'` | Cyan used for UI progress bar indicators. | Use neutral chrome `tokens.color.chrome.active` (`#E2E8F0`) or muted slate (`#475569`). |
| **L445, L473, L501, L531** | `border: '1px solid rgba(6, 182, 212, 0.3)'` / `rgba(168, 85, 247, 0.4)` / `rgba(16, 185, 129, 0.6)` | HUD cards use colored borders matching stage themes. | Unify all HUD panels on `InstrumentPanel` with `#1E222A` / `#2A2F3A` hairline borders. |
| **L529** | `backgroundColor: 'rgba(6, 78, 59, 0.90)'` | Stage 3 HUD card uses dark emerald green background. | Use standard instrument panel background `rgba(18, 21, 27, 0.92)` with dark neutral glass. |
| **L555-564** | `backgroundColor: '#06b6d4'`, `boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'` | **CRITICAL VIOLATION**: CTA Button is cyan with a 20px cyan glow shadow. | Replace with `Button` variant="primary" (Solid `#F1F5F9` chrome, text `#0A0B0D`, zero shadow). |
| **L486, L514-517** | Inline measurements (e.g. `95cm`, `138cm`, `1.25ms`, `+5.5dB @ 63Hz`, `-1.5dB @ 200Hz`) | Measurements rendered in unstructured strings without strict monospace tabular formatting. | Extract numeric values into `Readout` components or monospace spans styled with `tokens.typography.mono`. |
| **L220-222** | WebGL shader colors `vec3(0.024, 0.714, 0.831)` & `vec3(0.545, 0.361, 0.965)` | Hardcoded shader color constants. | Calibrate shader vec3 uniforms to match tokens: `#22D3EE` `(0.133, 0.827, 0.933)` and `#A78BFA` `(0.655, 0.545, 0.980)`. |
| **L581-645** | `NativeFallbackSlideshow` | Basic timer slideshow with hardcoded `#020617` background and `#06b6d4` tag. | Refactor with `InstrumentPanel`, `tokens.typography.mono`, and consistent HUD telemetry layout. |

---

### 2.2 `mobile-app/app/(tabs)/index.tsx`
A 2,317-line monolithic screen containing the landing page, 4-step wizard, 6 studio sub-tabs (Soundfield, EQ, Crossovers, Gain staging, Tones, DSP Export), and modals.

#### Audit Findings:
- **Scattered Background Colors**: Uses `#020617`, `#070d18`, `#0a101f`, `#0b1322`, `#060a12`, `#081f33`, `#092137`, `#0e172a`, `#1e293b`. Needs standardization to 4 surface levels (`#0A0B0D`, `#12151B`, `#181C24`, `#0E1015`).
- **Widespread Signal Color Misuse**:
  - `primaryGlowBtn` (`L928`): `backgroundColor: '#06b6d4'` with `shadowColor: '#06b6d4'`.
  - `selectModelBtnActive` (`L1781`): `backgroundColor: '#06b6d4'`.
  - `makeCardActive` (`L1652`): `borderColor: '#06b6d4'`, `backgroundColor: '#092137'`.
  - `modelCardActive` (`L1712`): `borderColor: '#06b6d4'`, `backgroundColor: '#081f33'`.
  - `configOptionChipActive`: Background and border tinted cyan.
  - `runSweepBtn` & `subscribeBtn`: Cyan background buttons.
- **SaaS Shadows & Glow Blobs**: `glowBlob1` (`L866`), `glowBlob2` (`L876`), and `shadowRadius: 15` create fuzzy SaaS lighting that violates the physical studio hardware aesthetic.
- **Data Measurement Formatting**: Numeric specs (`L766-775`, `L988-999`, `L1053-1056`, `L1127-1145`) are partially sans-serif and not cleanly decoupled into unit badges.

---

### 2.3 `mobile-app/app/(tabs)/explore.tsx`
- Background `#070b12` and card borders `#1e293b`.
- GitHub button (`L259`) uses hardcoded blue `#2563eb`.
- Formulas (`L189-196`) use raw monospace container. Can be polished using `InstrumentPanel` and structured token typography.

---

### 2.4 Modals (`AuthModal.tsx`, `PaymentModal.tsx`, `RtaMeasurementModal.tsx`)
- `AuthModal.tsx`: Cyan send OTP and verify buttons (`#06b6d4`), cyan drop-shadows.
- `PaymentModal.tsx`: Cyan/gold subscribe buttons (`#06b6d4`, `#f59e0b`), colored borders (`rgba(6, 182, 212, 0.3)`), prices not fully formatted in tabular mono.
- `RtaMeasurementModal.tsx`: Run sweep button is cyan, but RTA canvas visualization appropriately uses cyan/green/red for spectrum curves.

---

### 2.5 `mobile-app/constants/theme.ts`
- Currently contains boilerplate Expo light/dark themes (`#0a7ea4`, `#fff`, `#151718`) and simple font platform selector.
- Completely lacks studio tokens, signal ramps, hairline border definitions, warning colors, or structured measurement typography styles.

---

## 3. Design System Token Specification (`mobile-app/design-system/tokens.ts`)

The token architecture must be centralized in `mobile-app/design-system/tokens.ts` and export typed palettes, typography styles, layout metrics, and status configurations.

```typescript
/**
 * CarAudioAI Precision Design System Tokens
 * Path: mobile-app/design-system/tokens.ts
 */

export const tokens = {
  // -------------------------------------------------------------
  // 1. COLOR MATRIX
  // -------------------------------------------------------------
  color: {
    // Base Environment (Near-black dark garage studio aesthetic)
    surface: {
      base: '#0A0B0D',           // Main app viewport background
      panel: '#12151B',          // Standard instrument card / rack background
      panelElevated: '#181C24',  // Modals, dropdowns, hovered items
      panelInset: '#0E1015',     // Recessed displays, canvas backgrounds, wells
      overlay: 'rgba(10, 11, 13, 0.88)',
    },

    // Chrome & Hairline Borders (Zero soft blurry SaaS shadows)
    border: {
      hairline: '#1E222A',       // Default flat separation border
      subtle: '#2A2F3A',         // Interactive card borders, tab active borders
      focus: '#3E4656',          // Focused inputs, active knobs
      divider: 'rgba(255, 255, 255, 0.06)',
    },

    // UI Chrome & Controls (Neutral solid buttons & icons)
    chrome: {
      primaryBg: '#F1F5F9',      // Solid button primary background
      primaryText: '#0A0B0D',    // Solid button primary text (high contrast dark)
      secondaryBg: '#181C24',    // Outline button background
      secondaryBorder: '#2A2F3A',
      secondaryText: '#E2E8F0',
      activeTab: '#1E222A',
      disabledBg: '#12151B',
      disabledText: '#475569',
      disabledBorder: '#1E222A',
    },

    // Signal Colors (STRICTLY reserved for live waveforms, EQ splines, phase meters)
    signal: {
      primary: '#22D3EE',        // Cyan: Main live waveform, active EQ curve
      primaryDim: '#06B6D4',     // Cyan dim: Secondary trace, wave fill
      primaryGlow: 'rgba(34, 211, 238, 0.20)',
      secondary: '#A78BFA',      // Purple: Phase shift, secondary channel, target curve
      secondaryDim: '#8B5CF6',
      secondaryGlow: 'rgba(167, 139, 250, 0.20)',
      reference: '#38BDF8',      // Sky: Reference soundstage target
    },

    // Warning & Safety Indicators (STRICTLY for clipping, overheating, unloading)
    warning: {
      amber: '#F59E0B',          // Warning: Subsonic cut, gain sensitivity near clip
      amberDim: '#D97706',
      amberBg: 'rgba(245, 158, 11, 0.08)',
      amberBorder: 'rgba(245, 158, 11, 0.25)',
      red: '#EF4444',            // Danger: Hard clip, amplifier thermal overload
      redDim: '#DC2626',
      redBg: 'rgba(239, 68, 68, 0.08)',
      redBorder: 'rgba(239, 68, 68, 0.25)',
      locked: '#10B981',         // Coherence Locked / Nominal status
      lockedBg: 'rgba(16, 185, 129, 0.08)',
      lockedBorder: 'rgba(16, 185, 129, 0.25)',
    },

    // Text Hierarchy
    text: {
      primary: '#F1F5F9',        // High-contrast primary copy & titles
      secondary: '#94A3B8',      // Subheadings, secondary labels
      muted: '#64748B',          // Micro tags, inactive parameters
      unit: '#64748B',           // Unit markers (dB, Hz, ms)
      inverse: '#0A0B0D',        // Text on bright chrome buttons
    },
  },

  // -------------------------------------------------------------
  // 2. TYPOGRAPHY MATRIX (Geometric UI Sans vs Tabular Data Mono)
  // -------------------------------------------------------------
  typography: {
    fontFamily: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },

    // UI Chrome (Sans)
    display: {
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 28,
      fontWeight: '800' as const,
      lineHeight: 34,
      letterSpacing: -0.5,
    },
    heading1: {
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 20,
      fontWeight: '700' as const,
      lineHeight: 26,
      letterSpacing: -0.3,
    },
    heading2: {
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    body: {
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 19,
    },
    bodySmall: {
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 11,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    label: {
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 10,
      fontWeight: '700' as const,
      letterSpacing: 0.8,
      textTransform: 'uppercase' as const,
    },

    // Measurement & Telemetry Data (Tabular Mono)
    dataHero: {
      fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace",
      fontSize: 24,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    dataLarge: {
      fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace",
      fontSize: 18,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
    },
    dataMedium: {
      fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace",
      fontSize: 13,
      fontWeight: '600' as const,
    },
    dataSmall: {
      fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace",
      fontSize: 11,
      fontWeight: '500' as const,
    },
    dataMicro: {
      fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace",
      fontSize: 9,
      fontWeight: '600' as const,
      letterSpacing: 0.4,
    },
  },

  // -------------------------------------------------------------
  // 3. SPACING & SIZING (4px Metric Grid)
  // -------------------------------------------------------------
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // -------------------------------------------------------------
  // 4. RADII (Sharp Automotive Instrumentation)
  // -------------------------------------------------------------
  radius: {
    none: 0,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    pill: 9999,
  },
};
```

---

## 4. UI Primitives Specification

All UI components across all tracks will import exclusively from the primitives located in `mobile-app/design-system/`.

### 4.1 `InstrumentPanel` (`mobile-app/design-system/InstrumentPanel.tsx`)
A flat, hairline-bordered container representing a modular audio rack or oscilloscope unit.

**Props API**:
- `title?: string`: Header title in geometric sans.
- `tag?: string`: Monospace status or channel label (e.g. `CH 1/2`, `STAGE 03 // DSP`).
- `statusIndicator?: 'nominal' | 'warning' | 'critical' | 'signal' | 'idle'`: Color-coded hardware status LED.
- `action?: React.ReactNode`: Header right action slot (e.g. bypass button, preset menu).
- `variant?: 'default' | 'elevated' | 'inset' | 'warning' | 'danger'`: Surface style.
- `children: React.ReactNode`: Panel contents.

### 4.2 `Button` (`mobile-app/design-system/Button.tsx`)
Physical console-style button avoiding colored glowing fills.

**Variants**:
- `primary`: Solid `#F1F5F9` background, `#0A0B0D` bold text. Crisp, high-contrast, zero blur shadow.
- `secondary`: Outline `#1E222A` / `#2A2F3A` border with `#E2E8F0` text and `#12151B` background.
- `warning`: Amber-tinted background (`rgba(245, 158, 11, 0.1)`) and border for dangerous operations.
- `danger`: Red-tinted background (`rgba(239, 68, 68, 0.1)`) and border for reset/clipping bypass.
- `ghost`: Transparent with hover highlight.

**Sizes**: `sm` (28px height), `md` (38px height), `lg` (46px height).

### 4.3 `Readout` (`mobile-app/design-system/Readout.tsx`)
Precision right-aligned numeric data block with decoupled unit labeling.

**Props API**:
- `label: string`: Parameter name in UI Sans (e.g. `TIME DELAY`, `TARGET VOLTAGE`, `HPF CUTOFF`).
- `value: string | number`: Measured value formatted in Tabular Mono (e.g. `1.25`, `18.97`, `-1.5`).
- `unit: string`: Unit suffix in monospace (e.g. `ms`, `V AC`, `dB`, `Hz`, `Ω`, `cm`).
- `status?: 'nominal' | 'warning' | 'critical' | 'signal'`: Color tinting for the value.
- `size?: 'sm' | 'md' | 'lg' | 'hero'`: Sizing preset.

### 4.4 `SliderControl` & `DialControl` (`mobile-app/design-system/SliderControl.tsx`, `DialControl.tsx`)
1. **`SliderControl`**: Vertical EQ fader rack with center detent (0 dB), dB calibration marks (-12dB to +12dB), monospace readouts, and `+` / `-` tactile step adjusters.
2. **`DialControl`**: Physical rotary potentiometer dial with clock-face angular readouts (e.g. 9:30 o'clock HPF dial), frequency range notches, and live numeric angle feedback.

---

## 5. `HeroScrollSequence.jsx` Refactoring Blueprint

### 5.1 Stage-by-Stage HUD & Telemetry Overhaul

```
+-----------------------------------------------------------------------------------+
| TOP BAR: [● nominal] CARAUDIO.AI // SCROLLYTELLING ENGINE     [ ▪ ▪ ▪ ▪ Stage 1-4 ]|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                                                                                   |
|                              [ 8K STORYBOARD SHOT ]                               |
|                            [ WebGL Waveform Shader ]                              |
|                                                                                   |
|                                                                                   |
| +-------------------------------------------------------------------------------+ |
| | INSTRUMENT PANEL (HUD STAGE OVERLAY)                                         | |
| | [● Stage Status] STAGE 02 // COCKPIT INGRESS                                 | |
| | Asymmetrical Seating Matrix & Propagation Offset                             | |
| |                                                                               | |
| |  FL (138 cm) ───────────────> (Headrest) <─────────────── FR (95 cm)          | |
| |  [Readout: 1.25 ms Phase Clash]           [Readout: 43 cm Physical Offset]   | |
| +-------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

#### Stage 0: Exterior Scan & Chassis Geometry
- **Tag**: `STAGE 01 // EXTERIOR SCAN` (Monospace, `#94A3B8`)
- **Title**: `Precision Acoustic Baseline`
- **Telemetry**: `CHASSIS VOLUME: 3.20 m³` • `RESONANCE: 200 Hz` • `SEATING: RHD 2-ROW`
- **Visual**: Sharp `#1E222A` hairline border, `#12151B` translucent background.

#### Stage 1: Cockpit Ingress & Asymmetric Seating
- **Tag**: `STAGE 02 // COCKPIT INGRESS`
- **Title**: `Asymmetrical Seating Matrix`
- **Telemetry**: 
  - `FL DISTANCE: 138 cm` (mono)
  - `FR DISTANCE: 95 cm` (mono)
  - `PHASE OFFSET: 1.25 ms` (mono, warning amber tag)
- **Copy**: *"Driver sits 95cm from right speaker vs 138cm from left. 1.25ms acoustic arrival discrepancy detected."*

#### Stage 2: 14-Band Parametric DSP Tuning
- **Tag**: `STAGE 03 // 14-BAND PARAMETRIC DSP`
- **Title**: `Acoustic Notch Compensation`
- **Telemetry Table**:
  - `+5.5 dB @ 63 Hz  [Port Resonance Boost]`
  - `-1.5 dB @ 200 Hz [Cabin Standing Wave Notch]`
  - `-1.0 dB @ 4.0 kHz [Windshield Reflection Tamer]`
- **Formatting**: Tabular monospace with color-coded gain values.

#### Stage 3: Phase Coherence & Live Tuning Studio CTA
- **Tag**: `STAGE 04 // TIME ALIGNMENT`
- **Status Indicator**: Green locked status `● PHASE COHERENCE: 99.8% LOCKED`
- **Title**: `Laser Soundstage Focus`
- **Copy**: *"All 5 speaker waves arriving simultaneously at driver headrest. Ready for physical calibration."*
- **CTA Button**: Solid Chrome `Button` (`variant="primary"`) `Open Live Tuning Studio →` (Zero cyan button background, zero blurry shadow).

### 5.2 WebGL Concentric Soundwave Shader Updates
- Update shader uniforms to use `#22D3EE` `vec3(0.133, 0.827, 0.933)` and `#A78BFA` `vec3(0.655, 0.545, 0.980)`.
- Ensure proper alpha blending and pointer events transparent pass-through.

---

## 6. Comprehensive Implementation Plan Across Tracks 0–4

```
Track 0: Design System Foundation
  ├── mobile-app/design-system/tokens.ts
  ├── mobile-app/design-system/InstrumentPanel.tsx
  ├── mobile-app/design-system/Button.tsx
  ├── mobile-app/design-system/Readout.tsx
  ├── mobile-app/design-system/SliderControl.tsx
  └── mobile-app/design-system/DialControl.tsx
         │
         ├──► Track 1: Hero Scrollytelling Polish (HeroScrollSequence.jsx)
         ├──► Track 2: Precision DSP Dashboard (EQ, Analyser, DMM, Subsonic)
         ├──► Track 3: 4-Step Onboarding Flow & Seating Geometry
         └──► Track 4: High-Trust Razorpay Checkout Screen
```

### Track Breakdown
1. **Track 0 (Design Tokens & Primitives)**:
   - Create `mobile-app/design-system/tokens.ts` and core primitive components.
   - Update `mobile-app/constants/theme.ts` to re-export design tokens.
2. **Track 1 (Hero Scrollytelling Polish)**:
   - Refactor `HeroScrollSequence.jsx` (and its native fallback) to adopt `InstrumentPanel`, `Button`, `Readout`, and strict signal/warning color rules.
3. **Track 2 (Precision DSP Instrumentation Dashboard)**:
   - Implement interactive 14-band Bezier EQ curve with draggable nodes.
   - Build real-time Web Audio `AnalyserNode` frequency spectrum bar visualizer.
   - Integrate physical Linkwitz-Riley 24dB crossover dials, subsonic filter safety amber warnings, and DMM AC voltage calculator ($V = \sqrt{P \times R}$).
4. **Track 3 (Vehicle Seating & Geometry Onboarding Flow)**:
   - Refactor 4-step wizard (Make ➔ Model ➔ Hardware ➔ Tuning) with vehicle cabin geometry badges, RHD seating distance diagrams, and minimal phone OTP auth.
5. **Track 4 (High-Trust Payment & Checkout Screen)**:
   - Implement clean Razorpay subscription checkout modal with monospace line-item summaries and zero decorative SaaS gradients.

---

## 7. Verification Method
- **Static Build & Bundling**: Run `npx expo export --platform web` in `mobile-app/` to verify zero bundling or syntax errors.
- **Design Token Compliance Audit**: Grep across `mobile-app/` for rogue hardcoded hex values (`#06b6d4`, `#2563eb`, etc.) outside `tokens.ts`.
- **Responsive Layout Verification**: Verify rendering across viewport widths from 375px (mobile) to 1440px+ (desktop).
