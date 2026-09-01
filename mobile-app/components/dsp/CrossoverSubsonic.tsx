import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Dimensions,
} from 'react-native';
import Svg, { Path, Line, Text as SvgText, Rect, G } from 'react-native-svg';
import { tokens } from '../../design-system/tokens';
import {
  evaluateSubsonicSafety,
  calculateLr4LowPassDb,
  calculateLr4HighPassDb,
  DEFAULT_CROSSOVER_CONFIG,
} from '../../constants/dspConstants';
import InstrumentPanel from '../ui/InstrumentPanel';
import DialControl from '../ui/DialControl';
import Button from '../ui/Button';
import Readout from '../ui/Readout';

export interface CrossoverSubsonicProps {
  initialFrontHpf?: number;
  initialRearHpf?: number;
  initialSubLpf?: number;
  initialSubsonicHz?: number;
  boxTuningHz?: number;
  enclosureType?: 'ported' | 'sealed';
  onCrossoverChange?: (config: {
    frontHpf: number;
    rearHpf: number;
    subLpf: number;
    subsonicHz: number;
  }) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const CrossoverSubsonic: React.FC<CrossoverSubsonicProps> = ({
  initialFrontHpf = DEFAULT_CROSSOVER_CONFIG.frontHpfHz,
  initialRearHpf = DEFAULT_CROSSOVER_CONFIG.rearHpfHz,
  initialSubLpf = DEFAULT_CROSSOVER_CONFIG.subLpfHz,
  initialSubsonicHz = 28,
  boxTuningHz = 35,
  enclosureType = 'ported',
  onCrossoverChange,
  style,
  testID,
}) => {
  const [frontHpf, setFrontHpf] = useState<number>(initialFrontHpf);
  const [rearHpf, setRearHpf] = useState<number>(initialRearHpf);
  const [subLpf, setSubLpf] = useState<number>(initialSubLpf);
  const [subsonicHz, setSubsonicHz] = useState<number>(initialSubsonicHz);
  const [currentEnclosure, setCurrentEnclosure] = useState<'ported' | 'sealed'>(enclosureType);
  const [currentBoxTuning, setCurrentBoxTuning] = useState<number>(boxTuningHz);
  const [viewWidth, setViewWidth] = useState<number>(() => {
    const screenW = Dimensions.get('window').width;
    return Math.min(860, Math.max(320, screenW - 32));
  });

  // Evaluate subsonic safety
  const subsonicSafety = useMemo(() => {
    return evaluateSubsonicSafety(subsonicHz, currentBoxTuning, currentEnclosure);
  }, [subsonicHz, currentBoxTuning, currentEnclosure]);

  const notifyChange = useCallback(
    (nextConfig: { frontHpf: number; rearHpf: number; subLpf: number; subsonicHz: number }) => {
      if (onCrossoverChange) {
        onCrossoverChange(nextConfig);
      }
    },
    [onCrossoverChange]
  );

  const handleFrontHpfChange = (val: number) => {
    setFrontHpf(val);
    notifyChange({ frontHpf: val, rearHpf, subLpf, subsonicHz });
  };

  const handleRearHpfChange = (val: number) => {
    setRearHpf(val);
    notifyChange({ frontHpf, rearHpf: val, subLpf, subsonicHz });
  };

  const handleSubLpfChange = (val: number) => {
    setSubLpf(val);
    notifyChange({ frontHpf, rearHpf, subLpf: val, subsonicHz });
  };

  const handleSubsonicChange = (val: number) => {
    setSubsonicHz(val);
    notifyChange({ frontHpf, rearHpf, subLpf, subsonicHz: val });
  };

  // SVG Crossover Curve Preview Geometry
  const graphHeight = 120;
  const padding = { top: 16, right: 16, bottom: 20, left: 32 };
  const graphWidth = Math.max(260, viewWidth - padding.left - padding.right);

  const freqMin = 10;
  const freqMax = 1000;
  const gainMin = -24;
  const gainMax = 6;

  const freqToX = (f: number): number => {
    const logMin = Math.log10(freqMin);
    const logMax = Math.log10(freqMax);
    const logF = Math.log10(Math.max(freqMin, Math.min(freqMax, f)));
    const ratio = (logF - logMin) / (logMax - logMin);
    return padding.left + ratio * graphWidth;
  };

  const gainToY = (gDb: number): number => {
    const clampedG = Math.max(gainMin, Math.min(gainMax, gDb));
    const ratio = (clampedG - gainMin) / (gainMax - gainMin);
    return padding.top + (1 - ratio) * (graphHeight - padding.top - padding.bottom);
  };

  // Generate crossover curves
  const { subPath, frontPath, sumPath } = useMemo(() => {
    let sPath = '';
    let fPath = '';
    let sumP = '';
    const points = 100;
    const logMin = Math.log10(freqMin);
    const logMax = Math.log10(freqMax);

    for (let i = 0; i <= points; i++) {
      const logF = logMin + (i / points) * (logMax - logMin);
      const freq = Math.pow(10, logF);
      const x = freqToX(freq);

      // Subwoofer bandpass (Subsonic HPF 24dB + Sub LPF 24dB)
      const subLpfDb = calculateLr4LowPassDb(freq, subLpf);
      const subsonicDb = calculateLr4HighPassDb(freq, subsonicHz);
      const subCompositeDb = Math.max(gainMin, subLpfDb + subsonicDb);
      const subY = gainToY(subCompositeDb);

      // Front HPF 24dB
      const frontHpfDb = Math.max(gainMin, calculateLr4HighPassDb(freq, frontHpf));
      const frontY = gainToY(frontHpfDb);

      // Linear acoustic sum in voltage
      const subMag = Math.pow(10, subCompositeDb / 20);
      const frontMag = Math.pow(10, frontHpfDb / 20);
      const totalDb = 20 * Math.log10(Math.max(1e-4, subMag + frontMag));
      const sumY = gainToY(totalDb);

      if (i === 0) {
        sPath += `M ${x.toFixed(1)} ${subY.toFixed(1)}`;
        fPath += `M ${x.toFixed(1)} ${frontY.toFixed(1)}`;
        sumP += `M ${x.toFixed(1)} ${sumY.toFixed(1)}`;
      } else {
        sPath += ` L ${x.toFixed(1)} ${subY.toFixed(1)}`;
        fPath += ` L ${x.toFixed(1)} ${frontY.toFixed(1)}`;
        sumP += ` L ${x.toFixed(1)} ${sumY.toFixed(1)}`;
      }
    }

    return { subPath: sPath, frontPath: fPath, sumPath: sumP };
  }, [subLpf, subsonicHz, frontHpf, graphWidth]);

  return (
    <InstrumentPanel
      testID={testID}
      title="Active Crossover & Subsonic Console"
      subtitle="Linkwitz-Riley 24dB/oct (LR4) Active Slope Routing & Infrasonic Safety"
      badge={subsonicSafety.statusBadge === 'danger' ? 'CONE UNLOADING ALERT' : subsonicSafety.statusBadge === 'warning' ? 'SUBSONIC WARNING' : 'LR4 PHASE ALIGNED'}
      status={subsonicSafety.statusBadge}
      style={style}
    >
      {/* Subsonic Excursion Safety Guardrail Alert Banner */}
      {subsonicSafety.alertMessage && (
        <View
          style={[
            styles.alertBanner,
            subsonicSafety.isCriticalDanger ? styles.alertDanger : styles.alertWarning,
          ]}
        >
          <View
            style={[
              styles.alertDot,
              { backgroundColor: subsonicSafety.isCriticalDanger ? tokens.colors.status.danger : tokens.colors.status.warning },
            ]}
          />
          <Text
            style={[
              styles.alertText,
              { color: subsonicSafety.isCriticalDanger ? tokens.colors.status.danger : tokens.colors.status.warning },
            ]}
          >
            {subsonicSafety.alertMessage}
          </Text>
        </View>
      )}

      {/* Crossover Frequency Response Graphic Sketch */}
      <View
        style={styles.curveContainer}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 100) setViewWidth(w);
        }}
      >
        <Svg width={viewWidth} height={graphHeight} style={styles.svg}>
          <Rect
            x={padding.left}
            y={padding.top}
            width={graphWidth}
            height={graphHeight - padding.top - padding.bottom}
            fill={tokens.colors.bg.inset}
            stroke={tokens.colors.border.hairline}
            strokeWidth={1}
          />

          {/* -6.02 dB Crossover Alignment Guideline */}
          <Line
            x1={padding.left}
            y1={gainToY(-6.02)}
            x2={padding.left + graphWidth}
            y2={gainToY(-6.02)}
            stroke={tokens.colors.border.hairline}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <SvgText
            x={padding.left - 4}
            y={gainToY(-6.02) + 3}
            fill={tokens.colors.text.muted}
            fontSize="8"
            fontFamily={tokens.typography.fontFamily.mono}
            textAnchor="end"
          >
            -6dB
          </SvgText>

          {/* 0dB Flat Reference */}
          <Line
            x1={padding.left}
            y1={gainToY(0)}
            x2={padding.left + graphWidth}
            y2={gainToY(0)}
            stroke={tokens.colors.border.subtle}
            strokeWidth={1}
          />
          <SvgText
            x={padding.left - 4}
            y={gainToY(0) + 3}
            fill={tokens.colors.text.muted}
            fontSize="8"
            fontFamily={tokens.typography.fontFamily.mono}
            textAnchor="end"
          >
            0dB
          </SvgText>

          {/* Subwoofer Response (Cyan #22D3EE) */}
          <Path
            d={subPath}
            stroke={tokens.colors.signal.primary}
            strokeWidth={2}
            fill="none"
          />

          {/* Front HPF Response (Purple #A78BFA) */}
          <Path
            d={frontPath}
            stroke={tokens.colors.signal.secondary}
            strokeWidth={2}
            fill="none"
          />

          {/* Flat Summation Acoustic Result (Dotted White) */}
          <Path
            d={sumPath}
            stroke={tokens.colors.text.primary}
            strokeWidth={1}
            strokeDasharray="2 2"
            fill="none"
            opacity={0.6}
          />

          {/* Frequency labels */}
          <SvgText
            x={freqToX(20)}
            y={graphHeight - 4}
            fill={tokens.colors.text.muted}
            fontSize="8"
            fontFamily={tokens.typography.fontFamily.mono}
            textAnchor="middle"
          >
            20Hz
          </SvgText>
          <SvgText
            x={freqToX(80)}
            y={graphHeight - 4}
            fill={tokens.colors.text.secondary}
            fontSize="8"
            fontFamily={tokens.typography.fontFamily.mono}
            textAnchor="middle"
          >
            80Hz (fc)
          </SvgText>
          <SvgText
            x={freqToX(250)}
            y={graphHeight - 4}
            fill={tokens.colors.text.muted}
            fontSize="8"
            fontFamily={tokens.typography.fontFamily.mono}
            textAnchor="middle"
          >
            250Hz
          </SvgText>
          <SvgText
            x={freqToX(1000)}
            y={graphHeight - 4}
            fill={tokens.colors.text.muted}
            fontSize="8"
            fontFamily={tokens.typography.fontFamily.mono}
            textAnchor="end"
          >
            1kHz
          </SvgText>
        </Svg>
      </View>

      {/* Rotary Potentiometer Dials Console */}
      <View style={styles.dialsGrid}>
        {/* Subwoofer LPF Dial */}
        <DialControl
          label="Sub LPF"
          value={subLpf}
          min={40}
          max={200}
          step={5}
          unit="Hz"
          precision={0}
          onChange={handleSubLpfChange}
        />

        {/* Subsonic Infrasonic High-Pass Dial */}
        <DialControl
          label="Subsonic HPF"
          value={subsonicHz}
          min={15}
          max={50}
          step={1}
          unit="Hz"
          precision={0}
          warningBelow={subsonicSafety.recommendedCutoffHz - 1}
          dangerAbove={undefined}
          onChange={handleSubsonicChange}
        />

        {/* Front Component HPF Dial */}
        <DialControl
          label="Front HPF"
          value={frontHpf}
          min={40}
          max={250}
          step={5}
          unit="Hz"
          precision={0}
          onChange={handleFrontHpfChange}
        />

        {/* Rear Fill HPF Dial */}
        <DialControl
          label="Rear HPF"
          value={rearHpf}
          min={40}
          max={250}
          step={5}
          unit="Hz"
          precision={0}
          onChange={handleRearHpfChange}
        />
      </View>

      {/* Subwoofer Enclosure Spec & Telemetry Bar */}
      <View style={styles.enclosureBar}>
        <View style={styles.enclosureItem}>
          <Text style={styles.enclosureLabel}>ENCLOSURE</Text>
          <View style={styles.enclosureBtnGroup}>
            <Button
              label="Ported (Vented)"
              size="sm"
              variant={currentEnclosure === 'ported' ? 'solid' : 'outline'}
              onPress={() => setCurrentEnclosure('ported')}
            />
            <Button
              label="Sealed"
              size="sm"
              variant={currentEnclosure === 'sealed' ? 'solid' : 'outline'}
              onPress={() => setCurrentEnclosure('sealed')}
            />
          </View>
        </View>

        {currentEnclosure === 'ported' && (
          <View style={styles.enclosureItem}>
            <Text style={styles.enclosureLabel}>PORT TUNING (Fb)</Text>
            <View style={styles.tuningStepper}>
              <Button
                label="-"
                size="sm"
                variant="outline"
                style={styles.tuneStepBtn}
                onPress={() => setCurrentBoxTuning(Math.max(28, currentBoxTuning - 1))}
              />
              <Text style={styles.tuningValText}>{currentBoxTuning} Hz</Text>
              <Button
                label="+"
                size="sm"
                variant="outline"
                style={styles.tuneStepBtn}
                onPress={() => setCurrentBoxTuning(Math.min(45, currentBoxTuning + 1))}
              />
            </View>
          </View>
        )}

        <View style={styles.enclosureItem}>
          <Text style={styles.enclosureLabel}>SAFE SUBSONIC FLOOR</Text>
          <Readout
            value={subsonicSafety.recommendedCutoffHz}
            unit="Hz"
            size="sm"
            status="ok"
            framed={false}
          />
        </View>
      </View>
    </InstrumentPanel>
  );
};

const styles = StyleSheet.create({
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  alertWarning: {
    backgroundColor: tokens.colors.status.warningBg,
    borderColor: tokens.colors.status.warningBorder,
  },
  alertDanger: {
    backgroundColor: tokens.colors.status.dangerBg,
    borderColor: tokens.colors.status.dangerBorder,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: tokens.radius.full,
  },
  alertText: {
    flex: 1,
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.medium,
    lineHeight: 16,
  },
  curveContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.hairline,
    marginBottom: tokens.spacing.md,
  },
  svg: {
    overflow: 'visible',
  },
  dialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  enclosureBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    padding: tokens.spacing.sm,
    marginTop: tokens.spacing.sm,
    gap: tokens.spacing.sm,
  },
  enclosureItem: {
    flexDirection: 'column',
    gap: 4,
  },
  enclosureLabel: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: 9,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  enclosureBtnGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  tuningStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tuneStepBtn: {
    width: 28,
    height: 28,
    paddingHorizontal: 0,
  },
  tuningValText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs + 1,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
  },
});

export default CrossoverSubsonic;
