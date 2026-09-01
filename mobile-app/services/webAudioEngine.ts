/**
 * CarAudioAI — Real-Time Web Audio API Signal Processing Engine
 * 
 * Hardware Signal Chain:
 * [ Tone Synth (Sine / Sweep / Pink Noise) ]
 *   └──► [ Master GainNode (Anti-pop smooth linear/exponential ramps) ]
 *          └──► [ 14-Band Cascaded BiquadFilterNode EQ Chain ]
 *                 └──► [ AnalyserNode (fftSize 2048, 60FPS FFT) ]
 *                        └──► [ AudioContext.destination ]
 */

import { Platform } from 'react-native';
import {
  ISO_14_BAND_FREQUENCIES,
  DEFAULT_Q_FACTOR,
  DSP_SAMPLE_RATE_HZ,
} from '../constants/dspConstants';

export type ToneType = 'off' | 'sine_1000' | 'sine_50' | 'sine_custom' | 'pink_noise' | 'sine_sweep';

export interface WebAudioEngineState {
  isInitialized: boolean;
  isPlaying: boolean;
  activeTone: ToneType;
  customFrequencyHz: number;
  masterVolume: number; // 0.0 to 1.0
  eqGains: number[];
  peakFrequencyHz: number;
  currentDbfs: number;
  contextState: 'suspended' | 'running' | 'closed' | 'unsupported';
}

export type WebAudioStateListener = (state: WebAudioEngineState) => void;

class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private analyser: AnalyserNode | null = null;
  private activeSourceNode: AudioNode | null = null;
  private activeToneType: ToneType = 'off';
  private customFreq: number = 1000;
  private volume: number = 0.5;
  private currentGains: number[] = new Array(ISO_14_BAND_FREQUENCIES.length).fill(0);
  private listeners: Set<WebAudioStateListener> = new Set();
  private pinkNoiseBuffer: AudioBuffer | null = null;
  private sweepAnimationId: number | null = null;
  private mockIntervalId: any = null;

  // Cached analysis buffers
  private freqDataBuffer: Uint8Array | null = null;
  private floatDataBuffer: Float32Array | null = null;

  constructor() {
    // Lazy initialize on user gesture to conform to browser autoplay policies
  }

  /**
   * Check if Web Audio API is natively supported in the current environment
   */
  public isSupported(): boolean {
    if (Platform.OS !== 'web') return false;
    return typeof window !== 'undefined' && (
      Boolean((window as any).AudioContext) || Boolean((window as any).webkitAudioContext)
    );
  }

  /**
   * Initialize AudioContext and Signal Graph
   */
  public async initialize(): Promise<boolean> {
    if (!this.isSupported()) {
      this.notifyListeners();
      return false;
    }

    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return true;
    }

    try {
      const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass({
        latencyHint: 'interactive',
        sampleRate: DSP_SAMPLE_RATE_HZ,
      });

      // 1. Create Master Gain Node with initial unity/safe level
      this.masterGain = this.ctx!.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx!.currentTime);

      // 2. Build 14-band cascaded BiquadFilterNode chain
      this.eqFilters = [];
      let previousNode: AudioNode = this.masterGain;

      for (let i = 0; i < ISO_14_BAND_FREQUENCIES.length; i++) {
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.setValueAtTime(ISO_14_BAND_FREQUENCIES[i], this.ctx!.currentTime);
        filter.Q.setValueAtTime(DEFAULT_Q_FACTOR, this.ctx!.currentTime);
        filter.gain.setValueAtTime(this.currentGains[i] || 0.0, this.ctx!.currentTime);

        previousNode.connect(filter);
        previousNode = filter;
        this.eqFilters.push(filter);
      }

      // 3. Create AnalyserNode
      this.analyser = this.ctx!.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      this.analyser.smoothingTimeConstant = 0.8;

      previousNode.connect(this.analyser);
      this.analyser.connect(this.ctx!.destination);

      // Pre-allocate FFT data buffers
      this.freqDataBuffer = new Uint8Array(this.analyser.frequencyBinCount);
      this.floatDataBuffer = new Float32Array(this.analyser.frequencyBinCount);

      // Pre-generate Pink Noise Buffer (Voss-McCartney Filter)
      this.pinkNoiseBuffer = this.generatePinkNoiseBuffer(this.ctx!, 4.0);

      this.notifyListeners();
      return true;
    } catch (err) {
      console.warn('[WebAudioEngine] AudioContext initialization failed:', err);
      return false;
    }
  }

  /**
   * Set a specific EQ band gain in dB (-12.0 to +12.0 dB)
   */
  public setBandGain(bandIndex: number, gainDb: number): void {
    const clampedGain = Math.max(-12.0, Math.min(12.0, gainDb));
    this.currentGains[bandIndex] = clampedGain;

    if (this.ctx && this.eqFilters[bandIndex]) {
      const param = this.eqFilters[bandIndex].gain;
      param.cancelScheduledValues(this.ctx.currentTime);
      param.linearRampToValueAtTime(clampedGain, this.ctx.currentTime + 0.05);
    }

    this.notifyListeners();
  }

  /**
   * Set all 14 EQ band gains simultaneously
   */
  public setAllGains(gains: number[]): void {
    for (let i = 0; i < ISO_14_BAND_FREQUENCIES.length; i++) {
      if (i < gains.length) {
        this.setBandGain(i, gains[i]);
      }
    }
  }

  /**
   * Set Master Volume (0.0 to 1.0) with anti-pop exponential/linear ramp
   */
  public setVolume(vol: number): void {
    this.volume = Math.max(0.0, Math.min(1.0, vol));
    if (this.ctx && this.masterGain && this.activeToneType !== 'off') {
      const targetGain = Math.max(0.0001, this.volume * 0.4); // Scale to prevent clipping
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.04);
    }
    this.notifyListeners();
  }

  /**
   * Start synthetic audio tone playback
   */
  public async playTone(toneType: ToneType, customFreqHz?: number): Promise<void> {
    await this.initialize();

    if (customFreqHz !== undefined) {
      this.customFreq = customFreqHz;
    }

    // If already playing this exact tone, nothing to change
    if (this.activeToneType === toneType && this.activeSourceNode) {
      return;
    }

    this.stopTone(false); // Stop previous source cleanly without zeroing state

    if (!this.ctx || !this.masterGain) {
      // Offline fallback state for native/mock environments
      this.activeToneType = toneType;
      this.notifyListeners();
      return;
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const targetGain = Math.max(0.0001, this.volume * 0.4);

    if (toneType === 'sine_1000' || toneType === 'sine_50' || toneType === 'sine_custom') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      let freq = 1000;
      if (toneType === 'sine_50') freq = 50;
      else if (toneType === 'sine_custom') freq = this.customFreq;

      osc.frequency.setValueAtTime(freq, now);
      osc.connect(this.masterGain);
      osc.start(now);

      this.activeSourceNode = osc;
      this.activeToneType = toneType;

      // Anti-pop ramp up
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.05);

    } else if (toneType === 'pink_noise') {
      if (!this.pinkNoiseBuffer) {
        this.pinkNoiseBuffer = this.generatePinkNoiseBuffer(this.ctx, 4.0);
      }
      const bufferSource = this.ctx.createBufferSource();
      bufferSource.buffer = this.pinkNoiseBuffer;
      bufferSource.loop = true;
      bufferSource.connect(this.masterGain);
      bufferSource.start(now);

      this.activeSourceNode = bufferSource;
      this.activeToneType = toneType;

      // Anti-pop ramp up
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.linearRampToValueAtTime(targetGain * 0.7, now + 0.05);

    } else if (toneType === 'sine_sweep') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(20, now);
      // Exponential frequency sweep from 20 Hz to 20,000 Hz over 8.0 seconds
      osc.frequency.exponentialRampToValueAtTime(20000, now + 8.0);
      osc.connect(this.masterGain);
      osc.start(now);

      this.activeSourceNode = osc;
      this.activeToneType = toneType;

      // Anti-pop ramp up
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.05);

      // Auto-restart sweep loop
      const sweepDurationMs = 8200;
      this.sweepAnimationId = (typeof window !== 'undefined' ? window.setTimeout(() => {
        if (this.activeToneType === 'sine_sweep') {
          this.playTone('sine_sweep');
        }
      }, sweepDurationMs) : null) as any;
    }

    this.notifyListeners();
  }

  /**
   * Stop any actively playing tone with anti-pop ramp down
   */
  public stopTone(updateState: boolean = true): void {
    if (this.sweepAnimationId) {
      if (typeof window !== 'undefined') window.clearTimeout(this.sweepAnimationId);
      this.sweepAnimationId = null;
    }

    if (this.ctx && this.masterGain && this.activeSourceNode) {
      const now = this.ctx.currentTime;
      // Quick anti-pop ramp down
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.04);

      const sourceToStop = this.activeSourceNode;
      setTimeout(() => {
        try {
          if ('stop' in sourceToStop && typeof (sourceToStop as any).stop === 'function') {
            (sourceToStop as any).stop();
          }
          sourceToStop.disconnect();
        } catch {
          // Already stopped
        }
      }, 50);

      this.activeSourceNode = null;
    }

    if (updateState) {
      this.activeToneType = 'off';
      this.notifyListeners();
    }
  }

  /**
   * Extract live 60FPS byte frequency data from AnalyserNode
   */
  public getByteFrequencyData(): Uint8Array {
    if (this.analyser && this.freqDataBuffer) {
      this.analyser.getByteFrequencyData(this.freqDataBuffer);
      return this.freqDataBuffer;
    }

    // Synthesize fallback mock spectrum data when running in simulator or non-web mode
    const fallback = new Uint8Array(128);
    if (this.activeToneType !== 'off') {
      for (let i = 0; i < 128; i++) {
        fallback[i] = Math.floor(Math.random() * 40 + (this.activeToneType === 'pink_noise' ? 120 - i * 0.7 : 80));
      }
    }
    return fallback;
  }

  /**
   * Extract grouped spectrum bar levels (e.g. 14, 28, 32, or 64 bars)
   */
  public getGroupedSpectrumBars(numBars: number = 32): number[] {
    const rawData = this.getByteFrequencyData();
    const bars: number[] = new Array(numBars).fill(0);
    const binsPerBar = Math.floor(rawData.length / numBars) || 1;

    for (let i = 0; i < numBars; i++) {
      let sum = 0;
      const startBin = i * binsPerBar;
      const endBin = Math.min(rawData.length, (i + 1) * binsPerBar);
      const count = endBin - startBin || 1;

      for (let j = startBin; j < endBin; j++) {
        sum += rawData[j];
      }
      bars[i] = sum / (count * 255); // Normalized 0.0 to 1.0
    }

    return bars;
  }

  /**
   * Calculate live peak frequency in Hz
   */
  public getPeakFrequency(): number {
    if (!this.analyser || !this.ctx || !this.freqDataBuffer) {
      if (this.activeToneType === 'sine_1000') return 1000;
      if (this.activeToneType === 'sine_50') return 50;
      if (this.activeToneType === 'sine_custom') return this.customFreq;
      return 0;
    }

    this.analyser.getByteFrequencyData(this.freqDataBuffer);
    let maxVal = 0;
    let maxIndex = 0;

    for (let i = 0; i < this.freqDataBuffer.length; i++) {
      if (this.freqDataBuffer[i] > maxVal) {
        maxVal = this.freqDataBuffer[i];
        maxIndex = i;
      }
    }

    if (maxVal < 10) return 0; // Noise floor threshold
    const binWidth = this.ctx.sampleRate / this.analyser.fftSize;
    return Math.round(maxIndex * binWidth);
  }

  /**
   * Calculate live signal level in dBFS (-90 dBFS to 0 dBFS)
   */
  public getCurrentDbfs(): number {
    if (!this.analyser || !this.floatDataBuffer) {
      return this.activeToneType !== 'off' ? -6.0 : -90.0;
    }

    this.analyser.getFloatFrequencyData(this.floatDataBuffer);
    let maxDb = -120;
    for (let i = 0; i < this.floatDataBuffer.length; i++) {
      if (this.floatDataBuffer[i] > maxDb) {
        maxDb = this.floatDataBuffer[i];
      }
    }

    return Math.max(-90, Math.min(0, Math.round(maxDb * 10) / 10));
  }

  /**
   * Voss-McCartney 1/f Pink Noise Synthesis Algorithm
   */
  private generatePinkNoiseBuffer(ctx: AudioContext, durationSec: number = 4.0): AudioBuffer {
    const bufferSize = ctx.sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    return buffer;
  }

  /**
   * State management subscriber
   */
  public subscribe(listener: WebAudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): WebAudioEngineState {
    const peak = this.getPeakFrequency();
    const dbfs = this.getCurrentDbfs();

    return {
      isInitialized: Boolean(this.ctx),
      isPlaying: this.activeToneType !== 'off',
      activeTone: this.activeToneType,
      customFrequencyHz: this.customFreq,
      masterVolume: this.volume,
      eqGains: [...this.currentGains],
      peakFrequencyHz: peak,
      currentDbfs: dbfs,
      contextState: this.ctx ? this.ctx.state : (this.isSupported() ? 'suspended' : 'unsupported'),
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  /**
   * Cleanup and dispose audio context
   */
  public dispose(): void {
    this.stopTone(true);
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {
        // Ignored
      }
    }
    this.ctx = null;
    this.masterGain = null;
    this.eqFilters = [];
    this.analyser = null;
  }
}

// Export singleton instance
export const webAudioEngine = new WebAudioEngine();
export default webAudioEngine;
