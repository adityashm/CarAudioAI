import { Platform } from 'react-native';

/**
 * Universal browser file download helper
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain'): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return true;
    } catch (e) {
      console.error('[ExportService] Browser download error:', e);
      return false;
    }
  } else {
    // Non-web fallback
    console.log(`[ExportService] Native download placeholder for ${filename}`);
    return false;
  }
}

/**
 * One-click download for Pioneer DEH-80PRS XML preset
 */
export function downloadPioneerXml(vehicleName: string, xmlContent: string): boolean {
  const sanitized = vehicleName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `pioneer_deh80prs_${sanitized}.xml`;
  return downloadFile(filename, xmlContent, 'application/xml;charset=utf-8');
}

/**
 * One-click download for MiniDSP 2x4 HD JSON preset
 */
export function downloadMiniDspJson(vehicleName: string, jsonContent: string | object): boolean {
  const sanitized = vehicleName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `minidsp_config_${sanitized}.json`;
  const contentStr = typeof jsonContent === 'string' ? jsonContent : JSON.stringify(jsonContent, null, 2);
  return downloadFile(filename, contentStr, 'application/json;charset=utf-8');
}

/**
 * Generate Pioneer DEH-80PRS XML string from acoustic state
 */
export function generatePioneerXml(params: {
  vehicleName: string;
  delaysMs: { FL: number; FR: number; RL: number; RR: number; SUB: number };
  frontHpf: number;
  rearHpf: number;
  subLpf: number;
  subsonicHz: number;
  eqGains: number[];
  eqFrequencies?: number[];
}): string {
  const freqs = params.eqFrequencies || [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000];
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- CarAudioAI - Pioneer DEH-80PRS DSP Preset -->
<PioneerDSPConfig version="1.0">
  <Metadata>
    <Vehicle>${params.vehicleName}</Vehicle>
    <GeneratedAt>${new Date().toISOString()}</GeneratedAt>
    <Author>CarAudioAI Acoustic Engine</Author>
  </Metadata>
  <TimeAlignment position="driver_rhd" unit="milliseconds">
    <Channel id="FL" delay="${params.delaysMs.FL}"/>
    <Channel id="FR" delay="${params.delaysMs.FR}"/>
    <Channel id="RL" delay="${params.delaysMs.RL}"/>
    <Channel id="RR" delay="${params.delaysMs.RR}"/>
    <Channel id="SUB" delay="${params.delaysMs.SUB}"/>
  </TimeAlignment>
  <CrossoverNetwork>
    <Front HPF="${params.frontHpf}" Slope="24dB_LR"/>
    <Rear HPF="${params.rearHpf}" Slope="24dB_LR" GainOffset_dB="-4.0"/>
    <Subwoofer LPF="${params.subLpf}" Subsonic="${params.subsonicHz}" Slope="24dB_LR"/>
  </CrossoverNetwork>
  <Equalizer type="Graphic14Band">
    ${freqs.map((f, i) => `<Band freq="${f}Hz" gain="${params.eqGains[i] || 0.0}dB"/>`).join('\n    ')}
  </Equalizer>
</PioneerDSPConfig>`;
}

/**
 * Generate MiniDSP 2x4 HD JSON string from acoustic state
 */
export function generateMiniDspJson(params: {
  vehicleName: string;
  delaysMs: { FL: number; FR: number; RL: number; RR: number; SUB: number };
  frontHpf: number;
  rearHpf: number;
  subLpf: number;
  subsonicHz: number;
  eqGains: number[];
  eqFrequencies?: number[];
}): string {
  const freqs = params.eqFrequencies || [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000];
  const payload = {
    metadata: {
      device: 'MiniDSP 2x4 HD / C-DSP 8x12',
      vehicle: params.vehicleName,
      created_at: new Date().toISOString(),
      generator: 'CarAudioAI India DSP Engine',
    },
    routing: {
      input_channels: ['IN1_Left', 'IN2_Right'],
      output_channels: {
        out1_front_left: { delay_ms: params.delaysMs.FL, polarity: 'normal' },
        out2_front_right: { delay_ms: params.delaysMs.FR, polarity: 'normal' },
        out3_rear_left: { delay_ms: params.delaysMs.RL, polarity: 'normal', attenuation_db: -4.0 },
        out4_rear_right: { delay_ms: params.delaysMs.RR, polarity: 'normal', attenuation_db: -4.0 },
        out5_subwoofer: { delay_ms: params.delaysMs.SUB, polarity: 'normal' },
      },
    },
    crossovers: {
      front: { filter: 'Linkwitz-Riley 24dB/oct', hpf_hz: params.frontHpf },
      rear: { filter: 'Linkwitz-Riley 24dB/oct', hpf_hz: params.rearHpf },
      subwoofer: { filter: 'Linkwitz-Riley 24dB/oct', lpf_hz: params.subLpf, subsonic_hpf_hz: params.subsonicHz },
    },
    parametric_eq: freqs.map((f, i) => ({
      band: i + 1,
      frequency_hz: f,
      gain_db: params.eqGains[i] || 0.0,
      q_factor: 1.414,
      type: 'PEQ',
    })),
  };
  return JSON.stringify(payload, null, 2);
}
