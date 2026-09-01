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
  Linking,
  Image
} from 'react-native';

// --- DATASETS FOR MULTI-CAR & MULTI-EQUIPMENT ENGINE ---
interface CarModel {
  make: string;
  model: string;
  category: string;
  wheelbase: number;
  distances_rhd: { FL: number; FR: number; RL: number; RR: number; SUB: number };
  cabinCoords: {
    driver: { x: number; y: number };
    FL: { x: number; y: number };
    FR: { x: number; y: number };
    RL: { x: number; y: number };
    RR: { x: number; y: number };
    SUB: { x: number; y: number };
  };
}

const CAR_CATALOG: CarModel[] = [
  {
    make: 'Skoda',
    model: 'Kylaq (2025)',
    category: 'Compact SUV',
    wheelbase: 2566,
    distances_rhd: { FL: 138, FR: 95, RL: 155, RR: 115, SUB: 210 },
    cabinCoords: {
      driver: { x: 0.65, y: 0.42 },
      FL: { x: 0.22, y: 0.35 },
      FR: { x: 0.78, y: 0.35 },
      RL: { x: 0.22, y: 0.68 },
      RR: { x: 0.78, y: 0.68 },
      SUB: { x: 0.50, y: 0.90 }
    }
  },
  {
    make: 'Maruti Suzuki',
    model: 'Swift (2024)',
    category: 'Hatchback',
    wheelbase: 2450,
    distances_rhd: { FL: 130, FR: 88, RL: 145, RR: 105, SUB: 190 },
    cabinCoords: {
      driver: { x: 0.65, y: 0.40 },
      FL: { x: 0.22, y: 0.33 },
      FR: { x: 0.78, y: 0.33 },
      RL: { x: 0.22, y: 0.65 },
      RR: { x: 0.78, y: 0.65 },
      SUB: { x: 0.50, y: 0.88 }
    }
  },
  {
    make: 'Hyundai',
    model: 'Creta (2024)',
    category: 'Midsize SUV',
    wheelbase: 2610,
    distances_rhd: { FL: 142, FR: 98, RL: 160, RR: 120, SUB: 220 },
    cabinCoords: {
      driver: { x: 0.65, y: 0.42 },
      FL: { x: 0.22, y: 0.36 },
      FR: { x: 0.78, y: 0.36 },
      RL: { x: 0.22, y: 0.70 },
      RR: { x: 0.78, y: 0.70 },
      SUB: { x: 0.50, y: 0.92 }
    }
  },
  {
    make: 'Tata',
    model: 'Nexon (2024)',
    category: 'Compact SUV',
    wheelbase: 2498,
    distances_rhd: { FL: 136, FR: 92, RL: 150, RR: 110, SUB: 205 },
    cabinCoords: {
      driver: { x: 0.65, y: 0.41 },
      FL: { x: 0.22, y: 0.35 },
      FR: { x: 0.78, y: 0.35 },
      RL: { x: 0.22, y: 0.68 },
      RR: { x: 0.78, y: 0.68 },
      SUB: { x: 0.50, y: 0.90 }
    }
  },
  {
    make: 'Mahindra',
    model: 'Thar 4x4',
    category: 'Off-Road SUV',
    wheelbase: 2450,
    distances_rhd: { FL: 128, FR: 85, RL: 140, RR: 100, SUB: 180 },
    cabinCoords: {
      driver: { x: 0.65, y: 0.40 },
      FL: { x: 0.22, y: 0.34 },
      FR: { x: 0.78, y: 0.34 },
      RL: { x: 0.22, y: 0.65 },
      RR: { x: 0.78, y: 0.65 },
      SUB: { x: 0.50, y: 0.86 }
    }
  },
  {
    make: 'Toyota',
    model: 'Fortuner',
    category: 'Full-Size SUV',
    wheelbase: 2745,
    distances_rhd: { FL: 155, FR: 105, RL: 180, RR: 135, SUB: 250 },
    cabinCoords: {
      driver: { x: 0.65, y: 0.44 },
      FL: { x: 0.22, y: 0.38 },
      FR: { x: 0.78, y: 0.38 },
      RL: { x: 0.22, y: 0.72 },
      RR: { x: 0.78, y: 0.72 },
      SUB: { x: 0.50, y: 0.94 }
    }
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

const EQ_FREQUENCIES = [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000];

// CINEMATIC STORYBOARD SHOTS
const STORYBOARD_SHOTS = [
  {
    id: 0,
    tag: 'SHOT 01 // EXTERIOR REVEAL',
    title: 'The Dark Garage Reveal',
    desc: 'Volumetric studio lights sweep over the sculpted body lines of the Skoda Kylaq.',
    image: require('@/assets/images/shot1_exterior.jpg'),
    hudState: 'ACOUSTIC SCAN: INITIALIZING'
  },
  {
    id: 1,
    tag: 'SHOT 02 // COCKPIT INGRESS',
    title: 'Door Opens & Ingress',
    desc: 'The door glides open revealing ambient cyan & purple LED cockpit illumination.',
    image: require('@/assets/images/shot2_door_open.jpg'),
    hudState: 'CABIN GEOMETRY: 2566mm DETECTED'
  },
  {
    id: 2,
    tag: 'SHOT 03 // TOUCHSCREEN HUD',
    title: '14-Band Parametric EQ Screen',
    desc: 'Close-up zoom on the Nakamichi head unit displaying active DSP parametric filters.',
    image: require('@/assets/images/shot3_touchscreen.jpg'),
    hudState: 'DSP TARGET: SQL 63Hz BOOST'
  },
  {
    id: 3,
    tag: 'SHOT 04 // HOLOGRAPHIC SOUNDWAVES',
    title: 'Acoustic Soundstage Lock',
    desc: 'Holographic soundwave rings pulse through cabin air, snapping directly to the driver seat.',
    image: require('@/assets/images/shot4_soundwaves.jpg'),
    hudState: 'PHASE COHERENCE: 99.8% LOCKED'
  }
];

export default function AppMainScreen() {
  // Navigation
  const [currentView, setCurrentView] = useState<'landing' | 'studio'>('landing');

  // Cinematic Video Player State
  const [activeShotIdx, setActiveShotIdx] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);

  // Multi-Car & Hardware Setup State
  const [selectedCarIdx, setSelectedCarIdx] = useState<number>(0);
  const [selectedHeadUnitIdx, setSelectedHeadUnitIdx] = useState<number>(0);
  const [selectedSpeakerIdx, setSelectedSpeakerIdx] = useState<number>(0);
  const [selectedSubIdx, setSelectedSubIdx] = useState<number>(0);
  const [soundProfile, setSoundProfile] = useState<'sql' | 'harman' | 'vocal'>('sql');

  // Studio Sub-tab State
  const [studioTab, setStudioTab] = useState<'simulation' | 'eq' | 'crossover' | 'gain' | 'tones' | 'export'>('simulation');
  const [timeAlignmentEnabled, setTimeAlignmentEnabled] = useState<boolean>(true);
  const [isPlayingTone, setIsPlayingTone] = useState<string | null>(null);

  // Audio Context Ref & Canvas Refs
  const audioCtxRef = useRef<any>(null);
  const oscRef = useRef<any>(null);
  const soundfieldCanvasRef = useRef<any>(null);
  const eqCanvasRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Auto-advance cinematic video shots
  useEffect(() => {
    if (!isVideoPlaying) return;
    const interval = setInterval(() => {
      setActiveShotIdx((prev) => (prev + 1) % STORYBOARD_SHOTS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isVideoPlaying]);

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
  const [eqGains, setEqGains] = useState<number[]>([4.0, 5.5, 2.0, -1.5, 0.0, 0.0, 0.5, 1.0, -1.0, 1.5, 1.5, 2.0, 1.5, 1.5]);

  useEffect(() => {
    if (soundProfile === 'sql') {
      setEqGains([4.0, 5.5, 2.0, -1.5, 0.0, 0.0, 0.5, 1.0, -1.0, 1.5, 1.5, 2.0, 1.5, 1.5]);
    } else if (soundProfile === 'harman') {
      setEqGains([3.0, 3.0, 1.5, -1.0, 0.0, 0.0, 0.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.0]);
    } else {
      setEqGains([1.0, 1.0, 0.0, -2.0, 1.0, 1.5, 2.0, 1.5, 0.0, 1.0, 1.0, 1.0, 0.5, 0.5]);
    }
  }, [soundProfile]);

  // -------------------------------------------------------------
  // ANIMATION: REAL-TIME IN-CABIN SOUNDFIELD CANVAS SIMULATION
  // -------------------------------------------------------------
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let time = 0;
    const renderSoundfield = () => {
      const canvas = soundfieldCanvasRef.current;
      if (!canvas) {
        animationFrameRef.current = requestAnimationFrame(renderSoundfield);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width || 360;
      const height = canvas.height || 420;

      ctx.fillStyle = '#070d18';
      ctx.fillRect(0, 0, width, height);

      // Draw Car Body Schematic Outline
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.35, height * 0.12);
      ctx.lineTo(width * 0.65, height * 0.12);
      ctx.lineTo(width * 0.80, height * 0.26);
      ctx.lineTo(width * 0.84, height * 0.78);
      ctx.lineTo(width * 0.65, height * 0.94);
      ctx.lineTo(width * 0.35, height * 0.94);
      ctx.lineTo(width * 0.16, height * 0.78);
      ctx.lineTo(width * 0.20, height * 0.26);
      ctx.closePath();
      ctx.stroke();

      // Seats & Center Console
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width * 0.54, height * 0.34, width * 0.22, height * 0.16);
      ctx.strokeRect(width * 0.24, height * 0.34, width * 0.22, height * 0.16);
      ctx.strokeRect(width * 0.24, height * 0.62, width * 0.52, height * 0.14);

      // Driver's Head Target (Glowing Pulse)
      const driverX = width * car.cabinCoords.driver.x;
      const driverY = height * car.cabinCoords.driver.y;

      ctx.beginPath();
      ctx.arc(driverX, driverY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(driverX, driverY, 16 + Math.sin(time * 0.08) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('DRIVER SWEET SPOT', driverX - 44, driverY - 14);

      // Sound Wave Propagation from Each Speaker
      const speakerList = [
        { name: 'FL', label: 'FL (Door)', ...car.cabinCoords.FL, delay: delaysMs.FL, color: '#38bdf8' },
        { name: 'FR', label: 'FR (Door)', ...car.cabinCoords.FR, delay: delaysMs.FR, color: '#38bdf8' },
        { name: 'RL', label: 'RL (Door)', ...car.cabinCoords.RL, delay: delaysMs.RL, color: '#818cf8' },
        { name: 'RR', label: 'RR (Door)', ...car.cabinCoords.RR, delay: delaysMs.RR, color: '#818cf8' },
        { name: 'SUB', label: 'SUB (Boot)', ...car.cabinCoords.SUB, delay: delaysMs.SUB, color: '#f59e0b' }
      ];

      speakerList.forEach((spk) => {
        const spkX = width * spk.x;
        const spkY = height * spk.y;

        ctx.beginPath();
        ctx.arc(spkX, spkY, spk.name === 'SUB' ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = spk.color;
        ctx.fill();

        const delayOffset = timeAlignmentEnabled ? (spk.delay * 8.0) : 0;
        const wavePhase = (time * 1.5 - delayOffset) % 120;

        for (let r = wavePhase; r < 180; r += 35) {
          if (r > 5) {
            const alpha = Math.max(0, 1 - r / 180);
            ctx.beginPath();
            ctx.arc(spkX, spkY, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${spk.name === 'SUB' ? '245, 158, 11' : '6, 182, 212'}, ${alpha * 0.45})`;
            ctx.lineWidth = spk.name === 'SUB' ? 2 : 1.2;
            ctx.stroke();
          }
        }

        ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
        ctx.font = '9px monospace';
        const delayText = timeAlignmentEnabled ? `${spk.delay}ms` : '0ms';
        ctx.fillText(`${spk.name}: ${delayText}`, spkX - 18, spkY + 12);
      });

      time += 1;
      animationFrameRef.current = requestAnimationFrame(renderSoundfield);
    };

    animationFrameRef.current = requestAnimationFrame(renderSoundfield);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [timeAlignmentEnabled, selectedCarIdx, currentView, studioTab]);

  // -------------------------------------------------------------
  // ANIMATION: BEZIER EQ CURVE CANVAS
  // -------------------------------------------------------------
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const canvas = eqCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width || 550;
    const height = canvas.height || 180;

    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let y = 20; y < height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const zeroY = height / 2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(width, zeroY);
    ctx.stroke();

    const stepX = width / (eqGains.length - 1);
    const points = eqGains.map((gain, i) => {
      const y = zeroY - (gain / 12) * (height * 0.4);
      return { x: i * stepX, y };
    });

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const cpX = (points[i].x + points[i + 1].x) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, cpX, (points[i].y + points[i + 1].y) / 2);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
    ctx.fillStyle = grad;
    ctx.fill();

    points.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = eqGains[idx] > 0 ? '#10b981' : eqGains[idx] < 0 ? '#ef4444' : '#ffffff';
      ctx.fill();
    });
  }, [eqGains, currentView, studioTab]);

  // -------------------------------------------------------------
  // AUDIO ENGINE: WEB AUDIO OSCILLATOR & TONES
  // -------------------------------------------------------------
  const playTone = (type: string, freq?: number) => {
    if (Platform.OS !== 'web') {
      alert(`Playing ${type} test tone.`);
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
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq || 1000, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
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

  const updateGain = (index: number, delta: number) => {
    setEqGains((prev) => {
      const next = [...prev];
      next[index] = +Math.min(12, Math.max(-12, next[index] + delta)).toFixed(1);
      return next;
    });
  };

  const currentShot = STORYBOARD_SHOTS[activeShotIdx];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* TOP LUXURY NAVBAR */}
      <View style={styles.navBar}>
        <View style={styles.logoGroup}>
          <View style={styles.logoPulseRing} />
          <Text style={styles.logoBrand}>
            CarAudio<Text style={styles.cyanAccent}>AI</Text>
          </Text>
          <View style={styles.proTag}>
            <Text style={styles.proTagText}>STUDIO v2.0</Text>
          </View>
        </View>

        <View style={styles.navActionGroup}>
          <TouchableOpacity
            style={[styles.navPill, currentView === 'landing' && styles.navPillActive]}
            onPress={() => setCurrentView('landing')}
          >
            <Text style={[styles.navPillText, currentView === 'landing' && styles.navPillTextActive]}>
              🎬 Experience
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navPill, currentView === 'studio' && styles.navPillActive]}
            onPress={() => setCurrentView('studio')}
          >
            <Text style={[styles.navPillText, currentView === 'studio' && styles.navPillTextActive]}>
              🎛️ Acoustic Studio
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* ========================================================================= */}
        {/* VIEW 1: CINEMATIC STORYBOARD & LUXURY LANDING                             */}
        {/* ========================================================================= */}
        {currentView === 'landing' && (
          <View style={styles.viewContent}>

            {/* CINEMATIC HERO */}
            <View style={styles.cinematicHero}>
              <View style={styles.glowBlob1} />
              <View style={styles.glowBlob2} />

              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>⚡ THE FIRST AI ACOUSTIC ENGINE FOR INDIAN CARS</Text>
              </View>

              <Text style={styles.heroHeadline}>
                Automotive Soundstage.<br />
                <Text style={styles.gradientCyan}>Engineered with AI.</Text>
              </Text>

              <Text style={styles.heroSubhead}>
                Transform untuned car speakers into a laser-focused, phase-coherent studio monitor.
                Experience deep kick punch, zero windshield fatigue, and pinpoint vocal staging.
              </Text>

              {/* ------------------------------------------------------------- */}
              {/* THE CINEMATIC 4-SHOT VEO VIDEO / ANIMATION SHOWCASE           */}
              {/* ------------------------------------------------------------- */}
              <View style={styles.cinematicPlayerCard}>
                {/* Player Top Bar */}
                <View style={styles.playerTopBar}>
                  <View style={styles.playerDotGroup}>
                    <View style={styles.dotRed} />
                    <View style={styles.dotYellow} />
                    <View style={styles.dotGreen} />
                  </View>
                  <Text style={styles.playerHUDTag}>{currentShot.hudState}</Text>
                  <TouchableOpacity
                    style={styles.pausePlayBtn}
                    onPress={() => setIsVideoPlaying(!isVideoPlaying)}
                  >
                    <Text style={styles.pausePlayText}>{isVideoPlaying ? '⏸️ AUTO-PLAY ON' : '▶️ PAUSED'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Main 16:9 Cinematic Video Display */}
                <View style={styles.screenFrame}>
                  <Image
                    source={currentShot.image}
                    style={styles.cinematicImage}
                    resizeMode="cover"
                  />

                  {/* Glassmorphic Caption Overlay */}
                  <View style={styles.captionOverlay}>
                    <View style={styles.captionHeaderRow}>
                      <Text style={styles.captionTag}>{currentShot.tag}</Text>
                      <Text style={styles.captionIndex}>{activeShotIdx + 1} / 4</Text>
                    </View>
                    <Text style={styles.captionTitle}>{currentShot.title}</Text>
                    <Text style={styles.captionDesc}>{currentShot.desc}</Text>
                  </View>
                </View>

                {/* Interactive Shot Scrubbing Bar */}
                <View style={styles.shotScrubberRow}>
                  {STORYBOARD_SHOTS.map((shot, idx) => (
                    <TouchableOpacity
                      key={shot.id}
                      style={[styles.scrubberTab, activeShotIdx === idx && styles.scrubberTabActive]}
                      onPress={() => {
                        setActiveShotIdx(idx);
                        setIsVideoPlaying(false);
                      }}
                    >
                      <View style={[styles.scrubberDot, activeShotIdx === idx && styles.scrubberDotActive]} />
                      <Text style={[styles.scrubberTitle, activeShotIdx === idx && styles.textCyan]}>
                        0{idx + 1} // {shot.title.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.playerBottomGlow} />
              </View>

              {/* HERO CTA BUTTONS */}
              <View style={styles.heroBtnRow}>
                <TouchableOpacity style={styles.primaryGlowBtn} onPress={() => setCurrentView('studio')}>
                  <Text style={styles.primaryGlowBtnText}>Launch Live Acoustic Studio →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ghostGlowBtn}
                  onPress={() => Linking.openURL('https://github.com/adityashm/CarAudioAI')}
                >
                  <Text style={styles.ghostGlowBtnText}>⭐ GitHub Repo</Text>
                </TouchableOpacity>
              </View>

              {/* STATS BAR */}
              <View style={styles.statsBar}>
                <View style={styles.statCell}>
                  <Text style={styles.statVal}>100+</Text>
                  <Text style={styles.statKey}>Indian Car Cabins</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.statCell}>
                  <Text style={styles.statVal}>34.3</Text>
                  <Text style={styles.statKey}>cm/ms Speed of Sound</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.statCell}>
                  <Text style={styles.statVal}>₹99</Text>
                  <Text style={styles.statKey}>vs ₹15,000 Hardware</Text>
                </View>
              </View>
            </View>

            {/* INTERACTIVE COMPARISON MATRIX */}
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionOverline}>ACOUSTIC PHYSICS</Text>
              <Text style={styles.sectionHeading}>Why Great Speakers Sound Terrible Untuned</Text>

              <View style={styles.cardsRow}>
                <View style={styles.cardUntuned}>
                  <Text style={styles.cardHeaderRed}>❌ Untuned Stock Audio</Text>
                  <Text style={styles.bulletRed}>• Asymmetric Seating: Closer right speaker reaches ears 1.25ms faster, collapsing the soundstage into the door.</Text>
                  <Text style={styles.bulletRed}>• 200Hz Cabin Boom: Glass & metal boundaries create heavy acoustic bass resonance.</Text>
                  <Text style={styles.bulletRed}>• 4kHz Harshness: Windshield reflections spike treble, causing listener fatigue within 20 mins.</Text>
                  <Text style={styles.bulletRed}>• Port Unloading: Subwoofers bottom out and burn coils below enclosure tuning frequency.</Text>
                </View>

                <View style={styles.cardTuned}>
                  <Text style={styles.cardHeaderGreen}>✅ CarAudioAI Calibrated</Text>
                  <Text style={styles.bulletGreen}>• Millisecond Delay: Right speaker delayed by 1.25ms so all 5 soundwaves hit the driver's ears simultaneously.</Text>
                  <Text style={styles.bulletGreen}>• -1.5dB Notch @ 200Hz: Eliminates muddy cabin boom, yielding punchy kick drums.</Text>
                  <Text style={styles.bulletGreen}>• -1.0dB Reflection Tamer @ 4kHz: Crystal-clear vocals without harsh ear strain.</Text>
                  <Text style={styles.bulletGreen}>• Subsonic Safety HPF: Protects 35Hz ported enclosures from mechanical cone damage.</Text>
                </View>
              </View>
            </View>

            {/* BENTO ARCHITECTURE */}
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionOverline}>ENGINEERING HIGHLIGHTS</Text>
              <Text style={styles.sectionHeading}>Four Pillars of Studio Calibration</Text>

              <View style={styles.bentoContainer}>
                <View style={styles.bentoBlock}>
                  <Text style={styles.bentoEmoji}>⏱️</Text>
                  <Text style={styles.bentoHead}>Time Alignment Matrix</Text>
                  <Text style={styles.bentoBody}>
                    Calculates distance offsets (in cm and ms) from the driver's ear to each speaker in the cabin for pinpoint soundstage centering.
                  </Text>
                </View>

                <View style={styles.bentoBlock}>
                  <Text style={styles.bentoEmoji}>🎚️</Text>
                  <Text style={styles.bentoHead}>14-Band Parametric EQ</Text>
                  <Text style={styles.bentoBody}>
                    Tailored for Indian SQL taste (Punjabi, EDM, Hip-Hop): +5.5dB 63Hz kick punch, clean midrange, and silky 12kHz high-frequency air.
                  </Text>
                </View>

                <View style={styles.bentoBlock}>
                  <Text style={styles.bentoEmoji}>🛡️</Text>
                  <Text style={styles.bentoHead}>Subsonic Port Protection</Text>
                  <Text style={styles.bentoBody}>
                    Computes safe high-pass cutoffs (~28Hz for 35Hz ported boxes) so your subwoofer delivers massive low-end without bottoming out.
                  </Text>
                </View>

                <View style={styles.bentoBlock}>
                  <Text style={styles.bentoEmoji}>⚡</Text>
                  <Text style={styles.bentoHead}>Multimeter Gain Staging</Text>
                  <Text style={styles.bentoBody}>
                    Calculates exact AC voltage targets (V = √(P×R)) at 75% head unit volume so your amplifier delivers maximum clean undistorted power.
                  </Text>
                </View>
              </View>
            </View>

            {/* PRICING MATRIX */}
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionOverline}>TRANSPARENT PLANS</Text>
              <Text style={styles.sectionHeading}>Democratizing Acoustic Science</Text>

              <View style={styles.pricingRow}>
                <View style={styles.priceBox}>
                  <Text style={styles.tierName}>Free Starter</Text>
                  <Text style={styles.tierPrice}>₹0</Text>
                  <Text style={styles.tierSub}>For basic graphic EQ testing</Text>
                  <View style={styles.tierLine} />
                  <Text style={styles.tierItem}>✓ 1 Vehicle Profile</Text>
                  <Text style={styles.tierItem}>✓ 14-Band EQ Presets</Text>
                  <Text style={styles.tierItem}>✓ In-Browser Pink Noise Generator</Text>
                  <TouchableOpacity style={styles.tierBtnSecondary} onPress={() => setCurrentView('studio')}>
                    <Text style={styles.tierBtnTextSec}>Get Started</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.priceBox, styles.priceBoxPopular]}>
                  <View style={styles.popularBadge}><Text style={styles.popularBadgeText}>MOST POPULAR</Text></View>
                  <Text style={styles.tierName}>Pro Enthusiast</Text>
                  <Text style={styles.tierPrice}>₹99<Text style={styles.tierMonth}>/mo</Text></Text>
                  <Text style={styles.tierSub}>Complete AI acoustic studio</Text>
                  <View style={styles.tierLine} />
                  <Text style={styles.tierItem}>✓ Unlimited Cars & Audio Hardware</Text>
                  <Text style={styles.tierItem}>✓ Millimeter Time Alignment Delays</Text>
                  <Text style={styles.tierItem}>✓ Ported Box Subsonic Protection</Text>
                  <Text style={styles.tierItem}>✓ Multimeter AC Voltage Calculator</Text>
                  <Text style={styles.tierItem}>✓ Export to Pioneer XML & MiniDSP JSON</Text>
                  <TouchableOpacity style={styles.tierBtnPrimary} onPress={() => setCurrentView('studio')}>
                    <Text style={styles.tierBtnTextPri}>Start Pro Tuning →</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.priceBox}>
                  <Text style={styles.tierName}>Installer Pro</Text>
                  <Text style={styles.tierPrice}>₹999<Text style={styles.tierMonth}>/yr</Text></Text>
                  <Text style={styles.tierSub}>For audio accessory shops</Text>
                  <View style={styles.tierLine} />
                  <Text style={styles.tierItem}>✓ Everything in Pro</Text>
                  <Text style={styles.tierItem}>✓ Multi-Customer Profile Storage</Text>
                  <Text style={styles.tierItem}>✓ WhatsApp Tuning Reports</Text>
                  <Text style={styles.tierItem}>✓ Commercial Workshop License</Text>
                  <TouchableOpacity style={styles.tierBtnSecondary} onPress={() => setCurrentView('studio')}>
                    <Text style={styles.tierBtnTextSec}>Subscribe Yearly</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: MULTI-CAR & HARDWARE ACOUSTIC STUDIO                              */}
        {/* ========================================================================= */}
        {currentView === 'studio' && (
          <View style={styles.viewContent}>

            {/* VEHICLE SELECTOR CAROUSEL */}
            <View style={styles.glassCard}>
              <View style={styles.cardHeaderFlex}>
                <Text style={styles.cardTitle}>🚗 Active Vehicle: <Text style={styles.cyanAccent}>{car.make} {car.model}</Text></Text>
                <View style={styles.pillBadge}><Text style={styles.pillBadgeText}>{car.category}</Text></View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carPickerScroll}>
                {CAR_CATALOG.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.carOptionCard, selectedCarIdx === idx && styles.carOptionCardActive]}
                    onPress={() => setSelectedCarIdx(idx)}
                  >
                    <Text style={styles.carOptionMake}>{item.make}</Text>
                    <Text style={[styles.carOptionModel, selectedCarIdx === idx && styles.cyanAccent]}>{item.model}</Text>
                    <Text style={styles.carOptionSpec}>Wheelbase: {item.wheelbase}mm</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* HARDWARE CONFIGURATOR */}
            <View style={styles.glassCard}>
              <Text style={styles.cardTitle}>🎛️ Audio Equipment Configurator</Text>

              {/* Head Unit */}
              <Text style={styles.subConfigLabel}>Head Unit / Source:</Text>
              <View style={styles.configOptionsRow}>
                {HEAD_UNITS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.configOptionChip, selectedHeadUnitIdx === idx && styles.configOptionChipActive]}
                    onPress={() => setSelectedHeadUnitIdx(idx)}
                  >
                    <Text style={[styles.configOptionChipText, selectedHeadUnitIdx === idx && styles.textWhite]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Front Speakers */}
              <Text style={styles.subConfigLabel}>Front & Rear Speakers:</Text>
              <View style={styles.configOptionsRow}>
                {SPEAKER_SETS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.configOptionChip, selectedSpeakerIdx === idx && styles.configOptionChipActive]}
                    onPress={() => setSelectedSpeakerIdx(idx)}
                  >
                    <Text style={[styles.configOptionChipText, selectedSpeakerIdx === idx && styles.textWhite]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Subwoofer */}
              <Text style={styles.subConfigLabel}>Subwoofer & Enclosure:</Text>
              <View style={styles.configOptionsRow}>
                {SUBWOOFERS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.configOptionChip, selectedSubIdx === idx && styles.configOptionChipActive]}
                    onPress={() => setSelectedSubIdx(idx)}
                  >
                    <Text style={[styles.configOptionChipText, selectedSubIdx === idx && styles.textWhite]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* SOUND TARGET TABS */}
            <View style={styles.glassCard}>
              <Text style={styles.cardTitle}>🎯 Acoustic Target Profile</Text>
              <View style={styles.targetRow}>
                {[
                  { id: 'sql', label: '🔥 SQL (Punjabi/EDM/Hip-Hop)', desc: 'High impact sub-bass + crisp transparent vocals' },
                  { id: 'harman', label: '🎵 Harman Reference', desc: 'Linear in-cabin acoustic balance' },
                  { id: 'vocal', label: '🎙️ Vocal Clarity', desc: 'Enhanced intelligibility for podcasts & acoustic' }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.targetBtn, soundProfile === item.id && styles.targetBtnActive]}
                    onPress={() => setSoundProfile(item.id as any)}
                  >
                    <Text style={[styles.targetBtnTitle, soundProfile === item.id && styles.textBlack]}>{item.label}</Text>
                    <Text style={[styles.targetBtnDesc, soundProfile === item.id && styles.textBlack]}>{item.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* STUDIO TOOLS NAVIGATION */}
            <View style={styles.toolNavStrip}>
              {[
                { id: 'simulation', label: '🌊 Live Soundfield' },
                { id: 'eq', label: '🎚️ Bezier EQ Curve' },
                { id: 'crossover', label: '🎛️ Crossovers & Dials' },
                { id: 'gain', label: '⚡ Multimeter Voltages' },
                { id: 'tones', label: '🔊 Tone Generator' },
                { id: 'export', label: '📤 DSP File Exporter' }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.toolNavPill, studioTab === tab.id && styles.toolNavPillActive]}
                  onPress={() => setStudioTab(tab.id as any)}
                >
                  <Text style={[styles.toolNavPillText, studioTab === tab.id && styles.toolNavPillTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* TAB 1: LIVE SOUNDFIELD CANVAS SIMULATION */}
            {studioTab === 'simulation' && (
              <View style={styles.glassCard}>
                <View style={styles.cardHeaderFlex}>
                  <Text style={styles.cardTitle}>🌊 In-Cabin Acoustic Propagation Simulator</Text>
                  <TouchableOpacity
                    style={[styles.toggleBtn, timeAlignmentEnabled && styles.toggleBtnActive]}
                    onPress={() => setTimeAlignmentEnabled(!timeAlignmentEnabled)}
                  >
                    <Text style={styles.toggleBtnText}>
                      {timeAlignmentEnabled ? '✅ TIME ALIGNED (AI ON)' : '❌ STOCK PHASE (OFF)'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardSubNote}>
                  Live wave rendering inside {car.make} {car.model} cabin. Toggle time alignment to see wave pulses converge at driver's head:
                </Text>

                {Platform.OS === 'web' ? (
                  <View style={styles.canvasContainer}>
                    <canvas
                      ref={soundfieldCanvasRef}
                      width={480}
                      height={420}
                      style={{ width: '100%', maxWidth: 480, height: 380, borderRadius: 12 }}
                    />
                  </View>
                ) : (
                  <View style={styles.fallbackNotice}>
                    <Text style={styles.fallbackText}>Live HTML5 Canvas wave simulation running on Web.</Text>
                  </View>
                )}

                {/* Acoustic Delay Table */}
                <View style={styles.delayTable}>
                  <View style={styles.delayHeader}>
                    <Text style={styles.delayTh}>Speaker</Text>
                    <Text style={styles.delayTh}>Distance</Text>
                    <Text style={styles.delayTh}>Time Delay</Text>
                    <Text style={styles.delayTh}>Physical Offset</Text>
                  </View>
                  {[
                    { name: 'Front Right (FR)', dist: `${car.distances_rhd.FR} cm`, delay: `${delaysMs.FR} ms`, offset: `${maxDistance - car.distances_rhd.FR} cm` },
                    { name: 'Rear Right (RR)', dist: `${car.distances_rhd.RR} cm`, delay: `${delaysMs.RR} ms`, offset: `${maxDistance - car.distances_rhd.RR} cm` },
                    { name: 'Front Left (FL)', dist: `${car.distances_rhd.FL} cm`, delay: `${delaysMs.FL} ms`, offset: `${maxDistance - car.distances_rhd.FL} cm` },
                    { name: 'Rear Left (RL)', dist: `${car.distances_rhd.RL} cm`, delay: `${delaysMs.RL} ms`, offset: `${maxDistance - car.distances_rhd.RL} cm` },
                    { name: 'Boot Subwoofer', dist: `${car.distances_rhd.SUB} cm`, delay: '0.00 ms (Ref)', offset: '0 cm' },
                  ].map((row, i) => (
                    <View key={i} style={[styles.delayRow, i % 2 === 1 && styles.delayRowAlt]}>
                      <Text style={styles.delayTdName}>{row.name}</Text>
                      <Text style={styles.delayTd}>{row.dist}</Text>
                      <Text style={styles.delayTdCyan}>{row.delay}</Text>
                      <Text style={styles.delayTd}>{row.offset}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 2: BEZIER EQUALIZER CURVE */}
            {studioTab === 'eq' && (
              <View style={styles.glassCard}>
                <Text style={styles.cardTitle}>🎚️ 14-Band Parametric Spline Equalizer</Text>
                <Text style={styles.cardSubNote}>
                  Interactive continuous spline curve matching {headUnit.name} sliders:
                </Text>

                {Platform.OS === 'web' && (
                  <View style={styles.canvasContainer}>
                    <canvas
                      ref={eqCanvasRef}
                      width={650}
                      height={180}
                      style={{ width: '100%', maxWidth: 650, height: 180, borderRadius: 10 }}
                    />
                  </View>
                )}

                {/* 14 Sliders */}
                <View style={styles.sliderRack}>
                  {EQ_FREQUENCIES.map((freq, idx) => {
                    const gain = eqGains[idx];
                    return (
                      <View key={freq} style={styles.sliderCol}>
                        <TouchableOpacity style={styles.stepperBtn} onPress={() => updateGain(idx, 0.5)}>
                          <Text style={styles.stepperBtnText}>+</Text>
                        </TouchableOpacity>

                        <View style={styles.sliderBarTrack}>
                          <View
                            style={[
                              styles.sliderBarFill,
                              {
                                height: `${Math.abs(gain) * 7 + 8}%`,
                                backgroundColor: gain > 0 ? '#06b6d4' : gain < 0 ? '#ef4444' : '#64748b',
                                bottom: gain < 0 ? undefined : '50%',
                                top: gain < 0 ? '50%' : undefined
                              }
                            ]}
                          />
                          <View style={styles.sliderZero} />
                        </View>

                        <TouchableOpacity style={styles.stepperBtn} onPress={() => updateGain(idx, -0.5)}>
                          <Text style={styles.stepperBtnText}>-</Text>
                        </TouchableOpacity>

                        <Text style={[styles.gainNumber, gain > 0 && styles.textCyan, gain < 0 && styles.textRed]}>
                          {gain > 0 ? `+${gain}` : gain}
                        </Text>
                        <Text style={styles.freqTag}>{freq >= 1000 ? `${freq / 1000}k` : freq}</Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.insightBox}>
                  <Text style={styles.insightTitle}>💡 Target Acoustic Adjustments:</Text>
                  <Text style={styles.insightText}>• <Text style={styles.textWhite}>+5.5 dB @ 63Hz</Text>: 35Hz ported box bass resonance boost.</Text>
                  <Text style={styles.insightText}>• <Text style={styles.textWhite}>-1.5 dB @ 200Hz</Text>: Compact SUV cabin standing-wave notch.</Text>
                  <Text style={styles.insightText}>• <Text style={styles.textWhite}>-1.0 dB @ 4kHz</Text>: Windshield acoustic reflection tamer.</Text>
                </View>
              </View>
            )}

            {/* TAB 3: CROSSOVERS & DIALS */}
            {studioTab === 'crossover' && (
              <View style={styles.glassCard}>
                <Text style={styles.cardTitle}>🎛️ Physical Amplifier Filter Dials & Crossovers</Text>

                <View style={styles.filterCard}>
                  <Text style={styles.filterCardHead}>Front Channels (Sony XS-162GS Components)</Text>
                  <Text style={styles.filterValue}>HPF: ~{frontHpf} Hz (Approx. 9:30 o'clock)</Text>
                  <Text style={styles.filterDesc}>Filters out bass sub-80Hz to protect 45W RMS woofers and ensure crystal clear vocal midrange.</Text>
                </View>

                <View style={styles.filterCard}>
                  <Text style={styles.filterCardHead}>Rear Channels (Attenuated Rear Fill)</Text>
                  <Text style={styles.filterValue}>HPF: ~{rearHpf} Hz (Approx. 10:00 o'clock)</Text>
                  <Text style={styles.filterDesc}>Attenuated (-4dB) spatial ambient fill that doesn't pull the vocal stage backward.</Text>
                </View>

                <View style={[styles.filterCard, styles.filterCardAmber]}>
                  <Text style={[styles.filterCardHead, { color: '#f59e0b' }]}>Subwoofer ({sub.name})</Text>
                  <Text style={styles.filterValue}>LPF (Low Pass): ~{subLpf} Hz</Text>
                  <Text style={styles.filterValue}>Subsonic Filter: ~{subsonicHz} Hz</Text>
                  {sub.type === 'ported' && (
                    <Text style={styles.subsonicWarning}>
                      ⚠️ PORTED SAFETY: Frequencies below {sub.tune}Hz cause cone unloading. The {subsonicHz}Hz subsonic filter prevents coil destruction.
                    </Text>
                  )}
                  <Text style={styles.filterDesc}>Bass Boost: MUST BE SET TO 0 dB (OFF).</Text>
                </View>
              </View>
            )}

            {/* TAB 4: MULTIMETER VOLTAGES */}
            {studioTab === 'gain' && (
              <View style={styles.glassCard}>
                <Text style={styles.cardTitle}>⚡ Multimeter Target AC Voltages (V = √(P × R))</Text>
                <Text style={styles.cardSubNote}>
                  Set {headUnit.name} volume to 75% (Vol 30) with flat EQ before measuring amplifier terminals:
                </Text>

                <View style={styles.voltageGrid}>
                  <View style={styles.voltageBox}>
                    <Text style={styles.voltageLabel}>Front Channels (CH1/2)</Text>
                    <Text style={styles.voltageNumber}>{vFront} V AC</Text>
                    <Text style={styles.voltageTone}>Test Tone: 1,000 Hz 0dB Sine</Text>
                    <Text style={styles.voltageKnob}>Knob Position: ~10:30 o'clock</Text>
                  </View>

                  <View style={styles.voltageBox}>
                    <Text style={styles.voltageLabel}>Rear Channels (CH3/4)</Text>
                    <Text style={styles.voltageNumber}>{vRear} V AC</Text>
                    <Text style={styles.voltageTone}>Test Tone: 1,000 Hz 0dB Sine</Text>
                    <Text style={styles.voltageKnob}>Knob Position: ~9:30 o'clock</Text>
                  </View>

                  <View style={styles.voltageBox}>
                    <Text style={styles.voltageLabel}>Subwoofer Channel</Text>
                    <Text style={styles.voltageNumber}>{vSub} V AC</Text>
                    <Text style={styles.voltageTone}>Test Tone: 50 Hz 0dB Sine</Text>
                    <Text style={styles.voltageKnob}>Knob Position: ~11:30 o'clock</Text>
                  </View>
                </View>
              </View>
            )}

            {/* TAB 5: AUDIO TONE GENERATOR */}
            {studioTab === 'tones' && (
              <View style={styles.glassCard}>
                <Text style={styles.cardTitle}>🔊 In-Browser Audio Test Tone Generator</Text>
                <Text style={styles.cardSubNote}>
                  Connect via Bluetooth/Aux to play precision calibration tones in your car:
                </Text>

                <View style={styles.toneList}>
                  <TouchableOpacity
                    style={[styles.toneCardBtn, isPlayingTone === '1000' && styles.toneCardBtnActive]}
                    onPress={() => playTone('1000', 1000)}
                  >
                    <Text style={styles.toneCardTitle}>1,000 Hz (1 kHz) Sine Wave (0 dB)</Text>
                    <Text style={styles.toneCardSub}>Used for measuring Front/Rear speaker amplifier AC voltage (13.4V)</Text>
                    <Text style={styles.toneCardStatus}>{isPlayingTone === '1000' ? '⏹️ STOPPING' : '▶️ PLAY 1 kHz'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toneCardBtn, isPlayingTone === '50' && styles.toneCardBtnActive]}
                    onPress={() => playTone('50', 50)}
                  >
                    <Text style={styles.toneCardTitle}>50 Hz Sine Wave (0 dB)</Text>
                    <Text style={styles.toneCardSub}>Used for measuring Subwoofer amplifier AC voltage (44.7V)</Text>
                    <Text style={styles.toneCardStatus}>{isPlayingTone === '50' ? '⏹️ STOPPING' : '▶️ PLAY 50 Hz'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toneCardBtn, isPlayingTone === 'pink' && styles.toneCardBtnActive]}
                    onPress={() => playTone('pink')}
                  >
                    <Text style={styles.toneCardTitle}>Pink Noise (20 Hz – 20 kHz)</Text>
                    <Text style={styles.toneCardSub}>Full-spectrum acoustic test tone for RTA microphone measurement</Text>
                    <Text style={styles.toneCardStatus}>{isPlayingTone === 'pink' ? '⏹️ STOPPING' : '▶️ PLAY NOISE'}</Text>
                  </TouchableOpacity>
                </View>

                {isPlayingTone && (
                  <TouchableOpacity style={styles.stopGlobalBtn} onPress={stopTone}>
                    <Text style={styles.stopGlobalBtnText}>⏹️ STOP ALL AUDIO PLAYBACK</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* TAB 6: DSP FILE EXPORT */}
            {studioTab === 'export' && (
              <View style={styles.glassCard}>
                <Text style={styles.cardTitle}>📤 Export Ready-to-Flash DSP Configurations</Text>

                <View style={styles.codeExportCard}>
                  <Text style={styles.codeExportTitle}>Pioneer DEH-80PRS XML Format</Text>
                  <Text style={styles.codeExportBody}>
                    {`<PioneerDSPConfig version="1.0">\n  <Car>${car.make} ${car.model}</Car>\n  <TimeAlignment FR="${delaysMs.FR}ms" FL="${delaysMs.FL}ms" SUB="0ms"/>\n  <Crossover HPF="${frontHpf}Hz" LPF="${subLpf}Hz" Subsonic="${subsonicHz}Hz"/>\n</PioneerDSPConfig>`}
                  </Text>
                </View>

                <View style={styles.codeExportCard}>
                  <Text style={styles.codeExportTitle}>MiniDSP 2x4 HD JSON Format</Text>
                  <Text style={styles.codeExportBody}>
                    {`{\n  "vehicle": "${car.make} ${car.model}",\n  "delays_ms": { "FR": ${delaysMs.FR}, "FL": ${delaysMs.FL}, "SUB": 0 },\n  "crossover": { "front_hpf": ${frontHpf}, "sub_lpf": ${subLpf} }\n}`}
                  </Text>
                </View>
              </View>
            )}

          </View>
        )}

        {/* FOOTER */}
        <View style={styles.luxuryFooter}>
          <Text style={styles.footerBrand}>CarAudioAI • Precision Automotive Acoustic Intelligence</Text>
          <Text style={styles.footerNote}>Open-source on GitHub (adityashm/CarAudioAI)</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617'
  },
  scrollContainer: {
    paddingBottom: 60
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: 'rgba(2, 6, 23, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  logoPulseRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#06b6d4'
  },
  logoBrand: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  cyanAccent: {
    color: '#06b6d4'
  },
  proTag: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  proTagText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: 'bold'
  },
  navActionGroup: {
    flexDirection: 'row',
    gap: 8
  },
  navPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  navPillActive: {
    backgroundColor: '#1e293b'
  },
  navPillText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  navPillTextActive: {
    color: '#ffffff'
  },
  viewContent: {
    paddingHorizontal: 18,
    paddingTop: 24
  },
  cinematicHero: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 40
  },
  glowBlob1: {
    position: 'absolute',
    top: -40,
    left: '15%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    filter: 'blur(50px)' as any
  },
  glowBlob2: {
    position: 'absolute',
    top: 40,
    right: '15%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
    filter: 'blur(60px)' as any
  },
  heroBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1,
    borderColor: '#06b6d4',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16
  },
  heroBadgeText: {
    color: '#06b6d4',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  heroHeadline: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 14
  },
  gradientCyan: {
    color: '#06b6d4'
  },
  heroSubhead: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 620,
    marginBottom: 24
  },

  // CINEMATIC STORYBOARD PLAYER STYLES
  cinematicPlayerCard: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#070b14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative'
  },
  playerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#040710',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)'
  },
  playerDotGroup: {
    flexDirection: 'row',
    gap: 6
  },
  dotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  dotYellow: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b' },
  dotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  playerHUDTag: {
    color: '#38bdf8',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold'
  },
  pausePlayBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  pausePlayText: {
    color: '#cbd5e1',
    fontSize: 9,
    fontWeight: 'bold'
  },
  screenFrame: {
    width: '100%',
    height: 380,
    position: 'relative',
    backgroundColor: '#000000'
  },
  cinematicImage: {
    width: '100%',
    height: '100%'
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(6, 182, 212, 0.3)'
  },
  captionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  captionTag: {
    color: '#06b6d4',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'monospace'
  },
  captionIndex: {
    color: '#94a3b8',
    fontSize: 9,
    fontFamily: 'monospace'
  },
  captionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2
  },
  captionDesc: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 16
  },
  shotScrubberRow: {
    flexDirection: 'row',
    backgroundColor: '#040710',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 6
  },
  scrubberTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#0a101f',
    borderRadius: 6,
    gap: 4
  },
  scrubberTabActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: '#06b6d4'
  },
  scrubberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#475569'
  },
  scrubberDotActive: {
    backgroundColor: '#06b6d4'
  },
  scrubberTitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600'
  },
  playerBottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#06b6d4'
  },

  heroBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32
  },
  primaryGlowBtn: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: '#06b6d4',
    shadowOpacity: 0.4,
    shadowRadius: 15
  },
  primaryGlowBtnText: {
    color: '#020617',
    fontSize: 14,
    fontWeight: 'bold'
  },
  ghostGlowBtn: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8
  },
  ghostGlowBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0b1322',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 680
  },
  statCell: {
    alignItems: 'center'
  },
  statVal: {
    color: '#06b6d4',
    fontSize: 22,
    fontWeight: 'bold'
  },
  statKey: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2
  },
  statSep: {
    width: 1,
    height: 28,
    backgroundColor: '#1e293b'
  },
  sectionWrap: {
    marginBottom: 40
  },
  sectionOverline: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 4
  },
  sectionHeading: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14
  },
  cardUntuned: {
    flex: 1,
    minWidth: 280,
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 16
  },
  cardHeaderRed: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10
  },
  bulletRed: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 6
  },
  cardTuned: {
    flex: 1,
    minWidth: 280,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 16
  },
  cardHeaderGreen: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10
  },
  bulletGreen: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 6
  },
  bentoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14
  },
  bentoBlock: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#0b1322',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 18
  },
  bentoEmoji: {
    fontSize: 24,
    marginBottom: 8
  },
  bentoHead: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6
  },
  bentoBody: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18
  },
  pricingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14
  },
  priceBox: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#0b1322',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 20
  },
  priceBoxPopular: {
    borderColor: '#06b6d4',
    backgroundColor: '#081a2e'
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#06b6d4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8
  },
  popularBadgeText: {
    color: '#020617',
    fontSize: 9,
    fontWeight: 'bold'
  },
  tierName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  tierPrice: {
    color: '#06b6d4',
    fontSize: 28,
    fontWeight: '900',
    marginVertical: 4
  },
  tierMonth: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: 'normal'
  },
  tierSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12
  },
  tierLine: {
    height: 1,
    backgroundColor: '#1e293b',
    marginBottom: 12
  },
  tierItem: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 22
  },
  tierBtnPrimary: {
    backgroundColor: '#06b6d4',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 18
  },
  tierBtnTextPri: {
    color: '#020617',
    fontWeight: 'bold',
    fontSize: 13
  },
  tierBtnSecondary: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 18
  },
  tierBtnTextSec: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13
  },

  // STUDIO STYLES
  glassCard: {
    backgroundColor: '#0a101f',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold'
  },
  cardSubNote: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 14
  },
  pillBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  pillBadgeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: 'bold'
  },
  carPickerScroll: {
    flexDirection: 'row'
  },
  carOptionCard: {
    backgroundColor: '#070d18',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    minWidth: 130
  },
  carOptionCardActive: {
    borderColor: '#06b6d4',
    backgroundColor: '#092137'
  },
  carOptionMake: {
    color: '#94a3b8',
    fontSize: 11
  },
  carOptionModel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginVertical: 2
  },
  carOptionSpec: {
    color: '#64748b',
    fontSize: 9
  },
  subConfigLabel: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6
  },
  configOptionsRow: {
    gap: 6
  },
  configOptionChip: {
    backgroundColor: '#0e172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  configOptionChipActive: {
    borderColor: '#06b6d4',
    backgroundColor: '#08253a'
  },
  configOptionChipText: {
    color: '#94a3b8',
    fontSize: 11
  },
  targetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  targetBtn: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#0e172a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  targetBtnActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4'
  },
  targetBtnTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2
  },
  targetBtnDesc: {
    color: '#94a3b8',
    fontSize: 10
  },
  toolNavStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16
  },
  toolNavPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0a101f',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  toolNavPillActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4'
  },
  toolNavPillText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  toolNavPillTextActive: {
    color: '#020617',
    fontWeight: 'bold'
  },
  toggleBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  toggleBtnActive: {
    backgroundColor: '#064e3b'
  },
  toggleBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  canvasContainer: {
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: '#070d18',
    borderRadius: 12,
    padding: 6
  },
  fallbackNotice: {
    backgroundColor: '#0e172a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  fallbackText: {
    color: '#94a3b8',
    fontSize: 12
  },
  delayTable: {
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12
  },
  delayHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 8
  },
  delayTh: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold'
  },
  delayRow: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#0a101f'
  },
  delayRowAlt: {
    backgroundColor: '#0e172a'
  },
  delayTdName: {
    flex: 1.2,
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600'
  },
  delayTd: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 10
  },
  delayTdCyan: {
    flex: 1,
    color: '#06b6d4',
    fontSize: 10,
    fontWeight: 'bold'
  },
  sliderRack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#060a12',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 12
  },
  sliderCol: {
    alignItems: 'center',
    flex: 1
  },
  stepperBtn: {
    width: 18,
    height: 18,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2
  },
  stepperBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  sliderBarTrack: {
    width: 6,
    height: 70,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 2
  },
  sliderBarFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 3
  },
  sliderZero: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: '#475569'
  },
  gainNumber: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#cbd5e1'
  },
  freqTag: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2
  },
  insightBox: {
    marginTop: 12,
    backgroundColor: '#0e172a',
    padding: 12,
    borderRadius: 8
  },
  insightTitle: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4
  },
  insightText: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 17
  },
  filterCard: {
    backgroundColor: '#0e172a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  filterCardAmber: {
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b'
  },
  filterCardHead: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4
  },
  filterValue: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 14
  },
  filterDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4
  },
  subsonicWarning: {
    color: '#f59e0b',
    fontSize: 10,
    backgroundColor: '#2b1e06',
    padding: 6,
    borderRadius: 4,
    marginVertical: 4
  },
  voltageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  voltageBox: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#0e172a',
    padding: 12,
    borderRadius: 8
  },
  voltageLabel: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold'
  },
  voltageNumber: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: '900',
    marginVertical: 4
  },
  voltageTone: {
    color: '#cbd5e1',
    fontSize: 11
  },
  voltageKnob: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2
  },
  toneList: {
    gap: 8
  },
  toneCardBtn: {
    backgroundColor: '#0e172a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  toneCardBtnActive: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981'
  },
  toneCardTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13
  },
  toneCardSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2
  },
  toneCardStatus: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 6
  },
  stopGlobalBtn: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  stopGlobalBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12
  },
  codeExportCard: {
    backgroundColor: '#070d18',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10
  },
  codeExportTitle: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 6
  },
  codeExportBody: {
    color: '#cbd5e1',
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 15
  },
  textWhite: { color: '#ffffff' },
  textCyan: { color: '#06b6d4' },
  textRed: { color: '#ef4444' },
  textBlack: { color: '#020617' },
  luxuryFooter: {
    marginTop: 36,
    alignItems: 'center'
  },
  footerBrand: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600'
  },
  footerNote: {
    color: '#475569',
    fontSize: 10,
    marginTop: 2
  }
});
