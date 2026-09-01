import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';

const EQ_FREQUENCIES = [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000];

const PRESET_PROFILES: Record<string, { name: string; desc: string; bands: number[] }> = {
  sql: {
    name: '🔥 SQL (Punjabi / EDM / Hip-Hop)',
    desc: 'Deep impactful sub-bass shelf + crisp, fatigue-free vocal presence.',
    bands: [4.0, 5.5, 2.0, -1.5, 0.0, 0.0, 0.5, 1.0, -1.0, 1.5, 1.5, 2.0, 1.5, 1.5]
  },
  harman: {
    name: '🎵 Harman Reference Curve',
    desc: 'Balanced acoustic in-cabin target with linear vocals and controlled bass.',
    bands: [3.0, 3.0, 1.5, -1.0, 0.0, 0.0, 0.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.0]
  },
  vocal: {
    name: '🎙️ Vocal Clarity & Acoustic',
    desc: 'Enhanced midrange intelligibility for podcasts, ghazals, and acoustic music.',
    bands: [1.0, 1.0, 0.0, -2.0, 1.0, 1.5, 2.0, 1.5, 0.0, 1.0, 1.0, 1.0, 0.5, 0.5]
  }
};

export default function TuningDashboardScreen() {
  const [selectedProfile, setSelectedProfile] = useState<string>('sql');
  const [eqGains, setEqGains] = useState<number[]>(PRESET_PROFILES.sql.bands);
  const [activeTab, setActiveTab] = useState<'eq' | 'crossover' | 'time_alignment' | 'gain' | 'tones'>('eq');
  const [isPlayingTone, setIsPlayingTone] = useState<string | null>(null);

  const audioCtxRef = useRef<any>(null);
  const oscRef = useRef<any>(null);

  useEffect(() => {
    setEqGains([...PRESET_PROFILES[selectedProfile].bands]);
  }, [selectedProfile]);

  const updateGain = (index: number, delta: number) => {
    setEqGains(prev => {
      const next = [...prev];
      const newVal = Math.min(12, Math.max(-12, +(next[index] + delta).toFixed(1)));
      next[index] = newVal;
      return next;
    });
  };

  const playTone = (type: string, freq?: number) => {
    if (Platform.OS !== 'web') {
      alert(`Playing test tone: ${type} (Use in-car Bluetooth)`);
      return;
    }

    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      if (isPlayingTone === type) {
        setIsPlayingTone(null);
        return;
      }

      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'pink') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        whiteNoise.connect(ctx.destination);
        whiteNoise.start();
        oscRef.current = whiteNoise;
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq || 1000, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime); // Safe playback level
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
      }

      setIsPlayingTone(type);
    } catch (e) {
      console.log('Audio playback error:', e);
    }
  };

  const stopTone = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
    setIsPlayingTone(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0e17" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>🚗 Skoda Kylaq RHD</Text></View>
            <View style={[styles.badge, styles.badgeActive]}><Text style={styles.badgeText}>⚡ AI Tuning Active</Text></View>
          </View>
          <Text style={styles.title}>CarAudioAI Studio</Text>
          <Text style={styles.subtitle}>
            Calibrated for Nakamichi NAM5510 • MOCO AF-04 • Sound Barrier SB-654 • Sony XS-162GS • Pioneer 35Hz Ported Sub
          </Text>
        </View>

        {/* Profile Selector */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>🎯 Sound Target Profile</Text>
          <View style={styles.profileRow}>
            {Object.keys(PRESET_PROFILES).map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.profileBtn, selectedProfile === key && styles.profileBtnActive]}
                onPress={() => setSelectedProfile(key)}
              >
                <Text style={[styles.profileBtnText, selectedProfile === key && styles.profileBtnTextActive]}>
                  {key.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.profileDescTitle}>{PRESET_PROFILES[selectedProfile].name}</Text>
          <Text style={styles.profileDescText}>{PRESET_PROFILES[selectedProfile].desc}</Text>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          {[
            { id: 'eq', label: '🎚️ 14-Band EQ' },
            { id: 'crossover', label: '🎛️ Crossovers' },
            { id: 'time_alignment', label: '⏱️ Time Align' },
            { id: 'gain', label: '⚡ Gain Staging' },
            { id: 'tones', label: '🔊 Test Tones' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab.id && styles.tabBtnTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TAB 1: 14-Band Equalizer */}
        {activeTab === 'eq' && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.sectionHeader}>🎚️ Nakamichi NAM5510 Graphic EQ</Text>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => setEqGains([...PRESET_PROFILES[selectedProfile].bands])}
              >
                <Text style={styles.resetBtnText}>Reset Preset</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardHint}>
              Set these exact values in your head unit touchscreen EQ menu:
            </Text>

            {/* EQ Sliders Grid */}
            <View style={styles.eqGrid}>
              {EQ_FREQUENCIES.map((freq, idx) => {
                const gain = eqGains[idx];
                const isBoost = gain > 0;
                const isCut = gain < 0;
                return (
                  <View key={freq} style={styles.eqColumn}>
                    <TouchableOpacity style={styles.adjustBtn} onPress={() => updateGain(idx, 0.5)}>
                      <Text style={styles.adjustBtnText}>+</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.sliderTrack}>
                      <View
                        style={[
                          styles.sliderFill,
                          {
                            height: `${Math.abs(gain) * 3.5 + 8}%`,
                            backgroundColor: isBoost ? '#00e676' : isCut ? '#ff5252' : '#78909c',
                            bottom: isCut ? undefined : '50%',
                            top: isCut ? '50%' : undefined
                          }
                        ]}
                      />
                      <View style={styles.zeroLine} />
                    </View>

                    <TouchableOpacity style={styles.adjustBtn} onPress={() => updateGain(idx, -0.5)}>
                      <Text style={styles.adjustBtnText}>-</Text>
                    </TouchableOpacity>

                    <Text style={[styles.gainLabel, isBoost && styles.textBoost, isCut && styles.textCut]}>
                      {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)}
                    </Text>
                    <Text style={styles.freqLabel}>
                      {freq >= 1000 ? `${freq / 1000}k` : freq}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Acoustic Highlights */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 Key Acoustic Offsets Applied:</Text>
              <Text style={styles.infoItem}>• <Text style={styles.boldText}>+5.5 dB @ 63Hz</Text>: Maximizes 35Hz ported Pioneer sub kick punch.</Text>
              <Text style={styles.infoItem}>• <Text style={styles.boldText}>-1.5 dB @ 200Hz</Text>: Eliminates Kylaq compact SUV cabin boom.</Text>
              <Text style={styles.infoItem}>• <Text style={styles.boldText}>-1.0 dB @ 4kHz</Text>: Tames windshield/A-pillar reflection harshness.</Text>
              <Text style={styles.infoItem}>• <Text style={styles.boldText}>+2.0 dB @ 12kHz</Text>: Smooth airy extension on Sony silk tweeters.</Text>
            </View>
          </View>
        )}

        {/* TAB 2: Crossovers & Subsonic Filter */}
        {activeTab === 'crossover' && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>🎛️ Physical Amplifier Filter & Dial Guide</Text>

            <View style={styles.settingCard}>
              <Text style={styles.settingCardTitle}>MOCO AF-04 (Front CH1/CH2 - Sony Components)</Text>
              <Text style={styles.specLine}>• Switch: <Text style={styles.highlightText}>HPF (High Pass Filter)</Text></Text>
              <Text style={styles.specLine}>• Frequency Dial: <Text style={styles.highlightText}>~80 Hz</Text> (Approx. 9:30 o'clock)</Text>
              <Text style={styles.specLine}>• Purpose: Protects 6.5" woofers from distortion and maintains clean vocal midrange.</Text>
            </View>

            <View style={styles.settingCard}>
              <Text style={styles.settingCardTitle}>MOCO AF-04 (Rear CH3/CH4 - Sony Coaxials)</Text>
              <Text style={styles.specLine}>• Switch: <Text style={styles.highlightText}>HPF (High Pass Filter)</Text></Text>
              <Text style={styles.specLine}>• Frequency Dial: <Text style={styles.highlightText}>~90 Hz</Text> (Approx. 10:00 o'clock)</Text>
              <Text style={styles.specLine}>• Purpose: Attenuated rear ambient fill without pulling the soundstage backward.</Text>
            </View>

            <View style={[styles.settingCard, styles.alertCard]}>
              <Text style={[styles.settingCardTitle, { color: '#ffb74d' }]}>
                Sound Barrier SB-654 (Pioneer 12" Sub - Bridged Mono)
              </Text>
              <Text style={styles.specLine}>• Switch: <Text style={styles.highlightText}>LPF (Low Pass Filter)</Text></Text>
              <Text style={styles.specLine}>• Frequency Dial: <Text style={styles.highlightText}>~80 Hz</Text> (Approx. 10:30 o'clock)</Text>
              <Text style={styles.specLine}>
                • Subsonic Filter: <Text style={styles.highlightText}>~28 Hz</Text>
              </Text>
              <Text style={styles.criticalNotice}>
                ⚠️ CRITICAL FOR 35Hz PORTED BOX: Frequencies below 28Hz cause the woofer cone to unload and bottom out. Subsonic filter prevents coil burn-out.
              </Text>
              <Text style={styles.specLine}>• Bass Boost: <Text style={styles.boldRed}>MUST BE SET TO 0 dB (OFF)</Text></Text>
            </View>
          </View>
        )}

        {/* TAB 3: Time Alignment */}
        {activeTab === 'time_alignment' && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>⏱️ Driver-Seat Time Alignment (India RHD)</Text>
            <Text style={styles.cardHint}>
              Compensates for speaker distance differences so all sound waves reach your ears simultaneously:
            </Text>

            <View style={styles.table}>
              <View style={styles.tableRowHeader}>
                <Text style={styles.th}>Speaker</Text>
                <Text style={styles.th}>Distance</Text>
                <Text style={styles.th}>Delay (ms)</Text>
                <Text style={styles.th}>Offset (cm)</Text>
              </View>
              {[
                { name: 'Front Right (FR)', dist: '95 cm', delay: '3.35 ms', offset: '115 cm' },
                { name: 'Rear Right (RR)', dist: '115 cm', delay: '2.77 ms', offset: '95 cm' },
                { name: 'Front Left (FL)', dist: '138 cm', delay: '2.10 ms', offset: '72 cm' },
                { name: 'Rear Left (RL)', dist: '155 cm', delay: '1.60 ms', offset: '55 cm' },
                { name: 'Boot Subwoofer', dist: '210 cm', delay: '0.00 ms (Ref)', offset: '0 cm' },
              ].map((row, idx) => (
                <View key={idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                  <Text style={styles.tdName}>{row.name}</Text>
                  <Text style={styles.td}>{row.dist}</Text>
                  <Text style={styles.tdHighlight}>{row.delay}</Text>
                  <Text style={styles.td}>{row.offset}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>🔄 Subwoofer Acoustic Phase:</Text>
              <Text style={styles.infoItem}>
                Test flipping the phase switch on the subwoofer amplifier (0° vs 180°). Whichever position produces the heaviest, tightest bass impact at the driver seat is acoustically in-phase with your front woofers.
              </Text>
            </View>
          </View>
        )}

        {/* TAB 4: Gain Staging */}
        {activeTab === 'gain' && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>⚡ Digital Multimeter (DMM) Voltage Calibration</Text>
            <Text style={styles.cardHint}>
              Set Nakamichi NAM5510 Volume to <Text style={styles.boldText}>30 (75%)</Text> with flat EQ before testing:
            </Text>

            <View style={styles.gainCard}>
              <Text style={styles.gainCardTitle}>MOCO AF-04 (Front Channels - Sony Components)</Text>
              <Text style={styles.gainVoltage}>Target: 13.4 Volts AC</Text>
              <Text style={styles.gainDetail}>• Test Tone: 1,000 Hz (1 kHz) 0dB Sine Wave</Text>
              <Text style={styles.gainDetail}>• Approx Knob Position: ~10:30 o'clock (2.0V Pre-out)</Text>
            </View>

            <View style={styles.gainCard}>
              <Text style={styles.gainCardTitle}>MOCO AF-04 (Rear Channels - Sony Coaxials)</Text>
              <Text style={styles.gainVoltage}>Target: 10.0 Volts AC</Text>
              <Text style={styles.gainDetail}>• Test Tone: 1,000 Hz (1 kHz) 0dB Sine Wave</Text>
              <Text style={styles.gainDetail}>• Approx Knob Position: ~9:30 o'clock</Text>
            </View>

            <View style={styles.gainCard}>
              <Text style={styles.gainCardTitle}>Sound Barrier SB-654 (Subwoofer - Bridged Mono)</Text>
              <Text style={styles.gainVoltage}>Target: 44.7 Volts AC</Text>
              <Text style={styles.gainDetail}>• Test Tone: 50 Hz 0dB Sine Wave</Text>
              <Text style={styles.gainDetail}>• Approx Knob Position: ~11:30 o'clock</Text>
            </View>
          </View>
        )}

        {/* TAB 5: Web Audio Test Tone Generator */}
        {activeTab === 'tones' && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>🔊 Test Tone Generator (In-Car Calibration)</Text>
            <Text style={styles.cardHint}>
              Connect your phone to your Nakamichi head unit via Bluetooth/Aux to play calibration test tones:
            </Text>

            <View style={styles.toneGrid}>
              <TouchableOpacity
                style={[styles.toneBtn, isPlayingTone === '1000' && styles.toneBtnActive]}
                onPress={() => playTone('1000', 1000)}
              >
                <Text style={styles.toneBtnTitle}>1,000 Hz (1 kHz) Sine</Text>
                <Text style={styles.toneBtnDesc}>Used to set MOCO Front/Rear speaker amplifier gains</Text>
                <Text style={styles.toneStatus}>{isPlayingTone === '1000' ? '⏹️ STOPPING' : '▶️ PLAY TONE'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toneBtn, isPlayingTone === '50' && styles.toneBtnActive]}
                onPress={() => playTone('50', 50)}
              >
                <Text style={styles.toneBtnTitle}>50 Hz Sine Wave</Text>
                <Text style={styles.toneBtnDesc}>Used to set Sound Barrier subwoofer amplifier gain</Text>
                <Text style={styles.toneStatus}>{isPlayingTone === '50' ? '⏹️ STOPPING' : '▶️ PLAY TONE'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toneBtn, isPlayingTone === 'pink' && styles.toneBtnActive]}
                onPress={() => playTone('pink')}
              >
                <Text style={styles.toneBtnTitle}>Pink Noise</Text>
                <Text style={styles.toneBtnDesc}>Full-spectrum acoustic RTA measurement tone</Text>
                <Text style={styles.toneStatus}>{isPlayingTone === 'pink' ? '⏹️ STOPPING' : '▶️ PLAY TONE'}</Text>
              </TouchableOpacity>
            </View>

            {isPlayingTone && (
              <TouchableOpacity style={styles.stopAllBtn} onPress={stopTone}>
                <Text style={styles.stopAllBtnText}>⏹️ STOP ALL AUDIO TONES</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CarAudioAI • Built for the Indian Automotive Community</Text>
          <Text style={styles.footerSubtext}>Open Source on GitHub (adityashm/CarAudioAI)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b12'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    marginBottom: 16
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  badge: {
    backgroundColor: '#1a2332',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeActive: {
    backgroundColor: '#0d47a1'
  },
  badgeText: {
    color: '#90caf9',
    fontSize: 12,
    fontWeight: '600'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  subtitle: {
    fontSize: 13,
    color: '#90a4ae',
    marginTop: 4,
    lineHeight: 18
  },
  card: {
    backgroundColor: '#0f1724',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10
  },
  profileRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  profileBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    alignItems: 'center'
  },
  profileBtnActive: {
    backgroundColor: '#00e676'
  },
  profileBtnText: {
    color: '#94a3b8',
    fontWeight: 'bold',
    fontSize: 12
  },
  profileBtnTextActive: {
    color: '#070b12'
  },
  profileDescTitle: {
    color: '#00e676',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2
  },
  profileDescText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 16
  },
  tabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#131d2e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#223249'
  },
  tabBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6'
  },
  tabBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  tabBtnTextActive: {
    color: '#ffffff'
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  resetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1e293b',
    borderRadius: 4
  },
  resetBtnText: {
    color: '#94a3b8',
    fontSize: 11
  },
  cardHint: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 14
  },
  eqGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#070b12',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  eqColumn: {
    alignItems: 'center',
    flex: 1
  },
  adjustBtn: {
    width: 20,
    height: 20,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2
  },
  adjustBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14
  },
  sliderTrack: {
    width: 8,
    height: 90,
    backgroundColor: '#131d2e',
    borderRadius: 4,
    position: 'relative',
    marginVertical: 4,
    overflow: 'hidden'
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 4
  },
  zeroLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: '#475569'
  },
  gainLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#cbd5e1',
    marginTop: 2
  },
  textBoost: {
    color: '#00e676'
  },
  textCut: {
    color: '#ff5252'
  },
  freqLabel: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2
  },
  infoBox: {
    marginTop: 14,
    backgroundColor: '#131d2e',
    padding: 12,
    borderRadius: 8
  },
  infoTitle: {
    color: '#93c5fd',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 6
  },
  infoItem: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4
  },
  boldText: {
    fontWeight: 'bold',
    color: '#ffffff'
  },
  settingCard: {
    backgroundColor: '#131d2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ffb74d'
  },
  settingCardTitle: {
    color: '#60a5fa',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 6
  },
  specLine: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18
  },
  highlightText: {
    color: '#00e676',
    fontWeight: 'bold'
  },
  criticalNotice: {
    color: '#fbbf24',
    fontSize: 11,
    lineHeight: 16,
    marginVertical: 4,
    backgroundColor: '#27200f',
    padding: 6,
    borderRadius: 4
  },
  boldRed: {
    color: '#f87171',
    fontWeight: 'bold'
  },
  table: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  th: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#0f1724'
  },
  tableRowAlt: {
    backgroundColor: '#131d2e'
  },
  tdName: {
    flex: 1.2,
    color: '#f1f5f9',
    fontSize: 11,
    fontWeight: '600'
  },
  td: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 11
  },
  tdHighlight: {
    flex: 1,
    color: '#00e676',
    fontSize: 11,
    fontWeight: 'bold'
  },
  gainCard: {
    backgroundColor: '#131d2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  gainCardTitle: {
    color: '#93c5fd',
    fontWeight: '600',
    fontSize: 13
  },
  gainVoltage: {
    color: '#00e676',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4
  },
  gainDetail: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18
  },
  toneGrid: {
    gap: 10
  },
  toneBtn: {
    backgroundColor: '#131d2e',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#223249'
  },
  toneBtnActive: {
    backgroundColor: '#064e3b',
    borderColor: '#059669'
  },
  toneBtnTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2
  },
  toneBtnDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8
  },
  toneStatus: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 12
  },
  stopAllBtn: {
    marginTop: 14,
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  stopAllBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13
  },
  footer: {
    marginTop: 20,
    alignItems: 'center'
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600'
  },
  footerSubtext: {
    color: '#475569',
    fontSize: 11,
    marginTop: 2
  }
});
