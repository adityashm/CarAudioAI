# Project: CarAudioAI Platform

## Architecture
CarAudioAI is an AI-powered automotive acoustic tuning and DSP calibration platform tailored for Indian vehicles and listening preferences.

### System Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Expo SDK 54 / React Native)            │
│  ┌───────────────────────────┐  ┌───────────────────────────────────┐  │
│  │   Hero Scrollytelling     │  │   4-Step Indian Vehicle Wizard    │  │
│  │   (HeroScrollSequence.jsx)│  │   (Make, Model, Gear, Studio)     │  │
│  └─────────────┬─────────────┘  └─────────────────┬─────────────────┘  │
│                │                                  │                    │
│  ┌─────────────▼──────────────────────────────────▼─────────────────┐  │
│  │                     6-Tab Live Studio Dashboard                  │  │
│  │  1. 60FPS Wave Simulator  2. 14-Band Bezier EQ  3. Crossovers    │  │
│  │  4. DMM Gain Staging      5. Tone Generator     6. DSP Exporter  │  │
│  └─────────────────────────────┬────────────────────────────────────┘  │
│                                │ Axios API Client Layer                │
│                                │ (api.ts, authService, paymentService) │
└────────────────────────────────┼───────────────────────────────────────┘
                                 │ HTTP REST / JSON
┌────────────────────────────────▼───────────────────────────────────────┐
│                        BACKEND (FastAPI / Python 3.10+)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ /api/auth    │  │ /api/cars    │  │ /api/equipment│ │ /api/tuning│  │
│  │ (OTP/JWT)    │  │ (25+ Models) │  │ (Catalog)    │  │ (Acoustics)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │ /api/payments│  │/api/measure- │  │ Acoustic Engines:            │  │
│  │ (Razorpay)   │  │  ments (RTA) │  │ • Time Alignment (34.3cm/ms) │  │
│  └──────────────┘  └──────────────┘  │ • Linkwitz-Riley 24dB & Subs │  │
│                                      │ • DMM Voltages V=sqrt(P*R)   │  │
│                                      │ • Pioneer XML / MiniDSP JSON │  │
│                                      └──────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Feature Inventory
Every feature extracted during Phase 0 Survey is mapped to a milestone below:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Indian Vehicle Catalog | 9 makes, 25+ models with cabin wheelbase, volume, resonant frequency, RHD speaker distances (Skoda Kylaq, Thar Roxx, Creta, Nexon, etc.) | M1 | Survey |
| 2 | Audio Equipment Selection | Head units, 2-way components, coaxials, Class D amps, ported/sealed subwoofers with RMS/impedance specs | M1 | Survey |
| 3 | Wizard State Management | 4-step interactive flow with persistent state, search, and validation | M1 | Survey |
| 4 | Speed of Sound & Distance Calc | Physical speed of sound (34.3 cm/ms @ 20°C) with exact RHD driver-to-speaker delta calculations | M2 | Survey |
| 5 | Time Alignment Calibration | Furthest speaker baseline (0.00ms delay for Sub), calculated ms delay, and 48kHz sample offsets | M2 | Survey |
| 6 | Crossover Networks | Linkwitz-Riley 24dB/oct (HPF/LPF) cutoffs, Butterworth slopes, and rear fill attenuation (-4dB) | M2 | Survey |
| 7 | Subsonic Protection Engine | Ported enclosure protection rule: $F_{\text{subsonic}} = \max(20, \text{round}(F_{\text{tune}} - 7\text{ Hz}))$ | M2 | Survey |
| 8 | Gain Staging & Multimeter Target AC Voltages | 75% max clean volume limit (Step 30/40) and Multimeter AC calibration targets via $V = \sqrt{P \times R}$ | M2 | Survey |
| 9 | 14-Band Parametric EQ Optimizer | ISO 1/3-octave frequencies (32Hz–16kHz) with SQL Punjabi/Hip-Hop and Harman curve offsets (-1.5dB @ 200Hz, -1dB @ 4kHz, +5.5dB @ 63Hz) | M2 | Survey |
| 10 | 60FPS Soundfield Wave Simulator | Top-down 2D canvas wave propagation with phase-locked wavefronts representing time-aligned acoustic convergence | M3 | Survey |
| 11 | Continuous Bezier Equalizer UI | Interactive 14-band Bezier spline frequency response curve with $\pm 0.5\text{dB}$ fine steppers and visual gain fills | M3 | Survey |
| 12 | Web Audio Tone Generator | Synthesis of 1kHz calibration sine, 50Hz sub-bass sine, and Paul Kellet 3-pole Pink Noise | M3 | Survey |
| 13 | Masterclass Knowledge Base | Educational guide for time alignment, crossover theory, gain staging, and Indian cabin boom troubleshooting | M3 | Survey |
| 14 | REST API Backend & Data Fallbacks | Complete FastAPI endpoints (`/api/cars`, `/api/equipment`, `/api/tuning/calculate`) with standalone JSON catalog fallbacks | M4 | Survey |
| 15 | Twilio OTP & JWT Auth | Phone OTP verification flow with dev fallback (`123456`) and secure HS256 JWT tokens | M4 | Survey |
| 16 | Razorpay Subscription Payments | Subscription tiers (Free, Pro @ ₹99/mo, Installer @ ₹999/yr) with HMAC-SHA256 signature verification | M4 | Survey |
| 17 | DSP Exporter Services | Pioneer DEH-80PRS XML exporter and MiniDSP 2x4 HD JSON preset generator with one-click direct downloads | M4 | Survey |
| 18 | RTA Frequency Smoothing | 1/3-octave moving average convolution for microphone acoustic measurement uploads | M4 | Survey |
| 19 | Frontend-Backend API Client Integration | Full Axios service layer connecting UI with auth, tuning calculation, measurements, and payments | M4 | Survey |
| 20 | E2E Testing Suite (Tiers 1–4) | Automated pytest suite (14+ test cases) and cross-module E2E verification | M5 | Survey |
| 21 | Clean Expo Web Export | `npx expo export --platform web` static bundle generation with 0 errors | M5 | Survey |
| 22 | Adversarial Hardening (Tier 5) | Boundary stress tests, acoustic anomaly tests, edge cases, and security audit | M6 | Survey |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Configurator & Indian Vehicle Catalog | Features 1, 2, 3: 4-step wizard, 25+ Indian car profiles, hardware catalog, selection state | None | PLANNED |
| M2 | Acoustic & DSP Calculation Engine | Features 4, 5, 6, 7, 8, 9: Time alignment, crossovers, subsonic protection, gain staging, EQ optimization | None | PLANNED |
| M3 | Interactive Visualizations & Audio Synthesis | Features 10, 11, 12, 13: 60FPS canvas simulator, Bezier spline EQ, Web Audio tone generators, Explore masterclass | M1, M2 | PLANNED |
| M4 | Backend APIs, Auth, Payments & DSP Exporter | Features 14, 15, 16, 17, 18, 19: FastAPI routers, JWT auth, Razorpay flow, DSP exporters, Axios frontend client | M1, M2 | PLANNED |
| M5 | System Integration & E2E Test Suite | Features 20, 21: Full pytest suite execution, Expo web export verification (`npx expo export --platform web`), zero errors | M1-M4 | PLANNED |
| M6 | Adversarial Hardening (Tier 5) | Feature 22: Boundary testing, extreme cabin dimensions, anomalous impedances, corrupted tokens, edge-case coverage | M5 | PLANNED |

---

## Interface Contracts

### 1. `POST /api/tuning/calculate`
- **Request Body**:
```json
{
  "car_id": "skoda_kylaq_2025",
  "seat_position": "driver_rhd",
  "sound_preference": "sql_punjabi",
  "head_unit": { "brand": "Nakamichi", "model": "NAM5510", "preout_voltage": 4.0, "max_volume_steps": 40 },
  "front_speakers": { "brand": "Sony", "model": "XS-162GS", "size_inches": 6.5, "rms_watts": 45, "impedance_ohms": 4 },
  "rear_speakers": { "brand": "Sony", "model": "XS-162GS Coaxial", "size_inches": 6.5, "rms_watts": 45, "impedance_ohms": 4 },
  "amplifier_front_rear": { "brand": "Sound Barrier", "model": "SB-654", "channels": 4, "rms_per_channel_4ohm": 65 },
  "subwoofer": { "brand": "Pioneer", "model": "TS-W307D4", "size_inches": 12, "rms_watts": 250, "impedance_ohms": 8, "enclosure_type": "ported", "tuning_frequency_hz": 35.0 },
  "amplifier_subwoofer": { "brand": "MOCO", "model": "AF-04", "channels": 1, "rms_per_channel_4ohm": 250 }
}
```
- **Response Body**:
```json
{
  "time_alignment": {
    "delays_ms": { "FL": 2.10, "FR": 3.35, "RL": 1.60, "RR": 2.77, "SUB": 0.00 },
    "furthest_speaker": "SUB",
    "speed_of_sound_cm_per_ms": 34.3
  },
  "crossovers": {
    "front": { "type": "Linkwitz-Riley", "order": 4, "slope_db_oct": 24, "hpf_hz": 80.0 },
    "rear": { "type": "Linkwitz-Riley", "order": 4, "slope_db_oct": 24, "hpf_hz": 90.0, "gain_offset_db": -4.0 },
    "subwoofer": { "type": "Linkwitz-Riley", "order": 4, "slope_db_oct": 24, "lpf_hz": 80.0, "subsonic_hpf_hz": 28.0 }
  },
  "gain_staging": {
    "head_unit_clean_volume_limit": 30,
    "target_voltages_ac": { "front": 13.42, "rear": 10.39, "subwoofer": 44.72 }
  },
  "equalizer_14_band": {
    "curve_name": "sql_punjabi",
    "bands_db": [4.0, 5.5, 4.0, -1.5, 0.0, 0.0, 0.0, 0.5, 1.0, -1.0, 0.5, 1.5, 2.0, 1.0]
  }
}
```

### 2. `POST /api/auth/send-otp` & `POST /api/auth/verify-otp`
- `send-otp`: `{ "phone_number": "+919876543210" }` -> `{ "status": "pending", "message": "OTP sent" }`
- `verify-otp`: `{ "phone_number": "+919876543210", "code": "123456" }` -> `{ "access_token": "...", "token_type": "bearer", "user": { ... } }`

### 3. `POST /api/payments/create-order` & `POST /api/payments/verify-payment`
- `create-order`: `{ "plan_type": "pro_monthly" | "installer_yearly" }` -> `{ "order_id": "order_mock_...", "amount": 9900, "currency": "INR" }`
- `verify-payment`: `{ "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }` -> `{ "success": true, "subscription": { ... } }`

---

## Code Layout
- `mobile-app/app/(tabs)/index.tsx`: Main Configurator Wizard, Hero Scrollytelling, and Studio Tabs.
- `mobile-app/components/HeroScrollSequence.jsx`: Scrollytelling Hero sequence with WebGL shader and Web Audio SFX.
- `mobile-app/components/`: Modular UI components (AuthModal, PaymentModal, BezierEQCanvas, SoundfieldCanvas, ExportModal).
- `mobile-app/constants/catalog.ts`: Indian Car Catalog (9 makes, 25+ models) and Hardware Equipment specifications.
- `mobile-app/services/`: Frontend API integration layer (`api.ts`, `authService.ts`, `paymentService.ts`, `tuningService.ts`).
- `backend/app/main.py`: FastAPI server setup, CORS middleware, router registration.
- `backend/app/algorithms/`: Acoustic math engines (`time_alignment.py`, `crossover.py`, `gain_staging.py`, `eq_optimizer.py`, `dsp_export.py`).
- `backend/app/routers/`: REST endpoint routers (`auth.py`, `cars.py`, `equipment.py`, `tuning.py`, `payments.py`, `measurements.py`).
- `backend/app/data/`: `indian_cars.json` and `equipment.json`.
- `backend/tests/`: Pytest automated test suite (`test_tuning_engine.py`).
