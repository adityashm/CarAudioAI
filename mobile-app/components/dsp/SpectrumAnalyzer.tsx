import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { tokens } from '../../design-system/tokens';
import { webAudioEngine, ToneType, WebAudioEngineState } from '../../services/webAudioEngine';
import InstrumentPanel from '../ui/InstrumentPanel';
import Button from '../ui/Button';
import Readout from '../ui/Readout';

export interface SpectrumAnalyzerProps {
  style?: StyleProp<ViewStyle>;
  height?: number;
  numBars?: number;
  testID?: string;
}

export const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({
  style,
  height = 200,
  numBars = 32,
  testID,
}) => {
  const [engineState, setEngineState] = useState<WebAudioEngineState>(() => webAudioEngine.getState());
  const [bars, setBars] = useState<number[]>(() => new Array(numBars).fill(0));
  const [peakBars, setPeakBars] = useState<number[]>(() => new Array(numBars).fill(0));
  const [viewWidth, setViewWidth] = useState<number>(() => {
    const screenW = Dimensions.get('window').width;
    return Math.min(860, Math.max(320, screenW - 32));
  });

  const animFrameRef = useRef<number | null>(null);
  const peakHoldDecayRef = useRef<number[]>(new Array(numBars).fill(0));

  // Subscribe to Web Audio engine state
  useEffect(() => {
    const unsubscribe = webAudioEngine.subscribe((state) => {
      setEngineState(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // 60FPS animation loop for FFT spectrum bar extraction
  useEffect(() => {
    let isActive = true;

    const renderLoop = () => {
      if (!isActive) return;

      const rawBars = webAudioEngine.getGroupedSpectrumBars(numBars);
      setBars(rawBars);

      // Peak hold calculation with gravity decay
      const newPeaks = rawBars.map((val, idx) => {
        const currentPeak = peakHoldDecayRef.current[idx] || 0;
        let nextPeak = currentPeak;
        if (val >= currentPeak) {
          nextPeak = val;
        } else {
          nextPeak = Math.max(0, currentPeak - 0.015); // Gravity decay
        }
        peakHoldDecayRef.current[idx] = nextPeak;
        return nextPeak;
      });
      setPeakBars(newPeaks);

      if (typeof requestAnimationFrame !== 'undefined') {
        animFrameRef.current = requestAnimationFrame(renderLoop);
      }
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      animFrameRef.current = requestAnimationFrame(renderLoop);
    } else {
      const interval = setInterval(renderLoop, 33);
      return () => {
        isActive = false;
        clearInterval(interval);
      };
    }

    return () => {
      isActive = false;
      if (animFrameRef.current && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [numBars]);

  // Tone generation triggers
  const handleToggleTone = useCallback((tone: ToneType) => {
    if (engineState.isPlaying && engineState.activeTone === tone) {
      webAudioEngine.stopTone();
    } else {
      webAudioEngine.playTone(tone);
    }
  }, [engineState.isPlaying, engineState.activeTone]);

  const handleStopAll = useCallback(() => {
    webAudioEngine.stopTone();
  }, []);

  // Visual layout geometry
  const padding = { top: 16, right: 16, bottom: 24, left: 32 };
  const graphWidth = Math.max(260, viewWidth - padding.left - padding.right);
  const graphHeight = Math.max(100, height - padding.top - padding.bottom);
  const barGap = 2;
  const barWidth = Math.max(2, (graphWidth - (numBars - 1) * barGap) / numBars);

  // dBFS Grid lines (-10, -30, -60, -90 dBFS)
  const gridDbfs = [
    { db: -10, label: '-10' },
    { db: -30, label: '-30' },
    { db: -60, label: '-60' },
    { db: -90, label: '-90' },
  ];

  return (
    <InstrumentPanel
      testID={testID}
      title="Real-Time FFT Spectrum Analyzer & Tone Synth"
      subtitle="Web Audio API AnalyserNode (2048-Point FFT, 60 FPS Peak Hold)"
      badge={engineState.isPlaying ? 'SIGNAL ACTIVE' : 'STANDBY'}
      status={engineState.isPlaying ? 'ok' : 'neutral'}
      style={style}
      action={
        engineState.isPlaying ? (
          <Button
            label="Mute / Stop"
            size="sm"
            variant="danger"
            onPress={handleStopAll}
          />
        ) : undefined
      }
    >
      {/* Real-Time Monospace Telemetry Readouts */}
      <View style={styles.telemetryRow}>
        <Readout
          label="Peak Freq"
          value={engineState.peakFrequencyHz > 0 ? engineState.peakFrequencyHz : '--'}
          unit="Hz"
          size="sm"
          status={engineState.peakFrequencyHz > 0 ? 'ok' : 'normal'}
        />
        <Readout
          label="Signal Level"
          value={engineState.currentDbfs}
          unit="dBFS"
          size="sm"
          status={engineState.currentDbfs > -3.0 ? 'warning' : 'normal'}
        />
        <Readout
          label="Active Tone"
          value={engineState.activeTone.toUpperCase().replace('_', ' ')}
          size="sm"
        />
        <Readout
          label="Audio Context"
          value={engineState.contextState.toUpperCase()}
          size="sm"
          status={engineState.contextState === 'running' ? 'ok' : 'normal'}
        />
      </View>

      {/* Main 60FPS Spectrum Bar Visualizer Surface */}
      <View
        style={styles.canvasContainer}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 100) setViewWidth(w);
        }}
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

          {/* dBFS Horizontal Grid Marks */}
          {gridDbfs.map((grid, idx) => {
            const ratio = (grid.db - -90) / (-10 - -90);
            const y = padding.top + (1 - ratio) * graphHeight;
            return (
              <G key={`dbfs-${idx}`}>
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke={tokens.colors.border.hairline}
                  strokeWidth={0.8}
                  strokeDasharray="2 4"
                />
                <SvgText
                  x={padding.left - 4}
                  y={y + 3}
                  fill={tokens.colors.text.muted}
                  fontSize="8"
                  fontFamily={tokens.typography.fontFamily.mono}
                  textAnchor="end"
                >
                  {grid.label}
                </SvgText>
              </G>
            );
          })}

          {/* FFT Spectrum Bars (Cyan #22D3EE) */}
          {bars.map((normVal, idx) => {
            const clamped = Math.max(0.01, Math.min(1.0, normVal));
            const barH = clamped * graphHeight;
            const x = padding.left + idx * (barWidth + barGap);
            const y = padding.top + graphHeight - barH;

            const peakNorm = peakBars[idx] || 0;
            const peakY = padding.top + graphHeight - (peakNorm * graphHeight);

            return (
              <G key={`bar-${idx}`}>
                {/* Active Level Bar */}
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill={tokens.colors.signal.primary}
                  opacity={0.85}
                  rx={1}
                />

                {/* Peak Hold Line Marker (Purple #A78BFA) */}
                {peakNorm > 0.05 && (
                  <Line
                    x1={x}
                    y1={Math.max(padding.top, peakY)}
                    x2={x + barWidth}
                    y2={Math.max(padding.top, peakY)}
                    stroke={tokens.colors.signal.secondary}
                    strokeWidth={1.5}
                  />
                )}
              </G>
            );
          })}

          {/* Logarithmic Frequency Axis Labels */}
          <SvgText
            x={padding.left}
            y={padding.top + graphHeight + 14}
            fill={tokens.colors.text.muted}
            fontSize="8"
            fontFamily={tokens.typography.fontFamily.mono}
            textAnchor="start"
          >
            20Hz
          </SvgText>
          <SvgText
            x={padding.left + graphWidth * 0.3}
            y={padding.top + graphHeight + 14}
            fill={tokens.colors.text.muted}
            fontSize="8"
            fontFamily={tokens.typography.fontFamily.mono}
            textAnchor="middle"
          >
            250Hz
          </SvgText>
          <SvgText
            x={padding.left + graphWidth * 0.6}
            y={padding.top + graphHeight + 14}
            fill={tokens.colors.text.muted}
            fontSize="8"
            fontFamily={tokens.typography.fontFamily.mono}
            textAnchor="middle"
          >
            2.5kHz
          </SvgText>
          <SvgText
            x={padding.left + graphWidth}
            y={padding.top + graphHeight + 14}
            fill={tokens.colors.text.muted}
            fontSize="8"
            fontFamily={tokens.typography.fontFamily.mono}
            textAnchor="end"
          >
            20kHz
          </SvgText>
        </Svg>
      </View>

      {/* Audio Test Tone Generator Controls */}
      <View style={styles.controlsContainer}>
        <Text style={styles.sectionHeader}>SYNTHETIC AUDIO TEST TONE GENERATOR</Text>

        <View style={styles.buttonsGrid}>
          <Button
            label={engineState.activeTone === 'sine_1000' ? '⏹ 1kHz Mid Tone' : '▶ 1kHz Mid Tone'}
            size="sm"
            variant={engineState.activeTone === 'sine_1000' ? 'solid' : 'outline'}
            onPress={() => handleToggleTone('sine_1000')}
          />
          <Button
            label={engineState.activeTone === 'sine_50' ? '⏹ 50Hz Sub Tone' : '▶ 50Hz Sub Tone'}
            size="sm"
            variant={engineState.activeTone === 'sine_50' ? 'solid' : 'outline'}
            onPress={() => handleToggleTone('sine_50')}
          />
          <Button
            label={engineState.activeTone === 'pink_noise' ? '⏹ Pink Noise' : '▶ Pink Noise'}
            size="sm"
            variant={engineState.activeTone === 'pink_noise' ? 'solid' : 'outline'}
            onPress={() => handleToggleTone('pink_noise')}
          />
          <Button
            label={engineState.activeTone === 'sine_sweep' ? '⏹ 20Hz-20kHz Sweep' : '▶ 20Hz-20kHz Sweep'}
            size="sm"
            variant={engineState.activeTone === 'sine_sweep' ? 'solid' : 'outline'}
            onPress={() => handleToggleTone('sine_sweep')}
          />
        </View>
      </View>
    </InstrumentPanel>
  );
};

const styles = StyleSheet.create({
  telemetryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
  },
  canvasContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.hairline,
  },
  svg: {
    overflow: 'visible',
  },
  controlsContainer: {
    marginTop: tokens.spacing.md,
    paddingTop: tokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.hairline,
    gap: tokens.spacing.sm,
  },
  sectionHeader: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: 9,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
  },
});

export default SpectrumAnalyzer;
