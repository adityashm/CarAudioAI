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
