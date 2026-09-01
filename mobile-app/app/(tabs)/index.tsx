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
  TextInput
} from 'react-native';
import HeroScrollSequence from '@/components/HeroScrollSequence';
import {
  INDIAN_CAR_MAKES,
  HEAD_UNIT_OPTIONS,
  FRONT_SPEAKER_OPTIONS,
  REAR_SPEAKER_OPTIONS,
  AMPLIFIER_OPTIONS,
  SUBWOOFER_OPTIONS,
  CarModelData,
  VehicleMake
} from '@/constants/catalog';

const SPEED_OF_SOUND = 34.3; // cm / ms
const EQ_FREQUENCIES = [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000];

export default function AppMainScreen() {
  // Top-level Navigation View
  const [currentView, setCurrentView] = useState<'landing' | 'studio'>('landing');

  // Wizard Step State (1: Make -> 2: Model -> 3: Equipment -> 4: Tuning Dashboard)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected Configurations
  const [selectedMake, setSelectedMake] = useState<VehicleMake>(INDIAN_CAR_MAKES[0]); // Default: Skoda
  const [selectedCar, setSelectedCar] = useState<CarModelData>(INDIAN_CAR_MAKES[0].models[0]); // Default: Kylaq
  const [selectedHeadUnit, setSelectedHeadUnit] = useState(HEAD_UNIT_OPTIONS[0]); // Nakamichi
  const [selectedFrontSpeaker, setSelectedFrontSpeaker] = useState(FRONT_SPEAKER_OPTIONS[0]); // Sony XS-162GS
  const [selectedRearSpeaker, setSelectedRearSpeaker] = useState(REAR_SPEAKER_OPTIONS[0]); // Sony Coax
  const [selectedAmplifier, setSelectedAmplifier] = useState(AMPLIFIER_OPTIONS[0]); // MOCO + Sound Barrier
  const [selectedSubwoofer, setSelectedSubwoofer] = useState(SUBWOOFER_OPTIONS[0]); // Pioneer Ported 35Hz

  // Search filter for Make/Model
  const [makeSearch, setMakeSearch] = useState('');

  // Target Sound Profile
  const [soundProfile, setSoundProfile] = useState<'sql' | 'harman' | 'vocal'>('sql');

  // Studio Sub-tab Navigation
  const [studioTab, setStudioTab] = useState<'simulation' | 'eq' | 'crossover' | 'gain' | 'tones' | 'export'>('simulation');
  const [timeAlignmentEnabled, setTimeAlignmentEnabled] = useState<boolean>(true);
  const [isPlayingTone, setIsPlayingTone] = useState<string | null>(null);

  // Audio Context Ref & Canvas Refs
  const audioCtxRef = useRef<any>(null);
  const oscRef = useRef<any>(null);
  const soundfieldCanvasRef = useRef<any>(null);
  const eqCanvasRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // -------------------------------------------------------------
  // DYNAMIC ACOUSTIC CALCULATIONS
  // -------------------------------------------------------------
  const maxDistance = Math.max(...Object.values(selectedCar.distances_rhd));
  const delaysMs = {
    FR: +((maxDistance - selectedCar.distances_rhd.FR) / SPEED_OF_SOUND).toFixed(2),
    RR: +((maxDistance - selectedCar.distances_rhd.RR) / SPEED_OF_SOUND).toFixed(2),
    FL: +((maxDistance - selectedCar.distances_rhd.FL) / SPEED_OF_SOUND).toFixed(2),
    RL: +((maxDistance - selectedCar.distances_rhd.RL) / SPEED_OF_SOUND).toFixed(2),
    SUB: +((maxDistance - selectedCar.distances_rhd.SUB) / SPEED_OF_SOUND).toFixed(2)
  };

  const frontHpf = selectedFrontSpeaker.hpf;
  const rearHpf = selectedRearSpeaker.id === 'none' ? 0 : selectedRearSpeaker.hpf;
  const subLpf = 80;
  const subsonicHz = selectedSubwoofer.type === 'ported' ? Math.max(20, selectedSubwoofer.tuneHz - 7) : 20;

  // DMM Target Voltages: V = sqrt(P * R)
  const vFront = +(Math.sqrt(selectedFrontSpeaker.rms * selectedFrontSpeaker.ohms)).toFixed(2);
  const vRear = selectedRearSpeaker.rms > 0 ? +(Math.sqrt(selectedRearSpeaker.rms * 0.6 * selectedRearSpeaker.ohms)).toFixed(2) : 0;
  const vSub = selectedSubwoofer.rms > 0 ? +(Math.sqrt(selectedSubwoofer.rms * selectedSubwoofer.ohms)).toFixed(2) : 0;

  // Dynamic EQ Targets
  const [eqGains, setEqGains] = useState<number[]>([4.0, 5.5, 2.0, -1.5, 0.0, 0.0, 0.5, 1.0, -1.0, 1.5, 1.5, 2.0, 1.5, 1.5]);

  useEffect(() => {
    // Dynamically notch the vehicle's specific standing wave frequency
    const notchGain = selectedCar.category === 'Full-Size SUV' ? -2.0 : -1.5;
    if (soundProfile === 'sql') {
      setEqGains([4.0, 5.5, 2.0, notchGain, 0.0, 0.0, 0.5, 1.0, -1.0, 1.5, 1.5, 2.0, 1.5, 1.5]);
    } else if (soundProfile === 'harman') {
      setEqGains([3.0, 3.0, 1.5, -1.0, 0.0, 0.0, 0.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.0]);
    } else {
      setEqGains([1.0, 1.0, 0.0, -2.0, 1.0, 1.5, 2.0, 1.5, 0.0, 1.0, 1.0, 1.0, 0.5, 0.5]);
    }
  }, [soundProfile, selectedCar]);

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
      const driverX = width * 0.65;
      const driverY = height * 0.42;

      ctx.beginPath();
      ctx.arc(driverX, driverY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(driverX, driverY, 16 + Math.sin(time * 0.08) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('SWEET SPOT (DRIVER)', driverX - 55, driverY - 14);

      // Sound Wave Propagation from Each Speaker
      const speakerList = [
        { name: 'FL', x: 0.22, y: 0.35, delay: delaysMs.FL, color: '#38bdf8' },
        { name: 'FR', x: 0.78, y: 0.35, delay: delaysMs.FR, color: '#38bdf8' },
        { name: 'RL', x: 0.22, y: 0.68, delay: delaysMs.RL, color: '#818cf8' },
        { name: 'RR', x: 0.78, y: 0.68, delay: delaysMs.RR, color: '#818cf8' },
        { name: 'SUB', x: 0.50, y: 0.90, delay: delaysMs.SUB, color: '#f59e0b' }
      ];

      speakerList.forEach((spk) => {
        if (spk.name.startsWith('R') && selectedRearSpeaker.id === 'none') return;
        if (spk.name === 'SUB' && selectedSubwoofer.type === 'none') return;

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
  }, [timeAlignmentEnabled, selectedCar, currentView, studioTab, selectedRearSpeaker, selectedSubwoofer]);

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

  const filteredMakes = INDIAN_CAR_MAKES.filter((m) =>
    m.name.toLowerCase().includes(makeSearch.toLowerCase()) ||
    m.models.some((model) => model.model.toLowerCase().includes(makeSearch.toLowerCase()))
  );

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
            onPress={() => {
              setCurrentView('studio');
            }}
          >
            <Text style={[styles.navPillText, currentView === 'studio' && styles.navPillTextActive]}>
              🎛️ Tuning Wizard & Studio
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* ========================================================================= */}
        {/* VIEW 1: CINEMATIC SCROLLYTELLING & LANDING EXPERIENCE                     */}
        {/* ========================================================================= */}
        {currentView === 'landing' && (
          <View style={styles.viewContent}>

            {/* HERO TITLE */}
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
                Select your car make, model, and installed equipment. Our acoustic engine calculates millimeter time alignment, 14-band parametric EQ, and amplifier gain staging in seconds.
              </Text>

              {/* ------------------------------------------------------------- */}
              {/* THE FRAMER MOTION SCROLLYTELLING HERO SEQUENCE                */}
              {/* ------------------------------------------------------------- */}
              <View style={{ width: '100%', marginBottom: 30 }}>
                <HeroScrollSequence onEnterStudio={() => {
                  setCurrentView('studio');
                  setWizardStep(1);
                }} />
              </View>

              {/* HERO CTA BUTTONS */}
              <View style={styles.heroBtnRow}>
                <TouchableOpacity
                  style={styles.primaryGlowBtn}
                  onPress={() => {
                    setCurrentView('studio');
                    setWizardStep(1);
                  }}
                >
                  <Text style={styles.primaryGlowBtnText}>Configure My Car & Audio Setup →</Text>
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
                  <Text style={styles.statVal}>9+ Makes</Text>
                  <Text style={styles.statKey}>25+ Indian Models</Text>
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

          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: 4-STEP CAR & HARDWARE CONFIGURATOR & TUNING STUDIO                */}
        {/* ========================================================================= */}
        {currentView === 'studio' && (
          <View style={styles.viewContent}>

            {/* STEP PROGRESS INDICATOR */}
            <View style={styles.wizardProgressBar}>
              {[
                { step: 1, label: '1. Select Make' },
                { step: 2, label: '2. Select Model' },
                { step: 3, label: '3. Audio Gear' },
                { step: 4, label: '4. AI Tuning' }
              ].map((item) => (
                <TouchableOpacity
                  key={item.step}
                  style={[styles.wizardStepTab, wizardStep === item.step && styles.wizardStepTabActive]}
                  onPress={() => setWizardStep(item.step as any)}
                >
                  <View style={[styles.wizardStepBadge, wizardStep === item.step && styles.wizardStepBadgeActive]}>
                    <Text style={[styles.wizardStepBadgeText, wizardStep === item.step && styles.textBlack]}>{item.step}</Text>
                  </View>
                  <Text style={[styles.wizardStepLabel, wizardStep === item.step && styles.textWhite]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ------------------------------------------------------------- */}
            {/* STEP 1: SELECT VEHICLE MAKE                                   */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 1 && (
              <View style={styles.glassCard}>
                <View style={styles.cardHeaderFlex}>
                  <View>
                    <Text style={styles.cardTitle}>🚗 Step 1: Select Vehicle Manufacturer</Text>
                    <Text style={styles.cardSubNote}>Choose from major automobile manufacturers in India:</Text>
                  </View>
                </View>

                {/* Make Search Bar */}
                <View style={styles.searchBarContainer}>
                  <TextInput
                    placeholder="Search brand or model (e.g. Skoda, Swift, Creta)..."
                    placeholderTextColor="#64748b"
                    value={makeSearch}
                    onChangeText={setMakeSearch}
                    style={styles.searchInput}
                  />
                </View>

                {/* Grid of Vehicle Makes */}
                <View style={styles.makeGrid}>
                  {filteredMakes.map((make) => {
                    const isSelected = selectedMake.id === make.id;
                    return (
                      <TouchableOpacity
                        key={make.id}
                        style={[styles.makeCard, isSelected && styles.makeCardActive]}
                        onPress={() => {
                          setSelectedMake(make);
                          setSelectedCar(make.models[0]);
                          setWizardStep(2); // Auto advance to Step 2
                        }}
                      >
                        <View style={[styles.makeBadgeDot, { backgroundColor: make.badgeColor }]} />
                        <Text style={[styles.makeName, isSelected && styles.textWhite]}>{make.name}</Text>
                        <Text style={styles.makeCountry}>{make.country}</Text>
                        <View style={styles.modelCountPill}>
                          <Text style={styles.modelCountText}>{make.models.length} Models Available →</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: SELECT CAR MODEL & CABIN TYPE                         */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 2 && (
              <View style={styles.glassCard}>
                <View style={styles.cardHeaderFlex}>
                  <View>
                    <Text style={styles.cardTitle}>🚙 Step 2: Select {selectedMake.name} Model</Text>
                    <Text style={styles.cardSubNote}>Choose your specific vehicle to load exact in-cabin acoustic geometry:</Text>
                  </View>
                  <TouchableOpacity style={styles.backLinkBtn} onPress={() => setWizardStep(1)}>
                    <Text style={styles.backLinkText}>← Change Make</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modelGrid}>
                  {selectedMake.models.map((model) => {
                    const isSelected = selectedCar.id === model.id;
                    return (
                      <TouchableOpacity
                        key={model.id}
                        style={[styles.modelCard, isSelected && styles.modelCardActive]}
                        onPress={() => {
                          setSelectedCar(model);
                          setWizardStep(3); // Auto advance to Step 3
                        }}
                      >
                        <View style={styles.modelCardHeader}>
                          <Text style={[styles.modelTitle, isSelected && styles.cyanAccent]}>{model.model}</Text>
                          <View style={styles.categoryBadge}><Text style={styles.categoryBadgeText}>{model.category}</Text></View>
                        </View>

                        <Text style={styles.modelYear}>Production: {model.year}</Text>

                        {/* Acoustic Specs Strip */}
                        <View style={styles.specStrip}>
                          <View style={styles.specCell}>
                            <Text style={styles.specLabel}>Wheelbase</Text>
                            <Text style={styles.specValue}>{model.wheelbase} mm</Text>
                          </View>
                          <View style={styles.specCell}>
                            <Text style={styles.specLabel}>Cabin Volume</Text>
                            <Text style={styles.specValue}>{model.cabinVolumeM3} m³</Text>
                          </View>
                          <View style={styles.specCell}>
                            <Text style={styles.specLabel}>Resonance</Text>
                            <Text style={styles.specValue}>{model.resonantFreqHz} Hz</Text>
                          </View>
                        </View>

                        <View style={styles.speakerSpecBox}>
                          <Text style={styles.speakerSpecText}>• Front: {model.speakerSizes.front} ({model.speakerSizes.tweeterLocation})</Text>
                          <Text style={styles.speakerSpecText}>• Rear: {model.speakerSizes.rear} • Depth: {model.speakerSizes.maxDepthMm}mm</Text>
                        </View>

                        <View style={[styles.selectModelBtn, isSelected && styles.selectModelBtnActive]}>
                          <Text style={[styles.selectModelBtnText, isSelected && styles.textBlack]}>
                            {isSelected ? '✓ Selected Model' : 'Select This Model →'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: CONFIGURE INSTALLED AUDIO EQUIPMENT                   */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 3 && (
              <View style={styles.glassCard}>
                <View style={styles.cardHeaderFlex}>
                  <View>
                    <Text style={styles.cardTitle}>🎛️ Step 3: Configure Installed Audio Hardware</Text>
                    <Text style={styles.cardSubNote}>
                      Configuring for <Text style={styles.cyanAccent}>{selectedMake.name} {selectedCar.model}</Text>:
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.backLinkBtn} onPress={() => setWizardStep(2)}>
                    <Text style={styles.backLinkText}>← Change Model</Text>
                  </TouchableOpacity>
                </View>

                {/* 1. Head Unit */}
                <Text style={styles.subConfigLabel}>1. Head Unit / Infotainment Source:</Text>
                <View style={styles.configOptionsRow}>
                  {HEAD_UNIT_OPTIONS.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.configOptionChip, selectedHeadUnit.id === item.id && styles.configOptionChipActive]}
                      onPress={() => setSelectedHeadUnit(item)}
                    >
                      <Text style={[styles.configOptionChipText, selectedHeadUnit.id === item.id && styles.textWhite]}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 2. Front Speakers */}
                <Text style={styles.subConfigLabel}>2. Front Door Speakers & Tweeters:</Text>
                <View style={styles.configOptionsRow}>
                  {FRONT_SPEAKER_OPTIONS.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.configOptionChip, selectedFrontSpeaker.id === item.id && styles.configOptionChipActive]}
                      onPress={() => setSelectedFrontSpeaker(item)}
                    >
                      <Text style={[styles.configOptionChipText, selectedFrontSpeaker.id === item.id && styles.textWhite]}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 3. Rear Speakers */}
                <Text style={styles.subConfigLabel}>3. Rear Door / Fill Speakers:</Text>
                <View style={styles.configOptionsRow}>
                  {REAR_SPEAKER_OPTIONS.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.configOptionChip, selectedRearSpeaker.id === item.id && styles.configOptionChipActive]}
                      onPress={() => setSelectedRearSpeaker(item)}
                    >
                      <Text style={[styles.configOptionChipText, selectedRearSpeaker.id === item.id && styles.textWhite]}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 4. Amplifiers */}
                <Text style={styles.subConfigLabel}>4. Power Amplifiers:</Text>
                <View style={styles.configOptionsRow}>
                  {AMPLIFIER_OPTIONS.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.configOptionChip, selectedAmplifier.id === item.id && styles.configOptionChipActive]}
                      onPress={() => setSelectedAmplifier(item)}
                    >
                      <Text style={[styles.configOptionChipText, selectedAmplifier.id === item.id && styles.textWhite]}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 5. Subwoofer */}
                <Text style={styles.subConfigLabel}>5. Subwoofer & Enclosure Box Tuning:</Text>
                <View style={styles.configOptionsRow}>
                  {SUBWOOFER_OPTIONS.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.configOptionChip, selectedSubwoofer.id === item.id && styles.configOptionChipActive]}
                      onPress={() => setSelectedSubwoofer(item)}
                    >
                      <Text style={[styles.configOptionChipText, selectedSubwoofer.id === item.id && styles.textWhite]}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Proceed to Step 4 Button */}
                <TouchableOpacity style={styles.startTuningLargeBtn} onPress={() => setWizardStep(4)}>
                  <Text style={styles.startTuningLargeBtnText}>⚡ Calculate AI Acoustic Tuning →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: AI ACOUSTIC TUNING DASHBOARD                          */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 4 && (
              <View>
                {/* ACTIVE VEHICLE SUMMARY CARD */}
                <View style={styles.glassCard}>
                  <View style={styles.cardHeaderFlex}>
                    <View>
                      <Text style={styles.cardTitle}>
                        🚗 Calibrating: <Text style={styles.cyanAccent}>{selectedMake.name} {selectedCar.model}</Text>
                      </Text>
                      <Text style={styles.cardSubNote}>
                        Gear: {selectedHeadUnit.name.split('(')[0]} • {selectedFrontSpeaker.name.split('(')[0]} • {selectedSubwoofer.name.split('(')[0]}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.backLinkBtn} onPress={() => setWizardStep(3)}>
                      <Text style={styles.backLinkText}>Edit Gear ⚙️</Text>
                    </TouchableOpacity>
                  </View>

                  {/* SOUND TARGET PROFILE SELECTION */}
                  <Text style={styles.subConfigLabel}>Target Sound Signature:</Text>
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
                      Live wave rendering inside {selectedMake.name} {selectedCar.model} cabin ({selectedCar.cabinVolumeM3} m³).
                    </Text>

                    {Platform.OS === 'web' && (
                      <View style={styles.canvasContainer}>
                        <canvas
                          ref={soundfieldCanvasRef}
                          width={480}
                          height={420}
                          style={{ width: '100%', maxWidth: 480, height: 380, borderRadius: 12 }}
                        />
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
                        { name: 'Front Right (FR)', dist: `${selectedCar.distances_rhd.FR} cm`, delay: `${delaysMs.FR} ms`, offset: `${maxDistance - selectedCar.distances_rhd.FR} cm` },
                        { name: 'Rear Right (RR)', dist: `${selectedCar.distances_rhd.RR} cm`, delay: `${delaysMs.RR} ms`, offset: `${maxDistance - selectedCar.distances_rhd.RR} cm` },
                        { name: 'Front Left (FL)', dist: `${selectedCar.distances_rhd.FL} cm`, delay: `${delaysMs.FL} ms`, offset: `${maxDistance - selectedCar.distances_rhd.FL} cm` },
                        { name: 'Rear Left (RL)', dist: `${selectedCar.distances_rhd.RL} cm`, delay: `${delaysMs.RL} ms`, offset: `${maxDistance - selectedCar.distances_rhd.RL} cm` },
                        { name: 'Boot Subwoofer', dist: `${selectedCar.distances_rhd.SUB} cm`, delay: '0.00 ms (Ref)', offset: '0 cm' },
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
                      Continuous mathematical curve matching {selectedHeadUnit.name}:
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
                      <Text style={styles.insightTitle}>💡 Acoustic Offsets Applied:</Text>
                      <Text style={styles.insightText}>• <Text style={styles.textWhite}>+5.5 dB @ 63Hz</Text>: {selectedSubwoofer.tuneHz > 0 ? `${selectedSubwoofer.tuneHz}Hz ported box resonance boost` : 'Sub-bass punch boost'}.</Text>
                      <Text style={styles.insightText}>• <Text style={styles.textWhite}>-1.5 dB @ 200Hz</Text>: Eliminates {selectedCar.category} ({selectedCar.resonantFreqHz}Hz) standing cabin boom.</Text>
                      <Text style={styles.insightText}>• <Text style={styles.textWhite}>-1.0 dB @ 4kHz</Text>: Windshield acoustic reflection tamer.</Text>
                    </View>
                  </View>
                )}

                {/* TAB 3: CROSSOVERS & DIALS */}
                {studioTab === 'crossover' && (
                  <View style={styles.glassCard}>
                    <Text style={styles.cardTitle}>🎛️ Physical Amplifier Filter Dials & Crossovers</Text>

                    <View style={styles.filterCard}>
                      <Text style={styles.filterCardHead}>Front Channels ({selectedFrontSpeaker.name})</Text>
                      <Text style={styles.filterValue}>HPF (High Pass): ~{frontHpf} Hz (Approx. 9:30 o'clock)</Text>
                      <Text style={styles.filterDesc}>Filters out bass sub-80Hz to protect {selectedFrontSpeaker.rms}W RMS woofers and ensure crystal clear vocal midrange.</Text>
                    </View>

                    {selectedRearSpeaker.id !== 'none' && (
                      <View style={styles.filterCard}>
                        <Text style={styles.filterCardHead}>Rear Channels ({selectedRearSpeaker.name})</Text>
                        <Text style={styles.filterValue}>HPF (High Pass): ~{rearHpf} Hz (Approx. 10:00 o'clock)</Text>
                        <Text style={styles.filterDesc}>Attenuated (-4dB) spatial ambient fill that doesn't pull the vocal stage backward.</Text>
                      </View>
                    )}

                    {selectedSubwoofer.type !== 'none' && (
                      <View style={[styles.filterCard, styles.filterCardAmber]}>
                        <Text style={[styles.filterCardHead, { color: '#f59e0b' }]}>Subwoofer ({selectedSubwoofer.name})</Text>
                        <Text style={styles.filterValue}>LPF (Low Pass): ~{subLpf} Hz</Text>
                        <Text style={styles.filterValue}>Subsonic Filter: ~{subsonicHz} Hz</Text>
                        {selectedSubwoofer.type === 'ported' && (
                          <Text style={styles.subsonicWarning}>
                            ⚠️ PORTED BOX SAFETY: Frequencies below {selectedSubwoofer.tuneHz}Hz cause cone unloading. The {subsonicHz}Hz subsonic cutoff prevents mechanical voice coil destruction.
                          </Text>
                        )}
                        <Text style={styles.filterDesc}>Bass Boost: MUST BE SET TO 0 dB (OFF).</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* TAB 4: MULTIMETER VOLTAGES */}
                {studioTab === 'gain' && (
                  <View style={styles.glassCard}>
                    <Text style={styles.cardTitle}>⚡ Multimeter Target AC Voltages (V = √(P × R))</Text>
                    <Text style={styles.cardSubNote}>
                      Set {selectedHeadUnit.name.split('(')[0]} volume to 75% (Vol 30) with flat EQ before measuring amplifier terminals:
                    </Text>

                    <View style={styles.voltageGrid}>
                      <View style={styles.voltageBox}>
                        <Text style={styles.voltageLabel}>Front Channels (CH1/2)</Text>
                        <Text style={styles.voltageNumber}>{vFront} V AC</Text>
                        <Text style={styles.voltageTone}>Test Tone: 1,000 Hz 0dB Sine</Text>
                        <Text style={styles.voltageKnob}>Knob Position: ~10:30 o'clock</Text>
                      </View>

                      {selectedRearSpeaker.id !== 'none' && (
                        <View style={styles.voltageBox}>
                          <Text style={styles.voltageLabel}>Rear Channels (CH3/4)</Text>
                          <Text style={styles.voltageNumber}>{vRear} V AC</Text>
                          <Text style={styles.voltageTone}>Test Tone: 1,000 Hz 0dB Sine</Text>
                          <Text style={styles.voltageKnob}>Knob Position: ~9:30 o'clock</Text>
                        </View>
                      )}

                      {selectedSubwoofer.type !== 'none' && (
                        <View style={styles.voltageBox}>
                          <Text style={styles.voltageLabel}>Subwoofer Channel</Text>
                          <Text style={styles.voltageNumber}>{vSub} V AC</Text>
                          <Text style={styles.voltageTone}>Test Tone: 50 Hz 0dB Sine</Text>
                          <Text style={styles.voltageKnob}>Knob Position: ~11:30 o'clock</Text>
                        </View>
                      )}
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
                        <Text style={styles.toneCardSub}>Used for measuring Front/Rear speaker amplifier AC voltage ({vFront}V)</Text>
                        <Text style={styles.toneCardStatus}>{isPlayingTone === '1000' ? '⏹️ STOPPING' : '▶️ PLAY 1 kHz'}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.toneCardBtn, isPlayingTone === '50' && styles.toneCardBtnActive]}
                        onPress={() => playTone('50', 50)}
                      >
                        <Text style={styles.toneCardTitle}>50 Hz Sine Wave (0 dB)</Text>
                        <Text style={styles.toneCardSub}>Used for measuring Subwoofer amplifier AC voltage ({vSub}V)</Text>
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
                        {`<PioneerDSPConfig version="1.0">\n  <Car>${selectedMake.name} ${selectedCar.model}</Car>\n  <TimeAlignment FR="${delaysMs.FR}ms" FL="${delaysMs.FL}ms" SUB="0ms"/>\n  <Crossover HPF="${frontHpf}Hz" LPF="${subLpf}Hz" Subsonic="${subsonicHz}Hz"/>\n</PioneerDSPConfig>`}
                      </Text>
                    </View>

                    <View style={styles.codeExportCard}>
                      <Text style={styles.codeExportTitle}>MiniDSP 2x4 HD JSON Format</Text>
                      <Text style={styles.codeExportBody}>
                        {`{\n  "vehicle": "${selectedMake.name} ${selectedCar.model}",\n  "delays_ms": { "FR": ${delaysMs.FR}, "FL": ${delaysMs.FL}, "SUB": 0 },\n  "crossover": { "front_hpf": ${frontHpf}, "sub_lpf": ${subLpf} }\n}`}
                      </Text>
                    </View>
                  </View>
                )}
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

  // WIZARD PROGRESS BAR STYLES
  wizardProgressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0a101f',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 6
  },
  wizardStepTab: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8
  },
  wizardStepTabActive: {
    backgroundColor: '#0e172a',
    borderWidth: 1,
    borderColor: '#06b6d4'
  },
  wizardStepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center'
  },
  wizardStepBadgeActive: {
    backgroundColor: '#06b6d4'
  },
  wizardStepBadgeText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold'
  },
  wizardStepLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },

  // STEP 1: MAKE SELECTION STYLES
  searchBarContainer: {
    marginBottom: 16
  },
  searchInput: {
    backgroundColor: '#070d18',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13
  },
  makeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  makeCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#070d18',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  makeCardActive: {
    borderColor: '#06b6d4',
    backgroundColor: '#092137'
  },
  makeBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8
  },
  makeName: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2
  },
  makeCountry: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 10
  },
  modelCountPill: {
    backgroundColor: '#0f172a',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  modelCountText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600'
  },

  // STEP 2: MODEL SELECTION STYLES
  backLinkBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  backLinkText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold'
  },
  modelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14
  },
  modelCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: '#070d18',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  modelCardActive: {
    borderColor: '#06b6d4',
    backgroundColor: '#081f33'
  },
  modelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  modelTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  categoryBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  categoryBadgeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: 'bold'
  },
  modelYear: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 12
  },
  specStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0b1322',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10
  },
  specCell: {
    alignItems: 'center'
  },
  specLabel: {
    color: '#64748b',
    fontSize: 9
  },
  specValue: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2
  },
  speakerSpecBox: {
    backgroundColor: '#0b1322',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12
  },
  speakerSpecText: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16
  },
  selectModelBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  selectModelBtnActive: {
    backgroundColor: '#06b6d4'
  },
  selectModelBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },

  // STEP 3: EQUIPMENT CONFIGURATION STYLES
  subConfigLabel: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 6
  },
  configOptionsRow: {
    gap: 6
  },
  configOptionChip: {
    backgroundColor: '#070d18',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  configOptionChipActive: {
    borderColor: '#06b6d4',
    backgroundColor: '#08253a'
  },
  configOptionChipText: {
    color: '#94a3b8',
    fontSize: 12
  },
  startTuningLargeBtn: {
    backgroundColor: '#06b6d4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#06b6d4',
    shadowOpacity: 0.4,
    shadowRadius: 12
  },
  startTuningLargeBtnText: {
    color: '#020617',
    fontSize: 15,
    fontWeight: '900'
  },

  // STEP 4: TUNING STUDIO STYLES
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
    marginTop: 2
  },
  targetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6
  },
  targetBtn: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#070d18',
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
    backgroundColor: '#070d18'
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
    backgroundColor: '#070d18',
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
    backgroundColor: '#070d18',
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
    backgroundColor: '#070d18',
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
    backgroundColor: '#070d18',
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
