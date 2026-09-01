# CarAudioAI — E2E Test Infrastructure & Verification Architecture

## 1. Overview & Quality Mandate
The CarAudioAI precision automotive DSP tuning and calibration platform requires an uncompromising, multi-layered quality assurance matrix. Every mathematical formula ($V = \sqrt{P \times R}$, $\tau = \Delta d / 34.34\text{ cm/ms}$, Linkwitz-Riley -6dB crossover intersections, 28Hz subsonic safety rules), design token constraint (cyan/purple signal isolation, tabular monospace measurements), vehicle dimension catalog, and Razorpay GST billing line-item is verified against authoritative ground truth specifications.

---

## 2. The 4-Tier Test Architecture

```
+-----------------------------------------------------------------------------------+
|                        TIER 4: REAL-WORLD APPLICATION WORKLOADS                   |
|   • Skoda Kylaq Indian SQL Punjabi Setup (Nakamichi + MOCO + SB + Sony + Pioneer) |
|   • Maruti Swift Harman Reference Soundstage (Swift Cabin RHD + Coaxial Fill)      |
|   • Mahindra Thar Off-Road Vocal Clarity Preset (Dash Top Tweeters + 0dB Sub Cut)  |
+-----------------------------------------------------------------------------------+
                                         |
+-----------------------------------------------------------------------------------+
|                     TIER 3: CROSS-FEATURE PAIRWISE COMBINATIONS                   |
|   • Acoustic Delay (F8) + 14-Band Spline (F5) + LR4 Crossover (F7) + DMM Gain (F9)|
|   • Vehicle Onboarding Wizard (F10) + DSP Exporter Pioneer/MiniDSP (F13)          |
|   • Phone OTP Auth (F11) + Razorpay Monospace Monolithic Invoicing (F12)          |
|   • Web Audio FFT Realtime Engine (F6) + Subsonic Protection Safeguards (F7)      |
+-----------------------------------------------------------------------------------+
                                         |
+-----------------------------------------------------------------------------------+
|                     TIER 2: BOUNDARY, CORNER & ADVERSARIAL CASES                  |
|   • Ported Subwoofer Cone Unloading: Subsonic filter < 28Hz vs 35Hz box warning   |
|   • Gain Staging Extremes: 1500W RMS sub clippage, 0.5V - 5.0V pre-outs, 2Ω vs 8Ω |
|   • Time Alignment Invariants: 0.00ms baseline anchor, sub-millisecond precision  |
|   • Phone Auth & Rate Limits: Malformed strings, 6-digit bounds, OTP retry expiry |
|   • GST & Pricing Arithmetic: Exact 18% CGST/SGST rounding, ₹99/₹999 integer totals|
+-----------------------------------------------------------------------------------+
                                         |
+-----------------------------------------------------------------------------------+
|                        TIER 1: FULL FEATURE COVERAGE (F1 - F14)                   |
|   • >= 5 dedicated test cases per feature (F1 through F14) = 70+ baseline tests   |
|   • Complete contract verification against PROJECT.md and ORIGINAL_REQUEST.md     |
+-----------------------------------------------------------------------------------+
```

---

## 3. Tier 1: Feature Coverage Specification (>=5 Tests per Feature)

### F1: Design System & Token Hub (`tokens.ts`)
1. **F1.1**: Token matrix exports all 5 core color families: `bg`, `border`, `text`, `signal`, `status`, `chrome`.
2. **F1.2**: Background tokens strictly enforce near-black studio palette (`#0A0B0D` base, `#12151B` panel, `#181C24` elevated, `#0E1015` inset).
3. **F1.3**: Signal colors strictly contain cyan (`#22D3EE` / `#06B6D4`) and purple (`#A78BFA` / `#8B5CF6`).
4. **F1.4**: Typography matrix contains sans (`Inter, system-ui, sans-serif`) and monospace (`JetBrains Mono, Menlo, monospace`).
5. **F1.5**: Spacing and radius scales enforce consistent discrete increments (`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `2xl: 32`, `radius.sm: 2`, `radius.md: 4`).

### F2: Hardware-styled UI Primitives
1. **F2.1**: `InstrumentPanel` renders with neutral hairline border (`#1E222A`) and no blurry drop shadows.
2. **F2.2**: `Button` supports `solid`, `outline`, `danger`, and `ghost` variants with tokenized active states.
3. **F2.3**: `Readout` strictly formats numeric measurements in monospace font family with right alignment.
4. **F2.4**: `SliderControl` bounds vertical fader drag values within $[min, max]$ with step quantization.
5. **F2.5**: `DialControl` calculates rotary potentiometer angular deflection and steps cleanly across ranges.

### F3: Scrollytelling Hero Refactor (`HeroScrollSequence.jsx`)
1. **F3.1**: Canvas and container use tokenized base studio background `#0A0B0D`.
2. **F3.2**: Scroll progress normalizes from 0.0 to 1.0 smoothly over scroll height.
3. **F3.3**: Exterior, Door Open, Touchscreen, and Soundwave sequence stages trigger at correct scroll thresholds.
4. **F3.4**: CTA buttons use chrome styling (`#1E222A` background with hairline `#2A2F3A` border), avoiding signal cyan/purple backgrounds.
5. **F3.5**: Shader canvas gracefully falls back to 2D image sequence if WebGL context is unavailable.

### F4: HUD Scrollytelling Telemetry
1. **F4.1**: HUD telemetry cards display stage data strictly using tabular monospace font.
2. **F4.2**: Phase coherence metric renders from 0% to 100% with signal cyan trace visualization.
3. **F4.3**: Real-time delay readouts format in milliseconds (`ms`) with 2 decimal places.
4. **F4.4**: Frequency response preview shows 20Hz - 20kHz logarithmic tick marks.
5. **F4.5**: Warning indicators display in amber (`#F59E0B`) during simulated phase cancellation.

### F5: 14-Band Parametric/Graphic EQ Visualizer
1. **F5.1**: 14 ISO center frequencies match: `[32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000]` Hz.
2. **F5.2**: Gain range strictly bounded between $-12.0\text{ dB}$ and $+12.0\text{ dB}$.
3. **F5.3**: Catmull-Rom / Hermite spline interpolation yields continuous curve without discontinuities.
4. **F5.4**: Sound target presets (SQL Punjabi, Harman Reference, Vocal Clarity) load distinct target gain matrices.
5. **F5.5**: Interactive node dragging updates real-time frequency gain array and triggers recalculation.

### F6: Web Audio FFT Spectrum & Tone Generator
1. **F6.1**: Test tone generator produces pure 1,000 Hz sine wave for high/mid channel gain staging.
2. **F6.2**: Test tone generator produces pure 50 Hz sine wave for subwoofer channel gain staging.
3. **F6.3**: Pink noise generator generates uncorrelated pseudo-random noise with $1/f$ (-3dB/octave) spectral distribution.
4. **F6.4**: `AnalyserNode` FFT size is configurable (e.g., 2048 bins) with smoothing time constant between 0.8 and 0.85.
5. **F6.5**: Tone start and stop actions properly clean up audio oscillator nodes and prevent memory leaks.

### F7: Linkwitz-Riley 24dB Crossover & Subsonic Filter
1. **F7.1**: Linkwitz-Riley 4th order (LR4) slope calculates $-24\text{ dB/octave}$ attenuation rolloff.
2. **F7.2**: Summed magnitude response of LR4 HPF + LPF at crossover cutoff frequency $f_c$ equals exactly $0\text{ dB}$ (each $-6\text{ dB}$ at $f_c$).
3. **F7.3**: Front stage HPF defaults to $80\text{ Hz}$ for 6.5" component woofers.
4. **F7.4**: Rear stage HPF defaults to $90\text{ Hz}$ with $-4.0\text{ dB}$ acoustic attenuation offset.
5. **F7.5**: Ported enclosure subsonic filter automatically calculates $f_{subsonic} = f_{tune} - 7\text{ Hz}$ (e.g., 28Hz for 35Hz box).

### F8: Asymmetric RHD Time Alignment Engine
1. **F8.1**: Speed of sound constant is defined as $34.34\text{ cm/ms}$ ($343.4\text{ m/s}$ at $20^\circ\text{C}$).
2. **F8.2**: Delay formula enforces $\tau = (d_{max} - d_i) / 34.34\text{ ms}$.
3. **F8.3**: Furthest speaker (typically Boot Subwoofer) is assigned exact baseline delay of $0.00\text{ ms}$.
4. **F8.4**: Closest speaker to Indian RHD driver (Front Right / Rear Right) receives highest delay compensation.
5. **F8.5**: Sample delay conversion matches $N = \text{round}((\tau / 1000) \times 48000)$ at 48kHz sampling rate.

### F9: Multimeter DMM Gain-Staging Calculator
1. **F9.1**: Target AC voltage follows Ohm's law RMS formula $V_{AC} = \sqrt{P_{RMS} \times R_{load}}$.
2. **F9.2**: Front speakers ($45\text{W RMS}, 4\Omega$) produce target $V_{AC} = \sqrt{180} \approx 13.42\text{ V AC}$.
3. **F9.3**: Subwoofer channel ($250\text{W RMS}, 8\Omega$ DVC series) produces target $V_{AC} = \sqrt{2000} \approx 44.72\text{ V AC}$.
4. **F9.4**: Subwoofer channel ($600\text{W RMS}, 2\Omega$ DVC parallel) produces target $V_{AC} = \sqrt{1200} \approx 34.64\text{ V AC}$.
5. **F9.5**: Head unit clean volume limit restricts test tone volume step to $75\%$ (e.g. Volume 30 out of 40).

### F10: 4-Step Vehicle Onboarding Flow
1. **F10.1**: Step 1 validates 9 Indian automobile manufacturers (Škoda, Maruti, Hyundai, Tata, Mahindra, Toyota, Kia, VW, Honda).
2. **F10.2**: Step 2 validates 26 Indian vehicle cabin models with exact wheelbase and cabin acoustic volumes.
3. **F10.3**: Step 3 provides hardware selectors for head units, 2-way components, coaxials, amps, and subwoofers.
4. **F10.4**: Step 4 generates the complete customized AI acoustic tuning configuration.
5. **F10.5**: Step transition guards prevent skipping steps without valid selections.

### F11: Minimal Indian Phone OTP Auth
1. **F11.1**: Validates 10-digit Indian phone numbers with prefixes (`+91`, `91`, leading zeros, dashes, spaces).
2. **F11.2**: Rejects malformed numbers (e.g., letters, < 10 digits, invalid country codes).
3. **F11.3**: Verification requires exact 6-digit numeric OTP.
4. **F11.4**: Resend OTP timer enforces 30-second cooldown period.
5. **F11.5**: Session persistence preserves user profile and active subscription tier across reloads.

### F12: High-Trust Razorpay Checkout & Invoicing
1. **F12.1**: Pro Monthly plan displays ₹99/mo; Installer Pro displays ₹999/yr.
2. **F12.2**: 18% GST calculation decomposes into 9% CGST and 9% SGST.
3. **F12.3**: Monospace tabular numerals used for all currency amounts and line items.
4. **F12.4**: Razorpay order creation returns valid INR amount and order identifier (`order_*`).
5. **F12.5**: HMAC-SHA256 signature verification validates payment authenticity against secret key.

### F13: Complete DSP Configuration Exporters
1. **F13.1**: Pioneer XML export produces valid XML with root `<PioneerDSPConfig version="1.0">`.
2. **F13.2**: Pioneer XML includes all 14 ISO equalizer bands with `<Band freq="...Hz" gain="...dB"/>`.
3. **F13.3**: MiniDSP JSON export produces valid JSON containing `routing`, `crossovers`, `delays_ms`, and `parametric_eq`.
4. **F13.4**: Exporter includes car make/model, target sound curve, and timestamp metadata.
5. **F13.5**: Printable installer text summary includes step-by-step amplifier dial clock positions and DMM targets.

### F14: Static Web Export & Mobile Responsive Layout
1. **F14.1**: Static bundle builds cleanly without syntax or unresolved import errors (`npx expo export --platform web`).
2. **F14.2**: HTML entrypoints exist for `/index.html`, `/explore.html`, `/modal.html`, `/(tabs)/index.html`.
3. **F14.3**: Viewport layout scales seamlessly down to 375px mobile width without horizontal overflow.
4. **F14.4**: Touch targets meet accessibility minimum standard (>= 44x44 px).
5. **F14.5**: High DPI assets and icons render sharply on retina screens.

---

## 4. Tier 2: Boundary, Corner & Adversarial Test Cases

| Category | Test Case | Input Condition | Expected Result |
|---|---|---|---|
| **Subsonic Safety** | Ported Box Cone Unloading | $f_{tune} = 35\text{ Hz}$, $f_{subsonic} = 20\text{ Hz}$ | Trigger amber warning: subsonic < 28Hz causes mechanical unloading |
| **Subsonic Safety** | Sealed Enclosure Excursion | Sealed box ($f_{tune} = 0$) | Subsonic defaults to 20Hz protection without warning |
| **EQ Gain Bounds** | Extreme Boost Request | User sets Band 63Hz to $+18\text{ dB}$ | Clamped to $+12.0\text{ dB}$ maximum DSP hardware ceiling |
| **EQ Gain Bounds** | Extreme Cut Request | User sets Band 200Hz to $-24\text{ dB}$ | Clamped to $-12.0\text{ dB}$ minimum DSP floor |
| **Time Alignment** | Co-located Speaker / Zero Delta | Speaker distance equal to max distance ($210\text{ cm}$) | Exact $0.00\text{ ms}$ delay (no negative delays or NaN) |
| **Gain Staging** | Ultra-High Power Monoblock | $1500\text{W RMS}$ @ $1\Omega$ | Target $V_{AC} = \sqrt{1500 \times 1} = 38.73\text{ V AC}$, clipping warning flag |
| **Gain Staging** | OEM Low-Level Head Unit | $0.8\text{V}$ pre-out vs $5.0\text{V}$ audiophile | Amplifier sensitivity dial instruction accounts for pre-out scale |
| **Phone Formatting** | Messy User Phone Input | `+91 (98765) 43-210 ` | Normalized cleanly to `+919876543210` |
| **Auth Security** | Invalid / Expired OTP | OTP `000000`, `999999`, `12345` | HTTP 400 Bad Request / "Invalid or expired OTP" |
| **GST Arithmetic** | Fractional GST Rounding | ₹99 base price (18% GST included) | Base = ₹83.90, CGST 9% = ₹7.55, SGST 9% = ₹7.55, Total = ₹99.00 |
| **GST Arithmetic** | Yearly Installer Pro GST | ₹999 base price (18% GST included) | Base = ₹846.61, CGST 9% = ₹76.19, SGST 9% = ₹76.19, Total = ₹999.00 |

---

## 5. Tier 3: Cross-Feature Pairwise Integration Matrix

| Integration Pair | Features Combined | Verification Target |
|---|---|---|
| **Acoustic Calibration Chain** | F5 (14-Band EQ) + F7 (LR4 Crossover) + F8 (RHD Delay) + F9 (DMM Gain) | Combined DSP output matches physical acoustic environment of selected cabin without phase clash |
| **Hardware to Exporter** | F10 (Vehicle Catalog) + F13 (DSP Exporters) | Selected Nakamichi + MOCO + Sound Barrier + Sony + Pioneer setup translates into valid XML & JSON |
| **Auth & Monetization** | F11 (OTP Auth) + F12 (Razorpay Invoicing) | Authenticated user session triggers Razorpay order in INR, verifies HMAC signature, and updates user tier to Pro |
| **Web Audio & Safety** | F6 (Tone Generator) + F7 (Subsonic Filter) | 50Hz tone plays safely through subwoofer DSP pathway with 28Hz high-pass filter active |
| **Tokens & Responsive UI** | F1 (Design Tokens) + F2 (UI Primitives) + F14 (Static Web Export) | Web build renders exclusively with tokenized colors, zero hardcoded hexes, responsive on 375px mobile |

---

## 6. Tier 4: Real-World Application Workloads

### Workload 1: Škoda Kylaq Indian SQL Punjabi Setup
- **Vehicle**: Škoda Kylaq 2025 Compact SUV (RHD distances: FL 138cm, FR 95cm, RL 155cm, RR 115cm, SUB 210cm).
- **Hardware**: Nakamichi NAM5510 + MOCO AF-04 (Doors) + Sound Barrier SB-654 (Mono Sub) + Sony XS-162GS Components + Pioneer TS-W307D4 12" in 35Hz Slot Port Box.
- **Target Profile**: `sql_punjabi_hiphop` (+5.5dB @ 63Hz, -1.5dB @ 200Hz standing resonance cut, +2.0dB @ 12kHz).
- **Acoustic Outputs**:
  - Delays: FR = 3.35 ms, RR = 2.77 ms, FL = 2.10 ms, RL = 1.60 ms, SUB = 0.00 ms.
  - Crossovers: Front HPF 80Hz LR4, Rear HPF 90Hz LR4 (-4dB gain), Sub LPF 80Hz LR4, Subsonic HPF 28Hz LR4.
  - Gain Staging: Front (45W @ 4Ω) = 13.42 V AC (1kHz tone), Sub (250W @ 8Ω) = 44.72 V AC (50Hz tone).

### Workload 2: Maruti Suzuki Swift Harman Reference Soundstage
- **Vehicle**: Maruti Swift 2024 Hatchback (RHD distances: FL 130cm, FR 88cm, RL 145cm, RR 105cm, SUB 190cm).
- **Hardware**: Pioneer DEH-80PRS + Pioneer GM-D8704 4-Channel + Focal Access 165-AS Components + Focal Auditor Rear Coax + Rockford P3D4-12 Sealed Box.
- **Target Profile**: `harman_reference` (+3.0dB @ 63Hz, -1.0dB @ 200Hz, +0.5dB @ 2kHz/10kHz).
- **Acoustic Outputs**:
  - Delays: FR = 2.97 ms, RR = 2.48 ms, FL = 1.75 ms, RL = 1.31 ms, SUB = 0.00 ms.
  - Crossovers: Front HPF 75Hz LR4, Rear HPF 85Hz LR4, Sub LPF 75Hz LR4, Subsonic 20Hz (sealed box).
  - Gain Staging: Front (60W @ 4Ω) = 15.49 V AC, Sub (600W @ 4Ω) = 48.99 V AC.

### Workload 3: Mahindra Thar Off-Road Vocal Clarity Preset
- **Vehicle**: Mahindra Thar 4x4 / Roxx Off-Road SUV (Distances: FL 128cm, FR 85cm, RL 140cm, RR 100cm, SUB 180cm).
- **Hardware**: Alpine iLX-W650 + Sony XM-N1004 + Morel Maximo Ultra 602 + Dash Top Tweeters + Under-Seat Active Sub.
- **Target Profile**: `vocal_clarity` (+2.0dB @ 1kHz, +1.5dB @ 2kHz, -2.0dB @ 200Hz road rumble notch).
- **Acoustic Outputs**:
  - Delays: FR = 2.77 ms, RR = 2.33 ms, FL = 1.51 ms, RL = 1.16 ms, SUB = 0.00 ms.
  - Crossovers: Front HPF 80Hz LR4, Rear HPF 90Hz LR4, Sub LPF 80Hz LR4, Subsonic 20Hz.
  - Gain Staging: Front (70W @ 4Ω) = 16.73 V AC, Sub (120W @ 4Ω) = 21.91 V AC.

---

## 7. Test Suite Execution & Tooling

### Test Files Layout
- `mobile-app/__tests__/tokens.test.ts` — Design system token matrix & signal color discipline.
- `mobile-app/__tests__/dsp_math.test.ts` — DSP formulas, LR4 crossovers, subsonic safety, delays, gain staging.
- `mobile-app/__tests__/onboarding_catalog.test.ts` — Indian vehicle models, seating geometries, audio equipment catalog.
- `mobile-app/__tests__/pricing_tax.test.ts` — Subscription tiers, 18% GST line-item arithmetic, formatting.
- `backend/tests/test_tuning_engine.py` — FastAPI REST endpoints, acoustic calculations, DSP export.
- `backend/tests/test_challenger_verification.py` — Adversarial static bundle, phone OTP, Razorpay signature, XML/JSON parsing.

### Execution Command Matrix
```bash
# Frontend Unit & E2E Suites
npm --prefix mobile-app test

# Backend Integration & Adversarial Suites
pytest backend/tests/test_tuning_engine.py backend/tests/test_challenger_verification.py -v
```
