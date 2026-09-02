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
      q: 1.414,
      type: 'PEQ'
    }))
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * One-click download for Audiotec Fischer Helix / Match DSP (.afpc / .dxp XML)
 */
export function downloadHelixAfpc(vehicleName: string, xmlContent: string): boolean {
  const sanitized = vehicleName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `helix_dsp_${sanitized}.afpc`;
  return downloadFile(filename, xmlContent, 'application/xml;charset=utf-8');
}

/**
 * One-click download for Musway / Zapco DSP JSON
 */
export function downloadMuswayPreset(vehicleName: string, jsonContent: string | object): boolean {
  const sanitized = vehicleName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `musway_dsp_${sanitized}.json`;
  const contentStr = typeof jsonContent === 'string' ? jsonContent : JSON.stringify(jsonContent, null, 2);
  return downloadFile(filename, contentStr, 'application/json;charset=utf-8');
}

/**
 * One-click download for Android Head Unit DSP CSV / Text config
 */
export function downloadAndroidDspCsv(vehicleName: string, csvContent: string): boolean {
  const sanitized = vehicleName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `android_dsp_${sanitized}.csv`;
  return downloadFile(filename, csvContent, 'text/csv;charset=utf-8');
}

/**
 * One-click download for Installer Blueprint HTML Sheet
 */
export function downloadInstallerBlueprintHtml(vehicleName: string, htmlContent: string): boolean {
  const sanitized = vehicleName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `caraudioai_installer_blueprint_${sanitized}.html`;
  return downloadFile(filename, htmlContent, 'text/html;charset=utf-8');
}

/**
 * Open printable installer blueprint in a new browser tab/print dialog
 */
export function printInstallerBlueprint(htmlContent: string): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
        return true;
      }
    } catch (e) {
      console.error('[ExportService] Print window failed:', e);
    }
  }
  return false;
}

/**
 * Generate Audiotec Fischer Helix / Match DSP XML (.afpc)
 */
export function generateHelixAfpcXml(params: {
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
<!-- Audiotec Fischer Helix / Match DSP PC-Tool Configuration -->
<!-- Generated by CarAudioAI Acoustic Engine -->
<AudiotecFischerProject Version="5.04.02">
  <ProjectInfo>
    <Device>HELIX DSP.3S / MATCH UP 7DSP / UP 8DSP</Device>
    <Vehicle>${params.vehicleName}</Vehicle>
    <Date>${new Date().toISOString()}</Date>
    <TuningProfile>Right-Hand-Drive (RHD) Driver Optimized</TuningProfile>
  </ProjectInfo>
  <ChannelRouting>
    <Channel Index="0" Name="Front Left" Gain="0.0" Delay_ms="${params.delaysMs.FL}" Delay_cm="${+(params.delaysMs.FL * 34.3).toFixed(1)}" Phase="0">
      <Highpass Frequency="${params.frontHpf}" Characteristic="Linkwitz" Slope="24"/>
      <Equalizer Bands="14">
        ${freqs.map((f, i) => `<Band Index="${i}" Freq="${f}" Gain="${params.eqGains[i] || 0.0}" Q="1.414" Type="Peaking"/>`).join('\n        ')}
      </Equalizer>
    </Channel>
    <Channel Index="1" Name="Front Right" Gain="0.0" Delay_ms="${params.delaysMs.FR}" Delay_cm="${+(params.delaysMs.FR * 34.3).toFixed(1)}" Phase="0">
      <Highpass Frequency="${params.frontHpf}" Characteristic="Linkwitz" Slope="24"/>
      <Equalizer Bands="14">
        ${freqs.map((f, i) => `<Band Index="${i}" Freq="${f}" Gain="${params.eqGains[i] || 0.0}" Q="1.414" Type="Peaking"/>`).join('\n        ')}
      </Equalizer>
    </Channel>
    <Channel Index="2" Name="Rear Left" Gain="-4.0" Delay_ms="${params.delaysMs.RL}" Delay_cm="${+(params.delaysMs.RL * 34.3).toFixed(1)}" Phase="0">
      <Highpass Frequency="${params.rearHpf}" Characteristic="Linkwitz" Slope="24"/>
    </Channel>
    <Channel Index="3" Name="Rear Right" Gain="-4.0" Delay_ms="${params.delaysMs.RR}" Delay_cm="${+(params.delaysMs.RR * 34.3).toFixed(1)}" Phase="0">
      <Highpass Frequency="${params.rearHpf}" Characteristic="Linkwitz" Slope="24"/>
    </Channel>
    <Channel Index="4" Name="Subwoofer" Gain="+2.0" Delay_ms="${params.delaysMs.SUB}" Delay_cm="${+(params.delaysMs.SUB * 34.3).toFixed(1)}" Phase="0">
      <Highpass Frequency="${params.subsonicHz}" Characteristic="Butterworth" Slope="24"/>
      <Lowpass Frequency="${params.subLpf}" Characteristic="Linkwitz" Slope="24"/>
    </Channel>
  </ChannelRouting>
</AudiotecFischerProject>`;
}

/**
 * Generate Musway / Zapco DSP JSON configuration
 */
export function generateMuswayPresetJson(params: {
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
    brand: 'Musway / Zapco DSP Tuning Profile',
    vehicle: params.vehicleName,
    created: new Date().toISOString(),
    channels: [
      { id: 'CH1_FL', delay_ms: params.delaysMs.FL, hpf: params.frontHpf, slope: '24dB_LR' },
      { id: 'CH2_FR', delay_ms: params.delaysMs.FR, hpf: params.frontHpf, slope: '24dB_LR' },
      { id: 'CH3_RL', delay_ms: params.delaysMs.RL, hpf: params.rearHpf, slope: '24dB_LR', gain_db: -4.0 },
      { id: 'CH4_RR', delay_ms: params.delaysMs.RR, hpf: params.rearHpf, slope: '24dB_LR', gain_db: -4.0 },
      { id: 'CH5_SUB', delay_ms: params.delaysMs.SUB, lpf: params.subLpf, subsonic: params.subsonicHz, slope: '24dB_LR' },
    ],
    peq_bands: freqs.map((f, i) => ({
      freq_hz: f,
      gain_db: params.eqGains[i] || 0.0,
      q: 1.414,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Generate Android Head Unit DSP CSV (DUD / Joying / Nakamichi / TS10)
 */
export function generateAndroidDspCsv(params: {
  vehicleName: string;
  delaysMs: { FL: number; FR: number; RL: number; RR: number; SUB: number };
  frontHpf: number;
  rearHpf: number;
  subLpf: number;
  eqGains: number[];
  eqFrequencies?: number[];
}): string {
  const freqs = params.eqFrequencies || [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000];
  const rows = [
    ['# CarAudioAI Android DSP Config', params.vehicleName],
    ['Parameter', 'Channel/Band', 'Value', 'Unit'],
    ['TimeAlignment', 'FL', params.delaysMs.FL, 'ms'],
    ['TimeAlignment', 'FR', params.delaysMs.FR, 'ms'],
    ['TimeAlignment', 'RL', params.delaysMs.RL, 'ms'],
    ['TimeAlignment', 'RR', params.delaysMs.RR, 'ms'],
    ['TimeAlignment', 'SUB', params.delaysMs.SUB, 'ms'],
    ['Crossover_HPF', 'Front', params.frontHpf, 'Hz'],
    ['Crossover_HPF', 'Rear', params.rearHpf, 'Hz'],
    ['Crossover_LPF', 'Subwoofer', params.subLpf, 'Hz'],
  ];

  freqs.forEach((f, i) => {
    rows.push(['EQ_Band', `${f}Hz`, params.eqGains[i] || 0.0, 'dB']);
  });

  return rows.map((r) => r.join(',')).join('\n');
}

/**
 * Generate Professional High-Contrast Installer Blueprint Spec Sheet (HTML / Printable)
 */
export function generateInstallerBlueprintHtml(params: {
  vehicleName: string;
  headUnitName?: string;
  amplifierName?: string;
  speakerFrontName?: string;
  speakerRearName?: string;
  subwooferName?: string;
  delaysMs: { FL: number; FR: number; RL: number; RR: number; SUB: number };
  frontHpf: number;
  rearHpf: number;
  subLpf: number;
  subsonicHz: number;
  gainSetting: { preoutVoltage: number; ampInputV: number; clockAngle: string };
  eqGains: number[];
  eqFrequencies?: number[];
}): string {
  const freqs = params.eqFrequencies || [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000];
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CarAudioAI Installer Blueprint — ${params.vehicleName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background: #090d16; color: #f1f5f9; padding: 32px; font-size: 13px; line-height: 1.5; }
    .page { max-width: 900px; margin: 0 auto; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #38bdf8; padding-bottom: 18px; margin-bottom: 24px; }
    .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; color: #38bdf8; }
    .logo span { color: #f8fafc; font-weight: 300; }
    .subtitle { color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .badge { background: #1e293b; border: 1px solid #475569; padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 11px; color: #38bdf8; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    
    .section-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 18px; }
    .card-title { font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .card-title::before { content: ""; display: inline-block; width: 6px; height: 6px; background: #38bdf8; border-radius: 50%; }
    
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { text-align: left; padding: 8px 6px; color: #94a3b8; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #334155; }
    td { padding: 8px 6px; border-bottom: 1px solid #1e293b; font-family: monospace; }
    tr:last-child td { border-bottom: none; }
    .val-highlight { color: #38bdf8; font-weight: bold; }
    
    .dial-box { display: flex; align-items: center; gap: 16px; background: #0f172a; padding: 12px; border-radius: 6px; border: 1px solid #334155; margin-top: 8px; }
    .dial-circle { width: 50px; height: 50px; border-radius: 50%; border: 3px solid #38bdf8; position: relative; background: #1e293b; }
    .dial-hand { width: 3px; height: 20px; background: #f43f5e; position: absolute; top: 5px; left: 21px; transform-origin: bottom center; transform: rotate(-30deg); border-radius: 2px; }
    
    .eq-bars { display: flex; align-items: flex-end; gap: 6px; height: 90px; background: #0f172a; padding: 12px; border-radius: 6px; border: 1px solid #334155; margin-top: 12px; }
    .eq-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
    .eq-bar { width: 100%; background: #38bdf8; border-radius: 2px 2px 0 0; min-height: 4px; }
    .eq-lbl { font-size: 8px; color: #94a3b8; font-family: monospace; margin-top: 4px; }
    
    .footer { border-top: 1px solid #334155; padding-top: 16px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center; color: #64748b; font-size: 10px; }
    .print-btn { background: #38bdf8; color: #020617; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
    
    @media print {
      body { background: #ffffff; color: #000000; padding: 0; }
      .page { box-shadow: none; border: none; background: #ffffff; color: #000000; padding: 0; }
      .section-card { background: #f8fafc; border: 1px solid #cbd5e1; }
      .dial-box, .eq-bars { background: #f1f5f9; border: 1px solid #cbd5e1; }
      .print-btn { display: none; }
      td, th { color: #0f172a; }
      .val-highlight { color: #0284c7; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">CarAudio<span>AI</span></div>
        <div class="subtitle">Professional Installer Acoustic Calibration Blueprint</div>
      </div>
      <div style="text-align: right;">
        <div class="badge">${params.vehicleName}</div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Date: ${dateStr}</div>
      </div>
    </div>

    <!-- System Hardware Overview -->
    <div class="grid-2">
      <div class="section-card">
        <div class="card-title">1. Hardware Signal Path</div>
        <table>
          <tr><td>Head Unit</td><td class="val-highlight">${params.headUnitName || 'Pre-Out Matched Unit'}</td></tr>
          <tr><td>Amplifier</td><td class="val-highlight">${params.amplifierName || 'Multi-Channel Class-D Amp'}</td></tr>
          <tr><td>Front Speakers</td><td class="val-highlight">${params.speakerFrontName || '6.5" 2-Way Components'}</td></tr>
          <tr><td>Rear Speakers</td><td class="val-highlight">${params.speakerRearName || '6.5" Coaxial Fill'}</td></tr>
          <tr><td>Subwoofer</td><td class="val-highlight">${params.subwooferName || '12" Sealed/Ported Sub'}</td></tr>
        </table>
      </div>

      <div class="section-card">
        <div class="card-title">2. Amplifier Gain Potentiometer Calibration</div>
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
          Match head-unit pre-out to input sensitivity to avoid digital clipping:
        </p>
        <div class="dial-box">
          <div class="dial-circle"><div class="dial-hand"></div></div>
          <div>
            <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">Set Knob to ${params.gainSetting.clockAngle}</div>
            <div style="font-size: 11px; color: #cbd5e1;">Pre-out Voltage: <strong>${params.gainSetting.preoutVoltage}V RMS</strong></div>
            <div style="font-size: 10px; color: #10b981;">✓ 0% THD Distortion Safe Zone</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Time Alignment & Crossovers -->
    <div class="grid-2">
      <div class="section-card">
        <div class="card-title">3. RHD Driver Time Alignment Table</div>
        <table>
          <thead>
            <tr><th>Speaker Channel</th><th>Distance Offset</th><th>Delay (ms)</th><th>Phase</th></tr>
          </thead>
          <tbody>
            <tr><td>Front Left (Driver)</td><td>${+(params.delaysMs.FL * 34.3).toFixed(1)} cm</td><td class="val-highlight">${params.delaysMs.FL} ms</td><td>0° Normal</td></tr>
            <tr><td>Front Right (Passenger)</td><td>${+(params.delaysMs.FR * 34.3).toFixed(1)} cm</td><td class="val-highlight">${params.delaysMs.FR} ms</td><td>0° Normal</td></tr>
            <tr><td>Rear Left</td><td>${+(params.delaysMs.RL * 34.3).toFixed(1)} cm</td><td class="val-highlight">${params.delaysMs.RL} ms</td><td>0° Normal</td></tr>
            <tr><td>Rear Right</td><td>${+(params.delaysMs.RR * 34.3).toFixed(1)} cm</td><td class="val-highlight">${params.delaysMs.RR} ms</td><td>0° Normal</td></tr>
            <tr><td>Subwoofer (Trunk)</td><td>${+(params.delaysMs.SUB * 34.3).toFixed(1)} cm</td><td class="val-highlight">${params.delaysMs.SUB} ms</td><td>0° Normal</td></tr>
          </tbody>
        </table>
      </div>

      <div class="section-card">
        <div class="card-title">4. Crossover & Subsonic Filter Settings</div>
        <table>
          <thead>
            <tr><th>Filter Type</th><th>Frequency</th><th>Slope</th></tr>
          </thead>
          <tbody>
            <tr><td>Front High-Pass (HPF)</td><td class="val-highlight">${params.frontHpf} Hz</td><td>24 dB / Octave Linkwitz-Riley</td></tr>
            <tr><td>Rear High-Pass (HPF)</td><td class="val-highlight">${params.rearHpf} Hz</td><td>24 dB / Octave (-4dB Fill)</td></tr>
            <tr><td>Subwoofer Low-Pass (LPF)</td><td class="val-highlight">${params.subLpf} Hz</td><td>24 dB / Octave Linkwitz-Riley</td></tr>
            <tr><td>Subsonic High-Pass</td><td class="val-highlight">${params.subsonicHz} Hz</td><td>24 dB / Octave Infrasonic Protection</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 14-Band Parametric Equalizer Target Chart -->
    <div class="section-card" style="margin-bottom: 24px;">
      <div class="card-title">5. 14-Band Equalizer Target Curve (Harman In-Car Calibration)</div>
      <div class="eq-bars">
        ${freqs.map((f, i) => {
          const gain = params.eqGains[i] || 0.0;
          const hPercent = Math.max(10, Math.min(95, ((gain + 12) / 24) * 100));
          return `
          <div class="eq-col">
            <div style="font-size: 8px; color: ${gain > 0 ? '#38bdf8' : (gain < 0 ? '#f43f5e' : '#94a3b8')}; font-family: monospace; margin-bottom: 2px;">${gain > 0 ? '+' : ''}${gain}</div>
            <div class="eq-bar" style="height: ${hPercent}%; background: ${gain > 0 ? '#38bdf8' : (gain < 0 ? '#f43f5e' : '#64748b')};"></div>
            <div class="eq-lbl">${f >= 1000 ? (f/1000) + 'k' : f}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="footer">
      <div>Generated by <strong>CarAudioAI Acoustic Engine v2.0</strong> — For Professional Installation Use</div>
      <button class="print-btn" onclick="window.print()">🖨️ Print Blueprint Spec Sheet</button>
    </div>
  </div>
</body>
</html>`;
}
