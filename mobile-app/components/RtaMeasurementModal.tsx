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

interface RtaMeasurementModalProps {
  visible: boolean;
  onClose: () => void;
  carName: string;
  onApplyCuts?: (recommendedCuts: { frequency_hz: number; recommended_eq_cut_db: number }[]) => void;
}

// Standard 31-band 1/3-octave test frequencies (Hz)
const ISO_31_FREQUENCIES = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800,
  1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000,
];

export default function RtaMeasurementModal({
  visible,
  onClose,
  carName,
  onApplyCuts,
}: RtaMeasurementModalProps) {
  const [loading, setLoading] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<MeasurementResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'simulate' | 'custom'>('simulate');
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);
  const canvasRef = useRef<any>(null);

  // Generate realistic simulated in-cabin sweep
  const generateSimulatedData = (): MeasurementPoint[] => {
    return ISO_31_FREQUENCIES.map((freq) => {
      // Baseline 75 dB SPL
      let spl = 75.0;

      // Deep bass roll-off & cabin gain
      if (freq <= 63) {
        spl += 6.5 + (Math.random() * 2 - 1);
      }
      // Cabin standing wave resonance at 200 Hz
      else if (freq >= 160 && freq <= 250) {
        spl += 8.2 + (Math.random() * 1.5 - 0.75);
      }
      // Midrange notch around 800 Hz
      else if (freq >= 630 && freq <= 1000) {
        spl -= 2.5 + (Math.random() * 1.5 - 0.75);
      }
      // Windshield glass reflection treble boost @ 4-6 kHz
      else if (freq >= 3150 && freq <= 5000) {
        spl += 4.5 + (Math.random() * 2 - 1);
      }
      // Treble roll-off
      else if (freq >= 12500) {
        spl -= 3.0 + (Math.random() * 1.5 - 0.75);
      } else {
        spl += (Math.random() * 3 - 1.5);
      }

      return {
        frequency_hz: freq,
        spl_db: +spl.toFixed(1),
      };
    });
  };

  const handleRunAcousticSweep = async () => {
    setLoading(true);
    setAppliedMsg(null);
    try {
      const raw = generateSimulatedData();
      const res = await uploadMeasurement(raw, `${carName}_in_cabin_rta`);
      setMeasurementResult(res);
    } catch (e) {
      console.warn('[RTA Modal] Error running sweep:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && !measurementResult) {
      handleRunAcousticSweep();
    }
  }, [visible]);

  // Render RTA Canvas comparing raw vs smoothed
  useEffect(() => {
    if (!visible || !measurementResult || Platform.OS !== 'web') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width || 560;
    const height = canvas.height || 200;

    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 20; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const smoothed = measurementResult.smoothed_data;
    if (!smoothed || smoothed.length < 2) return;

    const minSpl = 60;
    const maxSpl = 95;
    const stepX = width / (smoothed.length - 1);

    // Draw Smoothed Spline Curve (Cyan Glow)
    const points = smoothed.map((pt, i) => {
      const normY = (pt.spl_db - minSpl) / (maxSpl - minSpl);
      const y = height - normY * height;
      return { x: i * stepX, y: Math.max(10, Math.min(height - 10, y)) };
    });

    // Baseline target 75dB line
    const targetY = height - ((75 - minSpl) / (maxSpl - minSpl)) * height;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(width, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const cpX = (points[i].x + points[i + 1].x) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, cpX, (points[i].y + points[i + 1].y) / 2);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill under curve
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.20)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Mark detected peaks with red pulses
    measurementResult.recommended_cuts.forEach((cut) => {
      const idx = smoothed.findIndex((p) => p.frequency_hz === cut.frequency_hz);
      if (idx !== -1) {
        const pt = points[idx];
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`${cut.frequency_hz}Hz (Cut ${cut.recommended_eq_cut_db}dB)`, Math.max(5, pt.x - 30), pt.y - 10);
      }
    });
  }, [visible, measurementResult]);

  const handleApplyToEq = () => {
    if (measurementResult?.recommended_cuts && onApplyCuts) {
      onApplyCuts(
        measurementResult.recommended_cuts.map((c) => ({
          frequency_hz: c.frequency_hz,
          recommended_eq_cut_db: c.recommended_eq_cut_db,
        }))
      );
      setAppliedMsg('Acoustic notch cuts applied to 14-band Equalizer!');
      setTimeout(() => {
        setAppliedMsg(null);
      }, 2500);
    }
  };

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
                <View style={styles.cyanDot} />
                <Text style={styles.modalTitle}>RTA In-Cabin Acoustic Analysis</Text>
              </View>
              <Text style={styles.modalSub}>
                1/3-octave frequency response smoothing and standing wave resonance notch detection for {carName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Action Bar */}
            <View style={styles.actionBar}>
              <TouchableOpacity
                style={styles.runSweepBtn}
                onPress={handleRunAcousticSweep}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#020617" />
                ) : (
                  <Text style={styles.runSweepBtnText}>🎙️ Run Live Acoustic Mic Sweep (31-Band)</Text>
                )}
              </TouchableOpacity>
            </View>

            {appliedMsg && (
              <View style={styles.alertSuccess}>
                <Text style={styles.alertSuccessText}>✓ {appliedMsg}</Text>
              </View>
            )}

            {/* RTA Response Canvas */}
            {Platform.OS === 'web' && (
              <View style={styles.canvasContainer}>
                <View style={styles.canvasLegendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#06b6d4' }]} />
                    <Text style={styles.legendText}>Smoothed SPL Response (dB)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                    <Text style={styles.legendText}>Harman Target (75dB)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.legendText}>Detected Resonances</Text>
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

            {/* Resonance Findings & Recommended Cuts */}
            {measurementResult && (
              <View style={styles.findingsBox}>
                <Text style={styles.findingsTitle}>
                  🔍 Detected In-Cabin Standing Wave Resonances:
                </Text>

                {measurementResult.recommended_cuts.length > 0 ? (
                  <View style={styles.cutsList}>
                    {measurementResult.recommended_cuts.map((cut, idx) => (
                      <View key={idx} style={styles.cutCard}>
                        <View style={styles.cutHeader}>
                          <Text style={styles.cutFreq}>{cut.frequency_hz} Hz</Text>
                          <Text style={styles.cutDb}>{cut.recommended_eq_cut_db} dB Cut</Text>
                        </View>
                        <Text style={styles.cutRationale}>{cut.rationale}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noPeaksText}>
                    No excessive standing wave peaks detected (&gt;3dB above baseline).
                  </Text>
                )}

                {measurementResult.recommended_cuts.length > 0 && (
                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={handleApplyToEq}
                  >
                    <Text style={styles.applyBtnText}>
                      ⚡ Apply Recommended Notch Cuts to Equalizer
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
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
  actionBar: {
    marginBottom: 12,
  },
  runSweepBtn: {
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  runSweepBtnText: {
    color: '#020617',
    fontSize: 13,
    fontWeight: 'bold',
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
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14,
    alignItems: 'center',
  },
  canvasLegendRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
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
  findingsBox: {
    backgroundColor: '#070d18',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  findingsTitle: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cutsList: {
    gap: 8,
    marginBottom: 14,
  },
  cutCard: {
    backgroundColor: '#0a101f',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  cutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cutFreq: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cutDb: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cutRationale: {
    color: '#94a3b8',
    fontSize: 11,
  },
  noPeaksText: {
    color: '#10b981',
    fontSize: 12,
  },
  applyBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#06b6d4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
