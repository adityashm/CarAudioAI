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
  TextInput,
  Image
} from 'react-native';
import HeroScrollSequence from '@/components/HeroScrollSequence';
import AuthModal from '@/components/AuthModal';
import PaymentModal from '@/components/PaymentModal';
import RtaMeasurementModal from '@/components/RtaMeasurementModal';
import { UserProfile, getCurrentUser } from '@/services/authService';
import {
  downloadPioneerXml,
  downloadMiniDspJson,
  generatePioneerXml,
  generateMiniDspJson,
} from '@/services/exportService';
import {
  INDIAN_CAR_MAKES,
  HEAD_UNIT_OPTIONS,
  FRONT_SPEAKER_OPTIONS,
  REAR_SPEAKER_OPTIONS,
  AMPLIFIER_OPTIONS,
  SUBWOOFER_OPTIONS,
  HEAD_UNIT_BRANDS,
  FRONT_SPEAKER_BRANDS,
  REAR_SPEAKER_BRANDS,
  AMPLIFIER_BRANDS,
  SUBWOOFER_BRANDS,
  CarModelData,
  VehicleMake,
  HeadUnitItem,
  SpeakerItem,
  AmplifierItem,
  SubwooferItem
} from '@/constants/catalog';
import { CarBrandLogo } from '@/components/ui/CarBrandLogo';
import EquipmentBrandModelSelector from '@/components/configurator/EquipmentBrandModelSelector';

const SPEED_OF_SOUND = 34.3; // cm / ms
const EQ_FREQUENCIES = [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000];

export default function AppMainScreen() {
  // Navigation View: 'landing' or 'studio'
  const [currentView, setCurrentView] = useState<'landing' | 'studio'>('landing');

  // Modals
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [rtaModalVisible, setRtaModalVisible] = useState(false);
  const [xmlCopied, setXmlCopied] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Load authenticated user on mount
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });
  }, []);

  // Configurator Step State (1: Make -> 2: Model -> 3: Equipment -> 4: Tuning Dashboard)
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
  const [makeCategoryFilter, setMakeCategoryFilter] = useState<string>('all');

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

  // Dynamic Acoustic Calculations
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

      const width = canvas.width || 480;
      const height = canvas.height || 400;

      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, width, height);

      // Draw Car Body Schematic Outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.35, height * 0.10);
      ctx.lineTo(width * 0.65, height * 0.10);
      ctx.lineTo(width * 0.82, height * 0.25);
      ctx.lineTo(width * 0.86, height * 0.78);
      ctx.lineTo(width * 0.65, height * 0.94);
      ctx.lineTo(width * 0.35, height * 0.94);
      ctx.lineTo(width * 0.14, height * 0.78);
      ctx.lineTo(width * 0.18, height * 0.25);
      ctx.closePath();
      ctx.stroke();

      // Seats & Center Console
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width * 0.54, height * 0.34, width * 0.22, height * 0.16);
      ctx.strokeRect(width * 0.24, height * 0.34, width * 0.22, height * 0.16);
      ctx.strokeRect(width * 0.24, height * 0.62, width * 0.52, height * 0.14);

      // Driver's Head Target (Glowing Pulse)
      const driverX = width * 0.65;
      const driverY = height * 0.42;

      ctx.beginPath();
      ctx.arc(driverX, driverY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(driverX, driverY, 14 + Math.sin(time * 0.08) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('SWEET SPOT', driverX - 32, driverY - 14);

      // Sound Wave Propagation from Each Speaker
      const speakerList = [
        { name: 'FL', x: 0.20, y: 0.35, delay: delaysMs.FL, color: '#22d3ee' },
        { name: 'FR', x: 0.80, y: 0.35, delay: delaysMs.FR, color: '#22d3ee' },
        { name: 'RL', x: 0.20, y: 0.68, delay: delaysMs.RL, color: '#a78bfa' },
        { name: 'RR', x: 0.80, y: 0.68, delay: delaysMs.RR, color: '#a78bfa' },
        { name: 'SUB', x: 0.50, y: 0.90, delay: delaysMs.SUB, color: '#ffffff' }
      ];

      speakerList.forEach((spk) => {
        if (spk.name.startsWith('R') && selectedRearSpeaker.id === 'none') return;
        if (spk.name === 'SUB' && selectedSubwoofer.type === 'none') return;

        const spkX = width * spk.x;
        const spkY = height * spk.y;

        ctx.beginPath();
        ctx.arc(spkX, spkY, spk.name === 'SUB' ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = spk.color;
        ctx.fill();

        const delayOffset = timeAlignmentEnabled ? (spk.delay * 8.0) : 0;
        const wavePhase = (time * 1.5 - delayOffset) % 120;

        for (let r = wavePhase; r < 180; r += 35) {
          if (r > 5) {
            const alpha = Math.max(0, 1 - r / 180);
            ctx.beginPath();
            ctx.arc(spkX, spkY, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.45})`;
            ctx.lineWidth = spk.name === 'SUB' ? 2 : 1.2;
            ctx.stroke();
          }
        }

        ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
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

    const width = canvas.width || 600;
    const height = canvas.height || 180;

    ctx.fillStyle = '#080a0f';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let y = 20; y < height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const zeroY = height / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
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

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(34, 211, 238, 0.20)');
    grad.addColorStop(1, 'rgba(34, 211, 238, 0.0)');
    ctx.fillStyle = grad;
    ctx.fill();

    points.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = eqGains[idx] > 0 ? '#22d3ee' : eqGains[idx] < 0 ? '#f59e0b' : '#ffffff';
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

  const filteredMakes = INDIAN_CAR_MAKES.filter((m) => {
    const q = makeSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.country.toLowerCase().includes(q) ||
      m.models.some((model) => model.model.toLowerCase().includes(q) || model.category.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (makeCategoryFilter === 'all') return true;
    return m.categoryTag === makeCategoryFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      {/* ========================================================================= */}
      {/* TURBOTWEAK MINIMALIST GLASS NAVBAR                                        */}
      {/* ========================================================================= */}
      <View style={styles.navBar}>
        <View style={styles.logoGroup}>
          <Text style={styles.logoBrand}>
            caraudio<Text style={styles.logoAccent}>ai</Text>
          </Text>
          <View style={styles.proPillBadge}>
            <Text style={styles.proPillText}>HMI v2.0</Text>
          </View>
        </View>

        <View style={styles.navLinksGroup}>
          <TouchableOpacity
            style={[styles.navAnchorPill, currentView === 'landing' && styles.navAnchorPillActive]}
            onPress={() => setCurrentView('landing')}
          >
            <Text style={[styles.navAnchorText, currentView === 'landing' && styles.textWhite]}>
              Experience
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navAnchorPill, currentView === 'studio' && styles.navAnchorPillActive]}
            onPress={() => {
              setCurrentView('studio');
              setWizardStep(1);
            }}
          >
            <Text style={[styles.navAnchorText, currentView === 'studio' && styles.textWhite]}>
              02 Configurator
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navAnchorPill, currentView === 'studio' && wizardStep === 4 && styles.navAnchorPillActive]}
            onPress={() => {
              setCurrentView('studio');
              setWizardStep(4);
            }}
          >
            <Text style={[styles.navAnchorText, currentView === 'studio' && wizardStep === 4 && styles.textWhite]}>
              03 DSP Studio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navAnchorPill}
            onPress={() => setPaymentModalVisible(true)}
          >
            <Text style={styles.navAnchorText}>
              05 Pricing
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navCtaGroup}>
          <TouchableOpacity
            style={styles.authPillBtn}
            onPress={() => setAuthModalVisible(true)}
          >
            <Text style={styles.authPillText}>{currentUser ? 'Account' : 'Login'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.whitePillBtn}
            onPress={() => {
              setCurrentView('studio');
              setWizardStep(1);
            }}
          >
            <Text style={styles.whitePillBtnText}>Launch Studio →</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* ========================================================================= */}
        {/* VIEW 1: TURBOTWEAK EDITORIAL LANDING & SCROLLYTELLING                     */}
        {/* ========================================================================= */}
        {currentView === 'landing' && (
          <View style={styles.viewContent}>

            {/* HERO SECTION */}
            <View style={styles.heroContainer}>
              {/* Giant Watermark Typography */}
              <Text style={styles.heroWatermark}>CARAUDIO.AI</Text>

              <View style={styles.heroContent}>
                <View style={styles.heroTagPill}>
                  <Text style={styles.heroTagText}>PRECISION ACOUSTICS // INDIAN AUTOMOTIVE</Text>
                </View>

                <Text style={styles.heroDisplayHeadline}>
                  Elevate Your Drive to{'\n'}
                  <Text style={styles.textWhite}>Extraordinary Heights.</Text>
                </Text>

                <Text style={styles.heroEditorialSub}>
                  Crafting power, phase coherence, and pinpoint vocal staging for the ultimate in-cabin driving experience.
                </Text>

                <View style={styles.heroCtaRow}>
                  <TouchableOpacity
                    style={styles.heroPrimaryWhitePill}
                    onPress={() => {
                      setCurrentView('studio');
                      setWizardStep(1);
                    }}
                  >
                    <Text style={styles.heroPrimaryWhitePillText}>Get started →</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.heroSecondaryOutlinePill}
                    onPress={() => Linking.openURL('https://github.com/adityashm/CarAudioAI')}
                  >
                    <Text style={styles.heroSecondaryOutlinePillText}>GitHub Repository</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* RACETRACK CAPSULE SCROLLYTELLING VIEWPORT */}
              <View style={styles.capsuleScrollytellingFrame}>
                <HeroScrollSequence onEnterStudio={() => {
                  setCurrentView('studio');
                  setWizardStep(1);
                }} />
              </View>
            </View>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 01: ABOUT THE PROJECT & ACOUSTIC PHYSICS              */}
            {/* ------------------------------------------------------------- */}
            <View style={styles.editorialSection}>
              {/* Ghost Outline Numeral & Overlay Badge */}
              <View style={styles.ghostNumeralGroup}>
                <Text style={styles.ghostNumeral}>01</Text>
                <View style={styles.ghostNumeralBadge}>
                  <Text style={styles.ghostNumeralBadgeText}>About</Text>
                </View>
              </View>

              <View style={styles.editorialTwoCol}>
                <View style={styles.editorialLeftCol}>
                  <Text style={styles.editorialSectionTitle}>
                    About The{'\n'}Platform.
                  </Text>
                </View>

                <View style={styles.editorialRightCol}>
                  <Text style={styles.editorialParagraph}>
                    CarAudioAI is your gateway to advanced automotive acoustic enhancement. Our engine blends precision acoustic physics with cutting-edge DSP calibration algorithms, offering tailored solutions for Indian car audio enthusiasts and professional installers alike.
                  </Text>
                  <Text style={styles.editorialParagraph}>
                    From correcting 1.25ms asymmetric right-hand-drive delay clashes to notching out the 200Hz cabin resonance of modern SUVs, CarAudioAI delivers unparalleled soundstage depth with safety and reliability at the forefront.
                  </Text>
                </View>
              </View>

              {/* Capsule Image Frame */}
              <View style={styles.capsuleImageFrame}>
                <Image
                  source={require('@/assets/images/shot1_exterior.jpg')}
                  style={styles.capsuleImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 02: 4-STEP CONFIGURATOR PREVIEW                       */}
            {/* ------------------------------------------------------------- */}
            <View style={styles.editorialSection}>
              <View style={styles.ghostNumeralGroup}>
                <Text style={styles.ghostNumeral}>02</Text>
                <View style={styles.ghostNumeralBadge}>
                  <Text style={styles.ghostNumeralBadgeText}>Configurator</Text>
                </View>
              </View>

              <View style={styles.editorialTwoCol}>
                <View style={styles.editorialLeftCol}>
                  <Text style={styles.editorialSectionTitle}>
                    Select Make,{'\n'}Model & Gear.
                  </Text>
                </View>

                <View style={styles.editorialRightCol}>
                  <Text style={styles.editorialParagraph}>
                    Choose from 9+ Indian automobile manufacturers (Skoda, Maruti Suzuki, Hyundai, Tata, Mahindra, Toyota, Kia, VW, Honda) and 25+ specific models to load exact cabin dimensions and speaker geometries.
                  </Text>
                  <TouchableOpacity
                    style={[styles.whitePillBtn, { alignSelf: 'flex-start', marginTop: 14 }]}
                    onPress={() => {
                      setCurrentView('studio');
                      setWizardStep(1);
                    }}
                  >
                    <Text style={styles.whitePillBtnText}>Open Configurator Wizard →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 03: LIVE DSP STUDIO PREVIEW                           */}
            {/* ------------------------------------------------------------- */}
            <View style={styles.editorialSection}>
              <View style={styles.ghostNumeralGroup}>
                <Text style={styles.ghostNumeral}>03</Text>
                <View style={styles.ghostNumeralBadge}>
                  <Text style={styles.ghostNumeralBadgeText}>DSP Studio</Text>
                </View>
              </View>

              <View style={styles.editorialTwoCol}>
                <View style={styles.editorialLeftCol}>
                  <Text style={styles.editorialSectionTitle}>
                    Live Acoustic{'\n'}Instrumentation.
                  </Text>
                </View>

                <View style={styles.editorialRightCol}>
                  <Text style={styles.editorialParagraph}>
                    Interactive 14-band Bezier Equalizer, real-time 60FPS soundfield wave simulation, Linkwitz-Riley 24dB crossover knobs with subsonic ported enclosure safety protection, and multimeter target AC voltage calculator (V = √(P × R)).
                  </Text>
                  <TouchableOpacity
                    style={[styles.whitePillBtn, { alignSelf: 'flex-start', marginTop: 14 }]}
                    onPress={() => {
                      setCurrentView('studio');
                      setWizardStep(4);
                    }}
                  >
                    <Text style={styles.whitePillBtnText}>Launch Live DSP Studio →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 05: PRICING & CALIBRATION TIERS                       */}
            {/* ------------------------------------------------------------- */}
            <View style={styles.editorialSection}>
              <View style={styles.ghostNumeralGroup}>
                <Text style={styles.ghostNumeral}>05</Text>
                <View style={styles.ghostNumeralBadge}>
                  <Text style={styles.ghostNumeralBadgeText}>Pricing</Text>
                </View>
              </View>

              <View style={styles.editorialTwoCol}>
                <View style={styles.editorialLeftCol}>
                  <Text style={styles.editorialSectionTitle}>
                    Precision Tuning{'\n'}For Everyone.
                  </Text>
                </View>

                <View style={styles.editorialRightCol}>
                  <Text style={styles.editorialParagraph}>
                    Get laboratory-grade acoustic DSP calibration at a fraction of hardware DSP costs. Simple, transparent pricing powered by Razorpay.
                  </Text>
                </View>
              </View>

              {/* Pricing Cards Grid */}
              <View style={styles.pricingCardsGrid}>
                {/* Free Tier */}
                <View style={styles.pricingCard}>
                  <Text style={styles.pricingTierName}>COMMUNITY</Text>
                  <Text style={styles.pricingPrice}>₹0<Text style={styles.pricingDuration}> / forever</Text></Text>
                  <Text style={styles.pricingDesc}>Basic vehicle database lookup and default 14-band graphic EQ curves.</Text>
                  <View style={styles.pricingDivider} />
                  <Text style={styles.pricingFeature}>✓ 9+ Indian Car Makes</Text>
                  <Text style={styles.pricingFeature}>✓ Static EQ Target Curves</Text>
                  <Text style={styles.pricingFeature}>✓ In-browser Test Tones</Text>
                  <TouchableOpacity
                    style={[styles.outlinePillBtn, { marginTop: 20 }]}
                    onPress={() => {
                      setCurrentView('studio');
                      setWizardStep(1);
                    }}
                  >
                    <Text style={styles.outlinePillBtnText}>Start Free</Text>
                  </TouchableOpacity>
                </View>

                {/* Pro Tier (Featured) */}
                <View style={[styles.pricingCard, styles.pricingCardFeatured]}>
                  <View style={styles.featuredBadge}><Text style={styles.featuredBadgeText}>MOST POPULAR</Text></View>
                  <Text style={styles.pricingTierName}>PRO ACOUSTIC</Text>
                  <Text style={styles.pricingPrice}>₹99<Text style={styles.pricingDuration}> / month</Text></Text>
                  <Text style={styles.pricingDesc}>Millisecond time-alignment, subsonic protection, and DMM gain staging voltages.</Text>
                  <View style={styles.pricingDivider} />
                  <Text style={styles.pricingFeature}>✓ Asymmetric RHD Time Alignment</Text>
                  <Text style={styles.pricingFeature}>✓ Custom Ported Sub Subsonic Filter</Text>
                  <Text style={styles.pricingFeature}>✓ Target AC Multimeter Voltages</Text>
                  <Text style={styles.pricingFeature}>✓ Pioneer XML & MiniDSP JSON Export</Text>
                  <TouchableOpacity
                    style={[styles.whitePillBtn, { marginTop: 20 }]}
                    onPress={() => setPaymentModalVisible(true)}
                  >
                    <Text style={styles.whitePillBtnText}>Upgrade to Pro →</Text>
                  </TouchableOpacity>
                </View>

                {/* Installer Tier */}
                <View style={styles.pricingCard}>
                  <Text style={styles.pricingTierName}>INSTALLER PRO</Text>
                  <Text style={styles.pricingPrice}>₹999<Text style={styles.pricingDuration}> / year</Text></Text>
                  <Text style={styles.pricingDesc}>Unlimited vehicle calibrations, client PDF reports, and multi-car garage storage.</Text>
                  <View style={styles.pricingDivider} />
                  <Text style={styles.pricingFeature}>✓ Unlimited Vehicle Calibrations</Text>
                  <Text style={styles.pricingFeature}>✓ Real-Time Mic RTA Smoothing</Text>
                  <Text style={styles.pricingFeature}>✓ White-Label Client Tuning Reports</Text>
                  <Text style={styles.pricingFeature}>✓ Priority WhatsApp Installer Support</Text>
                  <TouchableOpacity
                    style={[styles.outlinePillBtn, { marginTop: 20 }]}
                    onPress={() => setPaymentModalVisible(true)}
                  >
                    <Text style={styles.outlinePillBtnText}>Get Installer Pass</Text>
                  </TouchableOpacity>
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
                { step: 1, label: '01 Make' },
                { step: 2, label: '02 Model' },
                { step: 3, label: '03 Gear' },
                { step: 4, label: '04 DSP Studio' }
              ].map((item) => (
                <TouchableOpacity
                  key={item.step}
                  style={[styles.wizardStepTab, wizardStep === item.step && styles.wizardStepTabActive]}
                  onPress={() => setWizardStep(item.step as any)}
                >
                  <Text style={[styles.wizardStepLabel, wizardStep === item.step && styles.textWhite]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ------------------------------------------------------------- */}
            {/* STEP 1: SELECT VEHICLE MAKE                                   */}
            {/* ------------------------------------------------------------- */}
            {/* ------------------------------------------------------------- */}
            {/* STEP 1: SELECT VEHICLE MAKE                                   */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 1 && (
              <View style={styles.glassCard}>
                <View style={styles.cardHeaderFlex}>
                  <View>
                    <View style={styles.stepTitleRow}>
                      <Text style={styles.cardTitle}>Step 01 // Select Manufacturer</Text>
                      <View style={styles.brandCountBadge}>
                        <Text style={styles.brandCountBadgeText}>{filteredMakes.length} of {INDIAN_CAR_MAKES.length} BRANDS</Text>
                      </View>
                    </View>
                    <Text style={styles.cardSubNote}>Select your vehicle manufacturer in India for exact acoustic calibration:</Text>
                  </View>
                </View>

                {/* Make Category Quick Filter Tabs */}
                <View style={styles.makeCategoryTabs}>
                  {[
                    { id: 'all', label: 'All Brands' },
                    { id: 'popular', label: 'Popular / Mass Market' },
                    { id: 'suv', label: 'SUV & 4x4' },
                    { id: 'luxury', label: 'Luxury / German' },
                    { id: 'ev', label: 'EV Pioneers' },
                  ].map((tab) => (
                    <TouchableOpacity
                      key={tab.id}
                      style={[
                        styles.makeCategoryTab,
                        makeCategoryFilter === tab.id && styles.makeCategoryTabActive,
                      ]}
                      onPress={() => setMakeCategoryFilter(tab.id)}
                    >
                      <Text
                        style={[
                          styles.makeCategoryTabText,
                          makeCategoryFilter === tab.id && styles.makeCategoryTabTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Make Search Bar */}
                <View style={styles.searchBarContainer}>
                  <TextInput
                    placeholder="Search brand or model (e.g. Skoda, Swift, Thar, Creta, Defender, BMW)..."
                    placeholderTextColor="#64748b"
                    value={makeSearch}
                    onChangeText={setMakeSearch}
                    style={styles.searchInput}
                  />
                  {makeSearch.length > 0 && (
                    <TouchableOpacity onPress={() => setMakeSearch('')} style={styles.searchClearBtn}>
                      <Text style={styles.searchClearBtnText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Grid of Vehicle Makes with Authentic Vector SVG Logos */}
                <View style={styles.makeGrid}>
                  {filteredMakes.map((make) => {
                    const isSelected = selectedMake.id === make.id;
                    return (
                      <TouchableOpacity
                        key={make.id}
                        style={[
                          styles.makeCard,
                          isSelected && styles.makeCardActive,
                          isSelected && { borderColor: make.badgeColor }
                        ]}
                        onPress={() => {
                          setSelectedMake(make);
                          setSelectedCar(make.models[0]);
                          setWizardStep(2);
                        }}
                      >
                        {/* Top Row: Logo Badge & Country Indicator */}
                        <View style={styles.makeCardTopRow}>
                          <View
                            style={[
                              styles.makeLogoBadge,
                              isSelected && styles.makeLogoBadgeActive,
                              { borderColor: isSelected ? make.badgeColor : '#1e2430' }
                            ]}
                          >
                            <CarBrandLogo
                              makeId={make.id}
                              size={34}
                              color={isSelected ? '#ffffff' : make.badgeColor}
                              isSelected={isSelected}
                            />
                          </View>
                          <View style={styles.makeTopRightBadge}>
                            <View style={[styles.makeBadgeDotSmall, { backgroundColor: make.badgeColor }]} />
                            <Text style={styles.makeCountryTag}>
                              {make.country.split('/')[0].trim()}
                            </Text>
                          </View>
                        </View>

                        {/* Brand Details */}
                        <View style={styles.makeCardBody}>
                          <Text style={[styles.makeName, isSelected && styles.textWhite]}>
                            {make.name}
                          </Text>
                          <Text style={styles.makeCountryFull} numberOfLines={1}>
                            {make.country}
                          </Text>
                        </View>

                        {/* Bottom Action Pill */}
                        <View
                          style={[
                            styles.modelCountPill,
                            isSelected && styles.modelCountPillActive,
                            isSelected && { backgroundColor: make.badgeColor + '22' }
                          ]}
                        >
                          <Text
                            style={[
                              styles.modelCountText,
                              isSelected && { color: make.badgeColor, fontWeight: 'bold' }
                            ]}
                          >
                            {make.models.length} {make.models.length === 1 ? 'Model' : 'Models'} →
                          </Text>
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
                    <Text style={styles.cardTitle}>Step 02 // Select {selectedMake.name} Model</Text>
                    <Text style={styles.cardSubNote}>Loading exact in-cabin acoustic geometry:</Text>
                  </View>
                  <TouchableOpacity style={styles.outlinePillBtn} onPress={() => setWizardStep(1)}>
                    <Text style={styles.outlinePillBtnText}>← Change Make</Text>
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
                          setWizardStep(3);
                        }}
                      >
                        <View style={styles.modelCardHeader}>
                          <Text style={[styles.modelTitle, isSelected && styles.textWhite]}>{model.model}</Text>
                          <View style={styles.categoryBadge}><Text style={styles.categoryBadgeText}>{model.category}</Text></View>
                        </View>

                        <Text style={styles.modelYear}>Production: {model.year}</Text>

                        {/* Acoustic Specs Strip */}
                        <View style={styles.specStrip}>
                          <View style={styles.specCell}>
                            <Text style={styles.specLabel}>Wheelbase</Text>
                            <Text style={styles.specValueMono}>{model.wheelbase} mm</Text>
                          </View>
                          <View style={styles.specCell}>
                            <Text style={styles.specLabel}>Cabin Volume</Text>
                            <Text style={styles.specValueMono}>{model.cabinVolumeM3} m³</Text>
                          </View>
                          <View style={styles.specCell}>
                            <Text style={styles.specLabel}>Resonance</Text>
                            <Text style={styles.specValueMono}>{model.resonantFreqHz} Hz</Text>
                          </View>
                        </View>

                        <View style={styles.speakerSpecBox}>
                          <Text style={styles.speakerSpecText}>• Front: {model.speakerSizes.front} ({model.speakerSizes.tweeterLocation})</Text>
                          <Text style={styles.speakerSpecText}>• Rear: {model.speakerSizes.rear} • Depth: {model.speakerSizes.maxDepthMm}mm</Text>
                        </View>

                        <View style={[styles.selectModelBtn, isSelected && styles.selectModelBtnActive]}>
                          <Text style={[styles.selectModelBtnText, isSelected && styles.textBlack]}>
                            {isSelected ? '✓ Selected' : 'Select Model →'}
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
            {/* ------------------------------------------------------------- */}
            {/* STEP 3: CONFIGURE INSTALLED AUDIO EQUIPMENT                   */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 3 && (
              <View style={styles.glassCard}>
                <View style={styles.cardHeaderFlex}>
                  <View>
                    <Text style={styles.cardTitle}>Step 03 // Installed Audio Hardware</Text>
                    <Text style={styles.cardSubNote}>
                      Select brand then specific model for <Text style={styles.textWhite}>{selectedMake.name} {selectedCar.model}</Text>:
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.outlinePillBtn} onPress={() => setWizardStep(2)}>
                    <Text style={styles.outlinePillBtnText}>← Change Model</Text>
                  </TouchableOpacity>
                </View>

                {/* 1. Head Unit / Infotainment Source */}
                <EquipmentBrandModelSelector<HeadUnitItem>
                  categoryTitle="Head Unit / Infotainment Receiver"
                  categoryNumber="01"
                  icon="📻"
                  brandGroups={HEAD_UNIT_BRANDS}
                  selectedItem={selectedHeadUnit as any}
                  onSelectItem={(item) => setSelectedHeadUnit(item as any)}
                />

                {/* 2. Front Door Component Speakers */}
                <EquipmentBrandModelSelector<SpeakerItem>
                  categoryTitle="Front Door Speakers & Tweeters"
                  categoryNumber="02"
                  icon="🔊"
                  brandGroups={FRONT_SPEAKER_BRANDS}
                  selectedItem={selectedFrontSpeaker as any}
                  onSelectItem={(item) => setSelectedFrontSpeaker(item as any)}
                />

                {/* 3. Rear Door / Fill Speakers */}
                <EquipmentBrandModelSelector<SpeakerItem>
                  categoryTitle="Rear Door / Spatial Fill Speakers"
                  categoryNumber="03"
                  icon="🔉"
                  brandGroups={REAR_SPEAKER_BRANDS}
                  selectedItem={selectedRearSpeaker as any}
                  onSelectItem={(item) => setSelectedRearSpeaker(item as any)}
                />

                {/* 4. Power Amplifiers */}
                <EquipmentBrandModelSelector<AmplifierItem>
                  categoryTitle="Power Amplifiers & DSP Multi-Channels"
                  categoryNumber="04"
                  icon="⚡"
                  brandGroups={AMPLIFIER_BRANDS}
                  selectedItem={selectedAmplifier as any}
                  onSelectItem={(item) => setSelectedAmplifier(item as any)}
                />

                {/* 5. Subwoofer & Enclosure */}
                <EquipmentBrandModelSelector<SubwooferItem>
                  categoryTitle="Subwoofer & Enclosure Box Tuning"
                  categoryNumber="05"
                  icon="💥"
                  brandGroups={SUBWOOFER_BRANDS}
                  selectedItem={selectedSubwoofer as any}
                  onSelectItem={(item) => setSelectedSubwoofer(item as any)}
                />

                {/* Proceed to Step 4 Button */}
                <TouchableOpacity style={styles.whitePillBtnLarge} onPress={() => setWizardStep(4)}>
                  <Text style={styles.whitePillBtnLargeText}>Calculate AI Acoustic Tuning →</Text>
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
                      <View style={styles.tuningActiveBadge}>
                        <View style={styles.tuningActiveDot} />
                        <Text style={styles.tuningActiveText}>ACOUSTIC CALIBRATION ENGINE</Text>
                      </View>
                      <Text style={styles.cardTitle}>
                        Calibrating: <Text style={styles.textWhite}>{selectedMake.name} {selectedCar.model}</Text>
                      </Text>
                      <Text style={styles.cardSubNote}>
                        Active Gear: {selectedHeadUnit.name.split('(')[0]} • {selectedFrontSpeaker.name.split('(')[0]} • {selectedSubwoofer.name.split('(')[0]}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.outlinePillBtn} onPress={() => setWizardStep(3)}>
                      <Text style={styles.outlinePillBtnText}>Edit Hardware Specs</Text>
                    </TouchableOpacity>
                  </View>

                  {/* SOUND TARGET PROFILE SELECTION */}
                  <Text style={styles.subConfigLabel}>Target Sound Signature:</Text>
                  <View style={styles.targetRow}>
                    {[
                      { id: 'sql', label: 'SQL Bass Focus (EDM / Hip-Hop)', desc: 'High impact sub-bass + crisp transparent vocals' },
                      { id: 'harman', label: 'Harman Target (Audiophile Reference)', desc: 'Linear in-cabin acoustic balance' },
                      { id: 'vocal', label: 'Vocal Clarity (Acoustic & Podcasts)', desc: 'Enhanced intelligibility for podcasts & acoustic' }
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
                    { id: 'simulation', label: 'Soundfield Simulation' },
                    { id: 'eq', label: 'Parametric Spline EQ' },
                    { id: 'crossover', label: 'Crossovers & Filters' },
                    { id: 'gain', label: 'Gain Staging (DMM)' },
                    { id: 'tones', label: 'Test Tone Synth' },
                    { id: 'export', label: 'DSP File Export' }
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
                      <Text style={styles.cardTitle}>In-Cabin Acoustic Propagation Simulator</Text>
                      <TouchableOpacity
                        style={[styles.toggleBtn, timeAlignmentEnabled && styles.toggleBtnActive]}
                        onPress={() => setTimeAlignmentEnabled(!timeAlignmentEnabled)}
                      >
                        <Text style={styles.toggleBtnText}>
                          {timeAlignmentEnabled ? '✓ TIME ALIGNED (ON)' : '✕ STOCK PHASE (OFF)'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cardSubNote}>
                      Real-time 60 FPS wave convergence rendering inside {selectedMake.name} {selectedCar.model} cabin ({selectedCar.cabinVolumeM3} m³).
                    </Text>

                    {Platform.OS === 'web' && (
                      <View style={styles.canvasContainer}>
                        <canvas
                          ref={soundfieldCanvasRef}
                          width={480}
                          height={400}
                          style={{ width: '100%', maxWidth: 480, height: 380, borderRadius: 16 }}
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
                          <Text style={styles.delayTdMono}>{row.dist}</Text>
                          <Text style={styles.delayTdCyanMono}>{row.delay}</Text>
                          <Text style={styles.delayTdMono}>{row.offset}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* TAB 2: BEZIER EQUALIZER CURVE */}
                {studioTab === 'eq' && (
                  <View style={styles.glassCard}>
                    <Text style={styles.cardTitle}>14-Band Parametric Spline Equalizer</Text>
                    <Text style={styles.cardSubNote}>
                      Continuous mathematical Bezier curve matching {selectedHeadUnit.name}:
                    </Text>

                    {Platform.OS === 'web' && (
                      <View style={styles.canvasContainer}>
                        <canvas
                          ref={eqCanvasRef}
                          width={600}
                          height={180}
                          style={{ width: '100%', maxWidth: 600, height: 180, borderRadius: 12 }}
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
                                    backgroundColor: gain > 0 ? '#22d3ee' : gain < 0 ? '#f59e0b' : '#64748b',
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

                            <Text style={[styles.gainNumberMono, gain > 0 && styles.textCyan, gain < 0 && styles.textAmber]}>
                              {gain > 0 ? `+${gain}` : gain}
                            </Text>
                            <Text style={styles.freqTagMono}>{freq >= 1000 ? `${freq / 1000}k` : freq}</Text>
                          </View>
                        );
                      })}
                    </View>

                    <View style={styles.insightBox}>
                      <Text style={styles.insightTitle}>Acoustic Offsets Applied:</Text>
                      <Text style={styles.insightText}>• <Text style={styles.textWhite}>+5.5 dB @ 63Hz</Text>: {selectedSubwoofer.tuneHz > 0 ? `${selectedSubwoofer.tuneHz}Hz ported box resonance boost` : 'Sub-bass punch boost'}.</Text>
                      <Text style={styles.insightText}>• <Text style={styles.textWhite}>-1.5 dB @ 200Hz</Text>: Eliminates {selectedCar.category} ({selectedCar.resonantFreqHz}Hz) standing cabin boom.</Text>
                      <Text style={styles.insightText}>• <Text style={styles.textWhite}>-1.0 dB @ 4kHz</Text>: Windshield acoustic reflection tamer.</Text>
                    </View>
                  </View>
                )}

                {/* TAB 3: CROSSOVERS & DIALS */}
                {studioTab === 'crossover' && (
                  <View style={styles.glassCard}>
                    <Text style={styles.cardTitle}>Physical Amplifier Filter Dials & Crossovers</Text>

                    <View style={styles.filterCard}>
                      <Text style={styles.filterCardHead}>Front Channels ({selectedFrontSpeaker.name})</Text>
                      <Text style={styles.filterValueMono}>HPF: ~{frontHpf} Hz (Approx. 9:30 o'clock)</Text>
                      <Text style={styles.filterDesc}>Filters out bass sub-80Hz to protect {selectedFrontSpeaker.rms}W RMS woofers and ensure crystal clear vocal midrange.</Text>
                    </View>

                    {selectedRearSpeaker.id !== 'none' && (
                      <View style={styles.filterCard}>
                        <Text style={styles.filterCardHead}>Rear Channels ({selectedRearSpeaker.name})</Text>
                        <Text style={styles.filterValueMono}>HPF: ~{rearHpf} Hz (Approx. 10:00 o'clock)</Text>
                        <Text style={styles.filterDesc}>Attenuated spatial ambient fill that preserves front vocal soundstage focus.</Text>
                      </View>
                    )}

                    {selectedSubwoofer.type !== 'none' && (
                      <View style={[styles.filterCard, styles.filterCardAmber]}>
                        <Text style={[styles.filterCardHead, { color: '#f59e0b' }]}>Subwoofer ({selectedSubwoofer.name})</Text>
                        <Text style={styles.filterValueMono}>LPF: ~{subLpf} Hz</Text>
                        <Text style={styles.filterValueMono}>Subsonic Filter: ~{subsonicHz} Hz</Text>
                        {selectedSubwoofer.type === 'ported' && (
                          <Text style={styles.subsonicWarning}>
                            PORTED BOX SAFETY: Frequencies below {selectedSubwoofer.tuneHz}Hz cause mechanical cone unloading. The {subsonicHz}Hz subsonic cutoff protects voice coils from burning.
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
                    <Text style={styles.cardTitle}>Multimeter Target AC Voltages (V = √(P × R))</Text>
                    <Text style={styles.cardSubNote}>
                      Set {selectedHeadUnit.name.split('(')[0]} volume to 75% with flat EQ before measuring amplifier speaker terminals:
                    </Text>

                    <View style={styles.voltageGrid}>
                      <View style={styles.voltageBox}>
                        <Text style={styles.voltageLabel}>Front Channels (CH1/2)</Text>
                        <Text style={styles.voltageNumberMono}>{vFront} V AC</Text>
                        <Text style={styles.voltageTone}>Test Tone: 1,000 Hz 0dB Sine</Text>
                        <Text style={styles.voltageKnob}>Knob Position: ~10:30 o'clock</Text>
                      </View>

                      {selectedRearSpeaker.id !== 'none' && (
                        <View style={styles.voltageBox}>
                          <Text style={styles.voltageLabel}>Rear Channels (CH3/4)</Text>
                          <Text style={styles.voltageNumberMono}>{vRear} V AC</Text>
                          <Text style={styles.voltageTone}>Test Tone: 1,000 Hz 0dB Sine</Text>
                          <Text style={styles.voltageKnob}>Knob Position: ~9:30 o'clock</Text>
                        </View>
                      )}

                      {selectedSubwoofer.type !== 'none' && (
                        <View style={styles.voltageBox}>
                          <Text style={styles.voltageLabel}>Subwoofer Channel</Text>
                          <Text style={styles.voltageNumberMono}>{vSub} V AC</Text>
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
                    <Text style={styles.cardTitle}>In-Browser Audio Test Tone Synthesizer</Text>
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
                        <Text style={styles.toneCardStatusMono}>{isPlayingTone === '1000' ? 'STOPPING' : 'PLAY 1 kHz'}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.toneCardBtn, isPlayingTone === '50' && styles.toneCardBtnActive]}
                        onPress={() => playTone('50', 50)}
                      >
                        <Text style={styles.toneCardTitle}>50 Hz Sine Wave (0 dB)</Text>
                        <Text style={styles.toneCardSub}>Used for measuring Subwoofer amplifier AC voltage ({vSub}V)</Text>
                        <Text style={styles.toneCardStatusMono}>{isPlayingTone === '50' ? 'STOPPING' : 'PLAY 50 Hz'}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.toneCardBtn, isPlayingTone === 'pink' && styles.toneCardBtnActive]}
                        onPress={() => playTone('pink')}
                      >
                        <Text style={styles.toneCardTitle}>Pink Noise (20 Hz – 20 kHz)</Text>
                        <Text style={styles.toneCardSub}>Full-spectrum acoustic test tone for RTA microphone measurement</Text>
                        <Text style={styles.toneCardStatusMono}>{isPlayingTone === 'pink' ? 'STOPPING' : 'PLAY NOISE'}</Text>
                      </TouchableOpacity>
                    </View>

                    {isPlayingTone && (
                      <TouchableOpacity style={styles.stopGlobalBtn} onPress={stopTone}>
                        <Text style={styles.stopGlobalBtnText}>STOP ALL AUDIO PLAYBACK</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* TAB 6: DSP FILE EXPORT */}
                {studioTab === 'export' && (
                  <View style={styles.glassCard}>
                    <Text style={styles.cardTitle}>Export Ready-to-Flash DSP Configurations</Text>

                    <View style={styles.codeExportCard}>
                      <Text style={styles.codeExportTitle}>Pioneer DEH-80PRS XML Format</Text>
                      <Text style={styles.codeExportBodyMono}>
                        {`<PioneerDSPConfig version="1.0">\n  <Car>${selectedMake.name} ${selectedCar.model}</Car>\n  <TimeAlignment FR="${delaysMs.FR}ms" FL="${delaysMs.FL}ms" SUB="0ms"/>\n  <Crossover HPF="${frontHpf}Hz" LPF="${subLpf}Hz" Subsonic="${subsonicHz}Hz"/>\n</PioneerDSPConfig>`}
                      </Text>
                    </View>

                    <View style={styles.codeExportCard}>
                      <Text style={styles.codeExportTitle}>MiniDSP 2x4 HD JSON Format</Text>
                      <Text style={styles.codeExportBodyMono}>
                        {`{\n  "vehicle": "${selectedMake.name} ${selectedCar.model}",\n  "delays_ms": { "FR": ${delaysMs.FR}, "FL": ${delaysMs.FL}, "SUB": 0 },\n  "crossover": { "front_hpf": ${frontHpf}, "sub_lpf": ${subLpf} }\n}`}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

          </View>
        )}

        {/* ========================================================================= */}
        {/* TURBOTWEAK EDITORIAL FOOTER                                               */}
        {/* ========================================================================= */}
        <View style={styles.editorialFooter}>
          <Text style={styles.footerWatermark}>CARAUDIO.AI</Text>
          <View style={styles.footerFlexRow}>
            <View>
              <Text style={styles.footerBrandName}>caraudio<Text style={styles.logoAccent}>ai</Text></Text>
              <Text style={styles.footerSubText}>Precision Automotive Acoustic Platform • 343 m/s Phase Engine</Text>
            </View>
            <View style={styles.footerLinkRow}>
              <TouchableOpacity onPress={() => Linking.openURL('https://github.com/adityashm/CarAudioAI')}>
                <Text style={styles.footerLink}>GitHub</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPaymentModalVisible(true)}>
                <Text style={styles.footerLink}>Pricing</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAuthModalVisible(true)}>
                <Text style={styles.footerLink}>Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* MODALS */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setAuthModalVisible(false);
        }}
      />

      <PaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        currentUser={currentUser}
        onRequireAuth={() => {
          setPaymentModalVisible(false);
          setAuthModalVisible(true);
        }}
      />

      <RtaMeasurementModal
        visible={rtaModalVisible}
        onClose={() => setRtaModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050505'
  },
  scrollContainer: {
    paddingBottom: 40
  },

  // TURBOTWEAK NAVBAR STYLES
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    backgroundColor: 'rgba(5, 5, 5, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#181c24'
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  logoBrand: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5
  },
  logoAccent: {
    color: '#22d3ee'
  },
  proPillBadge: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: '#2a303c',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999
  },
  proPillText: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold'
  },
  navLinksGroup: {
    flexDirection: 'row',
    gap: 6
  },
  navAnchorPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999
  },
  navAnchorPillActive: {
    backgroundColor: '#161922'
  },
  navAnchorText: {
    color: '#8b949e',
    fontSize: 13,
    fontWeight: '600'
  },
  navCtaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  authPillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999
  },
  authPillText: {
    color: '#8b949e',
    fontSize: 13,
    fontWeight: '600'
  },
  whitePillBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 9999
  },
  whitePillBtnText: {
    color: '#050505',
    fontSize: 13,
    fontWeight: 'bold'
  },
  whitePillBtnLarge: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: 'center',
    marginTop: 20
  },
  whitePillBtnLargeText: {
    color: '#050505',
    fontSize: 14,
    fontWeight: 'bold'
  },
  outlinePillBtn: {
    borderWidth: 1,
    borderColor: '#30363d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    alignItems: 'center'
  },
  outlinePillBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  },

  // HERO SECTION STYLES
  viewContent: {
    paddingHorizontal: 24,
    paddingTop: 16
  },
  heroContainer: {
    position: 'relative',
    marginBottom: 60
  },
  heroWatermark: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    fontSize: 96,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.03)',
    textAlign: 'center',
    letterSpacing: 2,
    pointerEvents: 'none'
  },
  heroContent: {
    paddingTop: 40,
    marginBottom: 32,
    maxWidth: 720
  },
  heroTagPill: {
    backgroundColor: '#12151d',
    borderWidth: 1,
    borderColor: '#242936',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginBottom: 16
  },
  heroTagText: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1
  },
  heroDisplayHeadline: {
    fontSize: 48,
    fontWeight: '900',
    color: '#8b949e',
    lineHeight: 56,
    letterSpacing: -1.5,
    marginBottom: 16
  },
  heroEditorialSub: {
    fontSize: 16,
    color: '#8b949e',
    lineHeight: 26,
    maxWidth: 580,
    marginBottom: 24
  },
  heroCtaRow: {
    flexDirection: 'row',
    gap: 12
  },
  heroPrimaryWhitePill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 9999
  },
  heroPrimaryWhitePillText: {
    color: '#050505',
    fontSize: 14,
    fontWeight: 'bold'
  },
  heroSecondaryOutlinePill: {
    borderWidth: 1,
    borderColor: '#30363d',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 9999
  },
  heroSecondaryOutlinePillText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  },
  capsuleScrollytellingFrame: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e2430',
    backgroundColor: '#0a0d14'
  },

  // EDITORIAL SECTIONS STYLES
  editorialSection: {
    position: 'relative',
    paddingVertical: 48,
    borderTopWidth: 1,
    borderTopColor: '#161922',
    marginBottom: 30
  },
  ghostNumeralGroup: {
    position: 'relative',
    marginBottom: 20
  },
  ghostNumeral: {
    fontSize: 84,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.05)',
    lineHeight: 84,
    letterSpacing: -2
  },
  ghostNumeralBadge: {
    position: 'absolute',
    top: 24,
    left: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999
  },
  ghostNumeralBadgeText: {
    color: '#050505',
    fontSize: 11,
    fontWeight: '900'
  },
  editorialTwoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    marginBottom: 28
  },
  editorialLeftCol: {
    flex: 1,
    minWidth: 260
  },
  editorialSectionTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 42,
    letterSpacing: -1
  },
  editorialRightCol: {
    flex: 1.4,
    minWidth: 300,
    justifyContent: 'center'
  },
  editorialParagraph: {
    fontSize: 14,
    color: '#8b949e',
    lineHeight: 24,
    marginBottom: 12
  },
  capsuleImageFrame: {
    width: '100%',
    height: 280,
    borderRadius: 9999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e2430',
    marginTop: 10
  },
  capsuleImage: {
    width: '100%',
    height: '100%'
  },

  // PRICING GRID STYLES
  pricingCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12
  },
  pricingCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: '#0a0d14',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1c222e'
  },
  pricingCardFeatured: {
    borderColor: '#ffffff',
    backgroundColor: '#0e121a',
    position: 'relative'
  },
  featuredBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999
  },
  featuredBadgeText: {
    color: '#050505',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  pricingTierName: {
    color: '#8b949e',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8
  },
  pricingPrice: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'monospace'
  },
  pricingDuration: {
    color: '#6e7681',
    fontSize: 13,
    fontWeight: 'normal'
  },
  pricingDesc: {
    color: '#8b949e',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16
  },
  pricingDivider: {
    height: 1,
    backgroundColor: '#1c222e',
    marginBottom: 16
  },
  pricingFeature: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 22
  },

  // WIZARD PROGRESS BAR STYLES
  wizardProgressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0a0d14',
    borderRadius: 9999,
    padding: 6,
    borderWidth: 1,
    borderColor: '#1c222e',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 6
  },
  wizardStepTab: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 9999
  },
  wizardStepTabActive: {
    backgroundColor: '#161b24',
    borderWidth: 1,
    borderColor: '#30363d'
  },
  wizardStepLabel: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '700'
  },

  // CONFIGURATOR STYLES
  glassCard: {
    backgroundColor: '#0a0d14',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1c222e'
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.3
  },
  cardSubNote: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4
  },
  tuningActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tuningActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22d3ee',
  },
  tuningActiveText: {
    color: '#22d3ee',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  brandCountBadge: {
    backgroundColor: '#161b24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  brandCountBadgeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  makeCategoryTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
    marginTop: 4,
  },
  makeCategoryTab: {
    backgroundColor: '#06080d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#1e2430',
  },
  makeCategoryTabActive: {
    backgroundColor: '#161b24',
    borderColor: '#38bdf8',
  },
  makeCategoryTabText: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '600',
  },
  makeCategoryTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  searchBarContainer: {
    marginBottom: 16,
    position: 'relative',
    justifyContent: 'center',
  },
  searchClearBtn: {
    position: 'absolute',
    right: 12,
    top: 10,
    padding: 6,
  },
  searchClearBtnText: {
    color: '#8b949e',
    fontSize: 12,
  },
  searchInput: {
    backgroundColor: '#06080d',
    borderWidth: 1,
    borderColor: '#1e2430',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 40,
    color: '#ffffff',
    fontSize: 13,
  },
  makeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  makeCard: {
    flex: 1,
    minWidth: 210,
    maxWidth: 280,
    backgroundColor: '#06080d',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e2430',
    justifyContent: 'space-between',
  },
  makeCardActive: {
    backgroundColor: '#0e121a',
  },
  makeCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  makeLogoBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#0c0f17',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e2430',
  },
  makeLogoBadgeActive: {
    backgroundColor: '#131824',
  },
  makeTopRightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0f121a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#1e2430',
  },
  makeBadgeDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  makeCountryTag: {
    color: '#8b949e',
    fontSize: 10,
    fontWeight: '600',
  },
  makeCardBody: {
    marginBottom: 14,
  },
  makeName: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  makeCountryFull: {
    color: '#64748b',
    fontSize: 11,
  },
  modelCountPill: {
    backgroundColor: '#12151d',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1e2430',
  },
  modelCountPillActive: {
    borderColor: 'transparent',
  },
  modelCountText: {
    color: '#8b949e',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },

  // MODEL GRID
  modelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14
  },
  modelCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: '#06080d',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e2430'
  },
  modelCardActive: {
    borderColor: '#ffffff',
    backgroundColor: '#0e121a'
  },
  modelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  modelTitle: {
    color: '#8b949e',
    fontSize: 16,
    fontWeight: 'bold'
  },
  categoryBadge: {
    backgroundColor: '#161b24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999
  },
  categoryBadgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold'
  },
  modelYear: {
    color: '#6e7681',
    fontSize: 11,
    marginBottom: 12
  },
  specStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0c0f16',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12
  },
  specCell: {
    alignItems: 'center'
  },
  specLabel: {
    color: '#6e7681',
    fontSize: 9
  },
  specValueMono: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 2
  },
  speakerSpecBox: {
    backgroundColor: '#0c0f16',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14
  },
  speakerSpecText: {
    color: '#8b949e',
    fontSize: 11,
    lineHeight: 16
  },
  selectModelBtn: {
    borderWidth: 1,
    borderColor: '#30363d',
    paddingVertical: 10,
    borderRadius: 9999,
    alignItems: 'center'
  },
  selectModelBtnActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff'
  },
  selectModelBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },

  // EQUIPMENT SELECTION
  subConfigLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8
  },
  configOptionsRow: {
    gap: 8
  },
  configOptionChip: {
    backgroundColor: '#06080d',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2430'
  },
  configOptionChipActive: {
    borderColor: '#ffffff',
    backgroundColor: '#0e121a'
  },
  configOptionChipText: {
    color: '#8b949e',
    fontSize: 12
  },

  // DSP STUDIO STYLES
  targetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  targetBtn: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#06080d',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2430'
  },
  targetBtnActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff'
  },
  targetBtnTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2
  },
  targetBtnDesc: {
    color: '#8b949e',
    fontSize: 10
  },
  toolNavStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20
  },
  toolNavPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#0a0d14',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#1c222e'
  },
  toolNavPillActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff'
  },
  toolNavPillText: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '600'
  },
  toolNavPillTextActive: {
    color: '#050505',
    fontWeight: 'bold'
  },
  toggleBtn: {
    backgroundColor: '#161b24',
    borderWidth: 1,
    borderColor: '#30363d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff'
  },
  toggleBtnText: {
    color: '#050505',
    fontSize: 11,
    fontWeight: 'bold'
  },
  canvasContainer: {
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: '#06080d',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1e2430'
  },
  delayTable: {
    borderWidth: 1,
    borderColor: '#1c222e',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16
  },
  delayHeader: {
    flexDirection: 'row',
    backgroundColor: '#161b24',
    padding: 10
  },
  delayTh: {
    flex: 1,
    color: '#8b949e',
    fontSize: 10,
    fontWeight: 'bold'
  },
  delayRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#0a0d14'
  },
  delayRowAlt: {
    backgroundColor: '#06080d'
  },
  delayTdName: {
    flex: 1.2,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600'
  },
  delayTdMono: {
    flex: 1,
    color: '#8b949e',
    fontFamily: 'monospace',
    fontSize: 11
  },
  delayTdCyanMono: {
    flex: 1,
    color: '#22d3ee',
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: 'bold'
  },
  sliderRack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#06080d',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2430',
    marginTop: 14
  },
  sliderCol: {
    alignItems: 'center',
    flex: 1
  },
  stepperBtn: {
    width: 20,
    height: 20,
    backgroundColor: '#161b24',
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
    backgroundColor: '#161b24',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 4
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
  gainNumberMono: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#cbd5e1'
  },
  freqTagMono: {
    fontSize: 7,
    fontFamily: 'monospace',
    color: '#6e7681',
    marginTop: 2
  },
  insightBox: {
    marginTop: 14,
    backgroundColor: '#06080d',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2430'
  },
  insightTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 6
  },
  insightText: {
    color: '#8b949e',
    fontSize: 11,
    lineHeight: 18
  },
  filterCard: {
    backgroundColor: '#06080d',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e2430'
  },
  filterCardAmber: {
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b'
  },
  filterCardHead: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4
  },
  filterValueMono: {
    color: '#22d3ee',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 13
  },
  filterDesc: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 4
  },
  subsonicWarning: {
    color: '#f59e0b',
    fontSize: 11,
    backgroundColor: '#1f1608',
    padding: 8,
    borderRadius: 6,
    marginVertical: 6
  },
  voltageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  voltageBox: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#06080d',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2430'
  },
  voltageLabel: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: 'bold'
  },
  voltageNumberMono: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginVertical: 4
  },
  voltageTone: {
    color: '#6e7681',
    fontSize: 11
  },
  voltageKnob: {
    color: '#4b5563',
    fontSize: 10,
    marginTop: 2
  },
  toneList: {
    gap: 8
  },
  toneCardBtn: {
    backgroundColor: '#06080d',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2430'
  },
  toneCardBtnActive: {
    borderColor: '#22d3ee',
    backgroundColor: '#081a24'
  },
  toneCardTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13
  },
  toneCardSub: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 2
  },
  toneCardStatusMono: {
    color: '#22d3ee',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 6
  },
  stopGlobalBtn: {
    marginTop: 12,
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 9999,
    alignItems: 'center'
  },
  stopGlobalBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12
  },
  codeExportCard: {
    backgroundColor: '#06080d',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2430',
    marginBottom: 10
  },
  codeExportTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 6
  },
  codeExportBodyMono: {
    color: '#94a3b8',
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 15
  },

  // FOOTER STYLES
  editorialFooter: {
    position: 'relative',
    marginTop: 60,
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 28,
    borderTopWidth: 1,
    borderTopColor: '#161922'
  },
  footerWatermark: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    fontSize: 72,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.02)',
    pointerEvents: 'none'
  },
  footerFlexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16
  },
  footerBrandName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff'
  },
  footerSubText: {
    color: '#6e7681',
    fontSize: 11,
    marginTop: 2
  },
  footerLinkRow: {
    flexDirection: 'row',
    gap: 20
  },
  footerLink: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '600'
  },
  textWhite: { color: '#ffffff' },
  textCyan: { color: '#22d3ee' },
  textAmber: { color: '#f59e0b' },
  textBlack: { color: '#050505' }
});
