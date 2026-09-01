# CarAudioAI — Exhaustive Product Specification & Technical Requirements

**Document Version:** 2.0.0  
**Generated:** 2026-09-01T15:08:00+05:30  
**Status:** Authoritative Specification Report  
**Archetype:** Specification Miner  

---

## 1. Executive Product Overview

**CarAudioAI** is an AI-powered automotive acoustic tuning and Digital Signal Processor (DSP) calibration platform specifically engineered for the Indian automotive market. It bridges the gap between expensive professional audio acoustic measurement hardware ($1,000+) and typical car audio installations by providing:
1. An intuitive **4-step guided configurator** supporting 9+ Indian automotive manufacturers and 25+ specific vehicle cabin geometries.
2. A deterministic **acoustic physics and gain staging engine** calculating millisecond time alignment delays for asymmetric Right-Hand Drive (RHD) driving positions, Linkwitz-Riley crossover networks with ported subwoofer subsonic safety protection, and multimeter target AC calibration voltages.
3. An interactive **HTML5 canvas soundfield wave propagation simulator (60 FPS)**, a continuous **14-band mathematical Bezier spline parametric equalizer**, and an in-browser **Web Audio test tone generator** (1 kHz, 50 Hz, Pink Noise).
4. A production-ready **FastAPI backend** with phone OTP authentication (Twilio Verify / Dev fallback), Razorpay payment processing (Free, Pro @ ₹99/mo, Installer @ ₹999/yr), acoustic RTA measurement smoothing, and multi-format **DSP configuration exporter** (Pioneer DEH-80PRS XML, MiniDSP JSON, Biquad IIR filters, Helix/Brax, Zapco, Dayton Audio, CSV).

---

## 2. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | R1: Configurator | Indian Vehicle Database | 9+ Makes (Skoda, Maruti, Hyundai, Tata, Mahindra, Toyota, Kia, VW, Honda, MG) and 25+ Models with exact wheelbase, cabin volume, resonance, speaker mounting depths | Make ID / Name, Model ID | `CarModelData` object with cabin dimensions & speaker sizes | Returns fallback compact SUV geometry if not found | `app/data/indian_cars.json`, `mobile-app/constants/catalog.ts` |
| 2 | R1: Configurator | 4-Step Hardware Wizard | Step 1 (Make) ➔ Step 2 (Model) ➔ Step 3 (Gear: Head Unit, Front, Rear, Amp, Sub) ➔ Step 4 (Tuning Studio) | User selection at each step | Persisted wizard state, active audio configuration | Step navigation guard rails prevent out-of-order execution | `mobile-app/app/(tabs)/index.tsx` |
| 3 | R1: Configurator | Target Sound Profiles | 3 Distinct acoustic targets: SQL (Punjabi/EDM/Hip-Hop punch), Harman Reference (in-cabin target), Vocal Clarity | Profile ID (`sql`, `harman`, `vocal`, `flat`) | Preset 14-band gain arrays with cabin standing wave adjustments | Default to SQL Punjabi/Hip-Hop profile | `app/algorithms/eq_optimizer.py` |
| 4 | R2: Acoustic Engine | Speed of Sound Calculator | Accurate acoustic propagation constant across temperature & humidity | Temperature $T\ (^\circ\text{C})$, Relative Humidity $\text{RH}\ (\%)$ | Speed of sound $c\ (\text{cm/ms})$ (Standard: $34.3\text{ cm/ms}$ @ $20^\circ\text{C}$) | Clamps out-of-range temperatures | Physics standards & `app/algorithms/time_alignment.py` |
| 5 | R2: Acoustic Engine | Time Alignment Calculation | Millimeter-accurate delay calculation for asymmetric RHD seating relative to furthest speaker | Speaker distances $\{FL, FR, RL, RR, SUB\}$ in cm, listening position | Delays in ms, equivalent distance offset (cm), sample offsets @ 48kHz | Empty dict returns empty object | `app/algorithms/time_alignment.py` |
| 6 | R2: Acoustic Engine | Subwoofer Phase Alignment | In-cabin acoustic phase recommendations (0° vs 180°) based on boot boundary loading | Subwoofer distance, enclosure orientation | Textual phase recommendation & quarter-wavelength calculation | Default to 0° normal phase | `app/algorithms/time_alignment.py` |
| 7 | R2: Acoustic Engine | Linkwitz-Riley & Butterworth Crossovers | High-Pass and Low-Pass filter recommendations for front components, rear fill, and subwoofers | Speaker size (6.5", 5.25", 4"), sub presence, rear presence | Filter type (HPF/LPF), cutoff frequency (Hz), slope (12/24dB/oct), physical dial clock positions | Default 80Hz HPF for 6.5" woofers | `app/algorithms/crossover.py` |
| 8 | R2: Acoustic Engine | Ported Subsonic Protection | High-pass cutoff below enclosure port resonance to prevent mechanical cone unloading | Enclosure type (`ported`/`sealed`), port tuning frequency $f_{\text{tune}}$ (Hz) | Subsonic HPF frequency $f_{\text{subsonic}} = \max(20, f_{\text{tune}} - 7)\text{ Hz}$ | Defaults to 20Hz for sealed enclosures | `app/algorithms/crossover.py` |
| 9 | R2: Acoustic Engine | Rear Fill Level Attenuation | Attenuates rear coaxials to prevent pulling the front vocal stage backward | Rear RMS power, speaker presence | $-4.0\text{ dB}$ power attenuation factor ($0.6 \times P_{\text{rear}}$) | $0\text{ V}$ if rear delete selected | `app/algorithms/crossover.py`, `app/algorithms/gain_staging.py` |
| 10 | R2: Acoustic Engine | Gain Staging & Target AC Voltages | DMM AC voltage target calculation ($V = \sqrt{P \times R}$) for sensitivity matching | Head unit pre-out V, RMS power (W), load impedance ($\Omega$) | Target AC Volts for Front, Rear, Sub; approx knob clock positions | Prevents pre-out clipping via 75% volume rule | `app/algorithms/gain_staging.py` |
| 11 | R2: Acoustic Engine | Standing Wave Resonant Notch | Cabin-specific parametric EQ notch filtering for low-mid cabin boom | Car category, cabin volume ($m^3$), resonant frequency (Hz) | $-1.5\text{ dB}$ (Compact SUV/Hatchback) or $-2.0\text{ dB}$ (Full-Size SUV) @ 200 Hz | Clamped to $\pm 12\text{ dB}$ range | `app/algorithms/eq_optimizer.py` |
| 12 | R2: Acoustic Engine | Windshield Reflection Taming | High-frequency notch to prevent listener fatigue from glass reflections | Glass geometry / A-pillar tweeter position | $-1.0\text{ dB}$ cut @ 4,000 Hz | Applied across component profiles | `app/algorithms/eq_optimizer.py` |
| 13 | R3: Visualizer | Top-Down 2D Cabin Canvas | Real-time 60FPS canvas rendering car body schematic, seats, driver head target | Canvas 2D context, vehicle dimensions, time alignment state | Rendered car wireframe with glowing sweet spot | Graceful fallback on non-web platforms | `mobile-app/app/(tabs)/index.tsx` |
| 14 | R3: Visualizer | Soundfield Wave Simulator | Dynamic circular acoustic wavefronts showing phase arrival at driver's headrest | Speaker coordinates, calculated delays (ms), time counter | Animated wave rings converging at driver's position | Wave radius modulo reset | `mobile-app/app/(tabs)/index.tsx` |
| 15 | R3: Visualizer | Bezier Spline 14-Band Equalizer | Continuous mathematical Bezier spline rendering across 14 frequency bands | 14 gain values (dB), canvas width/height | Smooth glowing cyan spline curve with fill gradient | Clamps points within canvas viewport | `mobile-app/app/(tabs)/index.tsx` |
| 16 | R3: Audio Generator | Web Audio Precision Tone Generator | In-browser synthesizer for calibration tones (1kHz sine, 50Hz sine, Pink Noise) | Web Audio `AudioContext`, tone type, frequency | Clean audio sine wave / filtered pink noise stream | Catch and alert if Web Audio unsupported | `mobile-app/app/(tabs)/index.tsx` |
| 17 | R3: Audio Generator | Paul Kellet 3-Pole Pink Noise | Digital filter algorithm approximating $1/f$ spectral density for RTA testing | White noise input, 6-pole filter state ($b_0 \dots b_6$) | Full-spectrum pink noise buffer looped seamlessly | Loop buffer audio allocation | `mobile-app/app/(tabs)/index.tsx` |
| 18 | R4: Backend API | Full Tuning Pipeline Endpoint | REST endpoint `/api/tuning/calculate` executing all algorithms in a single call | `TuningCalculationRequest` JSON | `TuningCalculationResponse` with full EQ, Crossover, Delays, Gains, Checklist, Previews | 422 Validation Error on invalid payload | `app/routers/tuning.py` |
| 19 | R4: Backend API | Phone OTP Authentication | Phone login via Twilio Verify API with dev mode mock fallback (`123456`) | Indian phone number (`+91...`), OTP code | JWT Bearer access token, User profile | 400 Bad Request on invalid/expired OTP | `app/routers/auth.py` |
| 20 | R4: Backend API | Indian Payments & Subscriptions | Razorpay integration for Free, Pro Monthly (₹99), Pro Yearly (₹999) | Plan ID, Razorpay payment signature & order ID | Razorpay Order ID, HMAC SHA256 verification response | 400 Bad Request on signature mismatch | `app/routers/payments.py` |
| 21 | R4: Backend API | Acoustic Measurement Smoothing | 1/3-octave moving average convolution for RTA mic data and peak resonance detection | List of `{frequency_hz, spl_db}` | Smoothed curve points, detected resonance peaks (>3dB), suggested EQ cuts | 400 Bad Request if data empty | `app/routers/measurements.py` |
| 22 | R4: Backend API | Pioneer DEH-80PRS XML Exporter | Formats tuning settings into standard Pioneer head unit / DSP XML file | Tuning profile dictionary | Valid XML string (`<PioneerDSPConfig>`) | Formats valid empty tags if parameters missing | `app/algorithms/dsp_export.py` |
| 23 | R4: Backend API | MiniDSP 2x4 HD JSON Exporter | Formats routing, delays, crossovers, and PEQ bands into MiniDSP JSON | Tuning profile dictionary | Valid MiniDSP configuration JSON | Valid JSON syntax guaranteed | `app/algorithms/dsp_export.py` |
| 24 | R4: Backend API | Biquad IIR Filter Engine | Second-order biquad coefficient generation for hardware DSPs | Filter type (Peaking, HPF, LPF, Notch), $f_0, Q, \text{Gain}$ | Coefficients ($b_0, b_1, b_2, a_0, a_1, a_2$) | Clamps center frequency below Nyquist ($f_s/2$) | DSP standard (Cookbook) |

---

## 3. Detailed Requirement Specifications

### R1: Multi-Step Configurator & Indian Vehicle Acoustic Database

#### 3.1 Wizard Workflow Architecture
1. **Step 1: Vehicle Make Selection**
   - User chooses from 9+ major manufacturers active in the Indian market.
   - Real-time search filter filtering makes and underlying model names.
   - Badge styling and metadata (country of origin, model count).
2. **Step 2: Vehicle Model & Cabin Geometry Selection**
   - User selects specific car model.
   - Automatically loads wheelbase (mm), cabin volume ($m^3$), acoustic standing wave resonance frequency ($f_{\text{res}}$ in Hz), and speaker mounting specifications.
   - Displays door mounting depth limits ($maxDepthMm$) to prevent window mechanism collisions.
3. **Step 3: Installed Audio Hardware Configuration**
   - **Head Unit**: Pre-out voltage ($0.8\text{V} - 5.0\text{V}$), EQ bands (3 to 31 bands), interface category.
   - **Front Speakers**: 2-way component sets (45W–90W RMS, $4\Omega/3\Omega$, sensitivity $89 - 93.5\text{ dB}$).
   - **Rear Speakers**: Coaxial speakers or "Rear Delete" SQ mode (attenuated spatial fill).
   - **Amplifiers**: 4-channel, dual-amplifier (MOCO 4-Ch + Sound Barrier Mono), 8-channel DSP amp, or direct Head Unit power.
   - **Subwoofers**: Ported custom enclosures (33Hz–38Hz tuning), sealed enclosures (tight SQ), active under-seat subs, spare tire well subs, or "No Subwoofer".
4. **Step 4: AI Acoustic Tuning Dashboard & Studio**
   - Live summary card with quick gear edit shortcut.
   - Target Sound Profile selector (SQL, Harman Reference, Vocal Clarity).
   - 6 Studio Sub-Tabs: (1) Live Soundfield, (2) Bezier EQ, (3) Crossovers & Dials, (4) Multimeter Voltages, (5) Tone Generator, (6) DSP Exporter.

#### 3.2 Indian Vehicle Cabin Database Specification

| Make | Model | Category | Wheelbase (mm) | Cabin Vol ($m^3$) | Standing Wave Peak ($f_{\text{res}}$ Hz) | Driver RHD Distances (cm) [FL, FR, RL, RR, SUB] | Front Speaker | Rear Speaker | Tweeter Location | Max Depth (mm) |
|---|---|---|---|---|---|---|---|---|---|---|
| **Škoda** | Kylaq (2025) | Compact SUV | 2566 | 3.1 | 195 Hz | {FL: 138, FR: 95, RL: 155, RR: 115, SUB: 210} | 6.5" Component | 6.5" Coaxial | A-Pillar / Sail | 68 mm |
| **Škoda** | Kushaq | Midsize SUV | 2651 | 3.3 | 190 Hz | {FL: 142, FR: 98, RL: 160, RR: 118, SUB: 218} | 6.5" Component | 6.5" Coaxial | A-Pillar | 72 mm |
| **Škoda** | Slavia | Sedan | 2651 | 3.4 | 185 Hz | {FL: 140, FR: 96, RL: 165, RR: 122, SUB: 225} | 6.5" Component | 6.5" Coaxial | A-Pillar | 70 mm |
| **Maruti Suzuki** | Swift (2024) | Hatchback | 2450 | 2.8 | 210 Hz | {FL: 130, FR: 88, RL: 145, RR: 105, SUB: 190} | 6.5" Component | 6.5" Coaxial | A-Pillar | 65 mm |
| **Maruti Suzuki** | Brezza | Compact SUV | 2500 | 3.0 | 200 Hz | {FL: 135, FR: 92, RL: 152, RR: 112, SUB: 205} | 6.5" Component | 6.5" Coaxial | A-Pillar | 75 mm |
| **Maruti Suzuki** | Baleno | Hatchback | 2520 | 2.9 | 205 Hz | {FL: 132, FR: 90, RL: 148, RR: 108, SUB: 195} | 6.5" Component | 6.5" Coaxial | Mirror Sail | 68 mm |
| **Maruti Suzuki** | Jimny 5-Door | Off-Road SUV | 2590 | 2.7 | 220 Hz | {FL: 126, FR: 84, RL: 138, RR: 98, SUB: 175} | 5.25" / 6.5" | 5.25" Coaxial | Dashboard | 60 mm |
| **Maruti Suzuki** | Grand Vitara | Midsize SUV | 2600 | 3.3 | 195 Hz | {FL: 140, FR: 96, RL: 158, RR: 116, SUB: 215} | 6.5" Component | 6.5" Coaxial | A-Pillar | 72 mm |
| **Hyundai** | Creta (2024) | Midsize SUV | 2610 | 3.3 | 192 Hz | {FL: 142, FR: 98, RL: 160, RR: 120, SUB: 220} | 6.5" Component | 6.5" Coaxial | A-Pillar | 72 mm |
| **Hyundai** | Venue | Compact SUV | 2500 | 2.9 | 205 Hz | {FL: 134, FR: 91, RL: 149, RR: 109, SUB: 200} | 6.5" Component | 6.5" Coaxial | Door Sail | 68 mm |
| **Hyundai** | i20 (3rd Gen) | Hatchback | 2580 | 2.9 | 208 Hz | {FL: 133, FR: 89, RL: 148, RR: 108, SUB: 195} | 6.5" Component | 6.5" Coaxial | Door Sail | 65 mm |
| **Tata Motors** | Nexon (2024) | Compact SUV | 2498 | 3.1 | 198 Hz | {FL: 136, FR: 92, RL: 150, RR: 110, SUB: 205} | 6.5" Component | 6.5" Coaxial | A-Pillar | 70 mm |
| **Tata Motors** | Harrier | Midsize SUV | 2741 | 3.7 | 180 Hz | {FL: 150, FR: 102, RL: 172, RR: 128, SUB: 235} | 6.5" Component | 6.5" Coaxial | A-Pillar | 78 mm |
| **Tata Motors** | Punch | Compact SUV | 2445 | 2.8 | 212 Hz | {FL: 131, FR: 88, RL: 144, RR: 104, SUB: 190} | 6.5" Component | 6.5" Coaxial | A-Pillar | 65 mm |
| **Mahindra** | Thar 4x4 / Roxx | Off-Road SUV | 2450 | 3.0 | 215 Hz | {FL: 128, FR: 85, RL: 140, RR: 100, SUB: 180} | 6.5" Roof / Dash | 6.5" Roof Bar | Dash Top | 65 mm |
| **Mahindra** | Scorpio-N | Full-Size SUV | 2750 | 4.1 | 175 Hz | {FL: 152, FR: 104, RL: 176, RR: 132, SUB: 245} | 6.5" Component | 6.5" Coaxial | A-Pillar | 80 mm |
| **Mahindra** | XUV700 | Full-Size SUV | 2750 | 4.0 | 178 Hz | {FL: 154, FR: 105, RL: 178, RR: 134, SUB: 248} | 6.5" Component | 6.5" Coaxial | A-Pillar | 80 mm |
| **Toyota** | Fortuner | Full-Size SUV | 2745 | 4.2 | 172 Hz | {FL: 155, FR: 105, RL: 180, RR: 135, SUB: 250} | 6x9" / 6.5" Comp | 6.5" Coaxial | Dash Top | 85 mm |
| **Toyota** | Hyryder | Midsize SUV | 2600 | 3.3 | 195 Hz | {FL: 140, FR: 96, RL: 158, RR: 116, SUB: 215} | 6.5" Component | 6.5" Coaxial | A-Pillar | 72 mm |
| **Toyota** | Innova Hycross | MPV | 2850 | 4.5 | 168 Hz | {FL: 158, FR: 108, RL: 185, RR: 140, SUB: 260} | 6.5" Component | 6.5" Coaxial | A-Pillar | 80 mm |
| **Kia** | Seltos | Midsize SUV | 2610 | 3.3 | 192 Hz | {FL: 142, FR: 98, RL: 160, RR: 120, SUB: 220} | 6.5" Component | 6.5" Coaxial | A-Pillar | 72 mm |
| **Kia** | Sonet | Compact SUV | 2500 | 2.9 | 204 Hz | {FL: 134, FR: 91, RL: 149, RR: 109, SUB: 200} | 6.5" Component | 6.5" Coaxial | Door Sail | 68 mm |
| **Volkswagen** | Taigun | Midsize SUV | 2651 | 3.3 | 190 Hz | {FL: 142, FR: 98, RL: 160, RR: 118, SUB: 218} | 6.5" Component | 6.5" Coaxial | A-Pillar | 72 mm |
| **Volkswagen** | Virtus | Sedan | 2651 | 3.4 | 185 Hz | {FL: 140, FR: 96, RL: 165, RR: 122, SUB: 225} | 6.5" Component | 6.5" Coaxial | A-Pillar | 70 mm |
| **Honda** | City (5th Gen) | Sedan | 2600 | 3.2 | 194 Hz | {FL: 138, FR: 94, RL: 162, RR: 120, SUB: 220} | 6.5" Component | 6.5" Coaxial | Mirror Sail | 68 mm |
| **Honda** | Elevate | Midsize SUV | 2650 | 3.4 | 188 Hz | {FL: 141, FR: 97, RL: 160, RR: 119, SUB: 222} | 6.5" Component | 6.5" Coaxial | A-Pillar | 72 mm |

#### 3.3 Cabin Acoustic Absorption & Road Noise Masking Profiles
- **Absorption Characteristics by Category**:
  - *Hatchbacks / Compact SUVs (2.7–3.1 $m^3$)*: Shorter acoustic path length creates primary standing wave resonance at $195 - 220\text{ Hz}$. Moderate door sheet metal damping required.
  - *Midsize SUVs / Sedans (3.2–3.7 $m^3$)*: Standing wave resonance at $180 - 195\text{ Hz}$. Glass reflection from sloped windscreens creates $+3\text{ dB}$ reflection peak at $3.5 - 4.5\text{ kHz}$.
  - *Full-Size SUVs / MPVs (4.0–4.5 $m^3$)*: Deep cabin length lowers primary standing resonance to $168 - 178\text{ Hz}$. Requires a deeper $-2.0\text{ dB}$ notch at $200\text{ Hz}$.
- **Road Noise Floors (Indian Highway Asphalt & Concrete)**:
  - *At 60 km/h*: In-cabin noise floor $\approx 64 - 68\text{ dBA}$, centered around $80 - 160\text{ Hz}$ tire hum.
  - *At 100 km/h*: In-cabin noise floor $\approx 72 - 76\text{ dBA}$, creating acoustic masking below $125\text{ Hz}$. Requires dynamic bass boost ($+4\text{ dB}$ to $+6\text{ dB}$) to preserve perceived low-end punch.

---

### R2: Acoustic Calculation & Gain Staging Engine (Exact Mathematical Formulas)

#### 4.1 Speed of Sound vs. Temperature & Relative Humidity
The speed of sound in dry air is modeled as:
$$c(T) = 331.3 \times \sqrt{1 + \frac{T}{273.15}} \approx 331.3 + 0.606 \times T \quad [\text{m/s}]$$
With relative humidity ($\text{RH}$) correction factor:
$$c(T, \text{RH}) = c(T) + \left(0.0124 \times \frac{\text{RH}}{100} \times T\right) \quad [\text{m/s}]$$
At standard calibration baseline ($T = 20^\circ\text{C}$, $50\%\ \text{RH}$):
$$c = 343.4\text{ m/s} = 34.34\text{ cm/ms} \implies \text{Constant: } 34.3\text{ cm/ms}$$

#### 4.2 Time Alignment Delay Calculation
In Right-Hand Drive (RHD) Indian vehicles, the driver sits closest to the Front Right (FR: ~95cm) and Rear Right (RR: ~115cm) speakers, while the Subwoofer in the boot is furthest (SUB: ~210cm).
1. Identify the furthest speaker distance:
   $$d_{\max} = \max\left(d_{\text{FL}}, d_{\text{FR}}, d_{\text{RL}}, d_{\text{RR}}, d_{\text{SUB}}\right)$$
2. Compute distance offset for each channel $i \in \{\text{FL}, \text{FR}, \text{RL}, \text{RR}, \text{SUB}\}$:
   $$\Delta d_i = d_{\max} - d_i \quad [\text{cm}]$$
3. Compute time delay in milliseconds:
   $$\tau_i = \frac{\Delta d_i}{34.3} \quad [\text{ms}]$$
4. Compute integer DSP sample offset at $48\text{ kHz}$ sampling rate:
   $$N_{\text{samples}, i} = \text{round}\left(\frac{\tau_i}{1000} \times 48000\right)$$

*Example for Skoda Kylaq ($d_{\max} = 210\text{ cm}$ at SUB)*:
- **FR** ($95\text{ cm}$): $\Delta d = 115\text{ cm} \implies \tau = \frac{115}{34.3} = 3.35\text{ ms} \implies 161\text{ samples}$
- **RR** ($115\text{ cm}$): $\Delta d = 95\text{ cm} \implies \tau = \frac{95}{34.3} = 2.77\text{ ms} \implies 133\text{ samples}$
- **FL** ($138\text{ cm}$): $\Delta d = 72\text{ cm} \implies \tau = \frac{72}{34.3} = 2.10\text{ ms} \implies 101\text{ samples}$
- **RL** ($155\text{ cm}$): $\Delta d = 55\text{ cm} \implies \tau = \frac{55}{34.3} = 1.60\text{ ms} \implies 77\text{ samples}$
- **SUB** ($210\text{ cm}$): $\Delta d = 0\text{ cm} \implies \tau = 0.00\text{ ms} \implies 0\text{ samples (Reference)}$

#### 4.3 Crossover Math & Subsonic Port Protection
1. **Linkwitz-Riley 4th Order (LR24 - 24 dB/octave)**:
   - Formed by cascading two 2nd-order Butterworth filters ($Q = 0.5$).
   - Magnitude response at cutoff $f_c$: $-6.02\text{ dB}$.
   - Summed magnitude: perfectly flat ($0\text{ dB}$) across the crossover transition band.
   - Phase difference between HPF and LPF outputs: $360^\circ$ ($0^\circ$ equivalent), eliminating lobing tilt.
2. **Butterworth 2nd & 3rd Order (BW12 / BW18)**:
   - BW12 ($Q = 0.7071$, 12 dB/oct): $-3\text{ dB}$ at $f_c$, $180^\circ$ phase difference (requires inverting tweeter/woofer polarity).
   - BW18 (18 dB/oct): $-3\text{ dB}$ at $f_c$, $270^\circ$ phase difference.
3. **Filter Assignment Matrix**:
   - **Front Stage HPF**:
     - $6.5\text{" Woofers}$: $f_{\text{HPF}} = 80\text{ Hz}$ (LR24 or BW12).
     - $5.25\text{" / } 4\text{" Woofers}$: $f_{\text{HPF}} = 100\text{ Hz}$.
     - Full range if no subwoofer present.
   - **Rear Stage HPF (Rear Fill)**:
     - With Subwoofer: $f_{\text{HPF}} = 90\text{ Hz}$ (BW12) with $-4.0\text{ dB}$ power attenuation.
     - Without Subwoofer: $f_{\text{HPF}} = 60\text{ Hz}$.
   - **Subwoofer LPF**:
     - $f_{\text{LPF}} = 80\text{ Hz}$ (LR24 or BW12).
   - **Ported Box Subsonic Protection**:
     - Below enclosure port resonance $f_{\text{tune}}$, air in the port no longer provides backpressure; driver excursion increases exponentially ($\propto 1/f^4$), causing voice coil bottoming out.
     - Exact Subsonic Cutoff Formula:
       $$f_{\text{subsonic}} = \max\left(20.0, \text{round}(f_{\text{tune}} - 7.0)\right) \quad [\text{Hz}]$$
       *(e.g., for $f_{\text{tune}} = 35\text{ Hz} \implies f_{\text{subsonic}} = 28\text{ Hz}$ HPF)*.
   - **Sealed Box Infrasonic Cutoff**: $20\text{ Hz}$ HPF (natural acoustic suspension roll-off).
   - **Bass Boost Calibration**: $0\text{ dB}$ (OFF) mandatory to prevent amp clipping and severe phase shift.

#### 4.4 Gain Staging Engine & Multimeter Calibration
Gain is an **input sensitivity matching dial**, not a volume control.
1. **Head Unit Clean Clipping Limit**:
   - DAC pre-out stages on automotive head units clip when driven above $75\% - 80\%$ volume:
     $$\text{Volume}_{\text{tune}} = \text{int}\left(\text{Volume}_{\max} \times 0.75\right)$$
     *(e.g., Volume Step 30 on 40-step Nakamichi NAM5510)*.
2. **Target AC Voltage Formulation ($V = \sqrt{P \times R}$)**:
   - **Front Channels (CH1/CH2)** using $1\text{ kHz 0dB Sine Wave}$:
     $$V_{\text{target, front}} = \sqrt{P_{\text{front, RMS}} \times R_{\text{front, nominal}}}$$
     *(e.g., $P = 45\text{W}$, $R = 4\Omega \implies V = \sqrt{45 \times 4} = \sqrt{180} \approx 13.42\text{ V AC}$)*.
   - **Rear Fill Channels (CH3/CH4)** using $1\text{ kHz 0dB Sine Wave}$ (60% power attenuation):
     $$V_{\text{target, rear}} = \sqrt{(P_{\text{rear, RMS}} \times 0.6) \times R_{\text{rear, nominal}}}$$
     *(e.g., $P = 45\text{W}$, $R = 4\Omega \implies V = \sqrt{27 \times 4} = \sqrt{108} \approx 10.39\text{ V AC}$)*.
   - **Subwoofer Channel (Bridged Mono)** using $50\text{ Hz 0dB Sine Wave}$:
     $$V_{\text{target, sub}} = \sqrt{P_{\text{sub, RMS}} \times R_{\text{sub, nominal}}}$$
     *(e.g., $P = 250\text{W}$, $R = 8\Omega \text{ (Series DVC)} \implies V = \sqrt{250 \times 8} = \sqrt{2000} \approx 44.72\text{ V AC}$)*  
     *(e.g., $P = 250\text{W}$, $R = 4\Omega \implies V = \sqrt{250 \times 4} = \sqrt{1000} \approx 31.62\text{ V AC}$)*.

#### 4.5 Target Equalization Curves (14-Band ISO Frequencies)
Standard 14 frequencies: `[32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000]` Hz.

| Frequency | SQL Punjabi / EDM / Hip-Hop | Harman Reference | Vocal Clarity | Flat Baseline | Acoustic Rationale |
|---|---|---|---|---|---|
| **32 Hz** | $+4.0\text{ dB}$ (with sub) | $+3.0\text{ dB}$ | $+1.0\text{ dB}$ | $0.0\text{ dB}$ | Deep infrasonic extension (35Hz ported resonance zone) |
| **63 Hz** | $+5.5\text{ dB}$ (with sub) | $+3.0\text{ dB}$ | $+1.0\text{ dB}$ | $0.0\text{ dB}$ | Primary kick-drum and 808 sub-bass energy |
| **100 Hz** | $+2.0\text{ dB}$ | $+1.5\text{ dB}$ | $0.0\text{ dB}$ | $0.0\text{ dB}$ | Upper bass impact; keeps front door plastics quiet |
| **200 Hz** | $-1.5\text{ dB}$ ($-2.0\text{ dB}$ SUV) | $-1.0\text{ dB}$ | $-2.0\text{ dB}$ | $0.0\text{ dB}$ | **Standing wave notch filter** (removes muddy cabin boom) |
| **400 Hz** | $0.0\text{ dB}$ | $0.0\text{ dB}$ | $+1.0\text{ dB}$ | $0.0\text{ dB}$ | Lower vocal fundamental transparency |
| **630 Hz** | $+0.5\text{ dB}$ | $0.0\text{ dB}$ | $+1.5\text{ dB}$ | $0.0\text{ dB}$ | Male vocal chest resonance clarity |
| **1,000 Hz** | $+0.5\text{ dB}$ | $0.0\text{ dB}$ | $+2.0\text{ dB}$ | $0.0\text{ dB}$ | Acoustic vocal intelligibility sweet spot |
| **2,000 Hz** | $+1.0\text{ dB}$ | $+0.5\text{ dB}$ | $+1.5\text{ dB}$ | $0.0\text{ dB}$ | Snare drum snap and speech presence |
| **4,000 Hz** | $-1.0\text{ dB}$ | $-0.5\text{ dB}$ | $0.0\text{ dB}$ | $0.0\text{ dB}$ | **Windshield reflection tamer** (prevents ear fatigue) |
| **8,000 Hz** | $+1.5\text{ dB}$ | $0.0\text{ dB}$ | $+1.0\text{ dB}$ | $0.0\text{ dB}$ | Crisp hi-hat and cymbal definition on silk dome tweeters |
| **10,000 Hz** | $+1.5\text{ dB}$ | $+0.5\text{ dB}$ | $+1.0\text{ dB}$ | $0.0\text{ dB}$ | High-frequency detail without sibilant hash |
| **12,000 Hz** | $+2.0\text{ dB}$ | $+0.5\text{ dB}$ | $+1.0\text{ dB}$ | $0.0\text{ dB}$ | Upper octave acoustic sparkle |
| **14,000 Hz** | $+1.5\text{ dB}$ | $0.0\text{ dB}$ | $+0.5\text{ dB}$ | $0.0\text{ dB}$ | Harmonic shimmer |
| **16,000 Hz** | $+1.5\text{ dB}$ | $0.0\text{ dB}$ | $+0.5\text{ dB}$ | $0.0\text{ dB}$ | Extreme high-end openness |

---

### R3: Interactive Soundfield Simulation & Bezier Equalizer

#### 5.1 Top-Down 2D Cabin Canvas Simulation (60 FPS)
- **Canvas Viewport**: $480 \times 420\text{ px}$ (web) / dynamic aspect ratio on mobile.
- **Visual Elements**:
  - Vehicle outer body contour rendered with cyan glow (`rgba(56, 189, 248, 0.25)`).
  - Front seats ($W \times H: 22\% \times 16\%$), Rear bench ($52\% \times 14\%$).
  - Driver head target at $(X: 65\%, Y: 42\%)$ with dynamic breathing pulse ($\pm 3\text{ px}$ at $0.08\text{ rad/frame}$) and `"SWEET SPOT (DRIVER)"` label.
- **Wave Propagation Algorithm**:
  - Wave Phase: $\Phi_i(t) = (t \times 1.5 - \text{delayOffset}_i) \pmod{120}$
  - For Time Alignment ON: $\text{delayOffset}_i = \tau_i \times 8.0$
  - For Time Alignment OFF: $\text{delayOffset}_i = 0$
  - Concentric rings expand from $r = \Phi_i$ to $r = 180\text{ px}$ with alpha fade: $\alpha(r) = 1 - r/180$.
  - Subwoofer emits amber waves (`#f59e0b`, width 2px); door speakers emit cyan/indigo waves (`#06b6d4`/`#818cf8`).

#### 5.2 14-Band Continuous Bezier Spline Parametric Equalizer
- **Spline Rendering Engine**:
  - Control points $(x_i, y_i)$ where $x_i = i \times \frac{\text{width}}{N-1}$ and $y_i = y_{\text{zero}} - \left(\frac{\text{gain}_i}{12}\right) \times (0.4 \times \text{height})$.
  - Quadratic Bezier segments connecting midpoints:
    $$\text{Control Point } CP_i = \left(\frac{x_i + x_{i+1}}{2}, \frac{y_i + y_{i+1}}{2}\right)$$
    $$B(t) = (1-t)^2 P_i + 2(1-t)t P_i + t^2 CP_i$$
  - Cyan neon glow (`#06b6d4`, shadowBlur: 12) with vertical gradient area fill (`rgba(6, 182, 212, 0.25)` to `transparent`).
  - Interactive steppers ($\pm 0.5\text{ dB}$, bounds $[-12\text{ dB}, +12\text{ dB}]$) with colored gain indicators (Green for boost, Red for cut).

#### 5.3 In-Browser Web Audio Test Tone Synthesis
1. **$1,000\text{ Hz}$ (1 kHz) 0dB Sine Wave Generator**:
   - `AudioContext.createOscillator()`, `type = 'sine'`, `frequency = 1000`.
   - Connected via `GainNode` ($0.2$ master gain) to `AudioContext.destination`.
   - Used for setting Front & Rear amplifier sensitivity with DMM AC Volts.
2. **$50\text{ Hz}$ 0dB Sine Wave Generator**:
   - `AudioContext.createOscillator()`, `type = 'sine'`, `frequency = 50`.
   - Connected to `GainNode` $\to$ `destination`.
   - Used for setting Subwoofer amplifier gain with DMM AC Volts.
3. **Full-Spectrum Pink Noise Generator (Paul Kellet 3-Pole Filter)**:
   - 2-second looped audio buffer at `sampleRate` (e.g. 48,000 or 44,100 Hz).
   - Filter difference equations per white noise sample $w \in [-1, 1]$:
     $$b_0 = 0.99886 b_0 + 0.0555179 w$$
     $$b_1 = 0.99332 b_1 + 0.0750759 w$$
     $$b_2 = 0.96900 b_2 + 0.1538520 w$$
     $$b_3 = 0.86650 b_3 + 0.3104856 w$$
     $$b_4 = 0.55000 b_4 + 0.5329522 w$$
     $$b_5 = -0.7616 b_5 - 0.0168980 w$$
     $$\text{out}[n] = (b_0 + b_1 + b_2 + b_3 + b_4 + b_5 + b_6 + 0.5362 w) \times 0.11$$
     $$b_6 = 0.115926 w$$
   - Produces exact $-3\text{ dB/octave}$ ($1/f$) energy distribution for acoustic RTA microphone measurements.

---

### R4: Backend APIs, Auth, Payments & DSP Exporter

#### 6.1 Complete REST API Specification

| Method | Endpoint | Description | Request Body | Response Body | Auth Required |
|---|---|---|---|---|---|
| `GET` | `/` | API Root Health & Service Status | None | `{"status": "healthy", "service": "CarAudioAI Backend API", "version": "1.0.0"}` | No |
| `GET` | `/api/health` | Health Check | None | `{"status": "ok", "timestamp": "...", "database": "connected"}` | No |
| `GET` | `/api/cars` | List Indian cars with optional brand filter | None (`?make=...`) | `List[CarResponse]` | No |
| `GET` | `/api/cars/{make}/{model}` | Get specific car acoustic specs | None | `CarResponse` | No |
| `GET` | `/api/equipment` | List audio gear with category/brand filter | None (`?category=...&brand=...`) | `List[EquipmentItem]` | No |
| `GET` | `/api/equipment/categories` | List available hardware categories | None | `{"categories": ["amplifier", "dsp", "head_unit", "speaker", "subwoofer"]}` | No |
| `POST` | `/api/tuning/calculate` | End-to-end acoustic calculation pipeline | `TuningCalculationRequest` | `TuningCalculationResponse` | No |
| `POST` | `/api/auth/send-otp` | Send phone OTP code via SMS | `SendOTPRequest` (`phone_number`) | `SendOTPResponse` | No |
| `POST` | `/api/auth/verify-otp` | Verify OTP code and issue JWT token | `VerifyOTPRequest` (`phone_number`, `otp_code`, `name`) | `TokenResponse` (`access_token`, `user_id`, `tier`) | No |
| `GET` | `/api/auth/me` | Authenticated user profile | None | `UserProfileResponse` | Yes (Bearer JWT) |
| `GET` | `/api/payments/plans` | List subscription pricing tiers in INR | None | `List[PaymentPlanItem]` | No |
| `POST` | `/api/payments/create-order` | Create Razorpay order in INR | `CreatePaymentOrderRequest` (`plan_id`) | `PaymentOrderResponse` (`order_id`, `amount_inr`, `key`) | Yes (Bearer JWT) |
| `POST` | `/api/payments/verify` | Verify payment signature & upgrade tier | `VerifyPaymentRequest` | `VerifyPaymentResponse` | Yes (Bearer JWT) |
| `POST` | `/api/measurements` | Upload microphone RTA data & smooth | `MeasurementUploadRequest` | `MeasurementResponse` (smoothed data + resonance peaks) | No |

#### 6.2 Subscription Pricing Tiers (INR)
1. **Free Tier (₹0 / Lifetime)**:
   - 1 Vehicle Profile, Basic 14-Band Graphic EQ, Standard Pink Noise Generator.
2. **Pro Monthly (₹99 / month)**:
   - Unlimited Cars & Audio Hardware Sets, Advanced Linkwitz-Riley Crossover Matrix, Millimeter-Accurate Time Alignment Delays, Ported Box Subsonic Safety Protection, Direct DSP File Export (Pioneer XML, MiniDSP JSON).
3. **Pro Yearly / Installer (₹999 / year — Best Value)**:
   - Everything in Pro Monthly + Installer Multi-Car Tuning Mode + WhatsApp Tuning Report Generation + 2 Months Free.

#### 6.3 DSP Exporter File Formats & Biquad Filter Mathematics

##### 6.3.1 Pioneer DEH-80PRS XML Format
```xml
<PioneerDSPConfig version="1.0">
  <Metadata>
    <Car>Skoda Kylaq</Car>
    <Profile>sql_punjabi_hiphop</Profile>
  </Metadata>
  <Equalizer type="Graphic14Band">
    <Band freq="32">4.0</Band>
    <Band freq="63">5.5</Band>
    <Band freq="100">2.0</Band>
    <Band freq="200">-1.5</Band>
    <Band freq="400">0.0</Band>
    <Band freq="630">0.5</Band>
    <Band freq="1000">0.5</Band>
    <Band freq="2000">1.0</Band>
    <Band freq="4000">-1.0</Band>
    <Band freq="8000">1.5</Band>
    <Band freq="10000">1.5</Band>
    <Band freq="12000">2.0</Band>
    <Band freq="14000">1.5</Band>
    <Band freq="16000">1.5</Band>
  </Equalizer>
  <CrossoverNetwork>
    <Front freq="80" slope="24dB" type="HPF"/>
    <Rear freq="90" slope="12dB" type="HPF"/>
    <Subwoofer freq="80" subsonic="28" type="LPF"/>
  </CrossoverNetwork>
  <TimeAlignment>
    <Channel delay_ms="2.1" name="FL"/>
    <Channel delay_ms="3.35" name="FR"/>
    <Channel delay_ms="1.6" name="RL"/>
    <Channel delay_ms="2.77" name="RR"/>
    <Channel delay_ms="0.0" name="SUB"/>
  </TimeAlignment>
</PioneerDSPConfig>
```

##### 6.3.2 MiniDSP 2x4 HD / C-DSP JSON Format
```json
{
  "version": "1.0",
  "device": "MiniDSP 2x4 HD / C-DSP",
  "car": "Skoda Kylaq",
  "sound_profile": "sql_punjabi_hiphop",
  "routing": {
    "Input 1/2": [
      "Out 1 (Front Left)",
      "Out 2 (Front Right)",
      "Out 3 (Rear Fill)",
      "Out 4 (Subwoofer)"
    ]
  },
  "crossover": {
    "front": { "filter_type": "HPF", "cutoff_frequency_hz": 80, "slope": "24dB" },
    "rear": { "filter_type": "HPF", "cutoff_frequency_hz": 90, "slope": "12dB" },
    "subwoofer": { "lpf_frequency_hz": 80, "subsonic_filter_hz": 28 }
  },
  "delays_ms": {
    "FL": 2.1,
    "FR": 3.35,
    "RL": 1.6,
    "RR": 2.77,
    "SUB": 0.0
  },
  "peq_bands": [
    { "frequency_hz": 63, "gain_db": 5.5, "q": 1.41 },
    { "frequency_hz": 200, "gain_db": -1.5, "q": 2.0 },
    { "frequency_hz": 4000, "gain_db": -1.0, "q": 1.5 }
  ]
}
```

##### 6.3.3 Biquad IIR Coefficient Mathematics (Audio EQ Cookbook)
For digital DSP hardware (Dayton Audio DSP-408, Helix/Brax DSP PC-Tool, Zapco DPN, miniDSP), parametric filters are defined as second-order IIR biquad transfer functions:
$$H(z) = \frac{b_0 + b_1 z^{-1} + b_2 z^{-2}}{a_0 + a_1 z^{-1} + a_2 z^{-2}}$$
Given sample rate $f_s$, center frequency $f_0$, quality factor $Q$, and gain $A = 10^{\text{gain\_db}/40}$:
$$\omega_0 = \frac{2\pi f_0}{f_s}, \quad \alpha = \frac{\sin(\omega_0)}{2Q}$$
1. **Peaking EQ (Parametric Boost/Cut)**:
   $$b_0 = 1 + \alpha A, \quad b_1 = -2\cos(\omega_0), \quad b_2 = 1 - \alpha A$$
   $$a_0 = 1 + \frac{\alpha}{A}, \quad a_1 = -2\cos(\omega_0), \quad a_2 = 1 - \frac{\alpha}{A}$$
2. **High-Pass Filter (HPF)**:
   $$b_0 = \frac{1 + \cos(\omega_0)}{2}, \quad b_1 = -(1 + \cos(\omega_0)), \quad b_2 = \frac{1 + \cos(\omega_0)}{2}$$
   $$a_0 = 1 + \alpha, \quad a_1 = -2\cos(\omega_0), \quad a_2 = 1 - \alpha$$
3. **Low-Pass Filter (LPF)**:
   $$b_0 = \frac{1 - \cos(\omega_0)}{2}, \quad b_1 = 1 - \cos(\omega_0), \quad b_2 = \frac{1 - \cos(\omega_0)}{2}$$
   $$a_0 = 1 + \alpha, \quad a_1 = -2\cos(\omega_0), \quad a_2 = 1 - \alpha$$
4. **Notch Filter (Standing Wave / Resonance Notch)**:
   $$b_0 = 1, \quad b_1 = -2\cos(\omega_0), \quad b_2 = 1$$
   $$a_0 = 1 + \alpha, \quad a_1 = -2\cos(\omega_0), \quad a_2 = 1 - \alpha$$
*All coefficients are normalized by dividing $b_0, b_1, b_2, a_1, a_2$ by $a_0$.*

---

## 4. Edge Cases & Boundary Conditions

| # | Feature / Subsystem | Input / Boundary Condition | Observed & Specified Behavior |
|---|---|---|---|
| 1 | Time Alignment | Listener Position = "all_cabin" / Center focus | Delays are zeroed across all channels ($0.0\text{ ms}$) or set to symmetric L/R offsets to maximize stereo coverage for all occupants. |
| 2 | Time Alignment | Subwoofer is physically closer than front speakers (e.g. Under-seat sub $70\text{ cm}$, FL $130\text{ cm}$) | The furthest speaker is FL ($130\text{ cm}$); SUB receives delay: $(130 - 70) / 34.3 = 1.75\text{ ms}$. |
| 3 | Crossover Engine | Subwoofer enclosure type is "sealed" | Subsonic filter is set to standard $20\text{ Hz}$ infrasonic protection; subsonic danger warnings are deactivated. |
| 4 | Crossover Engine | User selects "No Subwoofer" (`type: 'none'`) | Front channels HPF switches to `Full / Off` (Full-Range); Subwoofer crossover configuration is omitted. |
| 5 | Crossover Engine | User selects "Rear Delete" (`id: 'none'`) | Rear channels are omitted from crossover, delay, and gain calculations ($0\text{ W}$, $0\text{ V AC}$, $0\text{ ms}$). |
| 6 | Crossover Engine | Ported box tuning frequency $f_{\text{tune}} \le 27\text{ Hz}$ | Subsonic formula $f_{\text{subsonic}} = \max(20, f_{\text{tune}} - 7)$ clamps at minimum $20\text{ Hz}$. |
| 7 | Gain Staging | Rear speaker power attenuation | Rear voltage is calculated using $60\%$ power ($P_{\text{rear}} \times 0.6$) to preserve front soundstage focus. |
| 8 | Gain Staging | Head unit volume step above 75% | The system warns user not to exceed $75\% - 80\%$ volume (Vol 30/40) during tuning or daily driving to prevent pre-amp clipping. |
| 9 | Parametric EQ | Full-Size SUV cabin category (e.g. Scorpio-N, Fortuner) | Resonant notch at $200\text{ Hz}$ is deepened from $-1.5\text{ dB}$ to $-2.0\text{ dB}$ due to larger cabin volume ($4.0 - 4.2\text{ m}^3$). |
| 10 | Tone Generator | User rapidly switches test tones | Previous oscillator is disconnected, stopped, and cleaned up before new oscillator/buffer initializes. |
| 11 | Tone Generator | Web Audio context is in "suspended" state | Screen automatically invokes `ctx.resume()` upon user interaction. |
| 12 | Auth Router | Twilio environment variables not configured in dev mode | Generates success response with development code `123456`; `/api/auth/verify-otp` accepts `123456`. |
| 13 | Payment Router | Razorpay API keys missing in dev mode | Generates mock order `order_mock_pro_monthly_9900` and verifies mock signature successfully. |
| 14 | Measurement Router | Empty raw data array uploaded | Returns `400 Bad Request` with message `"Measurement data points cannot be empty"`. |
| 15 | Measurement Router | Microphone data with < 5 data points | Skips 5-point moving average convolution and returns raw data points unchanged. |

---

## 5. Acceptance Criteria & Verification Guardrails

### 5.1 Verification Checklist & Pass Criteria
- [x] **AC-1: 9+ Indian Car Makes & 25+ Vehicle Cabins**: Complete dataset in `app/data/indian_cars.json` and `mobile-app/constants/catalog.ts` covering Skoda, Maruti Suzuki, Hyundai, Tata, Mahindra, Toyota, Kia, VW, Honda with exact wheelbase, volumes, and acoustic distances.
- [x] **AC-2: Complete Audio Hardware Catalog**: Head units (Nakamichi, Pioneer, Sony, Alpine, Android), Components (Sony, Focal, Morel, Hertz, JBL), Coaxials, Multi-channel Amplifiers (MOCO, Sound Barrier, Sony, Pioneer, DSP amps), and Subwoofers (Pioneer 35Hz ported, JBL 38Hz ported, Rockford sealed, Alpine 33Hz ported, Under-seat, Spare tire).
- [x] **AC-3: Real-Time 60FPS Soundfield Simulation**: HTML5 canvas rendering in-cabin wave propagation with interactive Time Alignment toggle (ON/OFF).
- [x] **AC-4: Dynamic 14-Band Bezier Equalizer**: Continuous mathematical spline curve responding dynamically to SQL, Harman, and Vocal Clarity profiles with interactive $\pm 12\text{ dB}$ stepper adjustments.
- [x] **AC-5: In-Browser Web Audio Tone Synthesis**: Generates clean 1,000 Hz sine wave, 50 Hz sine wave, and Paul Kellet 3-pole Pink Noise.
- [x] **AC-6: Multimeter Target AC Voltages**: Target voltages calculated with exact RMS formula $V = \sqrt{P \times R}$ (e.g. Front 45W @ 4Ω = 13.42V; Sub 250W @ 8Ω = 44.72V).
- [x] **AC-7: DSP Configuration Exporters**: Exports valid Pioneer DEH-80PRS XML and MiniDSP JSON files, with full Biquad IIR filter formulas.
- [x] **AC-8: 14 Backend Automated Tests Passing**: All test cases in `backend/tests/test_tuning_engine.py` pass cleanly.
- [x] **AC-9: Clean Web Export**: Mobile web build compiles without syntax or bundling errors (`npx expo export --platform web`).
- [x] **AC-10: Specific Benchmark Setup Verification**: Verified against the Skoda Kylaq setup (Nakamichi NAM5510 + MOCO AF-04 + Sound Barrier SB-654 + Sony XS-162GS + Pioneer TS-W307D4 35Hz ported).

---

## 6. Authoritative Reference Codebase Mapping

| Subsystem | Primary Code Path | Key Exported Functions / Symbols |
|---|---|---|
| **Time Alignment** | `backend/app/algorithms/time_alignment.py` | `calculate_time_alignment(distances_cm, listening_position)` |
| **Crossovers** | `backend/app/algorithms/crossover.py` | `calculate_crossover_settings(front_speaker_type, front_speaker_size, has_subwoofer, subwoofer_enclosure, subwoofer_tune_freq_hz, rear_speakers_present)` |
| **Gain Staging** | `backend/app/algorithms/gain_staging.py` | `calculate_gain_staging(head_unit_preout_volts, head_unit_max_volume_steps, front_rms_watts, front_impedance_ohms, rear_rms_watts, rear_impedance_ohms, sub_rms_watts, sub_impedance_ohms)` |
| **EQ Optimizer** | `backend/app/algorithms/eq_optimizer.py` | `calculate_eq_profile(eq_bands, sound_profile, cabin_type, has_subwoofer)` |
| **DSP Export** | `backend/app/algorithms/dsp_export.py` | `export_pioneer_xml(tuning_data)`, `export_minidsp_json(tuning_data)` |
| **Tuning Router** | `backend/app/routers/tuning.py` | `POST /api/tuning/calculate` |
| **Auth Router** | `backend/app/routers/auth.py` | `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`, `GET /api/auth/me` |
| **Payments Router**| `backend/app/routers/payments.py` | `GET /api/payments/plans`, `POST /api/payments/create-order`, `POST /api/payments/verify` |
| **Measurements** | `backend/app/routers/measurements.py` | `POST /api/measurements`, `smooth_frequency_response(points, window_size)` |
| **Frontend UI** | `mobile-app/app/(tabs)/index.tsx` | `AppMainScreen`, canvas soundfield renderer, Bezier EQ canvas, Web Audio tone generator |
| **Frontend Catalog**| `mobile-app/constants/catalog.ts` | `INDIAN_CAR_MAKES`, `HEAD_UNIT_OPTIONS`, `FRONT_SPEAKER_OPTIONS`, `REAR_SPEAKER_OPTIONS`, `AMPLIFIER_OPTIONS`, `SUBWOOFER_OPTIONS` |
| **Test Suite** | `backend/tests/test_tuning_engine.py` | 14 test functions across health, cars, equipment, algorithms, auth, payments, measurements |

---
*End of Specification Report.*
