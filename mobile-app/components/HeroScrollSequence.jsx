import React, { useRef, useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text, Image } from 'react-native';
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from 'framer-motion';
import { tokens } from '../design-system/tokens';
import { InstrumentPanel } from './ui/InstrumentPanel';
import { Button } from './ui/Button';
import { Readout } from './ui/Readout';

// 8K Photorealistic Storyboard Shots
const SHOT_IMAGES = [
  require('@/assets/images/shot1_exterior.jpg'),
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
 * Web Implementation: Framer Motion useScroll + useTransform Scrollytelling
 */
function WebHeroScrollSequence({ onEnterStudio }) {
  const containerRef = useRef(null);
  const webglCanvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sfxTriggeredRef = useRef({ whoosh: false, beep: false, sub: false });

  const prefersReducedMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState(0);

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
  // 4. WEBGL CONCENTRIC SOUNDWAVE SHADER OVERLAY
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

    // Strictly calibrated to tokens: Cyan #22D3EE (0.133, 0.827, 0.933) & Purple #A78BFA (0.655, 0.545, 0.980)
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

        vec3 cyan = vec3(0.133, 0.827, 0.933);
        vec3 purple = vec3(0.655, 0.545, 0.980);
        vec3 color = mix(cyan, purple, sin(u_time + dist * 5.0) * 0.5 + 0.5);

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

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        height: '350vh',
        backgroundColor: tokens.colors.bg.base,
        width: '100%',
        borderRadius: tokens.radius.lg,
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
          borderRadius: tokens.radius.lg,
          border: `1px solid ${tokens.colors.border.hairline}`,
          backgroundColor: tokens.colors.bg.base,
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

        {/* VIGNETTE & AMBIENT SCANLINES OVERLAY */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 35%, rgba(10, 11, 13, 0.85) 100%)',
            pointerEvents: 'none',
            zIndex: 6,
          }}
        />

        {/* ------------------------------------------------------------- */}
        {/* DOM-BASED HUD OVERLAYS WITH AnimatePresence                   */}
        {/* ------------------------------------------------------------- */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 10,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Top HUD Telemetry */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: tokens.colors.signal.primary,
                  border: `1px solid ${tokens.colors.border.hairline}`,
                }}
              />
              <span
                style={{
                  color: tokens.colors.text.secondary,
                  fontFamily: tokens.typography.fontFamily.mono,
                  fontSize: 11,
                  fontWeight: '600',
                  letterSpacing: 1.5,
                }}
              >
                CARAUDIO.AI // SCROLLYTELLING ENGINE
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  style={{
                    width: 24,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor:
                      activeStage >= step
                        ? tokens.colors.text.primary
                        : 'rgba(255, 255, 255, 0.12)',
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
                style={{ pointerEvents: 'auto', maxWidth: 480, width: '100%' }}
              >
                <InstrumentPanel
                  title="The Precision Acoustic Baseline"
                  badge="STAGE 01 // EXTERIOR SCAN"
                  status="info"
                  variant="elevated"
                  style={styles.hudPanel}
                  headerStyle={styles.hudHeader}
                  contentStyle={styles.hudContent}
                >
                  <Text style={styles.hudDescription}>
                    Scanning chassis volume and cabin dimensions for RHD acoustic calibration.
                  </Text>
                  <View style={styles.readoutRow}>
                    <Readout label="Chassis Vol" value="3.20" unit="m³" size="sm" />
                    <Readout label="Resonance" value="200" unit="Hz" size="sm" />
                    <Readout label="Seating Profile" value="RHD 2-ROW" size="sm" />
                  </View>
                </InstrumentPanel>
              </motion.div>
            )}

            {activeStage === 1 && (
              <motion.div
                key="hud-stage-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{ pointerEvents: 'auto', maxWidth: 480, width: '100%' }}
              >
                <InstrumentPanel
                  title="Asymmetrical Seating Matrix"
                  badge="STAGE 02 // COCKPIT INGRESS"
                  status="warning"
                  variant="elevated"
                  style={styles.hudPanel}
                  headerStyle={styles.hudHeader}
                  contentStyle={styles.hudContent}
                >
                  <Text style={styles.hudDescription}>
                    Driver sits 95cm from right speaker vs 138cm from left. 1.25ms acoustic arrival discrepancy detected.
                  </Text>
                  <View style={styles.readoutRow}>
                    <Readout label="FL Distance" value="138" unit="cm" size="sm" />
                    <Readout label="FR Distance" value="95" unit="cm" size="sm" />
                    <Readout label="Phase Offset" value="1.25" unit="ms" size="sm" status="warning" />
                  </View>
                </InstrumentPanel>
              </motion.div>
            )}

            {activeStage === 2 && (
              <motion.div
                key="hud-stage-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                style={{ pointerEvents: 'auto', maxWidth: 480, width: '100%' }}
              >
                <InstrumentPanel
                  title="Acoustic Notch Compensation"
                  badge="STAGE 03 // 14-BAND PARAMETRIC DSP"
                  status="info"
                  variant="elevated"
                  style={styles.hudPanel}
                  headerStyle={styles.hudHeader}
                  contentStyle={styles.hudContent}
                >
                  <Text style={styles.hudDescription}>
                    Target EQ curve applied to neutralize standing cabin waves and windshield reflections.
                  </Text>
                  <View style={styles.readoutRow}>
                    <Readout label="Port Boost" value="+5.5" unit="dB @ 63Hz" size="sm" />
                    <Readout label="Cabin Notch" value="-1.5" unit="dB @ 200Hz" size="sm" />
                    <Readout label="Glass Tamer" value="-1.0" unit="dB @ 4.0kHz" size="sm" />
                  </View>
                </InstrumentPanel>
              </motion.div>
            )}

            {activeStage === 3 && (
              <motion.div
                key="hud-stage-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ type: 'spring', damping: 18, stiffness: 100 }}
                style={{ pointerEvents: 'auto', maxWidth: 500, width: '100%' }}
              >
                <InstrumentPanel
                  title="Laser Soundstage Focus"
                  badge="PHASE COHERENCE: 99.8% LOCKED"
                  status="ok"
                  variant="elevated"
                  style={styles.hudPanel}
                  headerStyle={styles.hudHeader}
                  contentStyle={styles.hudContent}
                >
                  <Text style={styles.hudDescription}>
                    All 5 speaker acoustic wavefronts arriving simultaneously at driver headrest. Ready for physical calibration.
                  </Text>
                  <View style={styles.readoutRow}>
                    <Readout label="Coherence" value="99.8" unit="%" size="sm" status="ok" />
                    <Readout label="Wavefront" value="343" unit="m/s" size="sm" status="ok" />
                    <Readout label="Time Delta" value="0.00" unit="ms" size="sm" status="ok" />
                  </View>
                  {onEnterStudio && (
                    <View style={styles.ctaWrapper}>
                      <Button
                        label="Open Live Tuning Studio →"
                        variant="solid"
                        size="md"
                        onPress={onEnterStudio}
                        style={styles.ctaButton}
                      />
                    </View>
                  )}
                </InstrumentPanel>
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
        <InstrumentPanel
          title="AI Soundfield Calibration"
          badge="CARAUDIO.AI NATIVE PREVIEW"
          status="ok"
          variant="elevated"
          style={nativeStyles.panel}
        >
          <Text style={nativeStyles.description}>
            Phase-coherent 343 m/s acoustic calibration for Indian car environments.
          </Text>
          <View style={nativeStyles.telemetryRow}>
            <Readout label="Wavefront" value="343" unit="m/s" size="sm" status="ok" />
            <Readout label="Offset" value="1.25" unit="ms" size="sm" status="warning" />
            <Readout label="Coherence" value="99.8" unit="%" size="sm" status="ok" />
          </View>
          {onEnterStudio && (
            <View style={nativeStyles.ctaWrapper}>
              <Button
                label="Open Live Tuning Studio →"
                variant="solid"
                size="md"
                onPress={onEnterStudio}
                style={nativeStyles.ctaButton}
              />
            </View>
          )}
        </InstrumentPanel>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hudPanel: {
    backgroundColor: 'rgba(18, 21, 27, 0.92)',
    borderColor: tokens.colors.border.subtle,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  hudHeader: {
    backgroundColor: 'transparent',
    borderBottomColor: tokens.colors.border.hairline,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  hudContent: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  hudDescription: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    lineHeight: 16,
    color: tokens.colors.text.secondary,
  },
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.xs,
    marginTop: tokens.spacing.xs,
  },
  ctaWrapper: {
    marginTop: tokens.spacing.xs,
    alignItems: 'flex-start',
  },
  ctaButton: {
    alignSelf: 'flex-start',
  },
});

const nativeStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: 400,
    backgroundColor: tokens.colors.bg.base,
    position: 'relative',
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border.hairline,
    overflow: 'hidden',
    marginBottom: tokens.spacing.xl,
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
    padding: tokens.spacing.md,
  },
  panel: {
    backgroundColor: 'rgba(18, 21, 27, 0.92)',
    borderColor: tokens.colors.border.subtle,
    borderRadius: tokens.radius.md,
  },
  description: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.secondary,
    lineHeight: 16,
    marginBottom: tokens.spacing.xs,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
  },
  ctaWrapper: {
    alignItems: 'flex-start',
  },
  ctaButton: {
    width: '100%',
  },
});
