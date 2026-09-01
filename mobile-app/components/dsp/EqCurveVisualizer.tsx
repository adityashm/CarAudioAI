import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Platform,
  Dimensions,
  StyleProp,
  ViewStyle,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, G, Rect } from 'react-native-svg';
import { tokens } from '../../design-system/tokens';
import {
  ISO_14_BAND_FREQUENCIES,
  EQ_GAIN_MIN_DB,
  EQ_GAIN_MAX_DB,
  EQ_GAIN_STEP_DB,
  EQ_PRESETS,
  calculateCompositeEqResponseDb,
  calculateCompositePhaseDeg,
} from '../../constants/dspConstants';
import { webAudioEngine } from '../../services/webAudioEngine';
import InstrumentPanel from '../ui/InstrumentPanel';
import Button from '../ui/Button';

export interface EqCurveVisualizerProps {
  initialGains?: number[];
  onGainsChange?: (gains: number[]) => void;
  style?: StyleProp<ViewStyle>;
  height?: number;
  showFaderBank?: boolean;
  testID?: string;
}

const FREQ_MIN = 20;
const FREQ_MAX = 20000;
const GAIN_DISPLAY_MAX = 15; // Display bounds +/- 15 dB

export const EqCurveVisualizer: React.FC<EqCurveVisualizerProps> = ({
  initialGains,
  onGainsChange,
  style,
  height = 240,
  showFaderBank = true,
  testID,
}) => {
  const [gains, setGains] = useState<number[]>(() => {
    if (initialGains && initialGains.length === ISO_14_BAND_FREQUENCIES.length) {
      return [...initialGains];
    }
    return [...EQ_PRESETS.harman_reference.gains];
  });

  const [activePreset, setActivePreset] = useState<string>('harman_reference');
  const [selectedBandIndex, setSelectedBandIndex] = useState<number | null>(null);
  const [viewWidth, setViewWidth] = useState<number>(() => {
    const screenW = Dimensions.get('window').width;
    return Math.min(860, Math.max(320, screenW - 32));
  });

  const [showPhase, setShowPhase] = useState<boolean>(true);
  const [isFaderViewOpen, setIsFaderViewOpen] = useState<boolean>(false);

  // Sync to Web Audio engine on gains update
  const updateBandGain = useCallback((index: number, newGain: number) => {
    const clamped = Math.max(EQ_GAIN_MIN_DB, Math.min(EQ_GAIN_MAX_DB, Number(newGain.toFixed(1))));
    setGains((prev) => {
      const next = [...prev];
      next[index] = clamped;
      if (onGainsChange) onGainsChange(next);
      return next;
    });
    webAudioEngine.setBandGain(index, clamped);
    setActivePreset('custom');
  }, [onGainsChange]);

  const applyPreset = useCallback((presetKey: string) => {
    const preset = EQ_PRESETS[presetKey];
    if (!preset) return;
    const newGains = [...preset.gains];
    setGains(newGains);
    setActivePreset(presetKey);
    webAudioEngine.setAllGains(newGains);
    if (onGainsChange) onGainsChange(newGains);
  }, [onGainsChange]);

  // Dimensions & Padding for SVG Canvas
  const padding = { top: 20, right: 24, bottom: 28, left: 36 };
  const graphWidth = Math.max(280, viewWidth - padding.left - padding.right);
  const graphHeight = Math.max(120, height - padding.top - padding.bottom);

  // Coordinate Conversion Helpers
  const freqToX = useCallback((freq: number): number => {
    const logMin = Math.log10(FREQ_MIN);
    const logMax = Math.log10(FREQ_MAX);
    const logF = Math.log10(Math.max(FREQ_MIN, Math.min(FREQ_MAX, freq)));
    const ratio = (logF - logMin) / (logMax - logMin);
    return padding.left + ratio * graphWidth;
  }, [graphWidth, padding.left]);

  const gainToY = useCallback((gainDb: number): number => {
    const normalized = (gainDb - -GAIN_DISPLAY_MAX) / (GAIN_DISPLAY_MAX - -GAIN_DISPLAY_MAX);
    return padding.top + (1 - normalized) * graphHeight;
  }, [graphHeight, padding.top]);

  const yToGain = useCallback((yPx: number): number => {
    const relY = yPx - padding.top;
    const ratio = 1 - (relY / graphHeight);
    const rawGain = -GAIN_DISPLAY_MAX + ratio * (2 * GAIN_DISPLAY_MAX);
    const rounded = Math.round(rawGain / EQ_GAIN_STEP_DB) * EQ_GAIN_STEP_DB;
    return Math.max(EQ_GAIN_MIN_DB, Math.min(EQ_GAIN_MAX_DB, Number(rounded.toFixed(1))));
  }, [graphHeight, padding.top]);

  // Generate continuous spline path for composite EQ curve
  const { eqPathD, phasePathD } = useMemo(() => {
    const numPoints = 120;
    const logMin = Math.log10(FREQ_MIN);
    const logMax = Math.log10(FREQ_MAX);

    let eqD = '';
    let phaseD = '';

    for (let i = 0; i <= numPoints; i++) {
      const logF = logMin + (i / numPoints) * (logMax - logMin);
      const freq = Math.pow(10, logF);
      const x = freqToX(freq);

      // 1. Primary Magnitude Curve (Cyan)
      const gainAtF = calculateCompositeEqResponseDb(freq, gains);
      const yEq = gainToY(gainAtF);
      if (i === 0) {
        eqD += `M ${x.toFixed(1)} ${yEq.toFixed(1)}`;
      } else {
        eqD += ` L ${x.toFixed(1)} ${yEq.toFixed(1)}`;
      }

      // 2. Secondary Phase Curve (Purple) - Scaled to map +/- 90 deg into +/- 12 dB space
      if (showPhase) {
        const phaseDeg = calculateCompositePhaseDeg(freq, gains);
        const yPhase = gainToY((phaseDeg / 90) * 8); // Scale phase to visual range
        if (i === 0) {
          phaseD += `M ${x.toFixed(1)} ${yPhase.toFixed(1)}`;
        } else {
          phaseD += ` L ${x.toFixed(1)} ${yPhase.toFixed(1)}`;
        }
      }
    }

    return { eqPathD: eqD, phasePathD: phaseD };
  }, [gains, showPhase, freqToX, gainToY]);

  // Interactive Node Dragging PanResponder
  const activeDragBandRef = useRef<number | null>(null);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const locX = evt.nativeEvent.locationX;
          const locY = evt.nativeEvent.locationY;

          // Find nearest frequency band to touch point
          let closestIndex = 0;
          let minDistance = 9999;

          ISO_14_BAND_FREQUENCIES.forEach((freq, idx) => {
            const nodeX = freqToX(freq);
            const nodeY = gainToY(gains[idx]);
            const dist = Math.hypot(locX - nodeX, locY - nodeY);
            if (dist < minDistance) {
              minDistance = dist;
              closestIndex = idx;
            }
          });

          if (minDistance < 48) {
            activeDragBandRef.current = closestIndex;
            setSelectedBandIndex(closestIndex);
            const newGain = yToGain(locY);
            updateBandGain(closestIndex, newGain);
          }
        },
        onPanResponderMove: (evt) => {
          if (activeDragBandRef.current !== null) {
            const locY = evt.nativeEvent.locationY;
            const newGain = yToGain(locY);
            updateBandGain(activeDragBandRef.current, newGain);
          }
        },
        onPanResponderRelease: () => {
          activeDragBandRef.current = null;
        },
        onPanResponderTerminate: () => {
          activeDragBandRef.current = null;
        },
      }),
    [gains, freqToX, gainToY, yToGain, updateBandGain]
  );

  // Grid tick frequencies
  const gridFrequencies = [20, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000];
  const gridGains = [12, 6, 0, -6, -12];

  const formatFreqLabel = (f: number): string => {
    return f >= 1000 ? `${f / 1000}k` : `${f}`;
  };

  const selectedGain = selectedBandIndex !== null ? gains[selectedBandIndex] : null;
  const selectedFreq = selectedBandIndex !== null ? ISO_14_BAND_FREQUENCIES[selectedBandIndex] : null;

  return (
    <InstrumentPanel
      testID={testID}
      title="14-Band Parametric Equalizer"
      subtitle="Continuous Bezier Spline & Multi-Node Hardware DSP Control"
      badge={activePreset.toUpperCase().replace(/_/g, ' ')}
      status="ok"
      style={style}
      action={
        <View style={styles.headerActions}>
          <Button
            label={showPhase ? 'Phase [ON]' : 'Phase [OFF]'}
            size="sm"
            variant="outline"
            onPress={() => setShowPhase(!showPhase)}
          />
          <Button
            label={isFaderViewOpen ? 'Graph Only' : 'Fader Bank'}
            size="sm"
            variant="outline"
            onPress={() => setIsFaderViewOpen(!isFaderViewOpen)}
          />
        </View>
      }
    >
      {/* Preset Action Strip */}
      <View style={styles.presetBar}>
        <Button
          label="Harman Target"
          size="sm"
          variant={activePreset === 'harman_reference' ? 'solid' : 'outline'}
          onPress={() => applyPreset('harman_reference')}
        />
        <Button
          label="Punjabi Bass SQL"
          size="sm"
          variant={activePreset === 'sql_punjabi_hiphop' ? 'solid' : 'outline'}
          onPress={() => applyPreset('sql_punjabi_hiphop')}
        />
        <Button
          label="Vocal Clarity"
          size="sm"
          variant={activePreset === 'vocal_clarity' ? 'solid' : 'outline'}
          onPress={() => applyPreset('vocal_clarity')}
        />
        <Button
          label="Flat (0dB)"
          size="sm"
          variant={activePreset === 'flat' ? 'solid' : 'outline'}
          onPress={() => applyPreset('flat')}
        />
      </View>

      {/* Selected Band Telemetry Readout */}
      <View style={styles.telemetryBar}>
        <View style={styles.telemetryItem}>
          <Text style={styles.telemetryLabel}>SELECTED BAND</Text>
          <Text style={styles.telemetryValue}>
            {selectedFreq ? `${formatFreqLabel(selectedFreq)}Hz` : 'None (Tap Node)'}
          </Text>
        </View>
        <View style={styles.telemetryItem}>
          <Text style={styles.telemetryLabel}>GAIN OFFSET</Text>
          <Text style={[styles.telemetryValue, styles.gainHighlight]}>
            {selectedGain !== null ? `${selectedGain > 0 ? '+' : ''}${selectedGain.toFixed(1)} dB` : '-- dB'}
          </Text>
        </View>
        <View style={styles.telemetryItem}>
          <Text style={styles.telemetryLabel}>FILTER Q</Text>
          <Text style={styles.telemetryValue}>1.414 (1-Oct)</Text>
        </View>
        <View style={styles.telemetryItem}>
          <Text style={styles.telemetryLabel}>TRACE COLOR</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: tokens.colors.signal.primary }]} />
            <Text style={styles.legendText}>EQ Magnitude</Text>
            {showPhase && (
              <>
                <View style={[styles.legendDot, { backgroundColor: tokens.colors.signal.secondary, marginLeft: 6 }]} />
                <Text style={styles.legendText}>Phase Shift</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Main SVG Curve Surface */}
      <View
        style={styles.canvasContainer}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 100) setViewWidth(w);
        }}
        {...panResponder.panHandlers}
      >
        <Svg width={viewWidth} height={height} style={styles.svg}>
          {/* Background Inset Screen */}
          <Rect
            x={padding.left}
            y={padding.top}
            width={graphWidth}
            height={graphHeight}
            fill={tokens.colors.bg.inset}
            stroke={tokens.colors.border.hairline}
            strokeWidth={1}
          />

          {/* Grid Lines: Gain Horizontals */}
          {gridGains.map((g) => {
            const y = gainToY(g);
            return (
              <G key={`g-${g}`}>
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke={g === 0 ? tokens.colors.border.active : tokens.colors.border.hairline}
                  strokeWidth={g === 0 ? 1.5 : 0.8}
                  strokeDasharray={g === 0 ? undefined : '3 3'}
                />
                <SvgText
                  x={padding.left - 6}
                  y={y + 3}
                  fill={tokens.colors.text.muted}
                  fontSize="9"
                  fontFamily={tokens.typography.fontFamily.mono}
                  textAnchor="end"
                >
                  {g > 0 ? `+${g}` : `${g}`}
                </SvgText>
              </G>
            );
          })}

          {/* Grid Lines: Frequency Verticals */}
          {gridFrequencies.map((f) => {
            const x = freqToX(f);
            return (
              <G key={`f-${f}`}>
                <Line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + graphHeight}
                  stroke={tokens.colors.border.hairline}
                  strokeWidth={0.8}
                  strokeDasharray="2 4"
                />
                <SvgText
                  x={x}
                  y={padding.top + graphHeight + 14}
                  fill={tokens.colors.text.muted}
                  fontSize="8"
                  fontFamily={tokens.typography.fontFamily.mono}
                  textAnchor="middle"
                >
                  {formatFreqLabel(f)}
                </SvgText>
              </G>
            );
          })}

          {/* Secondary Phase Response Curve (Purple #A78BFA) */}
          {showPhase && phasePathD ? (
            <Path
              d={phasePathD}
              stroke={tokens.colors.signal.secondary}
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="4 2"
              opacity={0.7}
            />
          ) : null}

          {/* Primary EQ Spline Response Curve (Cyan #22D3EE) */}
          {eqPathD ? (
            <Path
              d={eqPathD}
              stroke={tokens.colors.signal.primary}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {/* 14 Interactive Draggable Node Handles */}
          {ISO_14_BAND_FREQUENCIES.map((freq, idx) => {
            const x = freqToX(freq);
            const y = gainToY(gains[idx]);
            const isSelected = selectedBandIndex === idx;

            return (
              <G key={`node-${idx}`}>
                {/* Node Vertical Stem Line to 0dB Baseline */}
                <Line
                  x1={x}
                  y1={gainToY(0)}
                  x2={x}
                  y2={y}
                  stroke={tokens.colors.signal.primaryDim}
                  strokeWidth={1}
                  strokeDasharray="1 2"
                  opacity={0.6}
                />

                {/* Outer Selection Aura */}
                {isSelected && (
                  <Circle
                    cx={x}
                    cy={y}
                    r={9}
                    fill={tokens.colors.signal.primaryGlow}
                    stroke={tokens.colors.signal.primary}
                    strokeWidth={1}
                  />
                )}

                {/* Main Node Point */}
                <Circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 5.5 : 4}
                  fill={tokens.colors.bg.base}
                  stroke={isSelected ? tokens.colors.text.primary : tokens.colors.signal.primary}
                  strokeWidth={2}
                />
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Optional Interactive 14-Band Fader Bank */}
      {(showFaderBank && isFaderViewOpen) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.faderBankContainer}
          contentContainerStyle={styles.faderBankContent}
        >
          {ISO_14_BAND_FREQUENCIES.map((freq, idx) => {
            const gain = gains[idx];
            const isSelected = selectedBandIndex === idx;
            return (
              <View
                key={`fader-${idx}`}
                style={[
                  styles.miniFaderColumn,
                  isSelected && styles.miniFaderColumnSelected,
                ]}
              >
                <Text style={styles.faderGainText}>
                  {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)}
                </Text>

                {/* Increment / Decrement Steppers */}
                <View style={styles.stepperGroup}>
                  <Button
                    label="▲"
                    size="sm"
                    variant="ghost"
                    style={styles.stepBtn}
                    onPress={() => updateBandGain(idx, gain + 0.5)}
                  />
                  <View style={styles.sliderTrackSlot}>
                    <View
                      style={[
                        styles.sliderFill,
                        {
                          height: `${((gain - EQ_GAIN_MIN_DB) / (EQ_GAIN_MAX_DB - EQ_GAIN_MIN_DB)) * 100}%`,
                          backgroundColor: gain >= 0 ? tokens.colors.signal.primary : tokens.colors.signal.secondary,
                        },
                      ]}
                    />
                  </View>
                  <Button
                    label="▼"
                    size="sm"
                    variant="ghost"
                    style={styles.stepBtn}
                    onPress={() => updateBandGain(idx, gain - 0.5)}
                  />
                </View>

                <Text style={styles.faderFreqText}>
                  {formatFreqLabel(freq)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </InstrumentPanel>
  );
};

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  presetBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
  },
  telemetryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs + 2,
    marginBottom: tokens.spacing.sm,
    gap: tokens.spacing.md,
  },
  telemetryItem: {
    flexDirection: 'column',
    gap: 2,
  },
  telemetryLabel: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: 9,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  telemetryValue: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs + 1,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
  },
  gainHighlight: {
    color: tokens.colors.signal.primary,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: tokens.radius.full,
  },
  legendText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    color: tokens.colors.text.secondary,
  },
  canvasContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.hairline,
    ...Platform.select({
      web: {
        cursor: 'crosshair',
        touchAction: 'none',
      } as any,
    }),
  },
  svg: {
    overflow: 'visible',
  },
  faderBankContainer: {
    marginTop: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.hairline,
    paddingTop: tokens.spacing.sm,
  },
  faderBankContent: {
    gap: tokens.spacing.xs,
    paddingHorizontal: 2,
  },
  miniFaderColumn: {
    width: 44,
    alignItems: 'center',
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    paddingVertical: 6,
    gap: 4,
  },
  miniFaderColumnSelected: {
    borderColor: tokens.colors.border.active,
    backgroundColor: tokens.colors.bg.elevated,
  },
  faderGainText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  stepperGroup: {
    alignItems: 'center',
    gap: 2,
  },
  stepBtn: {
    height: 20,
    width: 32,
    paddingHorizontal: 0,
  },
  sliderTrackSlot: {
    width: 6,
    height: 60,
    backgroundColor: tokens.colors.bg.base,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: 3,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  sliderFill: {
    width: '100%',
    borderRadius: 2,
  },
  faderFreqText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    color: tokens.colors.text.secondary,
  },
});

export default EqCurveVisualizer;
