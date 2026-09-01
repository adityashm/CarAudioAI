# Frontend Codebase Investigation Report: CarAudioAI

**Date**: 2026-09-01  
**Agent**: Explorer Codebase (`.agents/explorer_codebase`)  
**Scope**: Comprehensive analysis of the existing frontend codebase in `c:/Users/aditya/Downloads/CarAudioAI/mobile-app`, architecture, dependencies, UI/UX components, state management, audio engines, visualization layers, web platform export compatibility, and backend API integration surface.

---

## Executive Summary

CarAudioAI is an AI-powered automotive acoustic tuning and DSP calibration platform tailored for the Indian automotive market (Skoda, Maruti Suzuki, Hyundai, Tata, Mahindra, Toyota, Kia, Volkswagen, Honda). The frontend is an **Expo SDK 54 / React Native 0.81 / React 19** application featuring:
1. A cinematic **Framer Motion 4-stage scrollytelling hero experience** with WebGL shader wave overlays and Web Audio SFX (`components/HeroScrollSequence.jsx`).
2. A **4-step automotive audio configurator wizard** (Make ➔ Model ➔ Audio Gear ➔ AI Tuning Dashboard).
3. A **6-tab live tuning studio** equipped with an HTML5 60FPS in-cabin soundfield wave propagation simulator, a 14-band Bezier spline parametric equalizer, physical amplifier crossover dials, multimeter target AC voltage calculator ($V = \sqrt{P \times R}$), Web Audio test tone synthesizer (1kHz, 50Hz, Pink Noise), and DSP file exporter (Pioneer DEH-80PRS XML & MiniDSP JSON).
4. An educational **Acoustic Masterclass & Troubleshooting guide** (`app/(tabs)/explore.tsx`).

---

## 1. Directory Structure, Package & Platform Configurations

### 1.1 Directory Tree Overview
```
c:/Users/aditya/Downloads/CarAudioAI/
├── backend/                       # FastAPI REST API (Port 8000)
│   ├── app/
│   │   ├── algorithms/            # crossover.py, time_alignment.py, eq_optimizer.py, gain_staging.py, dsp_export.py
│   │   ├── data/                  # indian_cars.json (19+ cars), equipment.json (20+ audio gear items)
│   │   ├── models/                # 7 SQLAlchemy models (user, car, equipment, user_equipment, measurement, tuning_profile, payment)
│   │   ├── routers/               # auth.py, cars.py, equipment.py, tuning.py, payments.py, measurements.py
│   │   ├── schemas/               # Pydantic schemas (tuning.py)
│   │   └── main.py                # FastAPI entry with CORS
│   └── tests/                     # test_tuning_engine.py (14 backend test cases)
│
├── mobile-app/                    # Expo / React Native Web application
│   ├── app/
│   │   ├── _layout.tsx            # Root Stack Navigator with ThemeProvider & StatusBar
│   │   ├── modal.tsx              # Modal screen
│   │   └── (tabs)/
│   │       ├── _layout.tsx        # Bottom Tabs (Home & Explore) with HapticTab & IconSymbol
│   │       ├── index.tsx          # Main Screen: Scrollytelling Hero + 4-Step Configurator & Studio
│   │       └── explore.tsx        # Masterclass & Acoustic Troubleshooting Guide
│   ├── assets/
│   │   └── images/                # App icon, splash, shot1_exterior.jpg, shot2_door_open.jpg, shot3_touchscreen.jpg, shot4_soundwaves.jpg
│   ├── components/
│   │   ├── HeroScrollSequence.jsx # Scrollytelling with Framer Motion, WebGL Shader, Web Audio SFX
│   │   ├── external-link.tsx
│   │   ├── haptic-tab.tsx
│   │   ├── hello-wave.tsx
│   │   ├── parallax-scroll-view.tsx
│   │   ├── themed-text.tsx
│   │   ├── themed-view.tsx
│   │   └── ui/                    # collapsible.tsx, icon-symbol.tsx, icon-symbol.ios.tsx
│   ├── constants/
│   │   ├── catalog.ts             # 9 Indian makes, 25+ models with cabin geometries, head units, speakers, amps, subwoofers
│   │   └── theme.ts               # Colors, system font families (iOS/Android/Web)
│   ├── hooks/
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   └── use-theme-color.ts
│   ├── metro.config.js            # Metro bundler config with .mjs and .cjs resolver support
│   ├── app.json                   # Expo configuration with static web export & typed routes
│   ├── tsconfig.json              # TypeScript config with @/* path aliases
│   └── package.json               # Dependencies & scripts
```

### 1.2 Dependencies Breakdown
- **Core Framework**: `expo: ~54.0.33`, `react: 19.1.0`, `react-dom: 19.1.0`, `react-native: 0.81.5`, `expo-router: ~6.0.23`.
- **Web & Animations**: `react-native-web: ~0.21.0`, `framer-motion: ^13.1.1`, `react-native-reanimated: ~4.1.1`, `react-native-worklets: 0.5.1`.
- **Audio & Visuals**: `expo-audio: ^55.0.12`, `react-native-svg: ^15.15.4`, `react-native-chart-kit: ^6.12.0`.
- **UI & Device**: `react-native-paper: ^5.15.0`, `expo-haptics: ~15.0.8`, `expo-image: ~3.0.11`, `expo-symbols: ~1.0.8`, `@expo/vector-icons: ^15.0.3`.
- **Networking & State/Utils**: `axios: ^1.14.0`, `@react-native-async-storage/async-storage: ^3.0.2`, `i18next: ^26.0.3`, `react-i18next: ^17.0.2`.

### 1.3 Web Platform Support & Metro Resolution
- `app.json` configures:
  - `web.output: "static"` (Static site generation / bundle export).
  - `experiments.baseUrl: "/CarAudioAI"` (For GitHub Pages and subpath deployment).
  - `experiments.reactCompiler: true`, `experiments.typedRoutes: true`.
- `metro.config.js`:
  - Adds `.mjs` and `.cjs` to `resolver.sourceExts` to resolve modern ESM/CJS packages like `framer-motion`.
- `HeroScrollSequence.jsx` handles platform branching cleanly:
  - `Platform.OS === 'web'` runs Framer Motion + WebGL Canvas Shader + Web Audio API.
  - `Platform.OS !== 'web'` runs `NativeFallbackSlideshow` with automatic image cycling.

---

## 2. UI Screens, Components, State Management & Styling

### 2.1 Navigation & Screen Architecture
1. **Root Stack** (`app/_layout.tsx`):
   - `ThemeProvider` using `react-navigation`.
   - Stack contains `(tabs)` and modal `modal`.
2. **Bottom Tabs** (`app/(tabs)/_layout.tsx`):
   - Tab 1: **Home** (`index.tsx`) with House icon.
   - Tab 2: **Explore** (`explore.tsx`) with Paperplane icon.
3. **Home Screen Dual Views** (`app/(tabs)/index.tsx`):
   - **View 1: `currentView === 'landing'`**: Cinematic scrollytelling hero sequence, feature cards, physical comparison matrix (Untuned vs CarAudioAI Calibrated), quick CTA buttons.
   - **View 2: `currentView === 'studio'`**: The core 4-step wizard and 6-tab studio.

### 2.2 State Management
- All active configurator states are managed locally via React hooks (`useState`, `useEffect`, `useRef`) in `app/(tabs)/index.tsx`:
  - `wizardStep`: `1 | 2 | 3 | 4`
  - `selectedMake`: `VehicleMake` (default: Skoda)
  - `selectedCar`: `CarModelData` (default: Kylaq 2025)
  - `selectedHeadUnit`: Head unit configuration (Nakamichi NAM5510)
  - `selectedFrontSpeaker`: Front speaker configuration (Sony XS-162GS)
  - `selectedRearSpeaker`: Rear speaker configuration (Sony Coaxial)
  - `selectedAmplifier`: Amplifier configuration (MOCO AF-04 + Sound Barrier SB-654)
  - `selectedSubwoofer`: Subwoofer configuration (Pioneer TS-W307D4 Ported 35Hz)
  - `soundProfile`: `'sql' | 'harman' | 'vocal'`
  - `studioTab`: `'simulation' | 'eq' | 'crossover' | 'gain' | 'tones' | 'export'`
  - `timeAlignmentEnabled`: `boolean`
  - `isPlayingTone`: `string | null`
  - `eqGains`: `number[]` (14 frequency bands)

### 2.3 Styling Architecture
- Pure React Native `StyleSheet.create` with custom dark luxury design system:
  - Backgrounds: Dark slate/navy (`#020617`, `#070d18`, `#0a101f`, `#0f172a`).
  - Accents: Electric Cyan (`#06b6d4`, `#38bdf8`), Emerald Green (`#10b981`), Amber Gold (`#f59e0b`), Crimson Red (`#ef4444`).
  - Borders: Glassmorphism borders (`rgba(255,255,255,0.08)`, `rgba(6,182,212,0.3)`).
  - Typography: Monospace telemetry tags, bold headers, and micro-badges.

---

## 3. Configurator Steps, Visualizations & Audio Engines

### 3.1 Step-by-Step Configurator Details
| Step | Description | Implementation Details |
|---|---|---|
| **Step 1: Select Make** | 9 Indian Car Brands (Škoda, Maruti Suzuki, Hyundai, Tata, Mahindra, Toyota, Kia, VW, Honda) | Search filter by brand name and model name. Displays country of origin, badge accent, and model count. Auto-advances to Step 2 upon selection. |
| **Step 2: Select Model** | 25+ Specific Cabin Geometries | Displays Wheelbase (mm), Cabin Volume ($m^3$), Cabin Standing Resonance (Hz), Speaker sizes, Tweeter locations, and Max door depths. Auto-advances to Step 3. |
| **Step 3: Equipment Config** | 5 Hardware Subsystems | Interactive option chips for: 1. Head Unit (6 items), 2. Front Speakers (6 items), 3. Rear Speakers (6 items), 4. Amplifiers (5 items), 5. Subwoofer & Enclosure (7 items). |
| **Step 4: AI Tuning Dashboard** | Dynamic Calibration & 6 Studio Tabs | Sound Profile selector (🔥 SQL Punjabi/EDM/Hip-Hop, 🎵 Harman Reference, 🎙️ Vocal Clarity). Active vehicle hardware summary card. |

### 3.2 6 Studio Tabs & Visualizations
1. **`🌊 Live Soundfield` Tab**:
   - **Canvas 2D Wave Propagation**: Renders 2D top-down car chassis wireframe, front/rear seats, center console, and 5 speaker emitters (FL, FR, RL, RR, SUB).
   - **Time Alignment Convergence**: Animated concentric circular wavefronts propagate from each speaker. When Time Alignment is ON, wavefronts are delayed by $\Delta t = (MaxDist - Dist) / 34.3\text{ cm/ms}$ so all waves arrive at the driver's headrest in phase.
   - **Delay Data Table**: Displays exact speaker distances, physical offsets, and delay in milliseconds.
2. **`🎚️ Bezier EQ Curve` Tab**:
   - **Canvas Bezier Splines**: Continuous mathematical curve connecting 14 ISO center frequencies (32, 63, 100, 200, 400, 630, 1k, 2k, 4k, 8k, 10k, 12k, 14k, 16k Hz) with glowing cyan stroke and gradient fill under the curve.
   - **Interactive Stepper Rack**: 14 vertical sliders with `+` / `-` steppers adjusting gain by $\pm 0.5\text{dB}$, color-coded green (+dB) / red (-dB) / white (0dB).
   - **Acoustic Offsets**: Dynamic notch filter at cabin standing frequency (e.g. -1.5dB @ 200Hz for Kylaq), sub-bass boost (+5.5dB @ 63Hz), and windshield reflection tamer (-1.0dB @ 4kHz).
3. **`🎛️ Crossovers & Dials` Tab**:
   - Linkwitz-Riley 24dB crossover slope dial instructions for physical amplifiers.
   - Front HPF (~80Hz / 9:30 o'clock), Rear HPF (~90Hz / 10:00 o'clock), Sub LPF (~80Hz / 10:30 o'clock).
   - Ported Box Subsonic Safety Protection: Cutoff set to $TuneHz - 7\text{Hz}$ (e.g. 28Hz for 35Hz box) with safety cone unloading warning.
4. **`⚡ Multimeter Voltages` Tab**:
   - Target AC voltage output based on theoretical RMS power formula: $V = \sqrt{P \times R}$.
   - Front CH1/2: $V = \sqrt{45\text{W} \times 4\Omega} = 13.42\text{V AC}$ (1kHz 0dB sine).
   - Rear CH3/4: $V = \sqrt{45\text{W} \times 0.6 \times 4\Omega} = 10.39\text{V AC}$ (1kHz 0dB sine).
   - Subwoofer: $V = \sqrt{250\text{W} \times 8\Omega} = 44.72\text{V AC}$ (50Hz 0dB sine).
   - Instructions for volume calibration at 75% (Vol 30) with flat EQ.
5. **`🔊 Tone Generator` Tab**:
   - In-browser Web Audio API oscillator synthesis:
     - 1,000 Hz pure sine wave (0 dB) for mid/high amplifier gain tuning.
     - 50 Hz pure sine wave (0 dB) for subwoofer amplifier gain tuning.
     - Full-spectrum Pink Noise ($1/f$ filtered white noise) for RTA microphone measurements.
6. **`📤 DSP File Exporter` Tab**:
   - Pioneer DEH-80PRS XML formatting.
   - MiniDSP 2x4 HD JSON formatting.

---

## 4. Gap Analysis Against R1, R2, R3, R4 & Web Export

| Requirement | Requirement Spec | Current Status | Identified Gaps & Missing Items |
|---|---|---|---|
| **R1** | 4-step wizard, 9+ Indian makes, 25+ models, head units, components, coaxials, amps, custom ported/sealed subs, live dashboard. | **Implemented in frontend client** | 1. Frontend currently uses hardcoded catalog data from `constants/catalog.ts` rather than dynamically fetching or validating with `/api/cars` and `/api/equipment`.<br>2. Wizard state resets on browser refresh (lacks AsyncStorage/Zustand store). |
| **R2** | Millimeter time alignment ($Delay = \Delta Dist / 34.3$), Linkwitz-Riley 24dB crossovers, subsonic filter ($TuneHz - 7$), DMM voltages ($V = \sqrt{P \times R}$). | **Implemented in frontend & backend** | 1. Calculations run client-side in `index.tsx` and duplicated in backend algorithms. No API call to `POST /api/tuning/calculate` as sync mechanism.<br>2. Headroom and amplifier impedance selection is fixed to catalog defaults rather than user-customizable values. |
| **R3** | 60FPS HTML5 canvas wave propagation simulator, 14-band Bezier spline curve, in-browser Web Audio test tone generator (1kHz, 50Hz, Pink Noise). | **Implemented on Web** | 1. Web canvas uses direct DOM `<canvas>` and HTML `<br />` which works for `npx expo export --platform web`, but requires React Native SVG fallback for native iOS/Android packaging.<br>2. Tone generator in `index.tsx` handles Web Audio API; mobile native uses simple alert fallback. |
| **R4** | FastAPI REST endpoints for Twilio Verify Phone OTP, Razorpay Subscriptions (Free, ₹99/mo, ₹999/yr), Measurement smoothing, and DSP file export. | **Implemented in Backend; Gaps in Frontend UI** | 1. **No Auth UI Modal**: Frontend does not have OTP login screen or JWT token storage in AsyncStorage.<br>2. **No Razorpay Payment Modal**: Frontend lacks checkout button to open Razorpay SDK / API flow (`POST /api/payments/create-order` & `/verify`).<br>3. **No Measurement Upload UI**: No frontend drag-and-drop or microphone capture UI connecting to `POST /api/measurements`.<br>4. **No Direct File Download**: DSP Exporter displays XML/JSON in text cards, but lacks "Download .xml" and "Download .json" file blob download buttons. |
| **Web Export** | `npx expo export --platform web` cleanly with zero syntax or bundling errors. | **Configured** | 1. Metro config handles `.mjs`/`.cjs`.<br>2. Static output configured in `app.json`.<br>3. Check for any JSX tag issues (e.g. unescaped `<br />` inside `<Text>` in React Native Web). |

---

## 5. Frontend to Backend API Interfacing Surface

### 5.1 Backend REST API Endpoint Map
The backend (`backend/app/main.py`) exposes the following endpoints on port 8000:

```
FastAPI Base URL: http://localhost:8000 (or process.env.EXPO_PUBLIC_API_URL)

1. Health
   GET  /
   GET  /api/health

2. Cars Catalog
   GET  /api/cars?make={make}
   GET  /api/cars/{make}/{model}

3. Equipment Catalog
   GET  /api/equipment?category={category}&brand={brand}
   GET  /api/equipment/categories

4. Tuning Engine
   POST /api/tuning/calculate
   Payload: TuningCalculationRequest {
     car_make: string,
     car_model: string,
     car_variant?: string,
     equipment: {
       head_unit_brand: string,
       head_unit_model: string,
       front_speakers: string,
       rear_speakers: string,
       speakers_amplifier: string,
       subwoofer: string,
       subwoofer_enclosure_type: "ported" | "sealed",
       subwoofer_tuning_frequency_hz: number,
       subwoofer_amplifier: string
     },
     sound_target_profile: "sql_punjabi_hiphop" | "harman_reference" | "vocal_clarity",
     listening_position: "driver_rhd" | "passenger_lhd" | "both_front"
   }
   Response: TuningCalculationResponse (14-band EQ, crossovers, delays, gains, checklist, XML, JSON)

5. Auth (Twilio Verify & JWT Bearer)
   POST /api/auth/send-otp (payload: { phone_number })
   POST /api/auth/verify-otp (payload: { phone_number, otp_code, name? }) -> returns { access_token, user_id, tier }
   GET  /api/auth/me (Header: Authorization: Bearer {token})

6. Payments (Razorpay Subscriptions)
   GET  /api/payments/plans -> returns [Free (₹0), Pro Monthly (₹99), Pro Yearly (₹999)]
   POST /api/payments/create-order -> returns { order_id, amount_inr, razorpay_key_id }
   POST /api/payments/verify -> returns { success, subscription_tier }

7. Acoustic Measurements
   POST /api/measurements (payload: { measurement_type, raw_data: [{ frequency_hz, spl_db }] }) -> returns smoothed curve & peak cuts
```

### 5.2 Recommended Frontend Client Service Layer
To cleanly bridge frontend and backend without breaking standalone client capability, implement:
1. `services/api.ts`: Axios client configured with `baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'`.
2. `services/authService.ts`: Methods for `sendOTP`, `verifyOTP`, `getProfile`, and storing JWT in AsyncStorage.
3. `services/paymentService.ts`: Methods for fetching plans, initiating Razorpay order, and verifying signature.
4. `services/tuningService.ts`: Method for calling `POST /api/tuning/calculate` with fallback to local calculation if backend is unreachable.
5. `services/dspExportService.ts`: Helper to create and trigger browser download blobs for `pioneer_dsp_kylaq.xml` and `minidsp_config_kylaq.json`.

---

## 6. Recommendations & Action Plan

1. **API Integration & Resilience**: Add `services/api.ts` so the frontend seamlessly calls the backend FastAPI endpoints while maintaining graceful offline fallbacks to the in-memory engine when backend is offline.
2. **Add Auth & Payment Modals**: Add lightweight UI modals or drawer triggers for Phone OTP login and Razorpay Pro subscription upgrade (₹99/mo, ₹999/yr).
3. **One-Click File Downloads**: Add blob download helper in Tab 6 for instant downloading of `.xml` and `.json` DSP files.
4. **RTA Measurement Component**: Provide a file upload / synthetic mic test runner to test the `/api/measurements` smoothing endpoint.
5. **Skoda Kylaq Benchmark Verification**: Verify that the default setup matches the user prompt specification (Nakamichi NAM5510 + MOCO AF-04 + Sound Barrier SB-654 + Sony XS-162GS + Pioneer TS-W307D4 35Hz ported) with zero errors.

---
*Report compiled by Explorer Codebase Agent.*
