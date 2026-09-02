import React, { useRef, useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from 'framer-motion';

// 8K Photorealistic Storyboard Shots
const SHOT_IMAGES = [
  require('@/assets/images/turbotweak_hero_car.jpg'),
  require('@/assets/images/shot2_door_open.jpg'),
  require('@/assets/images/shot3_touchscreen.jpg'),
  require('@/assets/images/shot4_soundwaves.jpg'),
];

export default function HeroScrollSequence({ onEnterStudio }) {
  if (Platform.OS !== 'web') {
    return <NativeFallbackSlideshow onEnterStudio={onEnterStudio} />;
  }

  return <WebHeroScrollSequence onEnterStudio={onEnterStudio} />;
}

/**
 * Web Implementation: TurboTweak 3D Parallax & Framer Motion Scrollytelling
 * with Live Web Audio Acoustic Sweep Synthesizer and Interactive Hotspot HUD.
 */
function WebHeroScrollSequence({ onEnterStudio }) {
  const containerRef = useRef(null);
  const webglCanvasRef = useRef(null);
  const spectrumCanvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sfxTriggeredRef = useRef({ whoosh: false, beep: false, sub: false });

  const prefersReducedMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState(0);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoFreqReadout, setDemoFreqReadout] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState(null);

  // Framer Motion Scroll Progress (0.0 -> 1.0 across 350vh)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // 1. OPACITY TRANSFORMS
  const opacity1 = useTransform(scrollYProgress, [0, 0.22, 0.34], [1, 1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.22, 0.34, 0.54, 0.64], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.54, 0.64, 0.76, 0.84], [0, 1, 1, 0]);
  const opacity4 = useTransform(scrollYProgress, [0.76, 0.84, 1.0], [0, 1, 1]);

  // WebGL Soundwave Overlay Opacity
  const webglOpacity = useTransform(scrollYProgress, [0.74, 0.84, 1.0], [0, 0.9, 1.0]);

  // 2. KEN BURNS SCALE TRANSFORMS
  const scale1 = useTransform(scrollYProgress, [0, 0.34], prefersReducedMotion ? [1, 1] : [1.0, 1.08]);
  const scale2 = useTransform(scrollYProgress, [0.22, 0.64], prefersReducedMotion ? [1, 1] : [1.02, 1.10]);
  const scale3 = useTransform(scrollYProgress, [0.54, 0.84], prefersReducedMotion ? [1, 1] : [1.0, 1.12]);
  const scale4 = useTransform(scrollYProgress, [0.76, 1.0], prefersReducedMotion ? [1, 1] : [1.04, 1.15]);

  // 3. AUDIO CONTEXT INITIALIZATION
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        analyserRef.current.connect(audioCtxRef.current.destination);
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playWhoosh = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.35);
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  };

  const playBeep = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, ctx.currentTime);
    osc.frequency.setValueAtTime(2400, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  };

  const playSubBassSweep = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(34, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  };

  // FULL ACOUSTIC DEMO SWEEP (35Hz Sub -> 1kHz Mid -> 16kHz High)
  const playFullAcousticDemo = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (isPlayingDemo) {
      setIsPlayingDemo(false);
      setDemoFreqReadout(0);
      return;
    }

    setIsPlayingDemo(true);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    const duration = 4.5;

    // Logarithmic Frequency Sweep 35Hz -> 16000Hz
    osc.frequency.setValueAtTime(35, now);
    osc.frequency.exponentialRampToValueAtTime(16000, now + duration);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.5);
    gain.gain.setValueAtTime(0.22, now + duration - 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    if (analyserRef.current) {
      osc.connect(gain);
      gain.connect(analyserRef.current);
    } else {
      osc.connect(gain);
      gain.connect(ctx.destination);
    }

    osc.start(now);
    osc.stop(now + duration);

    // Live Readout Animation
    const startMs = Date.now();
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startMs) / 1000;
      if (elapsed >= duration) {
        clearInterval(timer);
        setIsPlayingDemo(false);
        setDemoFreqReadout(0);
      } else {
        const curFreq = Math.round(35 * Math.pow(16000 / 35, elapsed / duration));
        setDemoFreqReadout(curFreq);
      }
    }, 50);
  };

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (p) => {
      if (p < 0.28) {
        setActiveStage(0);
      } else if (p < 0.58) {
        setActiveStage(1);
      } else if (p < 0.82) {
        setActiveStage(2);
      } else {
        setActiveStage(3);
      }

      // Whoosh (Door opens)
      if (p >= 0.28 && !sfxTriggeredRef.current.whoosh) {
        sfxTriggeredRef.current.whoosh = true;
        playWhoosh();
      } else if (p < 0.20) {
        sfxTriggeredRef.current.whoosh = false;
      }

      // Beep (Screen activation)
      if (p >= 0.58 && !sfxTriggeredRef.current.beep) {
        sfxTriggeredRef.current.beep = true;
        playBeep();
      } else if (p < 0.50) {
        sfxTriggeredRef.current.beep = false;
      }

      // Sub-bass sweep (Holographic focus)
      if (p >= 0.82 && !sfxTriggeredRef.current.sub) {
        sfxTriggeredRef.current.sub = true;
        playSubBassSweep();
      } else if (p < 0.75) {
        sfxTriggeredRef.current.sub = false;
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  // WEBGL SOUNDWAVE SHADER OVERLAY
  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = webglCanvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform float u_demo_active;

      void main() {
        vec2 center = vec2(0.68, 0.45);
        vec2 uv = v_uv;
        float dist = distance(uv, center);

        float waveSpeed = u_demo_active > 0.5 ? 8.0 : 4.0;
        float wave = sin(dist * 45.0 - u_time * waveSpeed);
        float ringIntensity = smoothstep(0.7, 1.0, wave) * exp(-dist * 2.5);

        vec2 speakerFL = vec2(0.25, 0.65);
        float distFL = distance(uv, speakerFL);
        float waveFL = sin(distFL * 35.0 - u_time * (waveSpeed * 0.9));
        float flIntensity = smoothstep(0.8, 1.0, waveFL) * exp(-distFL * 3.0);

        vec3 cyan = vec3(0.133, 0.827, 0.933);
        vec3 violet = vec3(0.655, 0.545, 0.980);
        vec3 color = mix(cyan, violet, sin(u_time + dist * 5.0) * 0.5 + 0.5);

        float alpha = (ringIntensity * 0.45) + (flIntensity * 0.35);
        if (u_demo_active > 0.5) {
          alpha *= 1.4;
        }
        gl_FragColor = vec4(color * alpha, alpha);
      }
    `;

    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uDemoActive = gl.getUniformLocation(program, 'u_demo_active');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let animId;
    let startTime = performance.now();

    const render = () => {
      const elapsed = (performance.now() - startTime) * 0.001;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uDemoActive, isPlayingDemo ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [prefersReducedMotion, isPlayingDemo]);

  // LIVE FFT SPECTRUM ANALYZER OVERLAY
  useEffect(() => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    const renderSpectrum = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (analyserRef.current && isPlayingDemo) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, '#22d3ee');
          gradient.addColorStop(1, '#a78bfa');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      }

      animId = requestAnimationFrame(renderSpectrum);
    };

    renderSpectrum();
    return () => cancelAnimationFrame(animId);
  }, [isPlayingDemo]);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 4;
    setMouseTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
  };

  const jumpToStage = (index) => {
    if (!containerRef.current) return;
    const stageProgress = [0.05, 0.40, 0.68, 0.92];
    const targetP = stageProgress[index] || 0;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const containerTop = rect.top + scrollTop;
    const targetScroll = containerTop + targetP * (containerRef.current.offsetHeight - window.innerHeight);

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  const HOTSPOTS = [
    { id: 'front', label: 'FL/FR Stage', top: '58%', left: '32%', desc: '6.5" Midbass + Silk Dome Tweeters (1.25ms time delay offset)' },
    { id: 'cockpit', label: 'DSP Engine', top: '48%', left: '50%', desc: '48kHz / 32-bit Floating Point Processor (14-band Bezier spline EQ active)' },
    { id: 'rear', label: 'Rear Fill', top: '60%', left: '68%', desc: 'Coaxial ambient spatial fill attenuated at -4.0 dB' },
    { id: 'sub', label: 'Sub Chamber', top: '52%', left: '84%', desc: '12" High-Excursion Subwoofer (35Hz Ported chamber with subsonic HPF)' },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        height: '350vh',
        backgroundColor: '#050505',
        width: '100%',
        borderRadius: 24,
        overflow: 'visible',
      }}
    >
      {/* Sticky Viewport Container */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          perspective: 1200,
        }}
      >
        {/* 3D Parallax Tilt Canvas Container */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            rotateX: prefersReducedMotion ? 0 : -mouseTilt.y,
            rotateY: prefersReducedMotion ? 0 : mouseTilt.x,
            transition: 'transform 0.15s ease-out',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Shot 1: TurboTweak Supercar Hero */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: opacity1,
              scale: scale1,
            }}
          >
            <Image
              source={SHOT_IMAGES[0]}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <div style={styles.vignetteOverlay} />
          </motion.div>

          {/* Shot 2: Cockpit Ingress */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: opacity2,
              scale: scale2,
            }}
          >
            <Image
              source={SHOT_IMAGES[1]}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <div style={styles.vignetteOverlay} />
          </motion.div>

          {/* Shot 3: DSP Touchscreen */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: opacity3,
              scale: scale3,
            }}
          >
            <Image
              source={SHOT_IMAGES[2]}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <div style={styles.vignetteOverlay} />
          </motion.div>

          {/* Shot 4: Holographic Soundwaves */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: opacity4,
              scale: scale4,
            }}
          >
            <Image
              source={SHOT_IMAGES[3]}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <div style={styles.vignetteOverlay} />
          </motion.div>

          {/* WebGL Animated Wave Overlay */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: webglOpacity,
              pointerEvents: 'none',
              mixBlendMode: 'screen',
            }}
          >
            <canvas
              ref={webglCanvasRef}
              width={1280}
              height={720}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </motion.div>

          {/* Interactive Vehicle Telemetry Hotspots */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
            {HOTSPOTS.map((hotspot) => {
              const isHotspotActive = activeHotspot === hotspot.id;
              return (
                <div
                  key={hotspot.id}
                  style={{
                    position: 'absolute',
                    top: hotspot.top,
                    left: hotspot.left,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: 25,
                  }}
                  onClick={() => setActiveHotspot(isHotspotActive ? null : hotspot.id)}
                >
                  <div style={styles.hotspotPulse}>
                    <div style={styles.hotspotDot} />
                  </div>
                  <div style={styles.hotspotLabel}>{hotspot.label}</div>

                  {isHotspotActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      style={styles.hotspotCard}
                    >
                      <div style={styles.hotspotCardHead}>{hotspot.label} Telemetry</div>
                      <div style={styles.hotspotCardDesc}>{hotspot.desc}</div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* TOP HUD TELEMETRY BAR */}
        <div style={styles.topHudBar}>
          <div style={styles.hudLeftCluster}>
            <div style={styles.hudStatusDot} />
            <span style={styles.hudMonoText}>SYSTEM: OPTIMAL // 48kHz 24-BIT DSP</span>
          </div>

          {/* Live FFT Spectrum Analyzer Container */}
          <div style={styles.spectrumBox}>
            <canvas ref={spectrumCanvasRef} width={120} height={20} style={{ width: 120, height: 20 }} />
          </div>

          <div style={styles.hudRightCluster}>
            {isPlayingDemo && (
              <span style={styles.sweepReadoutMono}>
                SWEEP: <span style={{ color: '#22d3ee', fontWeight: 'bold' }}>{demoFreqReadout} Hz</span>
              </span>
            )}
            <button
              style={{
                ...styles.playDemoBtn,
                backgroundColor: isPlayingDemo ? '#22d3ee' : '#121722',
                color: isPlayingDemo ? '#050505' : '#ffffff',
              }}
              onClick={playFullAcousticDemo}
            >
              {isPlayingDemo ? '■ STOPPING' : '▶ LIVE ACOUSTIC DEMO'}
            </button>
          </div>
        </div>

        {/* STAGE NAVIGATION CONTROLLER */}
        <div style={styles.stageSwitcher}>
          {[
            { id: 0, num: '01', title: 'CHASSIS' },
            { id: 1, num: '02', title: 'INGRESS' },
            { id: 2, num: '03', title: 'DSP HUD' },
            { id: 3, num: '04', title: 'WAVES' },
          ].map((stage) => {
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => jumpToStage(stage.id)}
                style={{
                  ...styles.stageBtn,
                  backgroundColor: isActive ? '#ffffff' : 'rgba(10, 13, 20, 0.75)',
                  borderColor: isActive ? '#ffffff' : '#222836',
                  color: isActive ? '#050505' : '#8b949e',
                }}
              >
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', marginRight: 4 }}>{stage.num}</span>
                <span style={{ fontSize: 11, fontWeight: '700' }}>{stage.title}</span>
              </button>
            );
          })}
        </div>

        {/* BOTTOM HUD ACTION STRIP */}
        <div style={styles.bottomHudAction}>
          <div style={styles.bottomLeftText}>
            <div style={styles.bottomHeroTitle}>
              {activeStage === 0 && '01 // PRECISION CHASSIS GEOMETRY'}
              {activeStage === 1 && '02 // CABIN INGRESS & DAMPING'}
              {activeStage === 2 && '03 // 14-BAND BEZIER SPLINE DSP'}
              {activeStage === 3 && '04 // TIME-ALIGNED SOUNDWAVE CONVERGENCE'}
            </div>
            <div style={styles.bottomHeroSub}>
              {activeStage === 0 && 'Acoustic wave propagation calibrated for Indian right-hand-drive cabin geometry.'}
              {activeStage === 1 && 'Eliminate panel resonance, reflections, and road noise with tailored DSP offsets.'}
              {activeStage === 2 && 'Linkwitz-Riley 24dB filters with multimeter target AC gain staging.'}
              {activeStage === 3 && 'Millimeter-accurate arrival alignment directly to the driver headrest sweet-spot.'}
            </div>
          </div>

          <div style={styles.bottomRightCtas}>
            <button
              onClick={onEnterStudio}
              style={styles.primaryWhitePill}
            >
              LAUNCH TUNING STUDIO →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile Native Fallback
 */
function NativeFallbackSlideshow({ onEnterStudio }) {
  return (
    <View style={nativeStyles.container}>
      <Image source={SHOT_IMAGES[0]} style={nativeStyles.heroImage} resizeMode="cover" />
      <View style={nativeStyles.overlay}>
        <View style={nativeStyles.badge}>
          <Text style={nativeStyles.badgeText}>AUTOMOTIVE ACOUSTIC DSP</Text>
        </View>
        <Text style={nativeStyles.title}>PRECISION CABIN ACOUSTICS</Text>
        <Text style={nativeStyles.sub}>Calibrated for Indian vehicle cabins & multi-brand hardware.</Text>
        <TouchableOpacity style={nativeStyles.cta} onPress={onEnterStudio}>
          <Text style={nativeStyles.ctaText}>START TUNING CONFIGURATOR →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  heroImage: {
    width: '100%',
    height: '100%',
  },
  vignetteOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at center, transparent 35%, rgba(5, 5, 5, 0.85) 90%), linear-gradient(to bottom, rgba(5,5,5,0.7) 0%, transparent 20%, transparent 80%, #050505 100%)',
    pointerEvents: 'none',
  },
  topHudBar: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: 'rgba(10, 13, 20, 0.75)',
    backdropFilter: 'blur(16px)',
    borderRadius: 9999,
    border: '1px solid #1e2430',
    zIndex: 30,
  },
  hudLeftCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  hudStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22d3ee',
    boxShadow: '0 0 10px #22d3ee',
  },
  hudMonoText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  spectrumBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  hudRightCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  sweepReadoutMono: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  playDemoBtn: {
    border: '1px solid #222d3d',
    borderRadius: 9999,
    padding: '6px 14px',
    fontSize: 11,
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: 0.5,
    transition: 'all 0.2s ease',
  },
  stageSwitcher: {
    position: 'absolute',
    top: 88,
    display: 'flex',
    gap: 8,
    padding: '6px',
    backgroundColor: 'rgba(10, 13, 20, 0.65)',
    backdropFilter: 'blur(12px)',
    borderRadius: 9999,
    border: '1px solid #1e2430',
    zIndex: 30,
  },
  stageBtn: {
    border: '1px solid',
    borderRadius: 9999,
    padding: '6px 14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  bottomHudAction: {
    position: 'absolute',
    bottom: 32,
    left: 28,
    right: 28,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 16,
    zIndex: 30,
  },
  bottomLeftText: {
    maxWidth: 620,
  },
  bottomHeroTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  bottomHeroSub: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 1.5,
  },
  bottomRightCtas: {
    display: 'flex',
    gap: 12,
  },
  primaryWhitePill: {
    backgroundColor: '#ffffff',
    color: '#050505',
    fontSize: 13,
    fontWeight: '900',
    padding: '14px 28px',
    borderRadius: 9999,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 0 24px rgba(255, 255, 255, 0.25)',
    transition: 'transform 0.15s ease',
  },
  hotspotPulse: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    border: '1px solid #22d3ee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pulse 2s infinite',
  },
  hotspotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22d3ee',
  },
  hotspotLabel: {
    marginTop: 4,
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    backgroundColor: 'rgba(5, 5, 5, 0.85)',
    padding: '2px 6px',
    borderRadius: 4,
    border: '1px solid #1e2430',
    whiteSpace: 'nowrap',
  },
  hotspotCard: {
    position: 'absolute',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 220,
    backgroundColor: '#0c1017',
    border: '1px solid #22d3ee',
    borderRadius: 12,
    padding: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
    pointerEvents: 'none',
  },
  hotspotCardHead: {
    color: '#22d3ee',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  hotspotCardDesc: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 1.4,
  },
};

const nativeStyles = StyleSheet.create({
  container: {
    height: 480,
    backgroundColor: '#050505',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(5, 5, 5, 0.75)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  badge: {
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    borderColor: '#22d3ee',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeText: {
    color: '#22d3ee',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  sub: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 16,
  },
  cta: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
  },
  ctaText: {
    color: '#050505',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
