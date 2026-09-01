import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
  Linking
} from 'react-native';

// --- DATASETS FOR MULTI-CAR & MULTI-EQUIPMENT ENGINE ---
interface CarModel {
  make: string;
  model: string;
  category: string;
  wheelbase: number;
  distances_rhd: { FL: number; FR: number; RL: number; RR: number; SUB: number };
}

const CAR_CATALOG: CarModel[] = [
  {
    make: 'Skoda',
    model: 'Kylaq (2025)',
    category: 'Compact SUV',
    wheelbase: 2566,
    distances_rhd: { FL: 138, FR: 95, RL: 155, RR: 115, SUB: 210 }
  },
  {
    make: 'Maruti Suzuki',
    model: 'Swift (2024)',
    category: 'Hatchback',
    wheelbase: 2450,
    distances_rhd: { FL: 130, FR: 88, RL: 145, RR: 105, SUB: 190 }
  },
  {
    make: 'Hyundai',
    model: 'Creta (2024)',
    category: 'Midsize SUV',
    wheelbase: 2610,
    distances_rhd: { FL: 142, FR: 98, RL: 160, RR: 120, SUB: 220 }
  },
  {
    make: 'Tata',
    model: 'Nexon (2024)',
    category: 'Compact SUV',
    wheelbase: 2498,
    distances_rhd: { FL: 136, FR: 92, RL: 150, RR: 110, SUB: 205 }
  },
  {
    make: 'Mahindra',
    model: 'Thar 4x4',
    category: 'Off-Road SUV',
    wheelbase: 2450,
    distances_rhd: { FL: 128, FR: 85, RL: 140, RR: 100, SUB: 180 }
  },
  {
    make: 'Toyota',
    model: 'Fortuner',
    category: 'Full-Size SUV',
    wheelbase: 2745,
    distances_rhd: { FL: 155, FR: 105, RL: 180, RR: 135, SUB: 250 }
  }
];

const HEAD_UNITS = [
  { id: 'nakamichi_nam5510', name: 'Nakamichi NAM5510 (14-Band EQ, 2.0V Pre-out)', preout: 2.0, bands: 14 },
  { id: 'pioneer_80prs', name: 'Pioneer DEH-80PRS (31-Band DSP, 5.0V Pre-out)', preout: 5.0, bands: 14 },
  { id: 'sony_gs9', name: 'Sony RSX-GS9 High-Res (10-Band EQ, 5.0V Pre-out)', preout: 5.0, bands: 14 },
  { id: 'android_generic', name: 'Standard Android Head Unit (10-Band EQ, 1.5V Pre-out)', preout: 1.5, bands: 14 }
];

const SPEAKER_SETS = [
  { id: 'sony_xs162gs', name: 'Sony XS-162GS (6.5" 2-Way Components)', rms: 45, ohms: 4, hpf: 80 },
  { id: 'focal_access', name: 'Focal Access 165-AS (6.5" Components)', rms: 60, ohms: 4, hpf: 75 },
  { id: 'morel_maximo', name: 'Morel Maximo Ultra 602 (6.5" Components)', rms: 90, ohms: 4, hpf: 70 },
  { id: 'jbl_stage3', name: 'JBL Stage3 607C (6.5" Components)', rms: 50, ohms: 3, hpf: 85 }
];

const SUBWOOFERS = [
  { id: 'pioneer_tsw307', name: 'Pioneer TS-W307D4 (12" Ported @ 35Hz)', type: 'ported', tune: 35, rms: 250, ohms: 8 },
  { id: 'jbl_basspro12', name: 'JBL BassPro 12 (12" Ported @ 38Hz)', type: 'ported', tune: 38, rms: 150, ohms: 4 },
  { id: 'rockford_p3', name: 'Rockford Fosgate P3D4-12 (Sealed 1.25 cu ft)', type: 'sealed', tune: 0, rms: 600, ohms: 4 },
  { id: 'underseat_active', name: 'Underseat Compact Active Sub (8")', type: 'sealed', tune: 0, rms: 120, ohms: 4 }
];

const SPEED_OF_SOUND = 34.3; // cm / ms

export default function AppMainScreen() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'landing' | 'studio'>('landing');

  // Multi-Car & Hardware Setup State
  const [selectedCarIdx, setSelectedCarIdx] = useState<number>(0);
  const [selectedHeadUnitIdx, setSelectedHeadUnitIdx] = useState<number>(0);
  const [selectedSpeakerIdx, setSelectedSpeakerIdx] = useState<number>(0);
  const [selectedSubIdx, setSelectedSubIdx] = useState<number>(0);
  const [soundProfile, setSoundProfile] = useState<'sql' | 'harman' | 'vocal'>('sql');

  // Studio Sub-tab State
  const [studioTab, setStudioTab] = useState<'eq' | 'crossover' | 'time_alignment' | 'gain' | 'tones' | 'export'>('eq');
  const [isPlayingTone, setIsPlayingTone] = useState<string | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<any>(null);
  const oscRef = useRef<any>(null);

  const car = CAR_CATALOG[selectedCarIdx];
  const headUnit = HEAD_UNITS[selectedHeadUnitIdx];
  const speakers = SPEAKER_SETS[selectedSpeakerIdx];
  const sub = SUBWOOFERS[selectedSubIdx];

  // Dynamic Acoustic Calculations
  const maxDistance = Math.max(...Object.values(car.distances_rhd));
  const delaysMs = {
    FR: +((maxDistance - car.distances_rhd.FR) / SPEED_OF_SOUND).toFixed(2),
    RR: +((maxDistance - car.distances_rhd.RR) / SPEED_OF_SOUND).toFixed(2),
    FL: +((maxDistance - car.distances_rhd.FL) / SPEED_OF_SOUND).toFixed(2),
    RL: +((maxDistance - car.distances_rhd.RL) / SPEED_OF_SOUND).toFixed(2),
    SUB: +((maxDistance - car.distances_rhd.SUB) / SPEED_OF_SOUND).toFixed(2)
  };

  const frontHpf = speakers.hpf;
  const rearHpf = speakers.hpf + 10;
  const subLpf = 80;
  const subsonicHz = sub.type === 'ported' ? Math.max(20, sub.tune - 7) : 20;

  // DMM Target Voltages: V = sqrt(P * R)
  const vFront = +(Math.sqrt(speakers.rms * speakers.ohms)).toFixed(2);
  const vRear = +(Math.sqrt(speakers.rms * 0.6 * speakers.ohms)).toFixed(2);
  const vSub = +(Math.sqrt(sub.rms * sub.ohms)).toFixed(2);

  // Dynamic EQ Targets
  const eqBands = [
    { freq: 32, label: '32Hz', gain: soundProfile === 'sql' ? 4.0 : soundProfile === 'harman' ? 3.0 : 1.0 },
    { freq: 63, label: '63Hz', gain: soundProfile === 'sql' ? 5.5 : soundProfile === 'harman' ? 3.0 : 1.0 },
    { freq: 100, label: '100Hz', gain: soundProfile === 'sql' ? 2.0 : soundProfile === 'harman' ? 1.5 : 0.0 },
    { freq: 200, label: '200Hz', gain: soundProfile === 'sql' ? -1.5 : soundProfile === 'harman' ? -1.0 : -2.0 },
    { freq: 400, label: '400Hz', gain: 0.0 },
    { freq: 630, label: '630Hz', gain: soundProfile === 'vocal' ? 1.0 : 0.0 },
    { freq: 1000, label: '1kHz', gain: soundProfile === 'vocal' ? 2.0 : 0.5 },
    { freq: 2000, label: '2kHz', gain: soundProfile === 'vocal' ? 1.5 : 1.0 },
    { freq: 4000, label: '4kHz', gain: -1.0 },
    { freq: 8000, label: '8kHz', gain: 1.5 },
    { freq: 10000, label: '10kHz', gain: 1.5 },
    { freq: 12000, label: '12kHz', gain: 2.0 },
    { freq: 14000, label: '14kHz', gain: 1.5 },
    { freq: 16000, label: '16kHz', gain: 1.5 }
  ];

  const playTone = (type: string, freq?: number) => {
    if (Platform.OS !== 'web') {
      alert(`Playing ${type} tone. Use in-car Bluetooth.`);
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

      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

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
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
      }
      setIsPlayingTone(type);
    } catch (e) {
      console.log(e);
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#030712" />

      {/* Top Navbar */}
      <View style={styles.navBar}>
        <View style={styles.logoRow}>
          <View style={styles.logoDot} />
          <Text style={styles.logoText}>CarAudio<Text style={styles.logoHighlight}>AI</Text></Text>
          <View style={styles.navBadge}><Text style={styles.navBadgeText}>PRO DSP</Text></View>
        </View>
        <View style={styles.navLinks}>
          <TouchableOpacity
            style={[styles.navBtn, currentView === 'landing' && styles.navBtnActive]}
            onPress={() => setCurrentView('landing')}
          >
            <Text style={[styles.navBtnText, currentView === 'landing' && styles.navBtnTextActive]}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, currentView === 'studio' && styles.navBtnActive]}
            onPress={() => setCurrentView('studio')}
          >
            <Text style={[styles.navBtnText, currentView === 'studio' && styles.navBtnTextActive]}>Tuning Studio 🎛️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* ========================================================================= */}
        {/* VIEW 1: LUXURY HIGH-CONVERTING LANDING PAGE                               */}
        {/* ========================================================================= */}
        {currentView === 'landing' && (
          <View style={styles.landingContent}>

            {/* HERO SECTION */}
            <View style={styles.heroSection}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>⚡ AI-POWERED CAR ACOUSTIC ENGINE • INDIA</Text>
              </View>
              <Text style={styles.heroHeadline}>
                Turn Your Car Into A <Text style={styles.gradientText}>Concert Hall</Text> on Wheels.
              </Text>
              <Text style={styles.heroSubhead}>
                Stop wasting ₹20,000 on professional audio installers. Our AI calculates millimeter-accurate time alignment, 14-band parametric EQ, and crossover slopes for any car in 60 seconds.
              </Text>

              <View style={styles.heroCtaRow}>
                <TouchableOpacity style={styles.ctaPrimary} onPress={() => setCurrentView('studio')}>
                  <Text style={styles.ctaPrimaryText}>Launch Studio & Tune My Car →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ctaSecondary}
                  onPress={() => Linking.openURL('https://github.com/adityashm/CarAudioAI')}
                >
                  <Text style={styles.ctaSecondaryText}>⭐ Star on GitHub</Text>
                </TouchableOpacity>
              </View>

              {/* STATS STRIP */}
              <View style={styles.statsStrip}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>100+</Text>
                  <Text style={styles.statLabel}>Indian Car Models</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>0 ms</Text>
                  <Text style={styles.statLabel}>Phase Delay Target</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>₹99</Text>
                  <Text style={styles.statLabel}>vs ₹15,000 Tuning Rig</Text>
                </View>
              </View>
            </View>

            {/* BEFORE / AFTER ACOUSTIC COMPARISON */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTag}>ACOUSTIC COMPARISON</Text>
              <Text style={styles.sectionTitle}>Why Untuned Car Audio Sounds Muddy</Text>

              <View style={styles.comparisonGrid}>
                <View style={styles.comparisonCardBad}>
                  <Text style={styles.cardHeaderBad}>❌ Stock / Untuned Setup</Text>
                  <Text style={styles.cardItemBad}>• Soundstage collapsed down in the right door</Text>
                  <Text style={styles.cardItemBad}>• 200Hz cabin resonance makes bass muddy</Text>
                  <Text style={styles.cardItemBad}>• Windshield reflections cause ear fatigue at 4kHz</Text>
                  <Text style={styles.cardItemBad}>• Ported subwoofer bottoming out below 30Hz</Text>
                </View>

                <View style={styles.comparisonCardGood}>
                  <Text style={styles.cardHeaderGood}>✅ CarAudioAI Calibrated</Text>
                  <Text style={styles.cardItemGood}>• Soundstage lifted dead-center onto windshield</Text>
                  <Text style={styles.cardItemGood}>• Tight, punchy 63Hz 808s and kick drums</Text>
                  <Text style={styles.cardItemGood}>• Fatigue-free, crystal clear vocal imaging</Text>
                  <Text style={styles.cardItemGood}>• 28Hz Subsonic filter protecting your sub</Text>
                </View>
              </View>
            </View>

            {/* BENTO GRID: KEY FEATURES */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTag}>CORE ARCHITECTURE</Text>
              <Text style={styles.sectionTitle}>Precision Acoustic Engineering</Text>

              <View style={styles.bentoGrid}>
                <View style={styles.bentoCard}>
                  <Text style={styles.bentoIcon}>⏱️</Text>
                  <Text style={styles.bentoTitle}>Time Alignment Matrix</Text>
                  <Text style={styles.bentoDesc}>
                    Calculates distance differences from driver ears to all 5 speakers (FL, FR, RL, RR, SUB) down to 0.01 milliseconds.
                  </Text>
                </View>

                <View style={styles.bentoCard}>
                  <Text style={styles.bentoIcon}>🎛️</Text>
                  <Text style={styles.bentoTitle}>14-Band Parametric EQ</Text>
                  <Text style={styles.bentoDesc}>
                    Generates exact decibel offsets directly matching Nakamichi, Pioneer, Sony, and Android head unit sliders.
                  </Text>
                </View>

                <View style={styles.bentoCard}>
                  <Text style={styles.bentoIcon}>🛡️</Text>
                  <Text style={styles.bentoTitle}>Ported Box Subsonic Protection</Text>
                  <Text style={styles.bentoDesc}>
                    Prevents mechanical cone unloading by calculating safe high-pass cutoffs based on your exact port tuning frequency.
                  </Text>
                </View>

                <View style={styles.bentoCard}>
                  <Text style={styles.bentoIcon}>⚡</Text>
                  <Text style={styles.bentoTitle}>Multimeter Gain Staging</Text>
                  <Text style={styles.bentoDesc}>
                    Converts speaker RMS ratings and impedance into precise target AC voltages (13.4V, 44.7V) for zero-clipping power.
                  </Text>
                </View>
              </View>
            </View>

            {/* PRICING PLANS */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTag}>TRANSPARENT PRICING</Text>
              <Text style={styles.sectionTitle}>Professional Tuning for the Price of a Coffee</Text>

              <View style={styles.pricingGrid}>
                <View style={styles.pricingCard}>
                  <Text style={styles.planName}>Free Starter</Text>
                  <Text style={styles.planPrice}>₹0</Text>
                  <Text style={styles.planDesc}>For casual car owners testing basic EQ</Text>
                  <View style={styles.planDivider} />
                  <Text style={styles.planFeature}>✓ 1 Car Profile</Text>
                  <Text style={styles.planFeature}>✓ Standard 14-Band EQ Presets</Text>
                  <Text style={styles.planFeature}>✓ In-Browser Pink Noise Generator</Text>
                  <TouchableOpacity style={styles.planBtnSecondary} onPress={() => setCurrentView('studio')}>
                    <Text style={styles.planBtnTextSecondary}>Get Started</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.pricingCard, styles.pricingCardFeatured]}>
                  <View style={styles.featuredBadge}><Text style={styles.featuredBadgeText}>POPULAR</Text></View>
                  <Text style={styles.planName}>Pro Enthusiast</Text>
                  <Text style={styles.planPrice}>₹99<Text style={styles.pricePer}> / month</Text></Text>
                  <Text style={styles.planDesc}>Complete acoustic calibration suite</Text>
                  <View style={styles.planDivider} />
                  <Text style={styles.planFeature}>✓ Unlimited Cars & Hardware Sets</Text>
                  <Text style={styles.planFeature}>✓ Millimeter Time Alignment Delays</Text>
                  <Text style={styles.planFeature}>✓ Crossover & Subsonic Protection</Text>
                  <Text style={styles.planFeature}>✓ Multimeter AC Voltage Calculator</Text>
                  <Text style={styles.planFeature}>✓ Direct DSP Export (Pioneer XML / MiniDSP)</Text>
                  <TouchableOpacity style={styles.planBtnPrimary} onPress={() => setCurrentView('studio')}>
                    <Text style={styles.planBtnTextPrimary}>Start Pro Tuning →</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.pricingCard}>
                  <Text style={styles.planName}>Installer Pro</Text>
                  <Text style={styles.planPrice}>₹999<Text style={styles.pricePer}> / year</Text></Text>
                  <Text style={styles.planDesc}>For audio accessory shops & garages</Text>
                  <View style={styles.planDivider} />
                  <Text style={styles.planFeature}>✓ Everything in Pro</Text>
                  <Text style={styles.planFeature}>✓ Multi-Customer Car Profiler</Text>
                  <Text style={styles.planFeature}>✓ WhatsApp Tuning Reports</Text>
                  <Text style={styles.planFeature}>✓ Commercial Workshop License</Text>
                  <TouchableOpacity style={styles.planBtnSecondary} onPress={() => setCurrentView('studio')}>
                    <Text style={styles.planBtnTextSecondary}>Subscribe Yearly</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* CALL TO ACTION BANNER */}
            <View style={styles.ctaBanner}>
              <Text style={styles.ctaBannerTitle}>Ready to hear the difference in your car?</Text>
              <Text style={styles.ctaBannerSubtitle}>Select your car model, enter your gear, and get instant calibration values.</Text>
              <TouchableOpacity style={styles.ctaBannerBtn} onPress={() => setCurrentView('studio')}>
                <Text style={styles.ctaBannerBtnText}>Open Tuning Studio Now 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: MULTI-CAR & MULTI-SETUP TUNING STUDIO                             */}
        {/* ========================================================================= */}
        {currentView === 'studio' && (
          <View style={styles.studioContent}>

            {/* VEHICLE SELECTOR CAROUSEL */}
            <View style={styles.studioCard}>
              <View style={styles.studioCardHeaderRow}>
                <Text style={styles.studioSectionTitle}>🚗 Select Vehicle ({car.make} {car.model})</Text>
                <View style={styles.chip}><Text style={styles.chipText}>{car.category}</Text></View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carScroll}>
                {CAR_CATALOG.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.carCardBtn, selectedCarIdx === idx && styles.carCardBtnActive]}
                    onPress={() => setSelectedCarIdx(idx)}
                  >
                    <Text style={[styles.carCardMake, selectedCarIdx === idx && styles.textWhite]}>{item.make}</Text>
                    <Text style={[styles.carCardModel, selectedCarIdx === idx && styles.textCyan]}>{item.model}</Text>
                    <Text style={styles.carCardDim}>Wheelbase: {item.wheelbase}mm</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* AUDIO HARDWARE CONFIGURATOR */}
            <View style={styles.studioCard}>
              <Text style={styles.studioSectionTitle}>🎛️ Audio Equipment Configurator</Text>

              {/* Head Unit */}
              <Text style={styles.configLabel}>1. Head Unit / Infotainment:</Text>
              <View style={styles.configOptionGrid}>
                {HEAD_UNITS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.configOptionBtn, selectedHeadUnitIdx === idx && styles.configOptionBtnActive]}
                    onPress={() => setSelectedHeadUnitIdx(idx)}
                  >
                    <Text style={[styles.configOptionText, selectedHeadUnitIdx === idx && styles.textWhite]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Front Speakers */}
              <Text style={styles.configLabel}>2. Front & Rear Speakers:</Text>
              <View style={styles.configOptionGrid}>
                {SPEAKER_SETS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.configOptionBtn, selectedSpeakerIdx === idx && styles.configOptionBtnActive]}
                    onPress={() => setSelectedSpeakerIdx(idx)}
                  >
                    <Text style={[styles.configOptionText, selectedSpeakerIdx === idx && styles.textWhite]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Subwoofer */}
              <Text style={styles.configLabel}>3. Subwoofer & Enclosure:</Text>
              <View style={styles.configOptionGrid}>
                {SUBWOOFERS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.configOptionBtn, selectedSubIdx === idx && styles.configOptionBtnActive]}
                    onPress={() => setSelectedSubIdx(idx)}
                  >
                    <Text style={[styles.configOptionText, selectedSubIdx === idx && styles.textWhite]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* SOUND TARGET PROFILE TABS */}
            <View style={styles.studioCard}>
              <Text style={styles.studioSectionTitle}>🎯 Sound Target Profile</Text>
              <View style={styles.soundProfileRow}>
                {[
                  { id: 'sql', label: '🔥 SQL (Punjabi/EDM/Hip-Hop)', desc: 'High impact sub-bass + crisp transparent vocals' },
                  { id: 'harman', label: '🎵 Harman Reference', desc: 'Linear in-cabin acoustic balance' },
                  { id: 'vocal', label: '🎙️ Vocal Clarity', desc: 'Enhanced intelligibility for podcasts & acoustic' }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.soundProfileBtn, soundProfile === item.id && styles.soundProfileBtnActive]}
                    onPress={() => setSoundProfile(item.id as any)}
                  >
                    <Text style={[styles.soundProfileTitle, soundProfile === item.id && styles.textBlack]}>{item.label}</Text>
                    <Text style={[styles.soundProfileDesc, soundProfile === item.id && styles.textBlack]}>{item.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* STUDIO NAVIGATION TABS */}
            <View style={styles.studioNavTabs}>
              {[
                { id: 'eq', label: '🎚️ Graphic EQ' },
                { id: 'crossover', label: '🎛️ Crossovers' },
                { id: 'time_alignment', label: '⏱️ Time Align' },
                { id: 'gain', label: '⚡ Gain Staging' },
                { id: 'tones', label: '🔊 Test Tones' },
                { id: 'export', label: '📤 Export DSP' }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.studioNavTabBtn, studioTab === tab.id && styles.studioNavTabBtnActive]}
                  onPress={() => setStudioTab(tab.id as any)}
                >
                  <Text style={[styles.studioNavTabText, studioTab === tab.id && styles.studioNavTabTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* TAB: GRAPHIC EQ */}
            {studioTab === 'eq' && (
              <View style={styles.studioCard}>
                <Text style={styles.studioSectionTitle}>🎚️ 14-Band Head Unit Equalizer ({headUnit.name})</Text>
                <Text style={styles.studioSubNote}>
                  Live values dynamically computed for {car.make} {car.model} with {soundProfile.toUpperCase()} target:
                </Text>

                <View style={styles.eqGrid}>
                  {eqBands.map((b) => {
                    const isBoost = b.gain > 0;
                    const isCut = b.gain < 0;
                    return (
                      <View key={b.freq} style={styles.eqCol}>
                        <View style={styles.eqTrack}>
                          <View
                            style={[
                              styles.eqBar,
                              {
                                height: `${Math.abs(b.gain) * 7 + 10}%`,
                                backgroundColor: isBoost ? '#06b6d4' : isCut ? '#ef4444' : '#64748b',
                                bottom: isCut ? undefined : '50%',
                                top: isCut ? '50%' : undefined
                              }
                            ]}
                          />
                          <View style={styles.eqZeroLine} />
                        </View>
                        <Text style={[styles.eqGainText, isBoost && styles.textCyan, isCut && styles.textRed]}>
                          {b.gain > 0 ? `+${b.gain}` : b.gain}
                        </Text>
                        <Text style={styles.eqFreqText}>{b.label}</Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.highlightBox}>
                  <Text style={styles.highlightBoxTitle}>💡 Acoustic Offsets Applied:</Text>
                  <Text style={styles.highlightBoxLine}>• <Text style={styles.boldWhite}>+5.5 dB @ 63Hz</Text>: 35Hz ported kick drum resonance boost.</Text>
                  <Text style={styles.highlightBoxLine}>• <Text style={styles.boldWhite}>-1.5 dB @ 200Hz</Text>: Eliminates {car.category} cabin boom.</Text>
                  <Text style={styles.highlightBoxLine}>• <Text style={styles.boldWhite}>-1.0 dB @ 4kHz</Text>: Tames windshield glass reflections.</Text>
                </View>
              </View>
            )}

            {/* TAB: CROSSOVERS */}
            {studioTab === 'crossover' && (
              <View style={styles.studioCard}>
                <Text style={styles.studioSectionTitle}>🎛️ Amplifier Crossover & Subsonic Protection</Text>

                <View style={styles.dialCard}>
                  <Text style={styles.dialTitle}>Front Speakers ({speakers.name})</Text>
                  <Text style={styles.dialValue}>HPF (High Pass): ~{frontHpf} Hz</Text>
                  <Text style={styles.dialPosition}>Clock Position: Approx. 9:30 o'clock</Text>
                  <Text style={styles.dialNote}>Protects 6.5" woofers from over-excursion and cleans vocal midrange.</Text>
                </View>

                <View style={styles.dialCard}>
                  <Text style={styles.dialTitle}>Rear Speakers (Attenuated Rear Fill)</Text>
                  <Text style={styles.dialValue}>HPF (High Pass): ~{rearHpf} Hz</Text>
                  <Text style={styles.dialPosition}>Clock Position: Approx. 10:00 o'clock</Text>
                  <Text style={styles.dialNote}>Attenuated (-4dB) ambient fill so soundstage stays focused on front dash.</Text>
                </View>

                <View style={[styles.dialCard, styles.dialCardAlert]}>
                  <Text style={[styles.dialTitle, { color: '#f59e0b' }]}>Subwoofer ({sub.name})</Text>
                  <Text style={styles.dialValue}>LPF (Low Pass): ~{subLpf} Hz</Text>
                  <Text style={styles.dialValue}>Subsonic Filter: ~{subsonicHz} Hz</Text>
                  {sub.type === 'ported' && (
                    <Text style={styles.subsonicAlert}>
                      ⚠️ PORT PROTECTION: Below {sub.tune}Hz, air spring collapses and woofer will bottom out. {subsonicHz}Hz subsonic cutoff protects voice coil.
                    </Text>
                  )}
                  <Text style={styles.dialNote}>Bass Boost: MUST BE SET TO 0 dB (OFF).</Text>
                </View>
              </View>
            )}

            {/* TAB: TIME ALIGNMENT */}
            {studioTab === 'time_alignment' && (
              <View style={styles.studioCard}>
                <Text style={styles.studioSectionTitle}>⏱️ Driver-Seat Time Alignment ({car.make} {car.model})</Text>
                <Text style={styles.studioSubNote}>Delays sound from closer speakers so all waves hit your ears simultaneously:</Text>

                <View style={styles.taTable}>
                  <View style={styles.taTableHeader}>
                    <Text style={styles.taTh}>Channel</Text>
                    <Text style={styles.taTh}>Distance</Text>
                    <Text style={styles.taTh}>Delay</Text>
                    <Text style={styles.taTh}>Offset</Text>
                  </View>
                  {[
                    { name: 'Front Right (FR)', dist: `${car.distances_rhd.FR} cm`, delay: `${delaysMs.FR} ms`, offset: `${maxDistance - car.distances_rhd.FR} cm` },
                    { name: 'Rear Right (RR)', dist: `${car.distances_rhd.RR} cm`, delay: `${delaysMs.RR} ms`, offset: `${maxDistance - car.distances_rhd.RR} cm` },
                    { name: 'Front Left (FL)', dist: `${car.distances_rhd.FL} cm`, delay: `${delaysMs.FL} ms`, offset: `${maxDistance - car.distances_rhd.FL} cm` },
                    { name: 'Rear Left (RL)', dist: `${car.distances_rhd.RL} cm`, delay: `${delaysMs.RL} ms`, offset: `${maxDistance - car.distances_rhd.RL} cm` },
                    { name: 'Boot Subwoofer', dist: `${car.distances_rhd.SUB} cm`, delay: '0.00 ms (Ref)', offset: '0 cm' },
                  ].map((row, i) => (
                    <View key={i} style={[styles.taTableRow, i % 2 === 1 && styles.taTableRowAlt]}>
                      <Text style={styles.taTdName}>{row.name}</Text>
                      <Text style={styles.taTd}>{row.dist}</Text>
                      <Text style={styles.taTdHighlight}>{row.delay}</Text>
                      <Text style={styles.taTd}>{row.offset}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB: GAIN STAGING */}
            {studioTab === 'gain' && (
              <View style={styles.studioCard}>
                <Text style={styles.studioSectionTitle}>⚡ Multimeter Target AC Voltages</Text>
                <Text style={styles.studioSubNote}>
                  Set {headUnit.name} Volume to 75% (Vol 30/40) and EQ Flat before probing amplifier terminals:
                </Text>

                <View style={styles.gainRowGrid}>
                  <View style={styles.gainCol}>
                    <Text style={styles.gainTitle}>Front Channels (CH1/2)</Text>
                    <Text style={styles.gainVoltage}>{vFront} V AC</Text>
                    <Text style={styles.gainTone}>Tone: 1 kHz 0dB Sine</Text>
                  </View>

                  <View style={styles.gainCol}>
                    <Text style={styles.gainTitle}>Rear Channels (CH3/4)</Text>
                    <Text style={styles.gainVoltage}>{vRear} V AC</Text>
                    <Text style={styles.gainTone}>Tone: 1 kHz 0dB Sine</Text>
                  </View>

                  <View style={styles.gainCol}>
                    <Text style={styles.gainTitle}>Subwoofer Channel</Text>
                    <Text style={styles.gainVoltage}>{vSub} V AC</Text>
                    <Text style={styles.gainTone}>Tone: 50 Hz 0dB Sine</Text>
                  </View>
                </View>
              </View>
            )}

            {/* TAB: TEST TONES */}
            {studioTab === 'tones' && (
              <View style={styles.studioCard}>
                <Text style={styles.studioSectionTitle}>🔊 In-Browser Audio Tone Generator</Text>
                <Text style={styles.studioSubNote}>Play precision sine waves and pink noise through your car speakers:</Text>

                <View style={styles.toneButtonGrid}>
                  <TouchableOpacity
                    style={[styles.toneActionBtn, isPlayingTone === '1000' && styles.toneActionBtnActive]}
                    onPress={() => playTone('1000', 1000)}
                  >
                    <Text style={styles.toneActionTitle}>1,000 Hz (1 kHz) Sine</Text>
                    <Text style={styles.toneActionSub}>For setting Front/Rear speaker amplifier gains</Text>
                    <Text style={styles.toneActionStatus}>{isPlayingTone === '1000' ? '⏹️ STOPPING' : '▶️ PLAY 1 kHz'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toneActionBtn, isPlayingTone === '50' && styles.toneActionBtnActive]}
                    onPress={() => playTone('50', 50)}
                  >
                    <Text style={styles.toneActionTitle}>50 Hz Sine Wave</Text>
                    <Text style={styles.toneActionSub}>For setting Subwoofer amplifier gain</Text>
                    <Text style={styles.toneActionStatus}>{isPlayingTone === '50' ? '⏹️ STOPPING' : '▶️ PLAY 50 Hz'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toneActionBtn, isPlayingTone === 'pink' && styles.toneActionBtnActive]}
                    onPress={() => playTone('pink')}
                  >
                    <Text style={styles.toneActionTitle}>Pink Noise</Text>
                    <Text style={styles.toneActionSub}>Full-spectrum acoustic RTA measurement tone</Text>
                    <Text style={styles.toneActionStatus}>{isPlayingTone === 'pink' ? '⏹️ STOPPING' : '▶️ PLAY NOISE'}</Text>
                  </TouchableOpacity>
                </View>

                {isPlayingTone && (
                  <TouchableOpacity style={styles.stopToneBtn} onPress={stopTone}>
                    <Text style={styles.stopToneBtnText}>⏹️ STOP ALL AUDIO PLAYBACK</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* TAB: DSP EXPORT */}
            {studioTab === 'export' && (
              <View style={styles.studioCard}>
                <Text style={styles.studioSectionTitle}>📤 Export Ready-to-Flash DSP Config Files</Text>

                <View style={styles.exportCard}>
                  <Text style={styles.exportTitle}>Pioneer DEH-80PRS XML</Text>
                  <Text style={styles.exportSnippet}>
                    {`<PioneerDSPConfig version="1.0">\n  <Car>${car.make} ${car.model}</Car>\n  <TimeAlignment FR="${delaysMs.FR}ms" FL="${delaysMs.FL}ms" SUB="0ms"/>\n  <Crossover HPF="${frontHpf}Hz" LPF="${subLpf}Hz" Subsonic="${subsonicHz}Hz"/>\n</PioneerDSPConfig>`}
                  </Text>
                </View>

                <View style={styles.exportCard}>
                  <Text style={styles.exportTitle}>MiniDSP 2x4 HD / C-DSP JSON</Text>
                  <Text style={styles.exportSnippet}>
                    {`{\n  "vehicle": "${car.make} ${car.model}",\n  "delays_ms": { "FR": ${delaysMs.FR}, "FL": ${delaysMs.FL}, "SUB": 0 },\n  "crossover": { "front_hpf": ${frontHpf}, "sub_lpf": ${subLpf} }\n}`}
                  </Text>
                </View>
              </View>
            )}

          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CarAudioAI • Built with ❤️ for the Indian Car Audio Community</Text>
          <Text style={styles.footerSub}>Open Source on GitHub (adityashm/CarAudioAI)</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#030712'
  },
  scrollContainer: {
    paddingBottom: 60
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#030712',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#06b6d4'
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  logoHighlight: {
    color: '#06b6d4'
  },
  navBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4
  },
  navBadgeText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: 'bold'
  },
  navLinks: {
    flexDirection: 'row',
    gap: 8
  },
  navBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  navBtnActive: {
    backgroundColor: '#1e293b'
  },
  navBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600'
  },
  navBtnTextActive: {
    color: '#ffffff'
  },
  landingContent: {
    paddingHorizontal: 20,
    paddingTop: 30
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40
  },
  heroBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: '#06b6d4',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16
  },
  heroBadgeText: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  heroHeadline: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16
  },
  gradientText: {
    color: '#06b6d4'
  },
  heroSubhead: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 600,
    marginBottom: 24
  },
  heroCtaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30
  },
  ctaPrimary: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8
  },
  ctaPrimaryText: {
    color: '#030712',
    fontSize: 14,
    fontWeight: 'bold'
  },
  ctaSecondary: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8
  },
  ctaSecondaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 650
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    color: '#06b6d4',
    fontSize: 22,
    fontWeight: 'bold'
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#1e293b'
  },
  sectionContainer: {
    marginBottom: 40
  },
  sectionTag: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 4
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16
  },
  comparisonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14
  },
  comparisonCardBad: {
    flex: 1,
    minWidth: 280,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 16
  },
  cardHeaderBad: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10
  },
  cardItemBad: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 6
  },
  comparisonCardGood: {
    flex: 1,
    minWidth: 280,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 16
  },
  cardHeaderGood: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10
  },
  cardItemGood: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 6
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14
  },
  bentoCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 18
  },
  bentoIcon: {
    fontSize: 26,
    marginBottom: 8
  },
  bentoTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6
  },
  bentoDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14
  },
  pricingCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 20
  },
  pricingCardFeatured: {
    borderColor: '#06b6d4',
    backgroundColor: '#0b192c'
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 10
  },
  featuredBadgeText: {
    color: '#030712',
    fontSize: 9,
    fontWeight: 'bold'
  },
  planName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  planPrice: {
    color: '#06b6d4',
    fontSize: 28,
    fontWeight: '900',
    marginVertical: 6
  },
  pricePer: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: 'normal'
  },
  planDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12
  },
  planDivider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginBottom: 12
  },
  planFeature: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 22
  },
  planBtnPrimary: {
    backgroundColor: '#06b6d4',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 18
  },
  planBtnTextPrimary: {
    color: '#030712',
    fontWeight: 'bold',
    fontSize: 13
  },
  planBtnSecondary: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 18
  },
  planBtnTextSecondary: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13
  },
  ctaBanner: {
    backgroundColor: '#0b192c',
    borderWidth: 1,
    borderColor: '#06b6d4',
    borderRadius: 16,
    padding: 26,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 20
  },
  ctaBannerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6
  },
  ctaBannerSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 500,
    marginBottom: 16
  },
  ctaBannerBtn: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  ctaBannerBtnText: {
    color: '#030712',
    fontSize: 14,
    fontWeight: 'bold'
  },

  // STUDIO STYLES
  studioContent: {
    paddingHorizontal: 16,
    paddingTop: 16
  },
  studioCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  studioCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  studioSectionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold'
  },
  studioSubNote: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 14
  },
  chip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  chipText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: 'bold'
  },
  carScroll: {
    flexDirection: 'row'
  },
  carCardBtn: {
    backgroundColor: '#0b1322',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    minWidth: 130
  },
  carCardBtnActive: {
    borderColor: '#06b6d4',
    backgroundColor: '#092137'
  },
  carCardMake: {
    color: '#94a3b8',
    fontSize: 11
  },
  carCardModel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginVertical: 2
  },
  carCardDim: {
    color: '#64748b',
    fontSize: 9
  },
  configLabel: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6
  },
  configOptionGrid: {
    gap: 6
  },
  configOptionBtn: {
    backgroundColor: '#131d2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  configOptionBtnActive: {
    borderColor: '#06b6d4',
    backgroundColor: '#08253a'
  },
  configOptionText: {
    color: '#94a3b8',
    fontSize: 11
  },
  soundProfileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  soundProfileBtn: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#131d2e',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  soundProfileBtnActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4'
  },
  soundProfileTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2
  },
  soundProfileDesc: {
    color: '#94a3b8',
    fontSize: 10
  },
  studioNavTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16
  },
  studioNavTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  studioNavTabBtnActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4'
  },
  studioNavTabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  studioNavTabTextActive: {
    color: '#030712',
    fontWeight: 'bold'
  },
  eqGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#030712',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  eqCol: {
    alignItems: 'center',
    flex: 1
  },
  eqTrack: {
    width: 6,
    height: 80,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 4
  },
  eqBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 3
  },
  eqZeroLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: '#475569'
  },
  eqGainText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#cbd5e1'
  },
  eqFreqText: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2
  },
  highlightBox: {
    marginTop: 12,
    backgroundColor: '#131d2e',
    padding: 12,
    borderRadius: 8
  },
  highlightBoxTitle: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4
  },
  highlightBoxLine: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 17
  },
  boldWhite: {
    color: '#ffffff',
    fontWeight: 'bold'
  },
  dialCard: {
    backgroundColor: '#131d2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  dialCardAlert: {
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b'
  },
  dialTitle: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4
  },
  dialValue: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 14
  },
  dialPosition: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 2
  },
  dialNote: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4
  },
  subsonicAlert: {
    color: '#f59e0b',
    fontSize: 10,
    backgroundColor: '#2b1e06',
    padding: 6,
    borderRadius: 4,
    marginVertical: 4
  },
  taTable: {
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    overflow: 'hidden'
  },
  taTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 8
  },
  taTh: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold'
  },
  taTableRow: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#0f172a'
  },
  taTableRowAlt: {
    backgroundColor: '#131d2e'
  },
  taTdName: {
    flex: 1.2,
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600'
  },
  taTd: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 10
  },
  taTdHighlight: {
    flex: 1,
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold'
  },
  gainRowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  gainCol: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#131d2e',
    padding: 12,
    borderRadius: 8
  },
  gainTitle: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold'
  },
  gainVoltage: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: '900',
    marginVertical: 4
  },
  gainTone: {
    color: '#94a3b8',
    fontSize: 10
  },
  toneButtonGrid: {
    gap: 8
  },
  toneActionBtn: {
    backgroundColor: '#131d2e',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  toneActionBtnActive: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981'
  },
  toneActionTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13
  },
  toneActionSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2
  },
  toneActionStatus: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 6
  },
  stopToneBtn: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  stopToneBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12
  },
  exportCard: {
    backgroundColor: '#030712',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10
  },
  exportTitle: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 6
  },
  exportSnippet: {
    color: '#cbd5e1',
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 15
  },
  textWhite: { color: '#ffffff' },
  textCyan: { color: '#06b6d4' },
  textRed: { color: '#ef4444' },
  textBlack: { color: '#030712' },
  footer: {
    marginTop: 30,
    alignItems: 'center'
  },
  footerText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600'
  },
  footerSub: {
    color: '#475569',
    fontSize: 10,
    marginTop: 2
  }
});
