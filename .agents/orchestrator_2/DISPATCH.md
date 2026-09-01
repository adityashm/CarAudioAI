# Dispatch Log

## 2026-09-01T15:41:58+05:30
You are the Project Orchestrator for the CarAudioAI project.

Your working directory is: c:/Users/aditya/Downloads/CarAudioAI/.agents/orchestrator_2
Your root workspace is: c:/Users/aditya/Downloads/CarAudioAI
Authoritative request: c:/Users/aditya/Downloads/CarAudioAI/.agents/ORIGINAL_REQUEST.md (specifically the latest request dated 2026-09-01T15:40:46+05:30).

## Objective
Build the complete CarAudioAI frontend UI/UX across Web + Mobile (Expo / React Native Web) as a precision automotive acoustic tuning and DSP calibration platform for Indian car audio installers and enthusiasts, styled after professional mixing consoles, oscilloscopes, and modern automotive HMI instrumentation rather than generic SaaS dashboards.

## Core Design Foundations & Aesthetic Rules
- Base Environment: Near-black studio background (#0A0B0D), dark garage aesthetic.
- Signal Color Discipline: Cyan (#22D3EE / #06B6D4) for primary waveform/EQ traces, purple (#A78BFA) for secondary/phase data — reserved strictly for live signal visualization, never for buttons or decorative gradients.
- Chrome & Structure: Flat panels with hairline neutral gray borders (#1E222A, #2A2F3A), no soft blurry SaaS drop-shadows.
- Instrumentation Warning: Amber-red (#F59E0B / #EF4444) strictly reserved for clipping, voice-coil overheating, and cone-unloading warnings.
- Typography Matrix: Geometric sans for UI chrome / controls, monospace font for ALL numeric measurements (dB, Hz, ms, Ω, V AC) to clearly differentiate measured data from interface copy.

## Requirements
- R1. Track 0 — Design System Foundation & Primitives: Create shared design tokens module (mobile-app/design-system/tokens.ts and UI primitives) exporting color ramps, typography styles (UI sans + data mono), hairline-bordered InstrumentPanel, Button (solid primary vs outline secondary), Readout (right-aligned unit-labeled numeric display), and physical console-style slider/dial controls that all other components must import from.
- R2. Track 1 — Hero Scrollytelling Polish: Refactor and polish HeroScrollSequence.jsx against Track 0's design tokens, ensuring all HUD telemetry, phase coherence tags, and acoustic status overlays strictly utilize the monospace data font and signal color rules.
- R3. Track 2 — Precision DSP Instrumentation Dashboard: Build the core tuning screen as a professional audio instrumentation console: Interactive 14-band parametric/graphic EQ curve visualizer with draggable nodes and live Bezier trace; real-time spectrum analyzer driven by Web Audio API AnalyserNode; Linkwitz-Riley 24dB crossover dials, ported enclosure subsonic filter control (~28Hz for 35Hz box), and millisecond time-alignment delay readouts per channel; Multimeter gain-staging calculator outputting large mono AC target voltages (V = sqrt(P * R)) with explicit formula context.
- R4. Track 3 — Vehicle Seating & Geometry Onboarding Flow: Implement the sequential 4-step onboarding flow (Make -> Model -> Audio Hardware -> DSP Calibration) featuring Indian vehicles (Skoda Kylaq, Maruti Swift, Hyundai Creta, Mahindra Thar) with real seating distance implications (asymmetric RHD time-alignment) and minimal, uncluttered phone OTP authentication.
- R5. Track 4 — High-Trust Payment & Checkout Screen: Implement a clean, conventional, high-trust checkout interface for Razorpay subscription tiers (₹99/mo Pro, ₹999/yr Installer) displaying line-item summaries in monospace numerals without distracting decorative styling.

## Acceptance Criteria & Guardrails
- All components across all tracks import color, type, and spacing exclusively from mobile-app/design-system/tokens.ts (zero hardcoded hex values or fonts).
- Every numeric measurement (dB, Hz, ms, Ω, V AC) is rendered in monospace font with distinct unit labeling.
- Signal colors (cyan/purple) are strictly confined to waveforms, EQ splines, and live phase meters.
- Panels use flat hairline borders with zero soft floating SaaS drop-shadows.
- EQ curve visualizer allows real-time interactive node dragging and live curve updates.
- In-browser Web Audio tone generator and AnalyserNode spectrum bar visualizer function smoothly.
- Subsonic safety filter triggers amber warning if frequency is set below ported enclosure tuning point.
- Expo static build exports cleanly with zero syntax or bundling errors (npx expo export --platform web).
- Responsive layout verified for mobile phone screens down to 375px width.
