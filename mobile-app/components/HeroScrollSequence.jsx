import React, { useRef, useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text, Image } from 'react-native';
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from 'framer-motion';
import { tokens } from '../design-system/tokens';

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
 */
function WebHeroScrollSequence({ onEnterStudio }) {
  const containerRef = useRef(null);
  const webglCanvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sfxTriggeredRef = useRef({ whoosh: false, beep: false, sub: false });

  const prefersReducedMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState(0);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  // Framer Motion Scroll Progress (0.0 -> 1.0 across 350vh)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // -------------------------------------------------------------
  // 1. OPACITY TRANSFORMS (Breakpoints: 0->0.3, 0.3->0.6, 0.6->1.0)
  // -------------------------------------------------------------
  const opacity1 = useTransform(scrollYProgress, [0, 0.22, 0.34], [1, 1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.22, 0.34, 0.54, 0.64], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.54, 0.64, 0.76, 0.84], [0, 1, 1, 0]);
  const opacity4 = useTransform(scrollYProgress, [0.76, 0.84, 1.0], [0, 1, 1]);

  // WebGL Soundwave Overlay Opacity
  const webglOpacity = useTransform(scrollYProgress, [0.76, 0.86, 1.0], [0, 0.85, 1.0]);

  // -------------------------------------------------------------
  // 2. KEN BURNS SCALE TRANSFORMS
  // -------------------------------------------------------------
  const scale1 = useTransform(scrollYProgress, [0, 0.34], prefersReducedMotion ? [1, 1] : [1.0, 1.08]);
  const scale2 = useTransform(scrollYProgress, [0.22, 0.64], prefersReducedMotion ? [1, 1] : [1.02, 1.10]);
  const scale3 = useTransform(scrollYProgress, [0.54, 0.84], prefersReducedMotion ? [1, 1] : [1.0, 1.12]);
  const scale4 = useTransform(scrollYProgress, [0.76, 1.0], prefersReducedMotion ? [1, 1] : [1.04, 1.15]);

  // -------------------------------------------------------------
  // 3. AUDIO CONTEXT & SFX ENGINE
  // -------------------------------------------------------------
  const initAudioOnGesture = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playWhoosh = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
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
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
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
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
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

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (p) => {
      initAudioOnGesture();

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

  // -------------------------------------------------------------
  // 4. WEBGL SOUNDWAVE SHADER OVERLAY
  // -------------------------------------------------------------
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

      void main() {
        vec2 center = vec2(0.68, 0.45);
        vec2 uv = v_uv;
        float dist = distance(uv, center);

        float wave = sin(dist * 45.0 - u_time * 4.0);
        float ringIntensity = smoothstep(0.7, 1.0, wave) * exp(-dist * 2.5);

        vec2 speakerFL = vec2(0.25, 0.65);
        float distFL = distance(uv, speakerFL);
        float waveFL = sin(distFL * 35.0 - u_time * 3.5);
        float flIntensity = smoothstep(0.8, 1.0, waveFL) * exp(-distFL * 3.0);

        vec3 cyan = vec3(0.133, 0.827, 0.933); // #22d3ee
        vec3 violet = vec3(0.655, 0.545, 0.980); // #a78bfa
        vec3 color = mix(cyan, violet, sin(u_time + dist * 5.0) * 0.5 + 0.5);

        float alpha = (ringIntensity * 0.45) + (flIntensity * 0.35);
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
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [prefersReducedMotion]);

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
          left: 0,
          width: '100%',
          height: '80vh',
          minHeight: 520,
          maxHeight: 700,
          overflow: 'hidden',
          borderRadius: 24,
          border: '1px solid #1e2430',
          backgroundColor: '#050505',
          perspective: 1200,
        }}
      >
        {/* Parallax Wrapper */}
        <motion.div
          animate={{
            rotateY: mouseTilt.x,
            rotateX: -mouseTilt.y,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 150 }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* SHOT 1: EXTERIOR REVEAL */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: opacity1,
              scale: scale1,
              zIndex: 1,
            }}
          >
            <Image
              source={SHOT_IMAGES[0]}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </motion.div>

          {/* SHOT 2: DOOR OPEN & COCKPIT INGRESS */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: opacity2,
              scale: scale2,
              zIndex: 2,
            }}
          >
            <Image
              source={SHOT_IMAGES[1]}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </motion.div>

          {/* SHOT 3: TOUCHSCREEN HEAD UNIT HUD */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: opacity3,
              scale: scale3,
              zIndex: 3,
            }}
          >
            <Image
              source={SHOT_IMAGES[2]}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </motion.div>

          {/* SHOT 4: HOLOGRAPHIC SOUNDWAVES */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: opacity4,
              scale: scale4,
              zIndex: 4,
            }}
          >
            <Image
              source={SHOT_IMAGES[3]}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </motion.div>

          {/* WEBGL SOUNDWAVE SHADER OVERLAY CANVAS */}
          {!prefersReducedMotion && (
            <motion.canvas
              ref={webglCanvasRef}
              width={960}
              height={540}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 5,
                opacity: webglOpacity,
              }}
            />
          )}
        </motion.div>

        {/* VIGNETTE & AMBIENT SCANLINES OVERLAY */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 35%, rgba(5, 5, 5, 0.85) 100%)',
            pointerEvents: 'none',
            zIndex: 6,
          }}
        />

        {/* ------------------------------------------------------------- */}
        {/* DOM-BASED HUD OVERLAYS WITH AnimatePresence                   */}
        {/* ------------------------------------------------------------- */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Top HUD Telemetry */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#10141d', padding: '6px 14px', borderRadius: 9999, border: '1px solid #1e2430' }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }} />
              <span style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 }}>
                CARAUDIO.AI // SCROLLYTELLING
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  style={{
                    width: 24,
                    height: 3,
                    borderRadius: 9999,
                    backgroundColor: activeStage >= step ? '#ffffff' : 'rgba(255,255,255,0.15)',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Dynamic HUD Content per Shot Stage */}
          <AnimatePresence mode="wait">
            {activeStage === 0 && (
              <motion.div
                key="hud-stage-0"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  backgroundColor: 'rgba(10, 13, 20, 0.85)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid #1e2430',
                  borderRadius: 16,
                  padding: 18,
                  maxWidth: 440,
                }}
              >
                <div style={{ color: '#8b949e', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold', marginBottom: 4 }}>
                  STAGE 01 // EXTERIOR SCAN
                </div>
                <h3 style={{ color: '#ffffff', fontSize: 20, fontWeight: 900, margin: '0 0 4px 0' }}>
                  Precision Acoustic Baseline
                </h3>
                <p style={{ color: '#8b949e', fontSize: 12, lineHeight: 1.5, margin: 0 }}>
                  Scanning chassis volume and cabin dimensions. Scroll down to enter the acoustic stage.
                </p>
              </motion.div>
            )}

            {activeStage === 1 && (
              <motion.div
                key="hud-stage-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  backgroundColor: 'rgba(10, 13, 20, 0.85)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid #22d3ee',
                  borderRadius: 16,
                  padding: 18,
                  maxWidth: 440,
                }}
              >
                <div style={{ color: '#22d3ee', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold', marginBottom: 4 }}>
                  STAGE 02 // COCKPIT INGRESS
                </div>
                <h3 style={{ color: '#ffffff', fontSize: 20, fontWeight: 900, margin: '0 0 4px 0' }}>
                  Asymmetrical Seating Matrix
                </h3>
                <p style={{ color: '#8b949e', fontSize: 12, lineHeight: 1.5, margin: 0 }}>
                  Driver sits 95cm from right speaker vs 138cm from left. 1.25ms phase clash detected.
                </p>
              </motion.div>
            )}

            {activeStage === 2 && (
              <motion.div
                key="hud-stage-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                style={{
                  backgroundColor: 'rgba(10, 13, 20, 0.88)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid #1e2430',
                  borderRadius: 16,
                  padding: 18,
                  maxWidth: 420,
                }}
              >
                <div style={{ color: '#8b949e', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold', marginBottom: 4 }}>
                  STAGE 03 // 14-BAND PARAMETRIC DSP
                </div>
                <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                  Target EQ Curve Applied
                </div>
                <div style={{ color: '#cbd5e1', fontSize: 11, lineHeight: 1.5, fontFamily: 'monospace' }}>
                  +5.5 dB @ 63Hz (Port Resonance)<br />
                  -1.5 dB @ 200Hz (Cabin Standing Notch)<br />
                  -1.0 dB @ 4kHz (Windshield Glass Tamer)
                </div>
              </motion.div>
            )}

            {activeStage === 3 && (
              <motion.div
                key="hud-stage-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ type: 'spring', damping: 18, stiffness: 100 }}
                style={{
                  backgroundColor: 'rgba(10, 13, 20, 0.92)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid #ffffff',
                  borderRadius: 16,
                  padding: 20,
                  maxWidth: 460,
                  pointerEvents: 'auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }} />
                  <span style={{ color: '#22d3ee', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }}>
                    PHASE COHERENCE: 99.8% LOCKED
                  </span>
                </div>
                <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
                  Laser Soundstage Focus
                </div>
                <p style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.4, margin: '0 0 12px 0' }}>
                  All 5 speaker waves arriving simultaneously at driver headrest. Ready for physical calibration.
                </p>

                {onEnterStudio && (
                  <button
                    onClick={onEnterStudio}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#050505',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: 9999,
                      fontWeight: 'bold',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Open Live Tuning Studio →
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Native Platform Fallback (iOS/Android)
 */
function NativeFallbackSlideshow({ onEnterStudio }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SHOT_IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={nativeStyles.container}>
      <Image
        source={SHOT_IMAGES[currentIdx]}
        style={nativeStyles.image}
        resizeMode="cover"
      />
      <View style={nativeStyles.overlay}>
        <Text style={nativeStyles.tag}>CARAUDIO.AI NATIVE PREVIEW</Text>
        <Text style={nativeStyles.title}>AI Soundfield Calibration</Text>
        <Text style={nativeStyles.sub}>Phase-coherent 343 m/s acoustic calibration for Indian cars.</Text>
      </View>
    </View>
  );
}

const nativeStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: 360,
    backgroundColor: '#050505',
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(5, 5, 5, 0.85)',
  },
  tag: {
    color: '#22d3ee',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  sub: {
    color: '#8b949e',
    fontSize: 12,
  },
});
