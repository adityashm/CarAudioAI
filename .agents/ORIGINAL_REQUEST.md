# Original User Request

## 2026-09-01T15:03:05+05:30

An AI-powered automotive acoustic tuning and DSP calibration platform tailored for Indian vehicles (e.g., Skoda Kylaq, Creta, Swift, Thar, Fortuner) that provides an end-to-end multi-step wizard (Make ➔ Model ➔ Installed Audio Hardware ➔ AI Acoustic Tuning Dashboard) with real-time soundfield simulation, 14-band Bezier spline EQ optimization, millisecond time alignment, amplifier gain staging, in-browser audio test tone synthesis, and DSP configuration export.

Working directory: c:/Users/aditya/Downloads/CarAudioAI
Integrity mode: development

## Requirements

### R1. Multi-Step Automotive & Audio Equipment Wizard
Implement a guided 4-step configurator flow (Step 1: Select Make from 9+ Indian manufacturers ➔ Step 2: Select Model from 25+ vehicle cabins with acoustic geometries ➔ Step 3: Configure Installed Equipment including head units, 2-way components, coaxials, amplifiers, and custom ported/sealed subwoofers ➔ Step 4: Live AI Acoustic Tuning Dashboard).

### R2. Acoustic Calculation & Gain Staging Engine
Calculate millimeter-accurate time alignment delays for asymmetric Indian RHD driving positions ($Delay = \Delta Dist / 34.3\text{ cm/ms}$), Linkwitz-Riley 24dB crossover slopes with ported enclosure subsonic protection, and multimeter target AC voltages ($V = \sqrt{P \times R}$) for 75% volume gain staging.

### R3. Interactive Soundfield Simulation & Bezier Equalizer
Provide a real-time 60FPS HTML5 canvas wave propagation simulator showing time alignment wave convergence at the driver's headrest, a continuous mathematical Bezier spline 14-band EQ curve reacting to sound profiles (SQL Punjabi/EDM/Hip-Hop, Harman Reference, Vocal Clarity), and an in-browser Web Audio test tone generator (1kHz, 50Hz, Pink Noise).

### R4. Complete Backend APIs, Auth, Payments & DSP Exporter
Provide production-ready FastAPI REST endpoints for phone OTP auth (Twilio Verify), subscription management with Razorpay payment processing (Free, Pro @ ₹99/mo, Installer @ ₹999/yr), frequency response measurement smoothing, and one-click DSP export (Pioneer DEH-80PRS XML & MiniDSP JSON).

## Acceptance Criteria

### Configurator & Tuning Workflow
- [ ] Users can browse 9+ Indian car makes (Skoda, Maruti, Hyundai, Tata, Mahindra, Toyota, Kia, VW, Honda) and select from 25+ models with exact cabin dimensions.
- [ ] Hardware configurator supports custom head units, component sets, coaxials, multi-channel amplifiers, and ported/sealed subwoofers.
- [ ] Live canvas renders 60FPS in-cabin soundfield wave propagation with an interactive Time Alignment toggle.
- [ ] 14-band Bezier spline equalizer dynamically adjusts across SQL, Harman Reference, and Vocal Clarity profiles with live dB readouts.

### Technical & Verification Guardrails
- [ ] All 14 backend acoustic calculation test cases pass with automated test runner (`pytest backend/tests`).
- [ ] Web build exports cleanly with zero syntax or bundling errors (`npx expo export --platform web`).
- [ ] In-browser Web Audio test tone generator produces 1,000 Hz, 50 Hz, and Pink Noise.
- [ ] Multimeter AC target voltages match theoretical RMS power equations ($V = \sqrt{P \times R}$) without clipping.
- [ ] DSP export generates valid Pioneer XML and MiniDSP JSON files.
- [ ] Verified against the specific Skoda Kylaq setup (Nakamichi NAM5510 + MOCO AF-04 + Sound Barrier SB-654 + Sony XS-162GS + Pioneer TS-W307D4 35Hz ported).

## 2026-09-01T15:40:46+05:30

Build the complete CarAudioAI frontend UI/UX across Web + Mobile (Expo / React Native Web) as a precision automotive acoustic tuning and DSP calibration platform for Indian car audio installers and enthusiasts, styled after professional mixing consoles, oscilloscopes, and modern automotive HMI instrumentation rather than generic SaaS dashboards.

Working directory: c:/Users/aditya/Downloads/CarAudioAI
Integrity mode: development

## Design Foundations & Aesthetic Rules

- **Base Environment**: Near-black studio background (`#0A0B0D`), dark garage aesthetic.
- **Signal Color Discipline**: Cyan (`#22D3EE` / `#06B6D4`) for primary waveform/EQ traces, purple (`#A78BFA`) for secondary/phase data — reserved strictly for live signal visualization, never for buttons or decorative gradients.
- **Chrome & Structure**: Flat panels with hairline neutral gray borders (`#1E222A`, `#2A2F3A`), no soft blurry SaaS drop-shadows.
- **Instrumentation Warning**: Amber-red (`#F59E0B` / `#EF4444`) strictly reserved for clipping, voice-coil overheating, and cone-unloading warnings.
- **Typography Matrix**: Geometric sans for UI chrome / controls, monospace font for ALL numeric measurements (dB, Hz, ms, Ω, V AC) to clearly differentiate measured data from interface copy.

## Requirements

### R1. Track 0 — Design System Foundation & Primitives
Create a shared design tokens module (`mobile-app/design-system/tokens.ts` and UI primitives) exporting color ramps, typography styles (UI sans + data mono), hairline-bordered `InstrumentPanel`, `Button` (solid primary vs outline secondary), `Readout` (right-aligned unit-labeled numeric display), and physical console-style slider/dial controls that all other components must import from.

### R2. Track 1 — Hero Scrollytelling Polish
Refactor and polish `HeroScrollSequence.jsx` against Track 0's design tokens, ensuring all HUD telemetry, phase coherence tags, and acoustic status overlays strictly utilize the monospace data font and signal color rules.

### R3. Track 2 — Precision DSP Instrumentation Dashboard
Build the core tuning screen as a professional audio instrumentation console:
- Interactive 14-band parametric/graphic EQ curve visualizer with draggable nodes and live Bezier trace.
- Real-time spectrum analyzer driven by Web Audio API `AnalyserNode`.
- Linkwitz-Riley 24dB crossover dials, ported enclosure subsonic filter control (~28Hz for 35Hz box), and millisecond time-alignment delay readouts per channel.
- Multimeter gain-staging calculator outputting large mono AC target voltages ($V = \sqrt{P \times R}$) with explicit formula context.

### R4. Track 3 — Vehicle Seating & Geometry Onboarding Flow
Implement the sequential 4-step onboarding flow (Make ➔ Model ➔ Audio Hardware ➔ DSP Calibration) featuring Indian vehicles (Skoda Kylaq, Maruti Swift, Hyundai Creta, Mahindra Thar) with real seating distance implications (asymmetric RHD time-alignment) and minimal, uncluttered phone OTP authentication.

### R5. Track 4 — High-Trust Payment & Checkout Screen
Implement a clean, conventional, high-trust checkout interface for Razorpay subscription tiers (₹99/mo Pro, ₹999/yr Installer) displaying line-item summaries in monospace numerals without distracting decorative styling.

## Acceptance Criteria

### Instrumentation & Styling Guardrails
- [ ] All components across all tracks import color, type, and spacing exclusively from `mobile-app/design-system/tokens.ts` (zero hardcoded hex values or fonts).
- [ ] Every numeric measurement (dB, Hz, ms, Ω, V AC) is rendered in monospace font with distinct unit labeling.
- [ ] Signal colors (cyan/purple) are strictly confined to waveforms, EQ splines, and live phase meters.
- [ ] Panels use flat hairline borders with zero soft floating SaaS drop-shadows.

### Functional & Verification Guardrails
- [ ] EQ curve visualizer allows real-time interactive node dragging and live curve updates.
- [ ] In-browser Web Audio tone generator and AnalyserNode spectrum bar visualizer function smoothly.
- [ ] Subsonic safety filter triggers amber warning if frequency is set below ported enclosure tuning point.
- [ ] Expo static build exports cleanly with zero syntax or bundling errors (`npx expo export --platform web`).
- [ ] Responsive layout verified for mobile phone screens down to 375px width.
