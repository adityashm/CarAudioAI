# CarAudioAI — Tracks 2, 3, and 4 Technical Domain & Architecture Specification

**Author**: Survey Explorer 3  
**Date**: September 1, 2026  
**Status**: Comprehensive Technical Survey & Architectural Blueprint  
**Target Tracks**:
- **Track 2**: Precision DSP Instrumentation Dashboard
- **Track 3**: Vehicle Seating & Geometry Onboarding Flow (Indian RHD Acoustic Models)
- **Track 4**: High-Trust Payment & Checkout Screen (Razorpay Subscriptions & GST Invoicing)

---

## 1. Executive Summary & Domain Scope

CarAudioAI transforms automotive audio tuning from subjective guesswork into a deterministic, studio-grade calibration workflow. The application targets the Indian automotive market, characterized by Right-Hand Drive (RHD) cabin geometries, compact SUV/hatchback resonance profiles, high ambient road noise, and specific component audio hardware setups (e.g., Nakamichi Android head units, 2-way component sets with A-pillar tweeters, 4-channel class AB/D amplifiers, and 35Hz ported subwoofers).

This document establishes the exhaustive mathematical specifications, Web Audio API processing graphs, TypeScript data structures, component hierarchies, and state management models required to build Tracks 2, 3, and 4 in accordance with the project design foundations.

---

## 2. Track 2: Precision DSP Instrumentation Dashboard

The DSP Instrumentation Dashboard functions as a professional acoustic workstation. It integrates six core subsystems:
1. **14-Band Parametric / Graphic Equalizer** with interactive node manipulation and continuous Bezier curve rendering.
2. **Web Audio API Real-Time Synthesis & FFT Spectrum Analyzer**.
3. **Linkwitz-Riley 24dB/oct (LR4) Crossover Slope Calculator**.
4. **Ported Box Subsonic Infrasonic Protection Engine**.
5. **Millisecond Time-Alignment Delay Engine** for asymmetric RHD driver focus.
6. **Digital Multimeter (DMM) AC Voltage Gain Staging Engine** with live probe calibration UI.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DSP INSTRUMENTATION DASHBOARD                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ ┌────────────────────────┐ │
│ │  14-Band Spline Equalizer & Live FFT Spectrum Analyzer  │ │ Time Alignment (RHD)   │ │
│ │  Trace: Cyan (#22D3EE) | Peak: Purple (#A78BFA)         │ │ FL: 1.25 ms (43.0 cm)  │ │
│ │  +12dB ───●──────────────────●───────────               │ │ FR: 0.00 ms ( 0.0 cm)  │ │
│ │    0dB ───────●──────────●───────●───────               │ │ RL: 1.75 ms (60.0 cm)  │ │
│ │  -12dB ──────────●───────────────────────               │ │ RR: 0.58 ms (20.0 cm)  │ │
│ │        25 40 63 100 160 250 400 630 1k 2.5k 4k 6.3k 10k │ │ SUB:3.35 ms (115.0 cm) │ │
│ └─────────────────────────────────────────────────────────┘ └────────────────────────┘ │
│ ┌───────────────────────────┐ ┌───────────────────────────┐ ┌────────────────────────┐ │
│ │ Crossover & Subsonic Dial │ │ Multimeter Gain Staging   │ │ In-Browser Tone Synth  │ │
│ │ Front HPF: 80 Hz (LR4)    │ │ Target: 13.42 V AC        │ │ Tone: 1,000 Hz Sine    │ │
│ │ Sub LPF:   80 Hz (LR4)    │ │ Formula: V = √(45W × 4Ω)  │ │ Level: -0.0 dBFS       │ │
│ │ Subsonic:  28 Hz (HPF-24) │ │ Probe: CH1/2 Speaker Term │ │ State: [▶ PLAYING]     │ │
│ └───────────────────────────┘ └───────────────────────────┘ └────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.1. Equalizer Mathematics & Curve Synthesis

#### 2.1.1. Band Distribution & Center Frequencies
The 14-band equalizer adopts the standard automotive 2/3 to 1/3-octave center frequency matrix covering 20 Hz to 20 kHz:

$$\mathbf{f_0} = [25, 40, 63, 100, 160, 250, 400, 630, 1000, 2500, 4000, 6300, 10000, 16000]\text{ Hz}$$

- **Gain Range**: $G_i \in [-12.0\text{ dB}, +12.0\text{ dB}]$, step $0.1\text{ dB}$.
- **Quality Factor ($Q$)**: Default $Q = 1.414$ ($B = 1.0\text{ octave}$ bandwidth). In parametric mode, $Q \in [0.5, 10.0]$.
  $$\text{Bandwidth in Octaves } B = \frac{2}{\ln 2} \operatorname{arsinh}\left(\frac{1}{2Q}\right)$$

#### 2.1.2. Continuous Biquad Peaking Filter Transfer Function
For continuous real-time rendering of the composite EQ magnitude response across arbitrary frequency points $f \in [20, 20000]\text{ Hz}$:

$$\omega = 2\pi f, \quad \omega_{0,i} = 2\pi f_{0,i}, \quad A_i = 10^{G_i / 40}$$

The analog continuous peaking equalizer power response is modeled as:

$$|H_i(f)|^2 = \frac{1 + \left(\frac{A_i \omega \omega_{0,i}}{Q_i (\omega_{0,i}^2 - \omega^2)}\right)^2}{1 + \left(\frac{\omega \omega_{0,i}}{A_i Q_i (\omega_{0,i}^2 - \omega^2)}\right)^2}$$

The individual filter gain in decibels is:

$$G_i(f) = 10 \log_{10} |H_i(f)|^2 = 20 \log_{10} |H_i(f)|$$

The composite equalizer curve across all 14 active bands is the linear sum in decibels:

$$G_{\text{total}}(f) = \sum_{i=1}^{14} G_i(f)$$

#### 2.1.3. Screen Coordinate Mapping & Bezier Spline Interpolation
To render the EQ curve onto an HTML5 Canvas or SVG `<path>` element of dimensions $W \times H$:

1. **Logarithmic Frequency to X-pixel**:
   $$X(f) = W \cdot \frac{\log_{10}(f) - \log_{10}(20)}{\log_{10}(20000) - \log_{10}(20)}$$

2. **Linear Decibel to Y-pixel** (with $G_{\text{max}} = 15\text{ dB}$ display bounds and inverted Y screen axis):
   $$Y(G) = H \cdot \left(0.5 - \frac{G}{2 \cdot G_{\text{max}}}\right)$$

3. **Smooth Spline Generation (Monotone Cubic Hermite Spline / Catmull-Rom)**:
   Between adjacent control nodes $P_i(x_i, y_i)$ and $P_{i+1}(x_{i+1}, y_{i+1})$, cubic Bezier control points $C_{1,i}$ and $C_{2,i}$ are derived from tangents $m_i$:
   
   $$\Delta x_i = x_{i+1} - x_i, \quad m_i = \frac{1}{2}\left(\frac{y_{i+1} - y_i}{x_{i+1} - x_i} + \frac{y_i - y_{i-1}}{x_i - x_{i-1}}\right)$$
   $$C_{1,i} = \left(x_i + \frac{\Delta x_i}{3}, \, y_i + \frac{m_i \Delta x_i}{3}\right)$$
   $$C_{2,i} = \left(x_{i+1} - \frac{\Delta x_i}{3}, \, y_{i+1} - \frac{m_{i+1} \Delta x_i}{3}\right)$$

---

### 2.2. Web Audio API Signal Architecture & Real-Time Spectrum Analysis

```
 ┌───────────────────────────────┐
 │   Tone Generator Engine       │
 │  - Sine OscillatorNode        │
 │  - Pink Noise AudioBuffer     │
 └──────────────┬────────────────┘
                │
                ▼
 ┌───────────────────────────────┐
 │   Master Gain & Mute Node     │◄── Linear Ramp Volume (Anti-pop)
 └──────────────┬────────────────┘
                │
                ▼
 ┌───────────────────────────────┐
 │ 14-Stage Cascaded Biquad EQ   │
 │ Filters: Band 1 ... Band 14   │
 └──────────────┬────────────────┘
                │
                ▼
 ┌───────────────────────────────┐
 │ Linkwitz-Riley Crossover Node │
 │ (Cascaded 2nd-order Butterw.) │
 └───────┬───────────────┬───────┘
         │               │
         ▼               ▼
 ┌───────────────┐ ┌───────────────┐
 │ AnalyserNode  │ │ Destination   │
 │ fftSize=2048  │ │ (Hardware out)│
 └───────┬───────┘ └───────────────┘
         │
         ▼
 ┌───────────────────────────────┐
 │ 60 FPS Canvas Spectrum Bars   │
 │ Peak Hold & Gravity Decay     │
 └───────────────────────────────┘
```

#### 2.2.1. Web Audio Node Initialization Parameters
- **`AudioContext`**: Initialized with `{ latencyHint: 'interactive', sampleRate: 48000 }`.
- **`BiquadFilterNode` configuration for each band $i$**:
  ```typescript
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'peaking';
  filter.frequency.value = eqFrequencies[i];
  filter.Q.value = 1.414;
  filter.gain.value = eqGains[i];
  ```
- **`AnalyserNode` configuration**:
  - `fftSize`: $2048$ (yielding $1024$ discrete frequency bins from $0\text{ Hz}$ to $24000\text{ Hz}$, frequency resolution $\Delta f = \frac{48000}{2048} = 23.4375\text{ Hz/bin}$).
  - `smoothingTimeConstant`: $0.80$ (exponential moving average smoothing).
  - `minDecibels`: $-90\text{ dBFS}$.
  - `maxDecibels`: $-10\text{ dBFS}$.

#### 2.2.2. Pink Noise Synthesis Algorithm (Voss-McCartney Filter)
True 1/f pink noise (-3 dB/octave energy roll-off) generated dynamically in an `AudioBuffer`:
```typescript
function generatePinkNoiseBuffer(ctx: AudioContext, durationSec: number = 3.0): AudioBuffer {
  const bufferSize = ctx.sampleRate * durationSec;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}
```

---

### 2.3. Linkwitz-Riley 24dB/oct (LR4) Crossover & Ported Enclosure Subsonic Protection

#### 2.3.1. Linkwitz-Riley 4th-Order (LR4) Mathematical Properties
An LR4 crossover filter consists of two cascaded 2nd-order Butterworth filters in series with $Q = \frac{1}{\sqrt{2}} \approx 0.7071$.

1. **Low-Pass Filter Transfer Function**:
   $$H_{\text{LP,LR4}}(s) = \left( \frac{\omega_c^2}{s^2 + \sqrt{2}\omega_c s + \omega_c^2} \right)^2$$
2. **High-Pass Filter Transfer Function**:
   $$H_{\text{HP,LR4}}(s) = \left( \frac{s^2}{s^2 + \sqrt{2}\omega_c s + \omega_c^2} \right)^2$$
3. **Acoustic Summation**:
   $$H_{\text{sum}}(s) = H_{\text{LP,LR4}}(s) + H_{\text{HP,LR4}}(s) = \frac{(s^2 + \sqrt{2}\omega_c s + \omega_c^2)^2 - 2\sqrt{2}\omega_c s(s^2 + \omega_c^2)}{(s^2 + \sqrt{2}\omega_c s + \omega_c^2)^2}$$
   $$|H_{\text{sum}}(j\omega)| \equiv 1.0 \quad (0.0\text{ dB across all frequencies})$$
   $$\text{Attenuation at crossover frequency } f_c: \quad |H_{\text{LP}}(j\omega_c)| = |H_{\text{HP}}(j\omega_c)| = 0.5 \implies -6.02\text{ dB}$$
   $$\text{Phase Difference } \Delta \theta(f) = \theta_{\text{HP}}(f) - \theta_{\text{LP}}(f) = 360^\circ \equiv 0^\circ \quad (\text{Perfect In-Phase Summation})$$

#### 2.3.2. Subsonic (Infrasonic) High-Pass Filter for Ported Subwoofer Enclosures
In a ported (vented) bass-reflex enclosure, acoustic damping is provided by the resonant air mass in the port at tuning frequency $F_b$. Below $F_b$, the enclosure transitions to an acoustic short circuit, resulting in rapid cone unloading:

$$\text{Excursion } X(f) \propto \frac{1}{f^2} \quad \text{for } f < F_b$$

- **Subsonic Filter Cutoff Formula**:
  $$F_{\text{subsonic}} = \max\left(20.0, \, \operatorname{round}(F_b \times 0.8)\right) \quad \text{or} \quad \max(20.0, \, F_b - 7.0)$$
- **Example**: For a $35\text{ Hz}$ ported box (e.g., Pioneer TS-W307D4 in custom MDF enclosure):
  $$F_{\text{subsonic}} = 35 - 7 = 28\text{ Hz}$$
- **Safety Violation Rule**:
  $$\text{If } F_{\text{subsonic}} < F_b - 10\text{ Hz} \implies \text{Trigger Critical Amber-Red Guardrail Alert}$$
  $$\text{Alert text}: \text{"CRITICAL: Subsonic filter ({$F_{\text{subsonic}}$}Hz) is below safe port tuning limit (28Hz). Subwoofer will unload and bottom out."}$$

---

### 2.4. Millisecond Time-Alignment Delay Engine

#### 2.4.1. Indian RHD Asymmetric Distance Formulation
In Right-Hand Drive (RHD) vehicles in India, the driver sits at the Front Right position. The furthest speaker from the driver's right ear serves as the zero-delay reference:

$$\mathbf{D} = \{d_{\text{FL}}, d_{\text{FR}}, d_{\text{RL}}, d_{\text{RR}}, d_{\text{SUB}}\}$$
$$d_{\text{max}} = \max(\mathbf{D})$$

The speed of sound in cabin air at temperature $T \, (^\circ\text{C})$ is:
$$c(T) = 331.3 + 0.606 \cdot T \quad [\text{m/s}] \implies c(20^\circ\text{C}) = 343.42\text{ m/s} = 34.34\text{ cm/ms}$$

The required digital delay $\tau_k$ for channel $k$ is:
$$\Delta d_k = d_{\text{max}} - d_k \quad [\text{cm}]$$
$$\tau_k = \frac{\Delta d_k}{c} = \frac{d_{\text{max}} - d_k}{34.34} \quad [\text{milliseconds}]$$

DSP Sample Delay at $F_s = 48\text{ kHz}$:
$$N_k = \operatorname{round}\left(\tau_k \cdot 10^{-3} \times 48000\right) = \operatorname{round}(\tau_k \times 48)$$

#### 2.4.2. Concrete RHD Vehicle Delay Matrix
| Channel | Skoda Kylaq (cm) | Delay (ms) | Swift (cm) | Delay (ms) | Creta (cm) | Delay (ms) | Thar (cm) | Delay (ms) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Front Right (FR)** | 95.0 cm | **3.35 ms** | 88.0 cm | **2.97 ms** | 98.0 cm | **3.55 ms** | 85.0 cm | **2.77 ms** |
| **Front Left (FL)** | 138.0 cm | **2.10 ms** | 130.0 cm | **1.75 ms** | 142.0 cm | **2.27 ms** | 128.0 cm | **1.51 ms** |
| **Rear Right (RR)** | 115.0 cm | **2.77 ms** | 105.0 cm | **2.48 ms** | 120.0 cm | **2.91 ms** | 100.0 cm | **2.33 ms** |
| **Rear Left (RL)** | 155.0 cm | **1.60 ms** | 145.0 cm | **1.31 ms** | 160.0 cm | **1.75 ms** | 140.0 cm | **1.16 ms** |
| **Subwoofer (SUB)** | 210.0 cm | **0.00 ms (Ref)** | 190.0 cm | **0.00 ms (Ref)**| 220.0 cm | **0.00 ms (Ref)**| 180.0 cm | **0.00 ms (Ref)**|

---

### 2.5. Multimeter AC Voltage Gain Staging Calculator

#### 2.5.1. RMS Power & Voltage Law
To set amplifier input sensitivity without an oscilloscope:

$$V_{\text{target, RMS}} = \sqrt{P_{\text{RMS, target}} \times R_{\text{nominal}}}$$

- **Front Component Stage** ($45\text{W RMS} @ 4\Omega$):
  $$V_{\text{front}} = \sqrt{45 \times 4} = \sqrt{180} \approx \mathbf{13.42\text{ V AC}}$$
- **Rear Stage (Acoustic Rear Fill Attenuated to 60%)** ($27\text{W RMS} @ 4\Omega$):
  $$V_{\text{rear}} = \sqrt{27 \times 4} = \sqrt{108} \approx \mathbf{10.39\text{ V AC}}$$
- **Subwoofer Stage (Bridged Mono)** ($250\text{W RMS} @ 8\Omega$):
  $$V_{\text{sub}} = \sqrt{250 \times 8} = \sqrt{2000} \approx \mathbf{44.72\text{ V AC}}$$
  *(If wired in parallel @ $2\Omega$: $V_{\text{sub}} = \sqrt{250 \times 2} = \sqrt{500} \approx \mathbf{22.36\text{ V AC}}$)*

#### 2.5.2. Digital Multimeter (DMM) Tuning Protocol
1. Disconnect all speaker loads from amplifier output terminals.
2. Set Head Unit clean volume limit:
   $$\text{Volume}_{\text{safe}} = \operatorname{floor}(\text{Volume}_{\text{max}} \times 0.75) \quad (\text{e.g., Step 30 of 40})$$
3. Turn Bass Boost, Loudness, and EQ Bass tone controls to $0\text{ dB}$ (flat).
4. Play test tones:
   - Front/Rear channels: **$1000\text{ Hz}$ sine wave @ $0\text{ dBFS}$**
   - Subwoofer channel: **$50\text{ Hz}$ sine wave @ $0\text{ dBFS}$**
5. Connect DMM test leads set to **AC Volts ($\tilde{\text{V}}$)** across (+) and (-) speaker output terminals.
6. Slowly increase amplifier Gain potentiometer clockwise until DMM matches $V_{\text{target, RMS}}$ exactly.

---

## 3. Track 3: Vehicle Seating & Geometry Onboarding Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        4-STEP AUTOMOTIVE CALIBRATION ONBOARDING WIZARD                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [ STEP 1: MAKE ]   ➔   [ STEP 2: MODEL ]   ➔   [ STEP 3: AUDIO HW ] ➔ [ STEP 4: DSP ]  │
│ 9 Indian Brands        25+ Indian Models        HU, Speakers, Amps,     Synthesize &   │
│ (Skoda, Maruti, Tata,  (Kylaq, Swift, Creta,    Ported/Sealed Sub       Live Dashboard │
│  Mahindra, Toyota...)   Thar, Fortuner...)      Impedance & Wattage                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Sequential 4-Step User Journey

1. **Step 1 — Indian Vehicle Manufacturer Selection**:
   - Grid of 9 verified automotive manufacturers:
     - **Škoda India** (Czech Republic / SAVWIPL)
     - **Maruti Suzuki** (India's volume leader, Heartect platform)
     - **Hyundai Motor India** (Creta, Venue, i20)
     - **Tata Motors** (Omega-Arc & Alfa-Arc platforms: Nexon, Harrier, Punch)
     - **Mahindra & Mahindra** (Thar, Scorpio-N, XUV700)
     - **Toyota Kirloskar India** (Fortuner, Hyryder, Innova Hycross)
     - **Kia India** (Seltos, Sonet, Carens)
     - **Volkswagen India** (Taigun, Virtus)
     - **Honda Cars India** (Elevate, City)
   - Real-time search filter and manufacturer badge branding.

2. **Step 2 — Model & Acoustic Cabin Geometry Selection**:
   - Selection of 25+ specific models with pre-mapped acoustic geometries:
     - Wheelbase ($L_w$ in mm)
     - Internal cabin acoustic air volume ($V_{\text{cabin}}$ in $\text{m}^3$)
     - In-cabin acoustic fundamental standing wave resonance frequency:
       $$f_{\text{res}} \approx \frac{c}{2 \cdot L_{\text{cabin}}} \quad (170\text{ Hz} - 220\text{ Hz})$$
     - Exact physical speaker mounting coordinates (FL, FR, RL, RR, SUB) relative to RHD driver headrest.
     - Speaker cutout depths and factory tweeter locations (A-pillar, door mirror sail, dashboard).

3. **Step 3 — Installed Audio Equipment Configuration**:
   - **Head Unit**: Factory OEM vs Aftermarket Android / Nakamichi / Pioneer / Sony / Alpine. Preout voltage ($2\text{V}, 4\text{V}, 5\text{V}$), volume steps (30, 40, 50).
   - **Front Stage**: 2-way Component, 3-way Active, or Coaxial. Speaker diameter ($6.5"$, $5.25"$, $6\times9"$), power handling ($W_{\text{RMS}}$), impedance ($2\Omega, 3\Omega, 4\Omega$).
   - **Rear Fill Stage**: Coaxial, Component, or Rear-Delete (Audiophile pure front-stage setup).
   - **Amplifier Topology**: Multi-channel 4-Channel + Monoblock, 5-Channel Hybrid, Class AB vs Class D.
   - **Subwoofer Enclosure**: Sealed vs Ported/Vented. Port tuning frequency $F_b$ ($28\text{ Hz} - 45\text{ Hz}$), driver diameter ($8", 10", 12", 15"$), voice coil wiring configuration ($1\Omega, 2\Omega, 4\Omega, 8\Omega$).

4. **Step 4 — Synthesis & Live DSP Calibration Launch**:
   - Automated compilation of time-alignment delay matrix, LR4 crossover cutoff points, subsonic infrasonic safety frequency, 14-band acoustic target curve, and DMM gain staging voltages.
   - Instant transition to the DSP Instrumentation Dashboard.

---

### 3.2. Minimal Phone OTP Authentication Flow

```
┌─────────────┐       Submit Phone        ┌─────────────┐      Submit 6-Digit OTP    ┌─────────────┐
│ Phone Input │ ────────────────────────► │  OTP Input  │ ─────────────────────────► │ Authenti-   │
│ +91 XXXXX   │ ◄──────────────────────── │ (30s timer) │ ◄───────────────────────── │ cated User  │
└─────────────┘       Change Phone        └─────────────┘        Invalid Code        └─────────────┘
```

#### 3.2.1. Authentication Protocol & State Machine
- **State Interface**:
  ```typescript
  type AuthState = 
    | { status: 'idle' }
    | { status: 'sending_otp'; phone: string }
    | { status: 'otp_sent'; phone: string; resendAvailableAt: number }
    | { status: 'verifying'; phone: string; otp: string }
    | { status: 'authenticated'; user: UserProfile }
    | { status: 'error'; message: string; prevStatus: 'phone' | 'otp' };
  ```
- **Indian Phone Validation Regex**:
  $$\text{Pattern: } \texttt{/^(\+91[\-\s]?)?[6-9]\d{9}\$/}$$
- **Twilio Verify API Integration with Dev Fallback**:
  - Production: Backend calls Twilio Verify Service `v2/Services/{SID}/Verifications`.
  - Development / Demo Mode: Automatic detection of bypass token `123456` allowing instant verification without SMS gateway latency.
- **Session Persistence**: Stored via `AsyncStorage` / `localStorage` under key `car_audio_ai_session_token`.

---

## 4. Track 4: High-Trust Payment & Checkout Screen

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CARAUDIOAI SUBSCRIPTION UPGRADE                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────┐ ┌──────────────────────────────────────────┐ │
│ │  PRO ENTHUSIAST                       │ │  INSTALLER WORKSHOP                      │ │
│ │  ₹99 / Month                          │ │  ₹999 / Year (Save 16%)                  │ │
│ │  ───────────────────────────────────  │ │  ──────────────────────────────────────  │ │
│ │  • Unlimited Indian Car Models        │ │  • 50 Garage Client Vehicle Profiles    │ │
│ │  • 14-Band Parametric Bezier EQ       │ │  • Branded PDF Acoustic Tuning Reports   │ │
│ │  • 60FPS In-Cabin Soundfield Sim      │ │  • Live RTA Microphone Analysis          │ │
│ │  • Web Audio Tone Generator & FFT     │ │  • MiniDSP & Pioneer XML Export          │ │
│ │  • Multimeter Gain Staging Engine     │ │  • Commercial Installation License       │ │
│ │  [ SUBSCRIBE FOR ₹99/MO ]             │ │  [ GET INSTALLER LICENSE (₹999/YR) ]     │ │
│ └───────────────────────────────────────┘ └──────────────────────────────────────────┘ │
│ ────────────────────────────────────────────────────────────────────────────────────── │
│ ORDER SUMMARY                                                            PRICE (INR)   │
│ Base Subscription Plan (Pro Monthly) ................................... ₹     83.90   │
│ Integrated GST (IGST @ 18.00%) ......................................... ₹     15.10   │
│ TOTAL AMOUNT PAYABLE TODAY ............................................. ₹     99.00   │
│ ────────────────────────────────────────────────────────────────────────────────────── │
│ 🔒 256-Bit SSL Encrypted | Razorpay Verified Merchant | Instant DSP Feature Unlock     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1. Subscription Tier Architecture & Capabilities

| Feature Matrix | Free Tier (₹0) | Pro Monthly (₹99/mo) | Installer Annual (₹999/yr) |
| :--- | :--- | :--- | :--- |
| **Active Car Profiles** | 1 Profile | Unlimited | 50 Garage Client Slots |
| **Equalizer Bands** | 5 Bands Graphic | 14 Bands Bezier Parametric | 14 Bands Bezier Parametric |
| **Time Alignment Math** | Static Table | Millisecond RHD Interactive | Millisecond RHD Interactive |
| **Web Audio Tone Synth** | Single Tone | 50Hz / 1kHz / Pink Noise / Sweeps | Full Suite + Custom Freqs |
| **Real-Time FFT Analyzer** | None | 60FPS AnalyserNode Spectrum | 60FPS AnalyserNode Spectrum |
| **Gain Staging Calculator** | Basic | Precision Multimeter RMS | Precision Multimeter RMS |
| **DSP File Exporters** | Manual Copy | Pioneer XML + MiniDSP JSON | Pioneer XML + MiniDSP JSON |
| **Commercial Workshop PDF**| No | No | Custom Branded Reports |

---

### 4.2. GST Invoice Calculation & Monospace Formatting

Under Indian Goods & Services Tax (GST) provisions for digital electronic services (SAC Code `998439` - Online Audio Software Services):

$$\text{Tax Rate } r = 18.0\% = 0.18$$
$$\text{Base Taxable Value } P_{\text{base}} = \frac{P_{\text{gross}}}{1 + r} = \frac{99.00}{1.18} = \mathbf{83.90\text{ INR}}$$
$$\text{GST Amount (IGST or CGST 9\% + SGST 9\%)} = P_{\text{gross}} - P_{\text{base}} = 99.00 - 83.90 = \mathbf{15.10\text{ INR}}$$

#### Monospace Financial Formatting Spec:
All numeric amounts, taxes, and currency codes must be styled exclusively in monospace type (`Platform.select({ ios: 'Menlo', android: 'monospace', web: 'JetBrains Mono, monospace' })`) to prevent glyph-width jitter during tab switches:

```typescript
const formattedOrderSummary = {
  planName: 'Pro Monthly Calibration Subscription',
  billingInterval: 'Monthly recurring',
  currency: 'INR',
  baseAmount: '₹ 83.90',
  taxRate: '18.0%',
  taxAmount: '₹ 15.10',
  totalAmount: '₹ 99.00',
  renewalDate: '2026-10-01'
};
```

---

### 4.3. Razorpay Payment Gateway Integration Architecture

```
┌──────────────────┐    1. Create Order     ┌──────────────────┐    2. Create Order ID  ┌──────────────────┐
│  Mobile/Web App  │ ─────────────────────► │ Backend API      │ ─────────────────────► │ Razorpay API     │
│  (React Native)  │ ◄───────────────────── │ (/api/pay/order) │ ◄───────────────────── │ (api.razorpay)   │
└────────┬─────────┘    3. Return order_id  └──────────────────┘    Order: order_O19f... └──────────────────┘
         │
         │ 4. Open Razorpay Checkout Modal
         ▼
┌──────────────────┐    5. Payment Success  ┌──────────────────┐    6. Verify HMAC-SHA256┌──────────────────┐
│ Razorpay Modal   │ ─────────────────────► │ Backend API      │ ─────────────────────► │ Upgrade User     │
│ (UPI / Cards)    │ (payment_id, signature)│ (/api/pay/verify)│                        │ Tier in Database │
└──────────────────┘                        └──────────────────┘                        └──────────────────┘
```

#### 4.3.1. Cryptographic Signature Verification
Upon payment completion on the client, the backend verifies the authenticity of the transaction:

$$\text{Generated Signature} = \operatorname{HMAC-SHA256}(\text{order\_id} + "|" + \text{razorpay\_payment\_id}, \, \text{RAZORPAY\_KEY\_SECRET})$$
$$\text{Assertion: } \operatorname{constant\_time\_compare}(\text{Generated Signature}, \, \text{razorpay\_signature}) == \text{True}$$

---

## 5. Comprehensive TypeScript Interfaces & Data Contracts

```typescript
// ============================================================================
// 1. DESIGN TOKENS & UI PRIMITIVES
// ============================================================================

export interface ColorTokens {
  background: {
    base: '#0A0B0D';
    panel: '#0E1118';
    panelElevated: '#141824';
    overlay: 'rgba(10, 11, 13, 0.88)';
  };
  border: {
    hairline: '#1E222A';
    subtle: '#2A2F3A';
    focused: '#38BDF8';
  };
  signal: {
    primaryTrace: '#22D3EE';     // Primary waveform / EQ trace
    secondaryTrace: '#A78BFA';   // Phase / Secondary trace
    meterCyan: '#06B6D4';
    meterPurple: '#8B5CF6';
  };
  warning: {
    amber: '#F59E0B';            // Subsonic / Pre-clipping warning
    red: '#EF4444';              // Hard clipping / Excursion danger
  };
  text: {
    primary: '#FFFFFF';
    secondary: '#94A3B8';
    tertiary: '#64748B';
    monospace: '#38BDF8';
  };
}

// ============================================================================
// 2. ACOUSTIC DOMAIN & DSP STRUCTURES
// ============================================================================

export interface EqBandConfig {
  bandIndex: number;
  centerFrequencyHz: number;
  gainDb: number;              // -12.0 dB to +12.0 dB
  qFactor: number;             // Default 1.414
  filterType: 'peaking' | 'lowshelf' | 'highshelf' | 'notch';
  rationale: string;
}

export interface CrossoverChannelConfig {
  filterType: 'HPF' | 'LPF' | 'Bandpass' | 'Full';
  slope: '6dB' | '12dB' | '18dB' | '24dB_Linkwitz_Riley';
  cutoffFrequencyHz: number;
  subsonicCutoffHz?: number;
  subsonicSafetyAlert?: string;
  dialClockPosition: string;
}

export interface TimeAlignmentChannelResult {
  channel: 'FL' | 'FR' | 'RL' | 'RR' | 'SUB';
  distanceCm: number;
  deltaDistanceCm: number;
  delayMilliseconds: number;
  dspDelaySamples48k: number;
  phaseInversion: boolean;
}

export interface MultimeterCalibrationTarget {
  channelGroup: 'Front CH1/2' | 'Rear CH3/4' | 'Subwoofer Bridged';
  targetRmsWatts: number;
  loadImpedanceOhms: number;
  targetAcVoltage: number;     // V = sqrt(P * R)
  testToneFrequencyHz: number; // 1000 Hz or 50 Hz
  testToneDbFs: number;        // 0.0 dBFS
  headUnitVolumeStep: number;  // 75% max volume
  instruction: string;
}

// ============================================================================
// 3. VEHICLE CATALOG & HARDWARE CONFIGURATION
// ============================================================================

export interface CabinAcousticProfile {
  modelId: string;
  makeName: string;
  modelName: string;
  yearRange: string;
  bodyCategory: 'Hatchback' | 'Compact SUV' | 'Midsize SUV' | 'Off-Road SUV' | 'Sedan' | 'Full-Size SUV';
  wheelbaseMm: number;
  cabinVolumeM3: number;
  resonantFrequencyHz: number;
  speakerDistancesRhdCm: {
    FL: number;
    FR: number;
    RL: number;
    RR: number;
    SUB: number;
  };
  mountingDepths: {
    frontDoorMm: number;
    rearDoorMm: number;
    tweeterLocation: 'A-Pillar' | 'Sail Panel' | 'Dashboard' | 'Roof Bar';
  };
}

export interface InstalledAudioHardware {
  headUnit: {
    brand: string;
    model: string;
    preoutVoltage: number;
    maxVolumeSteps: number;
    eqBandsCount: number;
  };
  frontSpeakers: {
    brand: string;
    model: string;
    type: '2-way Component' | '3-way Active' | 'Coaxial';
    sizeInches: number;
    rmsWatts: number;
    impedanceOhms: number;
    frequencyResponseHz: [number, number];
  };
  rearSpeakers: {
    enabled: boolean;
    brand: string;
    model: string;
    rmsWatts: number;
    impedanceOhms: number;
  };
  amplifier: {
    brand: string;
    model: string;
    topology: 'Class AB' | 'Class D';
    channelsCount: number;
    ratedRmsPerChannel4Ohm: number;
    bridgedRmsWatts4Ohm: number;
  };
  subwoofer: {
    enabled: boolean;
    brand: string;
    model: string;
    sizeInches: number;
    enclosureType: 'ported' | 'sealed';
    portTuningHz: number;
    rmsWatts: number;
    wiringImpedanceOhms: number;
  };
}

// ============================================================================
// 4. USER AUTHENTICATION & SUBSCRIPTIONS
// ============================================================================

export interface UserProfile {
  id: string;
  phoneNumber: string;
  fullName?: string;
  subscriptionTier: 'free' | 'pro_monthly' | 'pro_yearly' | 'installer';
  createdAtIso: string;
}

export interface SubscriptionPlan {
  id: 'free' | 'pro_monthly' | 'pro_yearly' | 'installer';
  name: string;
  badge?: string;
  priceInr: number;
  billingInterval: 'month' | 'year' | 'forever';
  features: string[];
  maxSavedVehicles: number;
  isPopular?: boolean;
}

export interface PaymentOrderResponse {
  orderId: string;
  amountInr: number;
  currency: 'INR';
  razorpayKeyId: string;
  customerPhone: string;
}
```

---

## 6. Component Architecture & UI Hierarchy

```
mobile-app/
├── design-system/
│   ├── tokens.ts                   # Hex colors, typography, spacing scales
│   ├── InstrumentPanel.tsx         # Hairline flat border container
│   ├── Readout.tsx                 # Right-aligned unit-labeled monospace readout
│   ├── PhysicalDial.tsx            # Rotary potentiometer with angle mapping
│   ├── SplineCurveCanvas.tsx       # 60FPS Canvas Bezier curve renderer
│   └── SpectrumVisualizer.tsx      # Web Audio AnalyserNode FFT bar visualizer
├── components/
│   ├── dsp/
│   │   ├── EqualizerConsole.tsx    # 14-band slider bank + interactive spline
│   │   ├── CrossoverSubsonic.tsx   # LR4 crossover dials & subsonic safety alert
│   │   ├── TimeAlignmentMatrix.tsx # RHD cabin schematic with millisecond delays
│   │   ├── MultimeterGainStaging.tsx # DMM probe visualizer & AC voltage target
│   │   └── ToneGeneratorPanel.tsx  # In-browser sine & pink noise controls
│   ├── onboarding/
│   │   ├── WizardStepper.tsx       # 4-step progress header
│   │   ├── Step1MakeSelect.tsx     # 9 Indian car make cards
│   │   ├── Step2ModelGeometry.tsx  # 25+ model list with acoustic metrics
│   │   ├── Step3HardwareConfig.tsx # HU, component, amplifier, sub selectors
│   │   └── Step4AcousticSummary.tsx# Instant synthesis before studio transition
│   ├── auth/
│   │   └── PhoneOtpModal.tsx       # Indian phone input & 6-digit OTP verification
│   └── payment/
│       ├── PricingCardGrid.tsx     # Free vs Pro vs Installer comparison
│       ├── MonospaceInvoice.tsx    # Line-item price + 18% GST breakdown
│       └── RazorpayModal.tsx       # Live gateway checkout & test simulation
```

---

## 7. State Management Architecture

A lightweight, high-performance state store (Zustand or React Context + Hook architecture) manages active state without unnecessary re-renders of the 60FPS audio canvases.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GLOBAL ACOUSTIC TUNING STORE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  State Properties:                                                          │
│  - selectedMake: VehicleMake                                                │
│  - selectedCar: CabinAcousticProfile                                        │
│  - installedHardware: InstalledAudioHardware                                │
│  - soundProfile: 'sql' | 'harman' | 'vocal'                                 │
│  - eqBands: EqBandConfig[14]                                                │
│  - timeAlignmentEnabled: boolean                                            │
│  - audioContextState: { isRunning: boolean; activeTone: string | null }     │
│  - currentUser: UserProfile | null                                          │
│                                                                             │
│  Actions & Computed Selectors:                                              │
│  - setEqBandGain(index: number, gainDb: number) ➔ Updates Biquad node       │
│  - selectVehicle(makeId: string, modelId: string) ➔ Recalculates delays     │
│  - toggleToneGenerator(type: '1k' | '50' | 'pink') ➔ Controls Web Audio     │
│  - computedDelaysMs: Record<Channel, number>                                │
│  - computedTargetVoltages: Record<ChannelGroup, number>                     │
│  - computedSubsonicSafety: { isSafe: boolean; warningMsg: string }          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Audio Safety Guardrails & Edge Cases

1. **Subsonic Protection Below Port Tuning**:
   - Condition: Ported box selected with tuning frequency $F_b$, and subsonic filter $F_{\text{sub}} < F_b - 10\text{ Hz}$ or disabled.
   - Action: Dashboard highlights subsonic frequency in flashing amber (`#F59E0B`), disables one-click DSP export until acknowledged, and issues a mechanical excursion warning.
2. **Web Audio Autoplay Policy Compliance**:
   - Browsers block Web Audio `AudioContext` from outputting sound before user interaction.
   - Guard: All tone generation triggers first verify `if (audioCtx.state === 'suspended') await audioCtx.resume()`.
3. **Volume Anti-Pop Ramp**:
   - To prevent destructive DC transient clicks when starting or stopping sine tones, all gain changes utilize `GainNode.gain.linearRampToValueAtTime(target, audioCtx.currentTime + 0.05)`.
4. **Asymmetric RHD Stage Image Anchoring**:
   - Front-right speaker is closest ($95\text{ cm}$) and arrives earliest without delay. Applying $\approx 3.35\text{ ms}$ delay synchronizes acoustic wavefronts at the driver's ears, preventing the soundstage from collapsing into the right door.

---

## 9. Independent Verification & Test Matrix

1. **Acoustic Delay Verification**:
   - Test: Input Skoda Kylaq ($FR = 95\text{ cm}, SUB = 210\text{ cm}$).
   - Expected Output: $\Delta d = 115\text{ cm} \implies \tau = 115 / 34.34 = 3.348\text{ ms} \approx \mathbf{3.35\text{ ms}}$ ($161\text{ samples}$ @ $48\text{ kHz}$).
2. **Gain Staging Target Voltage Verification**:
   - Test: Front components ($45\text{W RMS} @ 4\Omega$).
   - Expected Output: $V = \sqrt{45 \times 4} = \sqrt{180} = \mathbf{13.42\text{ V AC RMS}}$.
3. **Subwoofer Subsonic Filter Verification**:
   - Test: Ported box tuned to $35\text{ Hz}$.
   - Expected Output: $F_{\text{subsonic}} = 28\text{ Hz}$. Setting below $25\text{ Hz}$ flags an amber warning.
4. **GST Tax Invoice Verification**:
   - Test: Pro Monthly ₹99.00 total.
   - Expected Output: Taxable Base = ₹83.90, 18% IGST = ₹15.10, Total = ₹99.00.

---
*(End of Analysis Report)*
