# Handoff Report — Survey Explorer 3 (Tracks 2, 3, and 4)

## 1. Observation
- **Authoritative Requirements Document**: `c:/Users/aditya/Downloads/CarAudioAI/.agents/ORIGINAL_REQUEST.md` lines 12-38 & 63-75 explicitly specifies:
  - Track 2: 14-band parametric/graphic EQ (frequencies: 25Hz, 40Hz, 63Hz, 100Hz, 160Hz, 250Hz, 400Hz, 630Hz, 1kHz, 2.5kHz, 4kHz, 6.3kHz, 10kHz, 16kHz with $\pm 12\text{ dB}$ gain and Q values), interactive Bezier/spline rendering, Web Audio API (`AudioContext`, `AnalyserNode`, `OscillatorNode`, FFT visualizer), Linkwitz-Riley 24dB crossover slope calculations, ported box subsonic filter (~28Hz for 35Hz box, warning if < box tuning), millisecond time alignment ($\text{Delay} = \Delta \text{Dist} / 34.3\text{ cm/ms}$), and Multimeter gain staging ($V = \sqrt{P \times R}$).
  - Track 3: 4-step onboarding flow (Make ➔ Model ➔ Audio Hardware ➔ DSP Calibration) for Indian vehicles (Skoda Kylaq, Maruti Swift, Hyundai Creta, Mahindra Thar) with RHD acoustic dimensions and minimal phone OTP auth.
  - Track 4: High-trust payment checkout for Razorpay tiers (₹99/mo Pro, ₹999/yr Installer) with line-item breakdowns in monospace numerals.
- **Backend Algorithm Implementations**:
  - `backend/app/algorithms/time_alignment.py` lines 8-43 defines `SPEED_OF_SOUND_CM_PER_MS = 34.3`, reference maximum distance logic, and delay in milliseconds and 48kHz samples.
  - `backend/app/algorithms/gain_staging.py` lines 27-40 implements `math.sqrt(P * R)` target AC voltage calculations and safe volume threshold (75% of head unit max steps).
  - `backend/app/algorithms/crossover.py` lines 26-84 defines Linkwitz-Riley 12dB/24dB crossovers and ported subsonic cutoff `max(20, subwoofer_tune_freq_hz - 7.0)`.
  - `backend/app/algorithms/eq_optimizer.py` lines 10-108 defines sound profiles (SQL Punjabi, Harman Reference, Vocal Clarity) with specific acoustic rationales.
- **Frontend Catalog & State Structure**:
  - `mobile-app/constants/catalog.ts` lines 1-280 contains 9 Indian makes (Skoda, Maruti, Hyundai, Tata, Mahindra, Toyota, Kia, VW, Honda) and 25+ models with exact RHD driver distances (`distances_rhd: { FL, FR, RL, RR, SUB }`), cabin volumes, and resonant frequencies.
  - `mobile-app/components/PaymentModal.tsx` lines 184-240 and `AuthModal.tsx` lines 50-100 implement prototype payment and OTP auth workflows.

## 2. Logic Chain
1. **Equalizer & Spline Interpolation**: Based on the 14-band specification (25Hz to 16kHz) and design constraints (cyan `#22D3EE` trace, monospace readouts), the continuous frequency response must be calculated using continuous biquad peaking filter transfer functions $G_i(f)$ summed across all bands, with Monotone Cubic Hermite / Catmull-Rom spline interpolation to prevent visual curve overshoot on the canvas.
2. **Web Audio Signal Chain**: To provide real-time audio generation and live visual feedback without clipping or audio pop, the Web Audio graph must connect an `OscillatorNode` / Pink Noise buffer through an anti-pop ramping `GainNode`, a 14-band `BiquadFilterNode` cascade, an LR4 crossover filter, and an `AnalyserNode` (`fftSize = 2048`, `smoothing = 0.8`) feeding a 60FPS canvas visualizer.
3. **Crossover & Subsonic Infrasonic Protection**: Based on the acoustics of ported enclosures, cone excursion increases asymptotically below the box tuning frequency $F_b$. Applying an LR4 HPF at $F_b - 7\text{ Hz}$ (e.g., $28\text{ Hz}$ for a $35\text{ Hz}$ box) prevents bottoming out. Setting the cutoff below $F_b - 10\text{ Hz}$ must trigger a critical amber warning banner (`#F59E0B`).
4. **Time Alignment in RHD Cabins**: In Indian RHD cabins, the driver is located at Front Right. The acoustic path difference $\Delta d_k = d_{\text{max}} - d_k$ mapped to delay $\tau_k = \Delta d_k / 34.34\text{ cm/ms}$ ensures all soundwaves arrive in phase at the driver's ears, pulling the acoustic soundstage from the right footwell up to the center of the windshield.
5. **Gain Staging via DMM**: Using $V_{\text{target}} = \sqrt{P_{\text{RMS}} \times R_{\text{load}}}$ with $1000\text{ Hz}$ (front/rear) and $50\text{ Hz}$ (subwoofer) sine waves at $75\%$ head unit volume ensures maximum clean power without pre-amp or power-amp clipping.
6. **Payment & Invoicing**: Indian GST requires 18% tax breakdown for digital software services ($P_{\text{base}} = \text{₹83.90}, \text{IGST} = \text{₹15.10}, \text{Total} = \text{₹99.00}$). Rendering this in monospace typography aligns with the HMI instrumentation aesthetic and provides high user trust.

## 3. Caveats
- Speed of sound varies slightly with temperature ($343.4\text{ m/s}$ at $20^\circ\text{C}$ vs $349.5\text{ m/s}$ at $30^\circ\text{C}$). The application assumes an average cabin temperature of $20^\circ\text{C}$ ($34.34\text{ cm/ms}$) with optional temperature compensation.
- Web Audio API `AudioContext` autoplay restrictions require user gesture activation before generating tones in web browsers.
- Real-world DMM accuracy depends on True-RMS capability of the physical multimeter at $1000\text{ Hz}$; instructions must advise True-RMS multimeters.

## 4. Conclusion
Tracks 2, 3, and 4 are fully specified with deterministic mathematical formulas, Web Audio API signal processing graphs, TypeScript data structures, component hierarchies, and state management models. The complete survey analysis report is compiled and available in `.agents/survey_explorer_3/analysis.md`.

## 5. Verification Method
1. **Mathematical Accuracy**:
   - Verify time alignment delay for Skoda Kylaq FR ($95\text{ cm}$) against Sub reference ($210\text{ cm}$): $\Delta d = 115\text{ cm} \implies \tau = 115 / 34.34 = 3.35\text{ ms}$.
   - Verify gain staging for $45\text{W RMS} @ 4\Omega$: $V = \sqrt{45 \times 4} = 13.42\text{ V AC}$.
   - Verify GST breakdown for Pro tier: $\text{₹83.90} \times 1.18 = \text{₹99.00}$.
2. **Code & File Inspection**:
   - Inspect `c:/Users/aditya/Downloads/CarAudioAI/.agents/survey_explorer_3/analysis.md` for complete technical formulas and interfaces.
3. **Backend Test Suite**:
   - Run `pytest backend/tests` to confirm consistency with existing calculation engines.
