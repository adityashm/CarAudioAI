import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  uploadMeasurement,
  MeasurementPoint,
  MeasurementResponse,
} from '@/services/tuningService';
import { webAudioEngine, ISO_31_FREQUENCIES, Rta31BandPoint } from '@/services/webAudioEngine';

interface RtaMeasurementModalProps {
  visible: boolean;
  onClose: () => void;
  carName: string;
  targetProfile?: 'sql' | 'harman' | 'vocal';
  onApplyCuts?: (recommendedCuts: { frequency_hz: number; recommended_eq_cut_db: number }[]) => void;
  onApplyAutoTune?: (autoTune14BandGains: number[]) => void;
}

export default function RtaMeasurementModal({
  visible,
  onClose,
  carName,
  targetProfile = 'harman',
  onApplyCuts,
  onApplyAutoTune,
}: RtaMeasurementModalProps) {
  const [loading, setLoading] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<MeasurementResponse | null>(null);
  const [activeMode, setActiveMode] = useState<'live_mic' | 'simulate'>('live_mic');
  const [isMicCapturing, setIsMicCapturing] = useState(false);
  const [isPinkNoisePlaying, setIsPinkNoisePlaying] = useState(false);
  const [liveSplPoints, setLiveSplPoints] = useState<Rta31BandPoint[]>([]);
  const [autoTune14Gains, setAutoTune14Gains] = useState<number[]>([]);
  const [currentAvgSpl, setCurrentAvgSpl] = useState<number>(75.0);
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);
  const canvasRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Live Animation Loop for 31-Band FFT RTA Canvas
  const runLiveRtaFrame = () => {
    if (!visible) return;

    const data = webAudioEngine.getMic31BandRtaData(targetProfile);
    setLiveSplPoints(data.points);
    setAutoTune14Gains(data.autoTune14BandGains);
    setCurrentAvgSpl(data.averageSplDb);

    drawRtaCanvas(data.points, targetProfile);

    animationFrameRef.current = requestAnimationFrame(runLiveRtaFrame);
  };

  const drawRtaCanvas = (points: Rta31BandPoint[], profile: 'sql' | 'harman' | 'vocal') => {
    if (Platform.OS !== 'web') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width || 560;
    const height = canvas.height || 200;

    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines (dB Levels)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 20; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (!points || points.length === 0) return;

    const minSpl = 50;
    const maxSpl = 105;
    const numBars = points.length;
    const barSpacing = 2;
    const barWidth = Math.max(2, (width - (numBars * barSpacing)) / numBars);

    // 1. Draw 31-Band Measured SPL Bars
    points.forEach((pt, i) => {
      const x = i * (barWidth + barSpacing) + 4;
      const normH = Math.max(0.05, Math.min(1.0, (pt.spl - minSpl) / (maxSpl - minSpl)));
      const barH = normH * (height - 30);
      const y = height - 20 - barH;

      // Color code by frequency band
      let barColor = '#0284c7';
      if (pt.freq <= 100) barColor = '#38bdf8'; // Sub-bass
      else if (pt.freq <= 500) barColor = '#06b6d4'; // Mid-bass
      else if (pt.freq <= 4000) barColor = '#10b981'; // Midrange
      else barColor = '#f59e0b'; // Treble

      if (pt.deltaDb < -4.0) barColor = '#ef4444'; // Resonant peak warning

      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth, barH);

      // Peak Hold Cap
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y - 2, barWidth, 2);
    });

    // 2. Draw Target Curve Reference Line (Green dashed curve)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    points.forEach((pt, i) => {
      const x = i * (barWidth + barSpacing) + 4 + barWidth / 2;
      const targetNormY = (pt.targetSpl - minSpl) / (maxSpl - minSpl);
      const targetY = height - 20 - targetNormY * (height - 30);
      if (i === 0) ctx.moveTo(x, targetY);
      else ctx.lineTo(x, targetY);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Start / Stop Live Microphone Capture
  const handleToggleMicCapture = async () => {
    if (isMicCapturing) {
      webAudioEngine.stopMicRtaCapture();
      setIsMicCapturing(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    } else {
      const ok = await webAudioEngine.startMicRtaCapture();
      if (ok) {
        setIsMicCapturing(true);
        runLiveRtaFrame();
      }
    }
  };

  // Toggle Pink Noise Test Tone
  const handleTogglePinkNoise = async () => {
    if (isPinkNoisePlaying) {
      webAudioEngine.stopTone(true);
      setIsPinkNoisePlaying(false);
    } else {
      await webAudioEngine.playTone('pink_noise');
      setIsPinkNoisePlaying(true);
    }
  };

  // Apply Full Auto-Tune Gains to DSP Studio
  const handleApplyAutoTune = () => {
    if (autoTune14Gains.length > 0 && onApplyAutoTune) {
      onApplyAutoTune(autoTune14Gains);
      webAudioEngine.setAllGains(autoTune14Gains);
      setAppliedMsg('Auto-Tune calibration profile applied directly to 14-band Studio DSP!');
      setTimeout(() => setAppliedMsg(null), 3500);
    }
  };

  // Generate simulated sweep for backend upload
  const handleRunSimulatedSweep = async () => {
    setLoading(true);
    setAppliedMsg(null);
    try {
      const raw = ISO_31_FREQUENCIES.map((freq) => {
        let spl = 75.0;
        if (freq <= 63) spl += 6.5 + (Math.random() * 2 - 1);
        else if (freq >= 160 && freq <= 250) spl += 8.2 + (Math.random() * 1.5 - 0.75);
        else if (freq >= 630 && freq <= 1000) spl -= 2.5 + (Math.random() * 1.5 - 0.75);
        else if (freq >= 3150 && freq <= 5000) spl += 4.5 + (Math.random() * 2 - 1);
        else if (freq >= 12500) spl -= 3.0 + (Math.random() * 1.5 - 0.75);
        else spl += (Math.random() * 3 - 1.5);
        return { frequency_hz: freq, spl_db: +spl.toFixed(1) };
      });
      const res = await uploadMeasurement(raw, `${carName}_in_cabin_rta`);
      setMeasurementResult(res);
    } catch (e) {
      console.warn('[RTA Modal] Error running sweep:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      if (activeMode === 'live_mic') {
        handleToggleMicCapture();
      }
    } else {
      if (isMicCapturing) webAudioEngine.stopMicRtaCapture();
      if (isPinkNoisePlaying) webAudioEngine.stopTone(true);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setIsMicCapturing(false);
      setIsPinkNoisePlaying(false);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      webAudioEngine.stopMicRtaCapture();
      webAudioEngine.stopTone(true);
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <View style={styles.headerTitleRow}>
                <View style={[styles.cyanDot, isMicCapturing && styles.cyanDotActive]} />
                <Text style={styles.modalTitle}>RTA In-Cabin Real-Time Acoustic Calibration</Text>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>{isMicCapturing ? '● LIVE MIC ACTIVE' : 'STANDBY'}</Text>
                </View>
              </View>
              <Text style={styles.modalSub}>
                31-Band 1/3-octave FFT cabin measurement & automated parametric equalizer correction for {carName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Live Controller Bar */}
            <View style={styles.controllerBar}>
              <TouchableOpacity
                style={[styles.ctrlBtn, isMicCapturing && styles.ctrlBtnActive]}
                onPress={handleToggleMicCapture}
              >
                <Text style={styles.ctrlBtnText}>
                  {isMicCapturing ? '⏹️ Stop Microphone Capture' : '🎙️ Start In-Cabin Mic Stream'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ctrlBtnPink, isPinkNoisePlaying && styles.ctrlBtnPinkActive]}
                onPress={handleTogglePinkNoise}
              >
                <Text style={styles.ctrlBtnPinkText}>
                  {isPinkNoisePlaying ? '🔇 Mute Pink Noise' : '🔊 Play Pink Noise Sweep'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* SPL Metric Cards */}
            <View style={styles.splReadoutRow}>
              <View style={styles.splMetricCard}>
                <Text style={styles.splMetricLabel}>AVG CABIN LEVEL</Text>
                <Text style={styles.splMetricVal}>{currentAvgSpl} <Text style={styles.splUnit}>dB SPL</Text></Text>
              </View>
              <View style={styles.splMetricCard}>
                <Text style={styles.splMetricLabel}>TARGET HOUSE CURVE</Text>
                <Text style={styles.splMetricVal}>{targetProfile.toUpperCase()} <Text style={styles.splUnit}>75 dB Ref</Text></Text>
              </View>
              <View style={styles.splMetricCard}>
                <Text style={styles.splMetricLabel}>AUTO-TUNE STATUS</Text>
                <Text style={[styles.splMetricVal, { color: '#10b981' }]}>
                  {autoTune14Gains.length > 0 ? 'READY TO APPLY' : 'CALCULATING'}
                </Text>
              </View>
            </View>

            {appliedMsg && (
              <View style={styles.alertSuccess}>
                <Text style={styles.alertSuccessText}>✓ {appliedMsg}</Text>
              </View>
            )}

            {/* 31-Band RTA Canvas */}
            {Platform.OS === 'web' && (
              <View style={styles.canvasContainer}>
                <View style={styles.canvasLegendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#38bdf8' }]} />
                    <Text style={styles.legendText}>Measured In-Cabin FFT (31-Band)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                    <Text style={styles.legendText}>Target House Curve</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.legendText}>Resonance Peak (&gt;4dB)</Text>
                  </View>
                </View>

                <canvas
                  ref={canvasRef}
                  width={560}
                  height={180}
                  style={{ width: '100%', maxWidth: 560, height: 180, borderRadius: 8 }}
                />
              </View>
            )}

            {/* Auto-Tune Action Block */}
            <View style={styles.autoTuneActionCard}>
              <View style={styles.autoTuneInfo}>
                <Text style={styles.autoTuneTitle}>⚡ 1-Click Auto-Tune Inverse Correction</Text>
                <Text style={styles.autoTuneSub}>
                  Computes exact inverse delta gains for 14 ISO studio EQ bands to align vehicle cabin to Harman target curve.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.autoTuneApplyBtn}
                onPress={handleApplyAutoTune}
              >
                <Text style={styles.autoTuneApplyBtnText}>Apply Auto-Tune to Studio DSP →</Text>
              </TouchableOpacity>
            </View>

            {/* 14-Band Delta Table Preview */}
            <View style={styles.deltaPreviewBox}>
              <Text style={styles.deltaPreviewTitle}>14-Band Auto-Tune Corrective Gains (dB):</Text>
              <View style={styles.deltaChipsGrid}>
                {[32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000].map((freq, idx) => {
                  const gain = autoTune14Gains[idx] || 0.0;
                  return (
                    <View key={freq} style={styles.deltaChip}>
                      <Text style={styles.deltaChipFreq}>{freq >= 1000 ? `${freq / 1000}k` : freq}</Text>
                      <Text style={[styles.deltaChipGain, gain > 0 ? styles.gainPlus : (gain < 0 ? styles.gainMinus : null)]}>
                        {gain > 0 ? `+${gain}` : gain} dB
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '90%',
    backgroundColor: '#0a101f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    padding: 20,
    shadowColor: '#06b6d4',
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 12,
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cyanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06b6d4',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollArea: {
    flexGrow: 0,
  },
  cyanDotActive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  liveBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  liveBadgeText: {
    color: '#38bdf8',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  controllerBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  ctrlBtn: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlBtnActive: {
    backgroundColor: '#dc2626',
  },
  ctrlBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ctrlBtnPink: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#f43f5e',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlBtnPinkActive: {
    backgroundColor: '#f43f5e',
  },
  ctrlBtnPinkText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  splReadoutRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  splMetricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#070d18',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  splMetricLabel: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  splMetricVal: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  splUnit: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 'normal',
  },
  alertSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  alertSuccessText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  canvasContainer: {
    backgroundColor: '#070d18',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14,
    alignItems: 'center',
  },
  canvasLegendRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  autoTuneActionCard: {
    backgroundColor: '#0c1a2e',
    borderWidth: 1,
    borderColor: '#0284c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  autoTuneInfo: {
    flex: 1,
    minWidth: 240,
  },
  autoTuneTitle: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  autoTuneSub: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15,
  },
  autoTuneApplyBtn: {
    backgroundColor: '#38bdf8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoTuneApplyBtnText: {
    color: '#020617',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deltaPreviewBox: {
    backgroundColor: '#070d18',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
  },
  deltaPreviewTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deltaChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  deltaChip: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  deltaChipFreq: {
    color: '#64748b',
    fontSize: 8,
    fontFamily: 'monospace',
  },
  deltaChipGain: {
    color: '#cbd5e1',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  gainPlus: {
    color: '#38bdf8',
  },
  gainMinus: {
    color: '#f43f5e',
  },
});
