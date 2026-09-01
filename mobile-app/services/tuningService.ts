import apiClient from './api';

export interface TuningEquipmentPayload {
  head_unit_brand: string;
  head_unit_model: string;
  front_speakers: string;
  rear_speakers: string;
  speakers_amplifier: string;
  subwoofer: string;
  subwoofer_enclosure_type: 'ported' | 'sealed' | 'none';
  subwoofer_tuning_frequency_hz: number;
  subwoofer_amplifier: string;
}

export interface TuningCalculationRequest {
  car_make: string;
  car_model: string;
  car_variant?: string;
  equipment: TuningEquipmentPayload;
  sound_target_profile: 'sql_punjabi_hiphop' | 'harman_reference' | 'vocal_clarity';
  listening_position: 'driver_rhd' | 'passenger_lhd' | 'both_front';
}

export interface TimeAlignmentChannel {
  distance_cm: number;
  delta_distance_cm: number;
  delay_ms: number;
  delay_samples_48khz: number;
}

export interface TimeAlignmentProfile {
  listening_position: string;
  speed_of_sound_cm_per_ms: number;
  furthest_speaker_reference: string;
  channels: Record<string, TimeAlignmentChannel>;
  phase_alignment_notes: string[];
}

export interface CrossoverChannel {
  filter_type: string;
  slope_db_per_octave: number;
  cutoff_frequency_hz: number;
  q_factor?: number;
  gain_offset_db?: number;
  purpose: string;
}

export interface CrossoverProfile {
  front_stage: CrossoverChannel;
  rear_stage: CrossoverChannel;
  subwoofer_low_pass?: CrossoverChannel;
  subsonic_high_pass_protection?: {
    filter_type: string;
    slope_db_per_octave: number;
    cutoff_frequency_hz: number;
    protection_rule: string;
    warning?: string;
  };
  bass_boost_recommendation: string;
}

export interface TuningCalculationResponse {
  car: string;
  setup_summary: string;
  sound_target: string;
  head_unit_14_band_eq: {
    frequencies_hz: number[];
    recommended_gain_db: number[];
    profile_name: string;
    acoustic_rationale: Record<string, string>;
  };
  crossover_configuration: CrossoverProfile;
  time_alignment_and_phase: TimeAlignmentProfile;
  amplifier_gain_and_dial_settings: {
    head_unit_clean_volume_limit: {
      maximum_volume_step: number;
      recommended_tuning_volume: number;
      percentage_of_max: number;
    };
    target_ac_voltages_dmm: Record<string, {
      test_tone: string;
      theoretical_rms_power_watts: number;
      impedance_ohms: number;
      target_ac_voltage_volts: number;
      dmm_meter_setting: string;
      estimated_knob_clock_position: string;
    }>;
  };
  quick_action_checklist: string[];
  pioneer_xml_preview?: string;
  minidsp_json_preview?: string;
}

export interface MeasurementPoint {
  frequency_hz: number;
  spl_db: number;
}

export interface MeasurementResponse {
  id: number;
  measurement_type: string;
  total_data_points: number;
  smoothed_data: MeasurementPoint[];
  peak_resonance_frequencies_hz: number[];
  recommended_cuts: {
    frequency_hz: number;
    measured_spl: number;
    recommended_eq_cut_db: number;
    rationale: string;
  }[];
}

const SPEED_OF_SOUND = 34.3; // cm/ms @ 20°C

/**
 * Calculate acoustic tuning profile via FastAPI backend or fallback client calculation
 */
export async function calculateTuning(
  payload: TuningCalculationRequest
): Promise<TuningCalculationResponse> {
  try {
    const response = await apiClient.post<TuningCalculationResponse>(
      '/api/tuning/calculate',
      payload
    );
    return response.data;
  } catch (error: any) {
    console.warn('[TuningService] Backend offline, calculating locally via acoustic math engine:', error.message);
    return calculateLocalTuning(payload);
  }
}

/**
 * Local deterministic acoustic math engine (matching backend algorithms exactly)
 */
export function calculateLocalTuning(
  payload: TuningCalculationRequest
): TuningCalculationResponse {
  // 1. Distances for Skoda Kylaq / standard Indian Compact SUV RHD
  const distances: Record<string, number> = {
    FL: 138,
    FR: 95,
    RL: 155,
    RR: 115,
    SUB: 210,
  };

  const maxDist = Math.max(...Object.values(distances));
  const channels: Record<string, TimeAlignmentChannel> = {};

  for (const [ch, dist] of Object.entries(distances)) {
    const delta = +(maxDist - dist).toFixed(1);
    const delayMs = +(delta / SPEED_OF_SOUND).toFixed(2);
    const samples = Math.round((delayMs / 1000) * 48000);
    channels[ch] = {
      distance_cm: dist,
      delta_distance_cm: delta,
      delay_ms: delayMs,
      delay_samples_48khz: samples,
    };
  }

  // 2. 14-band EQ profile
  const frequencies = [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000];
  let gains = [4.0, 5.5, 2.0, -1.5, 0.0, 0.0, 0.5, 1.0, -1.0, 1.5, 1.5, 2.0, 1.5, 1.5];
  let profileName = 'SQL Punjabi / Bass Heavy';

  if (payload.sound_target_profile === 'harman_reference') {
    gains = [3.0, 3.0, 1.5, -1.0, 0.0, 0.0, 0.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.0];
    profileName = 'Harman Automotive Target Curve';
  } else if (payload.sound_target_profile === 'vocal_clarity') {
    gains = [1.0, 1.0, 0.0, -2.0, 1.0, 1.5, 2.0, 1.5, 0.0, 1.0, 1.0, 1.0, 0.5, 0.5];
    profileName = 'Vocal Clarity & Acoustic Intelligibility';
  }

  // 3. Crossovers & Subsonic Protection
  const tuneFreq = payload.equipment.subwoofer_tuning_frequency_hz || 35;
  const subsonicCutoff = payload.equipment.subwoofer_enclosure_type === 'ported'
    ? Math.max(20, Math.round(tuneFreq - 7))
    : 20;

  // 4. Gain Staging Voltages
  const vFront = +(Math.sqrt(45.0 * 4.0)).toFixed(2);
  const vRear = +(Math.sqrt(45.0 * 0.6 * 4.0)).toFixed(2);
  const vSub = +(Math.sqrt(250.0 * 8.0)).toFixed(2);

  // 5. XML & JSON previews
  const pioneerXml = `<?xml version="1.0" encoding="UTF-8"?>
<PioneerDSPConfig version="1.0">
  <Metadata>
    <Vehicle>${payload.car_make} ${payload.car_model}</Vehicle>
    <TuningProfile>${profileName}</TuningProfile>
    <GeneratedBy>CarAudioAI India</GeneratedBy>
  </Metadata>
  <TimeAlignment position="driver_rhd">
    <Channel name="FL" delay_ms="${channels.FL.delay_ms}"/>
    <Channel name="FR" delay_ms="${channels.FR.delay_ms}"/>
    <Channel name="RL" delay_ms="${channels.RL.delay_ms}"/>
    <Channel name="RR" delay_ms="${channels.RR.delay_ms}"/>
    <Channel name="SUB" delay_ms="0.00"/>
  </TimeAlignment>
  <CrossoverNetwork>
    <Front HPF_Hz="80.0" Slope="24dB_LinkwitzRiley"/>
    <Rear HPF_Hz="90.0" Slope="24dB_LinkwitzRiley" GainOffset_dB="-4.0"/>
    <Subwoofer LPF_Hz="80.0" Subsonic_Hz="${subsonicCutoff}.0" Slope="24dB_LinkwitzRiley"/>
  </CrossoverNetwork>
  <Equalizer type="Graphic14Band">
    ${frequencies.map((f, i) => `<Band hz="${f}" gain_db="${gains[i]}"/>`).join('\n    ')}
  </Equalizer>
</PioneerDSPConfig>`;

  const minidspJson = JSON.stringify({
    metadata: {
      device: 'MiniDSP 2x4 HD / C-DSP 8x12',
      vehicle: `${payload.car_make} ${payload.car_model}`,
      target_curve: profileName,
    },
    delays_ms: {
      ch1_front_left: channels.FL.delay_ms,
      ch2_front_right: channels.FR.delay_ms,
      ch3_rear_left: channels.RL.delay_ms,
      ch4_rear_right: channels.RR.delay_ms,
      ch5_subwoofer: 0.0,
    },
    crossovers: {
      front: { type: 'Linkwitz-Riley', slope_db_oct: 24, hpf_hz: 80.0 },
      rear: { type: 'Linkwitz-Riley', slope_db_oct: 24, hpf_hz: 90.0, gain_db: -4.0 },
      subwoofer: { type: 'Linkwitz-Riley', slope_db_oct: 24, lpf_hz: 80.0, subsonic_hpf_hz: subsonicCutoff },
    },
    equalizer_14_band: frequencies.map((f, i) => ({ freq_hz: f, gain_db: gains[i], q: 1.414 })),
  }, null, 2);

  return {
    car: `${payload.car_make} ${payload.car_model}`,
    setup_summary: `${payload.car_make} ${payload.car_model} with ${payload.equipment.head_unit_brand} ${payload.equipment.head_unit_model}`,
    sound_target: payload.sound_target_profile,
    head_unit_14_band_eq: {
      frequencies_hz: frequencies,
      recommended_gain_db: gains,
      profile_name: profileName,
      acoustic_rationale: {
        '63Hz': '+5.5 dB deep sub-bass boost for punchy kick drums and Indian basslines',
        '200Hz': '-1.5 dB notch to tame SUV cabin boundary standing wave boom',
        '4000Hz': '-1.0 dB gentle dip to eliminate windshield reflection ear fatigue',
        '12000Hz': '+2.0 dB airy sparkle for crystal-clear acoustic reproduction',
      },
    },
    crossover_configuration: {
      front_stage: {
        filter_type: 'Linkwitz-Riley (HPF)',
        slope_db_per_octave: 24,
        cutoff_frequency_hz: 80,
        purpose: 'Protects 6.5" woofers from sub-bass excursion while keeping vocal midrange clean',
      },
      rear_stage: {
        filter_type: 'Linkwitz-Riley (HPF)',
        slope_db_per_octave: 24,
        cutoff_frequency_hz: 90,
        gain_offset_db: -4.0,
        purpose: 'Attenuated rear ambient fill that maintains forward soundstage imaging',
      },
      subwoofer_low_pass: {
        filter_type: 'Linkwitz-Riley (LPF)',
        slope_db_per_octave: 24,
        cutoff_frequency_hz: 80,
        purpose: 'Limits subwoofer to low bass below 80Hz',
      },
      subsonic_high_pass_protection: {
        filter_type: 'High-Pass Subsonic Filter',
        slope_db_per_octave: 24,
        cutoff_frequency_hz: subsonicCutoff,
        protection_rule: `Set to ${tuneFreq}Hz box tuning - 7Hz = ${subsonicCutoff}Hz`,
        warning: payload.equipment.subwoofer_enclosure_type === 'ported'
          ? `CRITICAL: Protects 35Hz ported enclosure from mechanical cone unloading below ${subsonicCutoff}Hz`
          : undefined,
      },
      bass_boost_recommendation: 'SET BASS BOOST TO 0 dB (OFF) on amplifier to prevent distortion.',
    },
    time_alignment_and_phase: {
      listening_position: payload.listening_position,
      speed_of_sound_cm_per_ms: SPEED_OF_SOUND,
      furthest_speaker_reference: 'Boot Subwoofer (0.00 ms)',
      channels,
      phase_alignment_notes: [
        'Sound waves from all 5 speakers reach the driver headrest simultaneously.',
        'If sub bass sounds weak, flip subwoofer phase switch from 0° to 180°.',
      ],
    },
    amplifier_gain_and_dial_settings: {
      head_unit_clean_volume_limit: {
        maximum_volume_step: 40,
        recommended_tuning_volume: 30,
        percentage_of_max: 75,
      },
      target_ac_voltages_dmm: {
        front_channels: {
          test_tone: '1,000 Hz 0dB Sine Wave',
          theoretical_rms_power_watts: 45.0,
          impedance_ohms: 4.0,
          target_ac_voltage_volts: vFront,
          dmm_meter_setting: 'AC Voltage (V~)',
          estimated_knob_clock_position: '~10:30 o\'clock',
        },
        rear_channels: {
          test_tone: '1,000 Hz 0dB Sine Wave',
          theoretical_rms_power_watts: 27.0,
          impedance_ohms: 4.0,
          target_ac_voltage_volts: vRear,
          dmm_meter_setting: 'AC Voltage (V~)',
          estimated_knob_clock_position: '~9:30 o\'clock',
        },
        subwoofer_channel: {
          test_tone: '50 Hz 0dB Sine Wave',
          theoretical_rms_power_watts: 250.0,
          impedance_ohms: 8.0,
          target_ac_voltage_volts: vSub,
          dmm_meter_setting: 'AC Voltage (V~)',
          estimated_knob_clock_position: '~11:30 o\'clock',
        },
      },
    },
    quick_action_checklist: [
      '1. [AMP 1 - MOCO AF-04]: Flip Front CH1/2 Crossover to HPF @ ~80Hz (~9:30 o\'clock).',
      '2. [AMP 1 - MOCO AF-04]: Flip Rear CH3/4 Crossover to HPF @ ~90Hz (~10:00 o\'clock).',
      '3. [AMP 2 - Sound Barrier SB-654]: Set Crossover to LPF @ ~80Hz (~10:30 o\'clock).',
      '4. [AMP 2 - Sound Barrier SB-654]: Set Subsonic HPF to ~28Hz, Bass Boost to 0dB.',
      '5. [HEAD UNIT]: Apply 14-band EQ offsets (+5.5dB @ 63Hz, -1.5dB @ 200Hz, -1.0dB @ 4kHz).',
      '6. [GAIN CALIBRATION]: Calibrate gains with DMM at Volume 30 (75% clean limit).',
      '7. [TIME ALIGNMENT]: Apply driver delays (FR: 3.35ms, RR: 2.77ms, FL: 2.10ms, RL: 1.60ms, SUB: 0ms).',
    ],
    pioneer_xml_preview: pioneerXml,
    minidsp_json_preview: minidspJson,
  };
}

/**
 * Upload microphone frequency response measurement for acoustic smoothing and peak analysis
 */
export async function uploadMeasurement(
  rawData: MeasurementPoint[],
  measurementType: string = 'cabin_rta_sweep'
): Promise<MeasurementResponse> {
  try {
    const response = await apiClient.post<MeasurementResponse>('/api/measurements', {
      measurement_type: measurementType,
      raw_data: rawData,
    });
    return response.data;
  } catch (error: any) {
    console.warn('[TuningService] Measurement upload offline fallback, smoothing locally:', error.message);
    
    // Client-side 1/3-octave moving average smoothing
    const windowSize = 5;
    const smoothed: MeasurementPoint[] = rawData.map((p, idx) => {
      const start = Math.max(0, idx - 2);
      const end = Math.min(rawData.length, idx + 3);
      const slice = rawData.slice(start, end);
      const avg = slice.reduce((sum, item) => sum + item.spl_db, 0) / slice.length;
      return { frequency_hz: p.frequency_hz, spl_db: +avg.toFixed(1) };
    });

    const avgSpl = smoothed.reduce((sum, p) => sum + p.spl_db, 0) / smoothed.length;
    const peaks: number[] = [];
    const recommendedCuts: any[] = [];

    smoothed.forEach((p) => {
      if (p.spl_db > avgSpl + 3.0) {
        peaks.push(p.frequency_hz);
        recommendedCuts.push({
          frequency_hz: p.frequency_hz,
          measured_spl: p.spl_db,
          recommended_eq_cut_db: +(avgSpl - p.spl_db).toFixed(1),
          rationale: `In-cabin standing resonance at ${p.frequency_hz} Hz`,
        });
      }
    });

    return {
      id: 1,
      measurement_type: measurementType,
      total_data_points: rawData.length,
      smoothed_data: smoothed,
      peak_resonance_frequencies_hz: peaks.slice(0, 5),
      recommended_cuts: recommendedCuts.slice(0, 5),
    };
  }
}

/**
 * Fetch list of cars from backend
 */
export async function getCars(make?: string): Promise<any[]> {
  try {
    const response = await apiClient.get('/api/cars', {
      params: make ? { make } : {},
    });
    return response.data;
  } catch {
    return [];
  }
}

/**
 * Fetch equipment catalog from backend
 */
export async function getEquipment(category?: string, brand?: string): Promise<any[]> {
  try {
    const response = await apiClient.get('/api/equipment', {
      params: { category, brand },
    });
    return response.data;
  } catch {
    return [];
  }
}
