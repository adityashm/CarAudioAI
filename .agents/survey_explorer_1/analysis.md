# Comprehensive Codebase & Architectural Survey Report

**Project**: CarAudioAI — Precision Automotive Acoustic Tuning & DSP Calibration Platform  
**Explorer Agent**: Survey Explorer 1 (`.agents/survey_explorer_1`)  
**Date**: 2026-09-01  
**Authoritative Specification**: `c:/Users/aditya/Downloads/CarAudioAI/.agents/ORIGINAL_REQUEST.md`

---

## 1. Executive Summary

CarAudioAI is an AI-powered automotive acoustic tuning and DSP calibration platform specifically tailored for Indian vehicles (e.g., Škoda Kylaq, Maruti Swift, Hyundai Creta, Mahindra Thar, Toyota Fortuner, etc.). It calculates asymmetric right-hand-drive (RHD) time alignment delays ($Delay = \Delta Dist / 34.3\text{ cm/ms}$), Linkwitz-Riley 24dB crossover slopes with ported enclosure subsonic safety protection, multimeter target AC voltages ($V = \sqrt{P \times R}$), 14-band Bezier equalizer curves, in-cabin acoustic wave propagation simulation, Web Audio tone generation, and one-click DSP export for Pioneer DEH-80PRS XML and MiniDSP 2x4 HD JSON.

The project consists of:
1. **Frontend (`mobile-app/`)**: Expo 54 / React Native 0.81 / React 19 / React Native Web 0.21 application with Expo Router v6, Framer Motion v13 scrollytelling, React Native SVG, and Web Audio API synthesis.
2. **Backend (`backend/`)**: FastAPI Python server with SQLite/Postgres persistence, mathematical acoustic calculation engines, Twilio OTP authentication, Razorpay subscription processing, and RTA measurement smoothing.

While core business logic, vehicle catalog data (9 makes, 26 Indian models), and backend APIs exist and function, the frontend is currently structured as a monolithic single-file screen (`app/(tabs)/index.tsx` > 1,300 lines) with scattered hardcoded styles, soft SaaS drop shadows, and missing precision instrumentation primitives (design tokens, draggable Bezier EQ nodes, Web Audio `AnalyserNode` spectrum visualizer, physical console dials).

---

## 2. Full Workspace & Directory Tree Mapping

```
c:/Users/aditya/Downloads/CarAudioAI/
├── .agents/                               # Multi-agent coordination metadata & reports
│   ├── ORIGINAL_REQUEST.md                # Authoritative requirements & design spec
│   ├── survey_explorer_1/                 # Current explorer workspace
│   │   ├── BRIEFING.md
│   │   ├── DISPATCH.md
│   │   ├── progress.md
│   │   ├── analysis.md                    # This report
│   │   └── handoff.md
│   ├── orchestrator_1/
│   ├── auditor_1/
│   └── challenger_1/
├── HeroScrollSequence.jsx                 # Framer Motion scrollytelling component (root copy)
├── PROJECT.md                             # Architectural overview & project guidelines
├── PROJECT_STATUS.md                      # Track progress status
├── README.md                              # User and developer documentation
├── SETUP_GUIDE.md                         # Setup & environment configuration
├── DEPLOYMENT.md                          # Production deployment guidelines
├── backend/                               # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                      # Environment settings (Pydantic Settings)
│   │   ├── database.py                    # SQLAlchemy database engine & sessions
│   │   ├── main.py                        # FastAPI application entry point & CORS
│   │   ├── algorithms/                    # Deterministic acoustic calculation engines
│   │   │   ├── crossover.py               # Linkwitz-Riley 24dB & subsonic protection
│   │   │   ├── dsp_export.py              # Pioneer XML & MiniDSP JSON formatting
│   │   │   ├── eq_optimizer.py            # 14-band Bezier parametric EQ profiles
│   │   │   ├── gain_staging.py            # RMS voltage calculation (V = sqrt(P * R))
│   │   │   └── time_alignment.py          # Asymmetric RHD delay calculation
│   │   ├── data/
│   │   │   ├── equipment.json             # Head units, speakers, amplifiers, subs
│   │   │   └── indian_cars.json           # 25+ Indian car cabins with dimensions
│   │   ├── models/                        # SQLAlchemy ORM models (User, Car, Equipment, Payment, etc.)
│   │   ├── routers/                       # REST endpoints (auth, cars, equipment, tuning, payments, measurements)
│   │   ├── schemas/                       # Pydantic validation schemas
│   │   └── utils/                         # Twilio OTP & cloud storage helpers
│   ├── requirements.txt                   # Python dependencies (FastAPI, uvicorn, pytest, scipy, etc.)
│   ├── seed.py                            # Database seeder for Indian cars and equipment
│   └── tests/
│       ├── test_tuning_engine.py          # Comprehensive 14-case backend test suite
│       └── test_challenger_verification.py # Independent verification test suite
└── mobile-app/                            # Expo / React Native Web Frontend
    ├── app/                               # Expo Router v6 file-based routes
    │   ├── _layout.tsx                    # Root stack layout & ThemeProvider
    │   ├── (tabs)/
    │   │   ├── _layout.tsx                # Bottom tab bar configuration
    │   │   ├── index.tsx                  # Main wizard & studio screen (currently monolithic)
    │   │   └── explore.tsx                # Acoustic guide & troubleshooting knowledge base
    │   └── modal.tsx                      # Modal stack presentation route
    ├── assets/
    │   └── images/                        # App icons, splash screens, storyboard shots
    │       ├── shot1_exterior.jpg         # Scrollytelling Shot 1
    │       ├── shot2_door_open.jpg        # Scrollytelling Shot 2
    │       ├── shot3_touchscreen.jpg      # Scrollytelling Shot 3
    │       └── shot4_soundwaves.jpg       # Scrollytelling Shot 4
    ├── components/
    │   ├── AuthModal.tsx                  # Phone OTP sign-in / profile modal
    │   ├── HeroScrollSequence.jsx         # 400vh Framer Motion + WebGL scrollytelling
    │   ├── PaymentModal.tsx               # Razorpay subscription tier selection modal
    │   ├── RtaMeasurementModal.tsx        # 31-band acoustic sweep & resonance analysis modal
    │   ├── haptic-tab.tsx                 # Haptic tab bar button
    │   ├── themed-text.tsx                # Themed text wrapper
    │   ├── themed-view.tsx                # Themed view wrapper
    │   └── ui/                            # UI primitives
    │       ├── collapsible.tsx
    │       ├── icon-symbol.tsx
    │       └── icon-symbol.ios.tsx
    ├── constants/
    │   ├── catalog.ts                     # Comprehensive catalog (9 makes, 26 models, gear)
    │   └── theme.ts                       # Legacy color & font definitions
    ├── hooks/
    │   ├── use-color-scheme.ts
    │   ├── use-color-scheme.web.ts
    │   └── use-theme-color.ts
    ├── services/
    │   ├── api.ts                         # Axios client with JWT interceptor & offline fallback
    │   ├── authService.ts                 # Phone OTP auth & AsyncStorage profile persistence
    │   ├── exportService.ts               # Browser XML/JSON download & export formatting
    │   ├── paymentService.ts              # Razorpay checkout & payment verification
    │   └── tuningService.ts               # Acoustic calculations & RTA analysis service
    ├── app.json                           # Expo application configuration
    ├── metro.config.js                    # Metro bundler config (.mjs, .cjs support)
    ├── package.json                       # Dependencies & scripts
    └── tsconfig.json                      # TypeScript compiler configuration
```

---

## 3. Dependency & Configuration Analysis

### 3.1 Mobile Frontend (`mobile-app/package.json`)
- **Core Runtime**:
  - `expo`: `~54.0.33`
  - `react`: `19.1.0`
  - `react-dom`: `19.1.0`
  - `react-native`: `0.81.5`
  - `react-native-web`: `~0.21.0`
  - `expo-router`: `~6.0.23`
- **Animation, Graphics & Canvas**:
  - `framer-motion`: `^13.1.1` (used for 4-stage viewport sticky scrollytelling & Ken Burns scaling)
  - `react-native-reanimated`: `~4.1.1`
  - `react-native-svg`: `^15.15.4` (for vector iconography and custom graphic elements)
  - `react-native-chart-kit`: `^6.12.0`
  - `react-native-gesture-handler`: `~2.28.0`
- **Audio & Device Capabilities**:
  - `expo-audio`: `^55.0.12`
  - `expo-haptics`: `~15.0.8`
  - `expo-font`: `~14.0.11`
  - `@react-native-async-storage/async-storage`: `^3.0.2`
- **UI Components & Icons**:
  - `@expo/vector-icons`: `^15.0.3` (MaterialIcons, FontAwesome, Ionicons, etc.)
  - `react-native-paper`: `^5.15.0`
  - `expo-symbols`: `~1.0.8`
  - Note: `lucide-react-native` is not currently in `package.json`, but `@expo/vector-icons` and `react-native-svg` are fully installed and available.

### 3.2 Expo Configuration (`mobile-app/app.json`)
- **Web Export Output**: `"output": "static"`
- **Experiments**:
  - `"baseUrl": "/CarAudioAI"` (supports GitHub Pages / static subpath hosting)
  - `"reactCompiler": true`
  - `"typedRoutes": true`
- **Architecture**: `"newArchEnabled": true`
- **Plugins**: `expo-router`, `expo-splash-screen`

### 3.3 Metro Bundler Configuration (`mobile-app/metro.config.js`)
- Includes explicit source extensions `mjs` and `cjs` for modern ESM modules and Framer Motion compatibility.

### 3.4 TypeScript Configuration (`mobile-app/tsconfig.json`)
- Strict mode: `true`
- Path mapping: `"@/*": ["./*"]` for clean module resolution from `mobile-app/`.

### 3.5 Backend Stack (`backend/requirements.txt`)
- `fastapi==0.100.0`, `uvicorn[standard]==0.23.0`
- `sqlalchemy==2.0.0`, `psycopg2-binary==2.9.6`
- `pydantic==2.0.0`, `pydantic-settings==2.0.0`
- `razorpay==1.4.0`, `twilio==8.5.0`
- `numpy==1.25.0`, `scipy==1.11.0`
- `pytest==7.4.0`, `pytest-cov==4.1.0`

---

## 4. Web Build Pipelines & Browser Capabilities

1. **Static Web Export Pipeline**:
   - `npx expo export --platform web` exports the full multi-page application into `mobile-app/dist/` with HTML pre-rendering, bundled CSS, and client-side hydration scripts.
2. **Web Audio API Integration**:
   - Audio Context (`window.AudioContext || window.webkitAudioContext`) is instantiated on user interaction to prevent autoplay blocking.
   - Generates 1,000 Hz 0dB sine waves, 50 Hz 0dB subwoofer test tones, and continuous 7-pole filtered Pink Noise buffer streams.
   - Can directly connect `AnalyserNode` for real-time FFT spectrum frequency bar visualization.
3. **HTML5 Canvas 2D & WebGL Contexts**:
   - 2D Canvas used for 60FPS soundwave propagation rings with time alignment phase delays.
   - 2D Canvas used for Bezier spline EQ curves.
   - WebGL 1.0 context used in `HeroScrollSequence.jsx` for concentric radial wave interference shaders.

---

## 5. Requirement-by-Requirement Gap Analysis (R1 – R5)

| Requirement | Description | Current State in Codebase | Gap / Missing Work Required |
|---|---|---|---|
| **R1 (Track 0)**: Design System Foundation & Primitives | Create `mobile-app/design-system/tokens.ts` and UI primitives (`InstrumentPanel`, `Button`, `Readout`, console dials/sliders). | Colors are scattered across components; `theme.ts` has generic blue/white tokens; no `tokens.ts` exists. | 1. Create `mobile-app/design-system/tokens.ts` with strict studio palette (`#0A0B0D` bg, `#22D3EE` cyan signal, `#A78BFA` purple phase, `#1E222A`/`#2A2F3A` hairline borders, `#F59E0B`/`#EF4444` warnings).<br>2. Build reusable UI primitives: `InstrumentPanel`, `Button` (solid vs outline), `Readout` (monospace data display), and tactile `ConsoleSlider`/`KnobDial`. |
| **R2 (Track 1)**: Hero Scrollytelling Polish | Polish `HeroScrollSequence.jsx` against design tokens; strict monospace HUD telemetry & signal color rules. | Component exists with Framer Motion and WebGL shader, but uses hardcoded hex values and non-tokenized styling. | 1. Refactor `HeroScrollSequence.jsx` to import colors, fonts, and borders from `tokens.ts`.<br>2. Enforce monospace font on all HUD telemetry, phase tags, and stage readouts.<br>3. Eliminate decorative cyan buttons in favor of high-precision console CTAs. |
| **R3 (Track 2)**: Precision DSP Instrumentation Dashboard | 14-band interactive Bezier EQ with draggable nodes; Web Audio `AnalyserNode` spectrum analyzer; Linkwitz-Riley 24dB dials; subsonic filter warning; multimeter calculator ($V = \sqrt{P \times R}$). | `index.tsx` has basic +/- steppers for EQ, basic tone playback, and static text for crossovers and voltages. | 1. Implement interactive draggable nodes on the Bezier EQ canvas.<br>2. Implement real-time `AnalyserNode` spectrum analyzer displaying live FFT frequency bars during tone playback.<br>3. Implement Linkwitz-Riley crossover dials and dynamic amber warning for ported subsonic safety.<br>4. Build high-precision multimeter gain staging readout panel with unit formatting. |
| **R4 (Track 3)**: Vehicle Seating & Geometry Onboarding Flow | 4-step wizard (Make ➔ Model ➔ Audio Gear ➔ Calibration) for 9+ Indian makes / 25+ models with RHD distances & minimal OTP auth. | Comprehensive catalog with 9 makes and 26 models exists in `catalog.ts`; wizard is embedded inside monolithic `index.tsx`. | 1. Modularize the 4-step onboarding flow into clean, maintainable step components styled with `InstrumentPanel`.<br>2. Enhance car model cards with clear RHD acoustic distance visualization.<br>3. Polish `AuthModal.tsx` to match precision instrumentation aesthetic. |
| **R5 (Track 4)**: High-Trust Payment & Checkout Screen | Razorpay subscription tiers (Free, Pro @ ₹99/mo, Installer @ ₹999/yr) with monospace line-item summaries and high-trust layout. | `PaymentModal.tsx` and `paymentService.ts` exist with Razorpay SDK integration, but use floating glow shadows and non-tokenized styling. | 1. Refactor `PaymentModal.tsx` using `tokens.ts`.<br>2. Present line-item summaries in monospace numerals.<br>3. Remove soft glowing SaaS shadows in favor of flat hairline borders. |

---

## 6. Detailed Architectural Breakdown of Core Modules

### 6.1 Catalog & Acoustic Dimensions (`mobile-app/constants/catalog.ts`)
The catalog is thoroughly detailed with accurate Indian automotive specifications:
- **9 Indian Manufacturers**: Škoda, Maruti Suzuki, Hyundai, Tata Motors, Mahindra, Toyota, Kia, Volkswagen, Honda.
- **26 Indian Vehicle Models**: Complete with wheelbase (mm), cabin volume ($m^3$), in-cabin resonant standing wave frequency (Hz), speaker sizes, mounting depths, and millimeter-accurate RHD distances (FL, FR, RL, RR, SUB in cm).
  - *Example (Škoda Kylaq)*: FL: 138cm, FR: 95cm, RL: 155cm, RR: 115cm, SUB: 210cm $\rightarrow$ Maximum distance is 210cm. Delay for FR = $(210 - 95) / 34.3 = 3.35\text{ ms}$.
- **Hardware Catalog**:
  - Head units: Nakamichi NAM5510, Pioneer DEH-80PRS, Sony RSX-GS9, Alpine iLX-W650, Android screen, OEM stock.
  - Front Speakers: Sony XS-162GS, Focal Access 165-AS, Morel Maximo Ultra 602, Hertz Uno K 165, JBL Stage3 607C, OEM paper cone.
  - Amplifiers: MOCO AF-04 + Sound Barrier SB-654 dual-amp setup, Sony XM-N1004, Pioneer GM-D8704, Helix 8-channel DSP.
  - Subwoofers: Pioneer TS-W307D4 (12" ported @ 35Hz), JBL BassPro 12 (ported @ 38Hz), Rockford Fosgate P3D4-12 (sealed), Alpine S-W12D4 (ported @ 33Hz), Underseat active sub, Spare wheel well sub.

### 6.2 Export Service (`mobile-app/services/exportService.ts`)
- Implements `generatePioneerXml` producing valid Pioneer DEH-80PRS XML with `<TimeAlignment>`, `<CrossoverNetwork>`, and `<Equalizer type="Graphic14Band">`.
- Implements `generateMiniDspJson` producing valid MiniDSP 2x4 HD routing matrices, 24dB Linkwitz-Riley biquads, and 14-band PEQ entries.
- Implements browser download triggers via programmatic blob object URLs.

### 6.3 Scrollytelling Hero (`mobile-app/components/HeroScrollSequence.jsx`)
- 4-stage viewport scrollytelling across 350vh-400vh:
  - Stage 01: Exterior chassis scan (Škoda Kylaq baseline)
  - Stage 02: Cockpit ingress & 1.25ms asymmetric RHD seating phase clash
  - Stage 03: 14-band parametric DSP notch curve
  - Stage 04: Phase coherence 99.8% laser soundstage focus
- Sound design: Synthesizes whoosh door ingress, screen activation beep, and 34Hz sub-bass sweep via Web Audio API oscillators.
- Visuals: 4 high-res storyboard assets with Ken Burns zoom transforms and custom WebGL radial wave shader.

---

## 7. Actionable Implementation Recommendations for Downstream Tracks

1. **Step 1 (Track 0)**:
   - Create `mobile-app/design-system/tokens.ts` exporting `colors`, `typography`, `spacing`, `borders`, `radii`.
   - Create `mobile-app/components/ui/InstrumentPanel.tsx`, `Button.tsx`, `Readout.tsx`, `ConsoleSlider.tsx`, `DialKnob.tsx`.
2. **Step 2 (Track 1)**:
   - Refactor `HeroScrollSequence.jsx` to consume `tokens.ts` and style telemetry overlays with strict monospace font and flat hairline panels.
3. **Step 3 (Track 2)**:
   - Create dedicated `DspInstrumentationDashboard.tsx` with interactive draggable Bezier EQ canvas, live Web Audio `AnalyserNode` frequency spectrum bars, Linkwitz-Riley filter dials, subsonic safety alert, and multimeter $V = \sqrt{P \times R}$ readout.
4. **Step 4 (Track 3)**:
   - Break down the 4-step onboarding flow in `app/(tabs)/index.tsx` into modular components (`Step1MakeSelection.tsx`, `Step2ModelSelection.tsx`, `Step3GearConfig.tsx`), styled with `InstrumentPanel`.
5. **Step 5 (Track 4)**:
   - Refactor `PaymentModal.tsx` to adhere to high-trust monospace line items and hairline border aesthetics.
6. **Step 6 (Verification)**:
   - Run static web export check (`npx expo export --platform web`) to ensure zero bundling/syntax errors and verify responsiveness down to 375px width.

---

*Survey Report complete and logged for CarAudioAI implementation team.*
