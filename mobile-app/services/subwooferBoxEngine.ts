/**
 * CarAudioAI - Subwoofer Enclosure Modeling & Port Length Engine
 * Implements Thiele-Small electro-acoustic parameters for Sealed, Vented (Ported), and Underseat enclosures.
 */

export interface ThieleSmallParams {
  fsHz: number;      // Free air resonant frequency (Hz)
  qts: number;       // Total Q-factor
  vasLiters: number; // Volume of acoustic compliance (Liters)
  xmaxMm: number;    // One-way linear excursion (mm)
  rmsWatts: number;  // Rated RMS power (Watts)
  sdCm2?: number;    // Effective piston area (cm^2)
}

export interface BoxCalculationInput {
  subwooferSizeInches: number;
  boxType: "sealed" | "ported" | "underseat";
  tsParams?: ThieleSmallParams;
  targetQtc?: number;         // For sealed (default 0.707 Butterworth)
  targetFbHz?: number;        // For ported tuning Hz (default 33-38 Hz)
  portType?: "round" | "slot";
  portDiameterInches?: number;// For round port (e.g. 3", 4")
  slotHeightInches?: number;  // For slot port (e.g. 12")
  slotWidthInches?: number;   // For slot port (e.g. 2")
  woodThicknessInches?: number;// e.g. 0.75" (18mm MDF / Birch)
}

export interface BoxCalculationResult {
  boxType: "sealed" | "ported" | "underseat";
  netVolumeCuFt: number;
  netVolumeLiters: number;
  grossVolumeCuFt: number;
  cutoffF3Hz: number;
  systemResonanceFcHz?: number;
  systemQtc?: number;
  tuningFbHz?: number;
  portSpecs?: {
    type: "round" | "slot";
    lengthInches: number;
    lengthCm: number;
    areaSqInches: number;
    portAirVelocityMs: number;
    isChuffingRisk: boolean; // True if port velocity > 17 m/s
    portDisplacementCuFt: number;
  };
  recommendedDimensions: {
    heightInches: number;
    widthInches: number;
    depthInches: number;
    heightCm: number;
    widthCm: number;
    depthCm: number;
  };
  cutSheetMdf: {
    frontBack: string;
    topBottom: string;
    sides: string;
    portWalls?: string;
  };
  acousticNotes: string[];
}

export const litersToCuFt = (l: number): number => l / 28.3168;
export const cuFtToLiters = (cuFt: number): number => cuFt * 28.3168;

export const TYPICAL_TS_BY_SIZE: Record<number, ThieleSmallParams> = {
  8: { fsHz: 38, qts: 0.44, vasLiters: 18, xmaxMm: 9.0, rmsWatts: 250, sdCm2: 215 },
  10: { fsHz: 32, qts: 0.42, vasLiters: 35, xmaxMm: 12.0, rmsWatts: 400, sdCm2: 350 },
  12: { fsHz: 28, qts: 0.38, vasLiters: 65, xmaxMm: 14.5, rmsWatts: 600, sdCm2: 510 },
  15: { fsHz: 24, qts: 0.36, vasLiters: 130, xmaxMm: 16.0, rmsWatts: 800, sdCm2: 830 },
};

export function calculateSubwooferEnclosure(input: BoxCalculationInput): BoxCalculationResult {
  const ts = input.tsParams || TYPICAL_TS_BY_SIZE[input.subwooferSizeInches] || TYPICAL_TS_BY_SIZE[12];
  const woodThick = input.woodThicknessInches || 0.75;
  const driverDisplacementCuFt = input.subwooferSizeInches >= 12 ? 0.10 : 0.06;

  if (input.boxType === "sealed" || input.boxType === "underseat") {
    const qtc = input.targetQtc || (input.boxType === "underseat" ? 0.85 : 0.707);
    const qts = ts.qts;
    const vasL = ts.vasLiters;

    const ratio = qtc / qts;
    const ratioSqMinus1 = Math.max(0.1, Math.pow(ratio, 2) - 1);
    const vbLiters = vasL / ratioSqMinus1;
    const netVolCuFt = Math.max(0.3, +litersToCuFt(vbLiters).toFixed(2));
    const netVolLiters = +cuFtToLiters(netVolCuFt).toFixed(1);

    const fc = +(ts.fsHz * ratio).toFixed(1);
    const term = (1 / (qtc * qtc)) - 2;
    const f3 = +(fc * Math.sqrt((term + Math.sqrt(term * term + 4)) / 2)).toFixed(1);
    const grossVolCuFt = +(netVolCuFt + driverDisplacementCuFt).toFixed(2);

    const intVolCuIn = netVolCuFt * 1728;
    const internalDepth = Math.pow(intVolCuIn / (1.25 * 1.5), 1 / 3);
    const internalHeight = internalDepth * 1.25;
    const internalWidth = internalDepth * 1.5;

    const extHeight = +(internalHeight + woodThick * 2).toFixed(1);
    const extWidth = +(internalWidth + woodThick * 2).toFixed(1);
    const extDepth = +(internalDepth + woodThick * 2).toFixed(1);

    return {
      boxType: input.boxType,
      netVolumeCuFt: netVolCuFt,
      netVolumeLiters: netVolLiters,
      grossVolumeCuFt: grossVolCuFt,
      cutoffF3Hz: f3,
      systemResonanceFcHz: fc,
      systemQtc: qtc,
      recommendedDimensions: {
        heightInches: extHeight,
        widthInches: extWidth,
        depthInches: extDepth,
        heightCm: +(extHeight * 2.54).toFixed(1),
        widthCm: +(extWidth * 2.54).toFixed(1),
        depthCm: +(extDepth * 2.54).toFixed(1),
      },
      cutSheetMdf: {
        frontBack: `2x (${extWidth}" x ${extHeight}" Front Baffle & Rear)`,
        topBottom: `2x (${extWidth}" x ${(extDepth - woodThick * 2).toFixed(1)}" Top & Bottom)`,
        sides: `2x (${(extHeight - woodThick * 2).toFixed(1)}" x ${(extDepth - woodThick * 2).toFixed(1)}" Left & Right Sides)`,
      },
      acousticNotes: [
        "Optimal Qtc = " + qtc + " Butterworth alignment delivers transient tightness, zero port lag, and flat phase response.",
        "Low-frequency -3dB roll-off begins at " + f3 + " Hz; in-cabin transfer function (cabin gain) will boost sub-45Hz by +6 to +9 dB.",
        "Line 50% of interior walls with 1-inch Polyfill / Dacron acoustic batting to absorb rear-wave reflections.",
      ],
    };
  }

  const fb = input.targetFbHz || (input.subwooferSizeInches >= 12 ? 34 : 38);
  const qts = ts.qts;
  const vasCuFt = litersToCuFt(ts.vasLiters);

  let netVolCuFt = 15 * vasCuFt * Math.pow(qts, 2.87);
  if (isNaN(netVolCuFt) || netVolCuFt < 0.8) netVolCuFt = input.subwooferSizeInches >= 12 ? 1.75 : 1.25;
  netVolCuFt = Math.max(0.9, Math.min(3.5, +netVolCuFt.toFixed(2)));
  const netVolLiters = +cuFtToLiters(netVolCuFt).toFixed(1);

  const f3 = +(ts.fsHz * Math.pow(vasCuFt / netVolCuFt, 0.32)).toFixed(1);

  let portAreaSqIn = 0;
  let portLengthInches = 0;
  let portType: "round" | "slot" = input.portType || "slot";
  let portDisplacementCuFt = 0;

  if (portType === "round") {
    const portDiam = input.portDiameterInches || (input.subwooferSizeInches >= 12 ? 4.0 : 3.0);
    portAreaSqIn = +(Math.PI * Math.pow(portDiam / 2, 2)).toFixed(2);
    const vbCuIn = netVolCuFt * 1728;
    const r = portDiam / 2;
    const lv = (1.463e7 * Math.pow(r, 2)) / (Math.pow(fb, 2) * vbCuIn) - (1.463 * r);
    portLengthInches = Math.max(4.0, +lv.toFixed(1));
    portDisplacementCuFt = +((portAreaSqIn * portLengthInches) / 1728).toFixed(3);
  } else {
    const targetSlotArea = +(netVolCuFt * 14.0).toFixed(1);
    portAreaSqIn = targetSlotArea;
    const slotH = input.slotHeightInches || (input.subwooferSizeInches >= 12 ? 13.0 : 11.0);
    const vbCuIn = netVolCuFt * 1728;
    const lv = (1.463e7 * portAreaSqIn) / (Math.PI * Math.pow(fb, 2) * vbCuIn) - (0.823 * Math.sqrt(portAreaSqIn));
    portLengthInches = Math.max(6.0, +lv.toFixed(1));
    portDisplacementCuFt = +(((portAreaSqIn + slotH * woodThick) * portLengthInches) / 1728).toFixed(3);
  }

  const portAreaCm2 = portAreaSqIn * 6.4516;
  const portAirVelocityMs = +(
    (0.85 * Math.sqrt(ts.rmsWatts) * (ts.xmaxMm || 12)) / (portAreaCm2 * 0.01) * 0.08
  ).toFixed(1);
  const isChuffingRisk = portAirVelocityMs > 17.0;

  const grossVolCuFt = +(netVolCuFt + driverDisplacementCuFt + portDisplacementCuFt + 0.05).toFixed(2);

  const intVolCuIn = grossVolCuFt * 1728;
  const internalH = input.subwooferSizeInches >= 12 ? 14.0 : 12.0;
  const internalD = 14.5;
  const internalW = +(intVolCuIn / (internalH * internalD)).toFixed(1);

  const extH = +(internalH + woodThick * 2).toFixed(1);
  const extW = +(internalW + woodThick * 2).toFixed(1);
  const extD = +(internalD + woodThick * 2).toFixed(1);

  return {
    boxType: "ported",
    netVolumeCuFt: netVolCuFt,
    netVolumeLiters: netVolLiters,
    grossVolumeCuFt: grossVolCuFt,
    cutoffF3Hz: f3,
    tuningFbHz: fb,
    portSpecs: {
      type: portType,
      lengthInches: portLengthInches,
      lengthCm: +(portLengthInches * 2.54).toFixed(1),
      areaSqInches: portAreaSqIn,
      portAirVelocityMs: portAirVelocityMs,
      isChuffingRisk: isChuffingRisk,
      portDisplacementCuFt: portDisplacementCuFt,
    },
    recommendedDimensions: {
      heightInches: extH,
      widthInches: extW,
      depthInches: extD,
      heightCm: +(extH * 2.54).toFixed(1),
      widthCm: +(extW * 2.54).toFixed(1),
      depthCm: +(extD * 2.54).toFixed(1),
    },
    cutSheetMdf: {
      frontBack: `2x (${extW}" x ${extH}" Front & Rear Baffles)`,
      topBottom: `2x (${extW}" x ${(extD - woodThick * 2).toFixed(1)}" Top & Bottom)`,
      sides: `2x (${(extH - woodThick * 2).toFixed(1)}" x ${(extD - woodThick * 2).toFixed(1)}" Left & Right Sides)`,
      portWalls: portType === "slot" ? `1x Port L-Divider (${(extH - woodThick * 2).toFixed(1)}" x ${portLengthInches}")` : undefined,
    },
    acousticNotes: [
      "Port tuned at " + fb + " Hz provides high SPL bass output (+4.5 dB gain around tuning).",
      "Set Subsonic HPF filter in DSP to " + Math.max(20, fb - 5) + " Hz (24dB/oct Linkwitz-Riley) to prevent mechanical cone unloading below tuning.",
      isChuffingRisk
        ? "⚠️ Port air velocity is high (" + portAirVelocityMs + " m/s). Use flared port ends or increase port cross-sectional area to prevent chuffing."
        : "✓ Port air velocity is optimal (" + portAirVelocityMs + " m/s < 17 m/s limit); smooth and noiseless bass airflow.",
    ],
  };
}
