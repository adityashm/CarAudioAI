/**
 * CarAudioAI — Precision DSP Instrumentation Constants & Mathematical Engine
 * 
 * Domain standards:
 * - 14 ISO 1/3-octave center frequencies (25 Hz to 16 kHz)
 * - Gain range: -12.0 dB to +12.0 dB (0.1 dB resolution, Q = 1.414)
 * - Linkwitz-Riley 24dB/octave (LR4) 4th-order crossovers (-6.02 dB at fc, flat 0.0 dB summation)
 * - Ported box subsonic infrasonic safety rule: fc_subsonic = f_box - 7 Hz (e.g. 28 Hz for 35 Hz box)
 * - Asymmetric RHD time alignment: delay = delta_d / 34.34 cm/ms (c = 34.34 cm/ms @ 20°C)
 * - Multimeter AC target voltage: V_ac = sqrt(P_rms * R_load) with 75% clean volume limit
 */

export const SPEED_OF_SOUND_CM_PER_MS = 34.34; // Speed of sound at 20°C in cm/ms (343.4 m/s)
export const SPEED_OF_SOUND_M_PER_S = 343.4;
export const DSP_SAMPLE_RATE_HZ = 48000;

// 14 ISO 1/3-octave EQ center frequencies
export const ISO_14_BAND_FREQUENCIES: readonly number[] = [
  25, 40, 63, 100, 160, 250, 400, 630, 1000, 2500, 4000, 6300, 10000, 16000,
] as const;

export const DEFAULT_EQ_FREQUENCIES = [...ISO_14_BAND_FREQUENCIES];

// Alternative 14-band frequency set supported for legacy automotive head units
export const LEGACY_14_BAND_FREQUENCIES: readonly number[] = [
  32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000,
] as const;

export const EQ_GAIN_MIN_DB = -12.0;
export const EQ_GAIN_MAX_DB = 12.0;
export const EQ_GAIN_STEP_DB = 0.1;
export const DEFAULT_Q_FACTOR = 1.414; // 1-octave bandwidth

export interface EqPreset {
  id: string;
  name: string;
  description: string;
  gains: number[];
}

export const EQ_PRESETS: Record<string, EqPreset> = {
  harman_reference: {
    id: 'harman_reference',
    name: 'Harman Reference',
    description: 'Acoustically balanced in-cabin response with smooth bass elevation and linear mids.',
    gains: [3.5, 3.5, 3.0, 1.5, -0.5, 0.0, 0.0, 0.0, 0.5, 0.0, -0.5, 0.0, 0.5, 0.0],
  },
  sql_punjabi_hiphop: {
    id: 'sql_punjabi_hiphop',
    name: 'Punjabi Bass SQL',
    description: 'Heavy sub-bass impact (+5.5dB @ 63Hz), cabin resonance notch cut, and high-frequency sparkle.',
    gains: [4.5, 5.5, 5.0, 2.0, -1.5, -0.5, 0.0, 0.5, 1.0, 1.5, -1.0, 1.5, 2.0, 1.5],
  },
  vocal_clarity: {
    id: 'vocal_clarity',
    name: 'Vocal Clarity',
    description: 'Enhanced dialogue and acoustic instrument presence (1kHz - 4kHz) with tight, controlled low end.',
    gains: [1.0, 1.0, 1.0, 0.0, -1.5, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, 1.0, 0.5, 0.5],
  },
  flat: {
    id: 'flat',
    name: 'Flat Reset',
    description: 'Bypass all 14 equalizer bands to pure 0.0 dB unity gain.',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
};

// ============================================================================
// 1. LINKWITZ-RILEY 24dB/OCT (LR4) CROSSOVER MATHEMATICS
// ============================================================================

export interface CrossoverDefaults {
  frontHpfHz: number;
  rearHpfHz: number;
  subLpfHz: number;
  slopeDbOct: 24;
}

export const DEFAULT_CROSSOVER_CONFIG: CrossoverDefaults = {
  frontHpfHz: 80,
  rearHpfHz: 90,
  subLpfHz: 80,
  slopeDbOct: 24,
};

/**
 * Compute Linkwitz-Riley 4th Order (LR4) Low-Pass magnitude at frequency f
 * |H_LR4_LP(f)| = 1 / (1 + (f / fc)^4)
 * Attenuation at fc: 1 / 2 = 0.5 (-6.02 dB)
 */
export function calculateLr4LowPassMagnitude(f: number, fc: number): number {
  if (fc <= 0 || f <= 0) return 1.0;
  const ratio = f / fc;
  const ratio4 = Math.pow(ratio, 4);
  return 1 / (1 + ratio4);
}

/**
 * Compute Linkwitz-Riley 4th Order (LR4) High-Pass magnitude at frequency f
 * |H_LR4_HP(f)| = (f / fc)^4 / (1 + (f / fc)^4)
 * Attenuation at fc: 1 / 2 = 0.5 (-6.02 dB)
 */
export function calculateLr4HighPassMagnitude(f: number, fc: number): number {
  if (fc <= 0 || f <= 0) return 0.0;
  const ratio = f / fc;
  const ratio4 = Math.pow(ratio, 4);
  return ratio4 / (1 + ratio4);
}

/**
 * Returns LR4 gain in dB for low-pass and high-pass filters
 */
export function calculateLr4LowPassDb(f: number, fc: number): number {
  const mag = calculateLr4LowPassMagnitude(f, fc);
  return mag > 0 ? 20 * Math.log10(mag) : -120;
}

export function calculateLr4HighPassDb(f: number, fc: number): number {
  const mag = calculateLr4HighPassMagnitude(f, fc);
  return mag > 0 ? 20 * Math.log10(mag) : -120;
}

// ============================================================================
// 2. PORTED ENCLOSURE SUBSONIC INFRASONIC PROTECTION
// ============================================================================

export interface SubsonicSafetyResult {
  recommendedCutoffHz: number;
  currentCutoffHz: number;
  boxTuningHz: number;
  enclosureType: 'ported' | 'sealed';
  isSafe: boolean;
  isWarning: boolean;
  isCriticalDanger: boolean;
  alertMessage?: string;
  statusBadge: 'ok' | 'warning' | 'danger';
}

/**
 * Calculate recommended subsonic high-pass filter frequency and evaluate excursion safety
 * For ported box tuned at Fb: safe subsonic cutoff is ~ (Fb - 7 Hz), minimum 20 Hz.
 * If user dials below (Fb - 7 Hz), cone unloading and excessive voice-coil excursion occur.
 */
export function evaluateSubsonicSafety(
  currentSubsonicHz: number,
  boxTuningHz: number = 35,
  enclosureType: 'ported' | 'sealed' = 'ported'
): SubsonicSafetyResult {
  if (enclosureType === 'sealed') {
    return {
      recommendedCutoffHz: 20,
      currentCutoffHz: currentSubsonicHz,
      boxTuningHz: 0,
      enclosureType: 'sealed',
      isSafe: true,
      isWarning: false,
      isCriticalDanger: false,
      statusBadge: 'ok',
    };
  }

  const safeCutoff = Math.max(20, Math.round(boxTuningHz - 7));
  const dangerThreshold = boxTuningHz - 10;
  const isCriticalDanger = currentSubsonicHz < dangerThreshold;
  const isWarning = !isCriticalDanger && currentSubsonicHz < safeCutoff;
  const isSafe = currentSubsonicHz >= safeCutoff;

  let alertMessage: string | undefined;
  if (isCriticalDanger) {
    alertMessage = `CRITICAL: Subsonic filter (${currentSubsonicHz.toFixed(0)}Hz) is severely below port tuning (${boxTuningHz}Hz). Subwoofer cone will unload and bottom out!`;
  } else if (isWarning) {
    alertMessage = `WARNING: Subsonic cutoff (${currentSubsonicHz.toFixed(0)}Hz) is below recommended safe limit (${safeCutoff}Hz for ${boxTuningHz}Hz box). Increased mechanical excursion risk.`;
  }

  return {
    recommendedCutoffHz: safeCutoff,
    currentCutoffHz: currentSubsonicHz,
    boxTuningHz,
    enclosureType: 'ported',
    isSafe,
    isWarning,
    isCriticalDanger,
    alertMessage,
    statusBadge: isCriticalDanger ? 'danger' : isWarning ? 'warning' : 'ok',
  };
}

// ============================================================================
// 3. ASYMMETRIC RHD TIME ALIGNMENT CALCULATIONS
// ============================================================================

export type SpeakerChannelId = 'FL' | 'FR' | 'RL' | 'RR' | 'SUB';

export interface ChannelDistanceMap {
  FL: number;
  FR: number;
  RL: number;
  RR: number;
  SUB: number;
}

export interface ChannelDelayResult {
  channel: SpeakerChannelId;
  distanceCm: number;
  deltaDistanceCm: number;
  delayMs: number;
  dspDelaySamples48k: number;
}

// Concrete Indian RHD Vehicle Distance Datasets
export const VEHICLE_RHD_DISTANCES: Record<string, { name: string; distancesCm: ChannelDistanceMap }> = {
  skoda_kylaq: {
    name: 'Skoda Kylaq (RHD Driver)',
    distancesCm: { FR: 95.0, FL: 138.0, RR: 115.0, RL: 155.0, SUB: 210.0 },
  },
  maruti_swift: {
    name: 'Maruti Suzuki Swift (RHD Driver)',
    distancesCm: { FR: 88.0, FL: 130.0, RR: 105.0, RL: 145.0, SUB: 190.0 },
  },
  hyundai_creta: {
    name: 'Hyundai Creta (RHD Driver)',
    distancesCm: { FR: 98.0, FL: 142.0, RR: 120.0, RL: 160.0, SUB: 220.0 },
  },
  mahindra_thar: {
    name: 'Mahindra Thar (RHD Driver)',
    distancesCm: { FR: 85.0, FL: 128.0, RR: 100.0, RL: 140.0, SUB: 180.0 },
  },
};

/**
 * Calculate millisecond delay and DSP sample offsets for RHD driver seating
 * Formula: delay_ms = (max_distance - channel_distance) / 34.34 cm/ms
 */
export function calculateTimeAlignment(
  distances: ChannelDistanceMap,
  speedOfSound: number = SPEED_OF_SOUND_CM_PER_MS
): Record<SpeakerChannelId, ChannelDelayResult> {
  const maxDistance = Math.max(distances.FL, distances.FR, distances.RL, distances.RR, distances.SUB);
  const channels: SpeakerChannelId[] = ['FL', 'FR', 'RL', 'RR', 'SUB'];
  const result = {} as Record<SpeakerChannelId, ChannelDelayResult>;

  channels.forEach((ch) => {
    const dist = distances[ch];
    const deltaCm = +(maxDistance - dist).toFixed(1);
    const delayMs = +(deltaCm / speedOfSound).toFixed(2);
    const samples = Math.round((delayMs / 1000) * DSP_SAMPLE_RATE_HZ);

    result[ch] = {
      channel: ch,
      distanceCm: dist,
      deltaDistanceCm: deltaCm,
      delayMs,
      dspDelaySamples48k: samples,
    };
  });

  return result;
}

// ============================================================================
// 4. MULTIMETER DMM GAIN STAGING TARGET VOLTAGE CALCULATIONS
// ============================================================================

export interface DmmCalibrationStage {
  label: string;
  channelId: string;
  defaultRmsWatts: number;
  defaultImpedanceOhms: number;
  testToneHz: number;
  testToneDbFs: number;
  recommendedKnobPosition: string;
  measurementProbes: string;
}

export const DMM_CALIBRATION_STAGES: DmmCalibrationStage[] = [
  {
    label: 'Front Stage (CH 1/2)',
    channelId: 'front',
    defaultRmsWatts: 45,
    defaultImpedanceOhms: 4,
    testToneHz: 1000,
    testToneDbFs: 0.0,
    recommendedKnobPosition: '~10:30 o\'clock',
    measurementProbes: 'CH1 / CH2 (+) & (-) Speaker Terminals',
  },
  {
    label: 'Rear Fill Stage (CH 3/4)',
    channelId: 'rear',
    defaultRmsWatts: 27, // 60% attenuated rear fill
    defaultImpedanceOhms: 4,
    testToneHz: 1000,
    testToneDbFs: 0.0,
    recommendedKnobPosition: '~9:30 o\'clock',
    measurementProbes: 'CH3 / CH4 (+) & (-) Speaker Terminals',
  },
  {
    label: 'Subwoofer Stage (Bridged Mono)',
    channelId: 'subwoofer',
    defaultRmsWatts: 250,
    defaultImpedanceOhms: 8, // 8 ohm series / 4 ohm bridged
    testToneHz: 50,
    testToneDbFs: 0.0,
    recommendedKnobPosition: '~11:30 o\'clock',
    measurementProbes: 'CH5 / Bridged Sub (+) & (-) Terminals',
  },
];

/**
 * Calculate Target AC Voltage for DMM Gain Staging
 * Formula: V_ac = sqrt(P_rms * R_load)
 */
export function calculateTargetAcVoltage(rmsWatts: number, impedanceOhms: number): number {
  if (rmsWatts <= 0 || impedanceOhms <= 0) return 0.0;
  return +(Math.sqrt(rmsWatts * impedanceOhms)).toFixed(2);
}

/**
 * Head Unit Clean Volume Limit (75% Rule to prevent DAC/preamp clipping)
 */
export function calculateCleanVolumeLimit(maxVolumeSteps: number = 40): {
  maxSteps: number;
  safeStep: number;
  percent: number;
} {
  const safeStep = Math.floor(maxVolumeSteps * 0.75);
  return {
    maxSteps: maxVolumeSteps,
    safeStep,
    percent: 75,
  };
}

// ============================================================================
// 5. CONTINUOUS BIQUAD PEAKING EQ TRANSFER FUNCTION
// ============================================================================

/**
 * Calculate composite EQ response in dB at frequency f across 14 cascaded biquad peaking bands
 */
export function calculateCompositeEqResponseDb(
  f: number,
  gains: number[],
  frequencies: readonly number[] = ISO_14_BAND_FREQUENCIES,
  q: number = DEFAULT_Q_FACTOR
): number {
  if (f <= 0) return 0.0;
  let totalDb = 0.0;

  for (let i = 0; i < frequencies.length; i++) {
    const f0 = frequencies[i];
    const gainDb = gains[i] || 0.0;
    if (Math.abs(gainDb) < 0.01) continue;

    // Analog peaking filter approximation
    const w = 2 * Math.PI * f;
    const w0 = 2 * Math.PI * f0;
    const A = Math.pow(10, gainDb / 40); // sqrt of 10^(G/20)

    const denomOmega = Q_denom(w, w0, q);
    if (denomOmega === 0) continue;

    const numTerm = (A * w * w0) / (q * (w0 * w0 - w * w || 1e-6));
    const denTerm = (w * w0) / (A * q * (w0 * w0 - w * w || 1e-6));

    const magSquared = (1 + numTerm * numTerm) / (1 + denTerm * denTerm);
    const bandDb = 10 * Math.log10(Math.max(1e-12, magSquared));
    totalDb += bandDb;
  }

  return totalDb;
}

function Q_denom(w: number, w0: number, q: number): number {
  return q * (w0 * w0 - w * w);
}

/**
 * Approximate Phase response (in degrees) for a peaking filter cascade
 */
export function calculateCompositePhaseDeg(
  f: number,
  gains: number[],
  frequencies: readonly number[] = ISO_14_BAND_FREQUENCIES
): number {
  if (f <= 0) return 0.0;
  let totalPhaseDeg = 0.0;

  for (let i = 0; i < frequencies.length; i++) {
    const f0 = frequencies[i];
    const gainDb = gains[i] || 0.0;
    if (Math.abs(gainDb) < 0.01) continue;

    const octavesFromCenter = Math.log2(f / f0);
    // Standard peaking filter creates a small minimum-phase shift proportional to gain
    const phaseShift = -gainDb * 3.5 * Math.sin(Math.PI * Math.max(-1, Math.min(1, octavesFromCenter)));
    totalPhaseDeg += phaseShift;
  }

  return Math.max(-90, Math.min(90, totalPhaseDeg));
}
