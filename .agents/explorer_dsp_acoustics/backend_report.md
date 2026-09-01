# CarAudioAI — Comprehensive Backend & DSP Acoustics Report

**Date**: 2026-09-01  
**Author**: Explorer DSP Acoustics Agent (`explorer_dsp_acoustics`)  
**Scope**: Backend Architecture, FastAPI Routers, Acoustic Calculation & DSP Engine, Exporters, Auth/Payments, and Pytest Test Suite.

---

## 1. Executive Summary

The CarAudioAI backend is a **FastAPI** application designed to deliver acoustic calibration, signal processing calculations, and automotive hardware tuning tailored specifically for the Indian automotive market.

The system features:
- **Vehicle Cabin Acoustic Geometry Catalog**: Database of Indian car models (e.g., *Skoda Kylaq, Maruti Swift/Brezza, Hyundai Creta/Venue, Tata Nexon/Harrier, Mahindra XUV700/Thar, Toyota Fortuner*) with cabin dimensions and speaker-to-driver physical acoustic distances.
- **Hardware Database**: Catalog of head units (e.g. *Nakamichi NAM5510*), amplifiers (*MOCO AF-04, Sound Barrier SB-654, Pioneer, Sony, JBL*), component/coaxial speakers (*Sony XS-162GS, Focal, Hertz*), and subwoofers (*Pioneer TS-W307D4, Rockford Fosgate*).
- **Core Acoustic Engines**:
  1. *Time Alignment & Phase Alignment*: Exact millisecond delay calculations for asymmetric Right-Hand Drive (RHD) Indian driver positioning based on speed of sound ($34.3\text{ cm/ms}$).
  2. *Crossover Optimization & Subsonic Protection*: Linkwitz-Riley 24dB/oct and Butterworth filtering with ported box excursion limits ($F_{\text{subsonic}} = F_b - 7\text{ Hz}$).
  3. *14-Band Equalizer Optimizer*: Specialized acoustic EQ profiles (*SQL Punjabi/Hip-Hop/EDM, Harman Car Reference, Vocal Clarity*).
  4. *Gain Staging Engine*: Max clean volume thresholding (75% limit) and Digital Multimeter (DMM) target AC voltage calculation ($V = \sqrt{P \times R}$).
  5. *DSP Exporters*: Pioneer DEH-80PRS XML and MiniDSP JSON preset generators.
- **Auth & Monetization**: Phone OTP auth with Twilio Verify / dev fallback (`123456`), HS256 JWT tokens, and Razorpay payment flow (Free, Pro Monthly @ ₹99, Pro Yearly @ ₹999).
- **Verification**: Complete 14-test suite (`backend/tests/test_tuning_engine.py`) covering all calculation endpoints, data models, auth, payments, and measurements.

---

## 2. Backend Architecture & Directory Structure

### 2.1 File Tree
```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py              # Pydantic BaseSettings (Env vars, Secrets, CORS, Pricing)
│   ├── database.py            # SQLAlchemy 2.0 Engine & SessionLocal sessionmaker
│   ├── main.py                # FastAPI app initialization, CORS, router mounting
│   ├── algorithms/            # Pure mathematical & signal processing algorithms
│   │   ├── __init__.py
│   │   ├── crossover.py       # Crossover points, slopes, ported subsonic logic
│   │   ├── dsp_export.py      # Pioneer XML & MiniDSP JSON generator
│   │   ├── eq_optimizer.py    # 14-band Bezier/Graphic EQ curve optimizer
│   │   ├── gain_staging.py    # Clean volume limit & DMM Target AC voltages
│   │   └── time_alignment.py  # Speed of sound & RHD acoustic delay calculations
│   ├── data/
│   │   ├── equipment.json     # 430 lines of curated audio hardware
│   │   └── indian_cars.json   # 391 lines of Indian vehicles & cabin geometries
│   ├── models/                # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── car.py             # Car cabin specifications
│   │   ├── equipment.py       # Audio equipment catalog
│   │   ├── measurement.py     # Microphone acoustic measurements
│   │   ├── payment.py         # Razorpay transaction history
│   │   ├── tuning_profile.py  # User saved DSP tuning setups
│   │   ├── user.py            # User account & subscription tier
│   │   └── user_equipment.py  # User's mapped vehicle audio hardware
│   ├── routers/               # FastAPI route controllers
│   │   ├── __init__.py
│   │   ├── auth.py            # Phone OTP & JWT access tokens
│   │   ├── cars.py            # Cars query & cabin specs
│   │   ├── equipment.py       # Audio hardware catalog & categories
│   │   ├── measurements.py    # Frequency response upload & smoothing
│   │   ├── payments.py        # Razorpay orders & signature verification
│   │   └── tuning.py          # End-to-end /calculate orchestration
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── tuning.py          # Pydantic request & response schemas
│   └── utils/
│       ├── __init__.py
│       ├── spaces.py          # DigitalOcean Spaces / S3 storage utilities
│       └── twilio.py          # Twilio Verify OTP client & Indian phone formatter
├── tests/
│   └── test_tuning_engine.py  # Comprehensive 14-case test suite
├── .env.example
├── README.md
├── requirements.txt
└── seed.py                    # Database seeding script for cars & equipment
```

### 2.2 Core Framework Components

1. **Configuration (`app/config.py`)**:
   - Uses `pydantic_settings.BaseSettings` with `.env` loading.
   - Manages environment variables: `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM` (HS256), `ACCESS_TOKEN_EXPIRE_MINUTES` (7 days = 10080 mins), `TWILIO_*`, `RAZORPAY_*`, `SPACES_*`, `SENTRY_*`.
   - Defines CORS whitelist for Expo web and mobile development (`http://localhost:8081`, `http://localhost:19000`, `exp://192.168.*.*:*`).

2. **Database Resilience (`app/database.py` & `app/main.py`)**:
   - SQLAlchemy `create_engine` with `pool_pre_ping=True`.
   - In development mode without PostgreSQL, `main.py` wraps table auto-creation in `try/except`, allowing fallback data operation via local JSON datasets (`app/data/indian_cars.json` and `app/data/equipment.json`) and in-memory mock user records.

---

## 3. Acoustic Calculation & DSP Logic Deep Dive

### 3.1 Speed of Sound & Time Alignment (`app/algorithms/time_alignment.py`)

In an automobile cabin, the driver is positioned asymmetrically close to the right speakers (in India / RHD vehicles). To create a coherent, elevated front soundstage where vocal imaging is centered, sound waves from all speakers must arrive at the driver's ears simultaneously.

- **Speed of Sound Constant**:
  $$v = 34.3\text{ cm/ms} \quad (343\text{ m/s at } 20^\circ\text{C})$$
- **Delay Formula**:
  $$\Delta d_i = d_{\text{max}} - d_i$$
  $$\text{Delay}_i (\text{ms}) = \frac{\Delta d_i}{34.3\text{ cm/ms}}$$
  $$\text{Samples}_{48\text{kHz}} = \text{round}\left(\frac{\text{Delay}_i (\text{ms})}{1000} \times 48000\right)$$

#### Skoda Kylaq Asymmetric RHD Calculation:
| Speaker Channel | Physical Distance ($d_i$) | Delta Distance ($\Delta d_i$) | Calculated Delay (ms) | DSP Samples (48kHz) |
|---|---|---|---|---|
| **Subwoofer (Boot)** | $210\text{ cm}$ | $0\text{ cm}$ (Reference) | **$0.00\text{ ms}$** | 0 |
| **Rear Left (RL)** | $155\text{ cm}$ | $55\text{ cm}$ | **$1.60\text{ ms}$** | 77 |
| **Front Left (FL)** | $138\text{ cm}$ | $72\text{ cm}$ | **$2.10\text{ ms}$** | 101 |
| **Rear Right (RR)** | $115\text{ cm}$ | $95\text{ cm}$ | **$2.77\text{ ms}$** | 133 |
| **Front Right (FR)** | $95\text{ cm}$ | $115\text{ cm}$ | **$3.35\text{ ms}$** | 161 |

- **Phase Alignment**:
  - Subwoofer Quarter-Wavelength at 80 Hz: $\lambda/4 = \frac{34300 / 80}{4} \approx 107\text{ cm}$.
  - System checks acoustic boundary reflections and provides 0° vs 180° flip recommendations to avoid cabin phase cancellation.

---

### 3.2 Crossover Network & Subsonic Protection (`app/algorithms/crossover.py`)

- **Front Stage**:
  - 6.5" Component Woofers (e.g. *Sony XS-162GS*): High-Pass Filter (HPF) at **$80\text{ Hz}$** with a 24dB/octave Linkwitz-Riley slope ($Q = 0.7071$ cascaded biquads).
  - 5.25" / 4" Woofers: HPF at **$100\text{ Hz}$**.
  - Prevents voice coil overheating and non-linear cone distortion during high-SPL playback.
- **Rear Stage (Rear Fill)**:
  - Coaxials: HPF at **$90\text{ Hz}$**, 12dB/octave slope, with **$-4.0\text{ dB}$** attenuation to keep the acoustic soundstage anchored in front of the dashboard.
- **Subwoofer & Subsonic Safety**:
  - Low-Pass Filter (LPF): **$80\text{ Hz}$** (12dB to 24dB/octave).
  - **Ported Enclosure Excursion Limit**: In a ported enclosure, below the box tuning frequency $F_b$, the air spring in the port unloads and the driver behaves in free air, risking bottoming out.
  - Subsonic High-Pass Formula:
    $$F_{\text{subsonic}} = \max\left(20, \text{round}(F_b - 7\text{ Hz})\right)$$
    For a **$35\text{ Hz}$ ported box** (e.g. *Pioneer TS-W307D4*), $F_{\text{subsonic}} = 35 - 7 = \mathbf{28\text{ Hz}}$.
  - Sealed Enclosures: Default subsonic filter at **$20\text{ Hz}$**.
- **Bass Boost Protection**: Explicit mandate to set amplifier Bass Boost to $0\text{ dB}$ (OFF) to prevent amplifier rail clipping and acoustic phase smear.

---

### 3.3 14-Band Equalizer Optimization (`app/algorithms/eq_optimizer.py`)

Matches 14-band graphic equalizer frequencies found on automotive head units (e.g., *Nakamichi NAM5510* and Android car units):  
`[32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000]` Hz.

#### Target Sound Profiles:
1. **SQL Punjabi / EDM / Hip-Hop (`sql_punjabi_hiphop`)**:
   - `32 Hz`: $+4.0\text{ dB}$ (Deep sub-bass extension)
   - `63 Hz`: $+5.5\text{ dB}$ (Primary kick drum / 808 punch)
   - `100 Hz`: $+2.0\text{ dB}$ (Upper bass impact)
   - `200 Hz`: $-1.5\text{ dB}$ (Cabin boxy resonance cut in compact SUV cabin)
   - `400 - 500 Hz`: $0.0\text{ dB}$ (Neutral vocal body)
   - `1000 Hz`: $+0.5\text{ dB}$ (Male & female vocal intelligibility)
   - `2000 Hz`: $+1.0\text{ dB}$ (Snare snap & presence)
   - `4000 Hz`: $-1.0\text{ dB}$ (Windshield/A-pillar glass reflection notch to eliminate ear fatigue)
   - `8000 Hz`: $+1.5\text{ dB}$ (Crisp hi-hats)
   - `12000 Hz`: $+2.0\text{ dB}$ (Airy sparkle)
   - `14000 - 16000 Hz`: $+1.5\text{ dB}$ (Harmonic air without hiss)
2. **Harman In-Cabin Reference (`harman_reference`)**:
   - $+3.0\text{ dB}$ sub-bass shelf below $60\text{ Hz}$, $-1.0\text{ dB}$ boundary correction around $200\text{ Hz}$, flat response $200\text{ Hz} - 3\text{ kHz}$, and gentle $-0.5\text{ dB}$ high-frequency roll-off above $3\text{ kHz}$.
3. **Vocal Clarity / Flat**:
   - Optimized speech intelligibility with neutral baseline.

---

### 3.4 Gain Staging & Target AC Multimeter Calibration (`app/algorithms/gain_staging.py`)

Prevents distortion across the signal chain:
1. **Clean Head Unit Volume Limit**:
   $$\text{Max Safe Volume} = \text{int}(\text{MaxSteps} \times 0.75)$$
   For a 40-step head unit (Nakamichi NAM5510), volume is locked to **Step 30** during tuning and normal listening.
2. **Digital Multimeter (DMM) AC Voltage Equation**:
   Using Ohm's Law and the theoretical RMS power equation:
   $$V_{\text{target}} = \sqrt{P_{\text{RMS}} \times R_{\text{impedance}}}$$

#### Hardware Calibration Matrix (Skoda Kylaq Setup):
| Channel / Amplifier | Hardware Load | Power & Impedance | Test Tone | Target AC Voltage | Knob Guide |
|---|---|---|---|---|---|
| **Front CH1/CH2** (*MOCO AF-04*) | Sony XS-162GS Component | $45\text{W RMS} @ 4\Omega$ | $1\text{ kHz } 0\text{dB}$ Sine Wave | $\sqrt{45 \times 4} = \mathbf{13.42\text{ V AC}}$ | ~10:30 o'clock |
| **Rear CH3/CH4** (*MOCO AF-04*) | Sony XS-162GS Coaxial | $27\text{W RMS (Attenuated)} @ 4\Omega$ | $1\text{ kHz } 0\text{dB}$ Sine Wave | $\sqrt{27 \times 4} = \mathbf{10.39\text{ V AC}}$ | ~9:30 o'clock |
| **Subwoofer Mono** (*Sound Barrier SB-654*) | Pioneer TS-W307D4 Ported | $250\text{W RMS} @ 8\Omega$ (Series DVC) | $50\text{ Hz } 0\text{dB}$ Sine Wave | $\sqrt{250 \times 8} = \mathbf{44.72\text{ V AC}}$ | ~11:30 o'clock |

---

## 4. DSP Exporters

Implemented in `app/algorithms/dsp_export.py`:

1. **Pioneer DEH-80PRS XML Exporter (`export_pioneer_xml`)**:
   - Generates structured XML with `<PioneerDSPConfig>`, `<Metadata>`, `<Equalizer type="Graphic14Band">`, `<CrossoverNetwork>` with discrete `<Front>`, `<Rear>`, and `<Subwoofer>` configurations (frequencies, slopes, subsonic values), and `<TimeAlignment>` millisecond channel mappings.
2. **MiniDSP JSON Exporter (`export_minidsp_json`)**:
   - Generates JSON formatted for MiniDSP 2x4 HD / C-DSP, including 4-channel input/output routing matrices, crossover filters, millisecond delay mappings, and parametric EQ arrays.

---

## 5. Authentication, Payments & Storage Subsystems

### 5.1 Authentication (`app/routers/auth.py` & `app/utils/twilio.py`)
- **Phone OTP Flow**:
  - `POST /api/auth/send-otp`: Accepts Indian phone number, formats with `+91` via `format_indian_phone()`.
  - Production mode: Uses Twilio Verify API service.
  - Development mode: Seamless mock verification with code `123456`.
  - `POST /api/auth/verify-otp`: Validates OTP and generates HS256 JWT access token encoding `sub` (phone), `user_id`, and `tier`.
  - `GET /api/auth/me`: Authenticated endpoint using `HTTPBearer` security dependency.

### 5.2 Razorpay Payment Flow (`app/routers/payments.py`)
- **Plans**:
  - Free Tier: ₹0
  - Pro Monthly: ₹99/month
  - Pro Yearly: ₹999/year
- **Order Creation (`POST /api/payments/create-order`)**:
  - Calculates amount in paise ($100\text{ paise} = \text{₹}1$).
  - Creates order via Razorpay client or mock order string (`order_mock_...`).
- **Signature Verification (`POST /api/payments/verify`)**:
  - Verifies HMAC-SHA256 signature:
    $$\text{hash} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{secret})$$
  - Upgrades user account in database upon signature match.

### 5.3 Storage Utilities (`app/utils/spaces.py`)
- DigitalOcean Spaces / S3-compatible client for uploading DSP presets, measurement data, and generated reports with presigned URL support.

---

## 6. Test Suite & Verification Matrix

Located in `backend/tests/test_tuning_engine.py`:

| # | Test Function | Target Component | Description / Assertion | Status |
|---|---|---|---|---|
| 1 | `test_health_endpoints` | `/`, `/api/health` | Verifies health check status is 200 OK | Passed |
| 2 | `test_cars_list_and_filter` | `/api/cars` | Lists Indian cars & filters by `make=Skoda` | Passed |
| 3 | `test_skoda_kylaq_car_api` | `/api/cars/Skoda/Kylaq` | Confirms cabin acoustic distances in JSON specs | Passed |
| 4 | `test_equipment_catalog_api` | `/api/equipment` | Verifies presence of Nakamichi, MOCO, Sony, Pioneer, Sound Barrier | Passed |
| 5 | `test_equipment_categories` | `/api/equipment/categories` | Returns categories (head_unit, amplifier, speaker, subwoofer, dsp) | Passed |
| 6 | `test_crossover_ported_box_subsonic_protection` | `crossover.py` | Front HPF 80Hz, Rear HPF 90Hz, Sub LPF 80Hz, Subsonic 28Hz | Passed |
| 7 | `test_time_alignment_calculation` | `time_alignment.py` | Sub=0ms, FR=3.35ms, FL=2.10ms for RHD driver position | Passed |
| 8 | `test_14_band_eq_optimizer` | `eq_optimizer.py` | 14 bands, +5.5dB @ 63Hz, -1.5dB @ 200Hz | Passed |
| 9 | `test_gain_staging_voltages` | `gain_staging.py` | 13.42V AC for Front 45W @ 4Ω | Passed |
| 10 | `test_dsp_export_generators` | `dsp_export.py` | Generates valid XML and JSON for Pioneer and MiniDSP | Passed |
| 11 | `test_full_tuning_pipeline_endpoint` | `/api/tuning/calculate` | Full end-to-end tuning pipeline with Skoda Kylaq equipment payload | Passed |
| 12 | `test_auth_otp_and_jwt_flow` | `/api/auth/*` | Send OTP $\rightarrow$ Verify `123456` $\rightarrow$ Access `/me` with Bearer token | Passed |
| 13 | `test_payment_plans_and_order` | `/api/payments/*` | Lists ₹99/₹999 plans $\rightarrow$ Creates order $\rightarrow$ Verifies signature | Passed |
| 14 | `test_measurements_upload_and_smoothing` | `/api/measurements` | Uploads raw frequency curve $\rightarrow$ Moving average smoothing $\rightarrow$ Standing wave peak detection | Passed |

---

## 7. Skoda Kylaq Reference Benchmark Confirmation

The backend is fully calibrated and verified against the user's specific setup:
- **Vehicle**: Skoda Kylaq Prestige (Cabin acoustic distances: FL $138\text{ cm}$, FR $95\text{ cm}$, RL $155\text{ cm}$, RR $115\text{ cm}$, SUB $210\text{ cm}$)
- **Head Unit**: Nakamichi NAM5510 (14-Band Graphic EQ, 2.0V Pre-outs, Clean Volume Limit: Step 30/40)
- **Amplifier 1**: MOCO AF-04 4-Channel (CH1/2 HPF 80Hz @ 13.42V AC, CH3/4 HPF 90Hz @ 10.39V AC)
- **Amplifier 2**: Sound Barrier SB-654 4-Channel (Bridged Mono LPF 80Hz @ 44.72V AC, Subsonic HPF 28Hz, Bass Boost 0dB)
- **Speakers**: Sony XS-162GS 6.5" Component (Front) + Sony XS-162GS 6.5" Coaxial (Rear)
- **Subwoofer**: Pioneer TS-W307D4 in Custom 35Hz Ported Enclosure (Dual 4Ω wired to 8Ω series)

---
*Report generated and self-verified by `explorer_dsp_acoustics`.*
