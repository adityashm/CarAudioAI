import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { tokens } from '../../design-system/tokens';
import { InstrumentPanel } from '../ui/InstrumentPanel';
import { Readout } from '../ui/Readout';
import { Button } from '../ui/Button';
import { SliderControl } from '../ui/SliderControl';
import {
  HEAD_UNIT_OPTIONS,
  FRONT_SPEAKER_OPTIONS,
  REAR_SPEAKER_OPTIONS,
  AMPLIFIER_OPTIONS,
  SUBWOOFER_OPTIONS,
} from '../../constants/catalog';

export interface HardwareConfig {
  headUnit: (typeof HEAD_UNIT_OPTIONS)[0];
  frontSpeaker: (typeof FRONT_SPEAKER_OPTIONS)[0];
  rearSpeaker: (typeof REAR_SPEAKER_OPTIONS)[0];
  amplifier: (typeof AMPLIFIER_OPTIONS)[0];
  subwoofer: (typeof SUBWOOFER_OPTIONS)[0];
  boxTuningHz: number;
  customFrontRms?: number;
  customSubRms?: number;
  customSubOhms?: number;
}

export interface StepHardwareProps {
  config: HardwareConfig;
  onChangeConfig: (newConfig: HardwareConfig) => void;
  onBack?: () => void;
  onContinue?: () => void;
}

export const StepHardware: React.FC<StepHardwareProps> = ({
  config,
  onChangeConfig,
  onBack,
  onContinue,
}) => {
  const [activeCategory, setActiveCategory] = useState<'front' | 'rear' | 'sub' | 'amp' | 'headunit'>('front');

  // Subsonic Protection Calculation (Box Tuning - 7Hz for ported, or 20Hz default)
  const isPorted = config.subwoofer.type === 'ported';
  const resolvedBoxTune = isPorted ? config.boxTuningHz || config.subwoofer.tuneHz || 35 : 0;
  const subsonicHz = isPorted ? Math.max(20, resolvedBoxTune - 7) : 20;

  // DMM Target AC Voltages: V = sqrt(P * R)
  const frontRms = config.customFrontRms || config.frontSpeaker.rms;
  const frontOhms = config.frontSpeaker.ohms;
  const vFront = +(Math.sqrt(frontRms * frontOhms)).toFixed(2);

  const rearRms = config.rearSpeaker.rms > 0 ? +(config.rearSpeaker.rms * 0.6).toFixed(1) : 0;
  const rearOhms = config.rearSpeaker.ohms;
  const vRear = rearRms > 0 ? +(Math.sqrt(rearRms * rearOhms)).toFixed(2) : 0;

  const subRms = config.customSubRms || config.subwoofer.rms;
  const subOhms = config.customSubOhms || config.subwoofer.ohms;
  const vSub = subRms > 0 && subOhms > 0 ? +(Math.sqrt(subRms * subOhms)).toFixed(2) : 0;

  // Handler helpers
  const handleSelectHeadUnit = (hu: (typeof HEAD_UNIT_OPTIONS)[0]) => {
    onChangeConfig({ ...config, headUnit: hu });
  };

  const handleSelectFront = (spk: (typeof FRONT_SPEAKER_OPTIONS)[0]) => {
    onChangeConfig({ ...config, frontSpeaker: spk });
  };

  const handleSelectRear = (spk: (typeof REAR_SPEAKER_OPTIONS)[0]) => {
    onChangeConfig({ ...config, rearSpeaker: spk });
  };

  const handleSelectAmp = (amp: (typeof AMPLIFIER_OPTIONS)[0]) => {
    onChangeConfig({ ...config, amplifier: amp });
  };

  const handleSelectSub = (sub: (typeof SUBWOOFER_OPTIONS)[0]) => {
    const defaultTune = sub.tuneHz > 0 ? sub.tuneHz : 35;
    onChangeConfig({
      ...config,
      subwoofer: sub,
      boxTuningHz: defaultTune,
    });
  };

  const handleBoxTuneChange = (val: number) => {
    onChangeConfig({ ...config, boxTuningHz: val });
  };

  return (
    <View style={styles.container}>
      {/* Intro Title */}
      <View style={styles.introHeader}>
        <Text style={styles.stepTitle}>INSTALLED AUDIO HARDWARE CONFIGURATION</Text>
        <Text style={styles.stepSubtitle}>
          Configure your source unit, front stage, rear fill, amplifier power, and custom subwoofer enclosure tuning.
        </Text>
      </View>

      {/* Hardware Category Tabs */}
      <View style={styles.categoryNavRow}>
        {[
          { key: 'front', label: '1. FRONT STAGE', icon: '🔊' },
          { key: 'rear', label: '2. REAR FILL', icon: '🔈' },
          { key: 'sub', label: '3. SUBWOOFER', icon: '📦' },
          { key: 'amp', label: '4. AMPLIFIERS', icon: '⚡' },
          { key: 'headunit', label: '5. SOURCE UNIT', icon: '📻' },
        ].map((tab) => {
          const isActive = activeCategory === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.categoryTab, isActive && styles.categoryTabActive]}
              onPress={() => setActiveCategory(tab.key as any)}
            >
              <Text style={styles.categoryTabIcon}>{tab.icon}</Text>
              <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Category Content Area */}
      {/* 1. FRONT STAGE SPEAKERS */}
      {activeCategory === 'front' && (
        <InstrumentPanel
          variant="flat"
          title="FRONT SOUNDSTAGE SPEAKERS"
          subtitle="Component / Coaxial Drivers (Acoustic Stage Anchor)"
          badge={${config.frontSpeaker.rms}W RMS}
          status="ok"
        >
          <View style={styles.optionsList}>
            {FRONT_SPEAKER_OPTIONS.map((opt) => {
              const isSelected = config.frontSpeaker.id === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, isSelected && styles.optionCardActive]}
                  onPress={() => handleSelectFront(opt)}
                >
                  <View style={styles.optionHeader}>
                    <Text style={[styles.optionName, isSelected && styles.textWhite]}>
                      {opt.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedPill}>
                        <Text style={styles.selectedPillText}>SELECTED</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.optionSpecsRow}>
                    <Text style={styles.specChip}>⚡ {opt.rms}W RMS</Text>
                    <Text style={styles.specChip}>Ω {opt.ohms}Ω</Text>
                    <Text style={styles.specChip}>HPF: {opt.hpf}Hz</Text>
                    <Text style={styles.specChip}>Sens: {opt.sensitivity}dB</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </InstrumentPanel>
      )}

      {/* 2. REAR FILL SPEAKERS */}
      {activeCategory === 'rear' && (
        <InstrumentPanel
          variant="flat"
          title="REAR FILL SPEAKERS"
          subtitle="Ambient Coaxial Fill or Rear Delete for Pure Front Soundstage"
          badge={config.rearSpeaker.id === 'none' ? 'REAR DELETE' : ${config.rearSpeaker.rms}W RMS}
          status={config.rearSpeaker.id === 'none' ? 'neutral' : 'ok'}
        >
          <View style={styles.optionsList}>
            {REAR_SPEAKER_OPTIONS.map((opt) => {
              const isSelected = config.rearSpeaker.id === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, isSelected && styles.optionCardActive]}
                  onPress={() => handleSelectRear(opt)}
                >
                  <View style={styles.optionHeader}>
                    <Text style={[styles.optionName, isSelected && styles.textWhite]}>
                      {opt.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedPill}>
                        <Text style={styles.selectedPillText}>SELECTED</Text>
                      </View>
                    )}
                  </View>

                  {opt.rms > 0 ? (
                    <View style={styles.optionSpecsRow}>
                      <Text style={styles.specChip}>⚡ {opt.rms}W RMS</Text>
                      <Text style={styles.specChip}>Ω {opt.ohms}Ω</Text>
                      <Text style={styles.specChip}>HPF: {opt.hpf}Hz</Text>
                    </View>
                  ) : (
                    <Text style={styles.rearDeleteDesc}>
                      Pure Front Stage SQ Setup — All amplifier power dedicated to front components.
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </InstrumentPanel>
      )}

      {/* 3. SUBWOOFER & ENCLOSURE TUNING */}
      {activeCategory === 'sub' && (
        <View style={styles.subCategoryBlock}>
          <InstrumentPanel
            variant="flat"
            title="SUBWOOFER & ENCLOSURE TYPE"
            subtitle="Ported Slot Port / Sealed Box / Under-Seat Active Bass"
            badge={config.subwoofer.type.toUpperCase()}
            status="ok"
          >
            <View style={styles.optionsList}>
              {SUBWOOFER_OPTIONS.map((opt) => {
                const isSelected = config.subwoofer.id === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.optionCard, isSelected && styles.optionCardActive]}
                    onPress={() => handleSelectSub(opt)}
                  >
                    <View style={styles.optionHeader}>
                      <Text style={[styles.optionName, isSelected && styles.textWhite]}>
                        {opt.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.selectedPill}>
                          <Text style={styles.selectedPillText}>SELECTED</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.optionDescText}>{opt.desc}</Text>

                    {opt.rms > 0 && (
                      <View style={styles.optionSpecsRow}>
                        <Text style={styles.specChip}>⚡ {opt.rms}W RMS</Text>
                        <Text style={styles.specChip}>Ω {opt.ohms}Ω</Text>
                        <Text style={styles.specChip}>
                          {opt.type === 'ported' ? Ported @ Hz : 'Sealed Box'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </InstrumentPanel>

          {/* Ported Box Tuning Frequency Slider Control */}
          {isPorted && (
            <InstrumentPanel
              variant="elevated"
              title="PORTED ENCLOSURE TUNING & SUBSONIC SAFETY"
              subtitle="Slot Port Box Resonance Tuning ({box}$) & High-Pass Subsonic Protection"
              badge={${resolvedBoxTune} HZ TUNING}
              status="warning"
            >
              <View style={styles.tuningControlSection}>
                <View style={styles.sliderWrap}>
                  <SliderControl
                    label="BOX TUNING FREQUENCY"
                    unit="Hz"
                    value={resolvedBoxTune}
                    min={25}
                    max={45}
                    step={1}
                    precision={0}
                    orientation="horizontal"
                    width={280}
                    onChange={handleBoxTuneChange}
                    ticks={[
                      { value: 28, label: '28Hz (Deep SQL)' },
                      { value: 33, label: '33Hz (EDM)' },
                      { value: 35, label: '35Hz (Punjabi/Punch)' },
                      { value: 40, label: '40Hz (SPL)' },
                    ]}
                  />
                </View>

                {/* Subsonic Protection Notice */}
                <View style={styles.subsonicWarningCard}>
                  <Text style={styles.subsonicWarningTitle}>⚠️ SUBSONIC HIGH-PASS FILTER SAFETY RULE</Text>
                  <Text style={styles.subsonicWarningText}>
                    Ported enclosures exhibit cone unloading below their tuning point ({resolvedBoxTune}Hz). CarAudioAI calculates an automatic subsonic safety HPF at <Text style={styles.monoHighlight}>{subsonicHz}Hz (24dB/oct Linkwitz-Riley)</Text> to prevent mechanical voice-coil destruction.
                  </Text>
                </View>
              </View>
            </InstrumentPanel>
          )}
        </View>
      )}

      {/* 4. AMPLIFIERS & GAIN STAGING */}
      {activeCategory === 'amp' && (
        <InstrumentPanel
          variant="flat"
          title="AMPLIFIER CONFIGURATION"
          subtitle="4-Channel, Monoblock, or Active Multi-Channel DSP Amp"
          badge={config.amplifier.hasSubChannel ? 'MULTI-AMP' : '4-CHANNEL'}
          status="ok"
        >
          <View style={styles.optionsList}>
            {AMPLIFIER_OPTIONS.map((opt) => {
              const isSelected = config.amplifier.id === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, isSelected && styles.optionCardActive]}
                  onPress={() => handleSelectAmp(opt)}
                >
                  <View style={styles.optionHeader}>
                    <Text style={[styles.optionName, isSelected && styles.textWhite]}>
                      {opt.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedPill}>
                        <Text style={styles.selectedPillText}>SELECTED</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.optionSpecsRow}>
                    <Text style={styles.specChip}>Front: {opt.frontRms}W x 2</Text>
                    <Text style={styles.specChip}>Rear: {opt.rearRms}W x 2</Text>
                    {opt.subRms > 0 && <Text style={styles.specChip}>Sub: {opt.subRms}W Mono</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </InstrumentPanel>
      )}

      {/* 5. HEAD UNIT / SOURCE */}
      {activeCategory === 'headunit' && (
        <InstrumentPanel
          variant="flat"
          title="HEAD UNIT / SOURCE PLAYER"
          subtitle="Pre-out Voltage & Equalizer Band Capabilities"
          badge={${config.headUnit.preout}V PRE-OUT}
          status="ok"
        >
          <View style={styles.optionsList}>
            {HEAD_UNIT_OPTIONS.map((opt) => {
              const isSelected = config.headUnit.id === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, isSelected && styles.optionCardActive]}
                  onPress={() => handleSelectHeadUnit(opt)}
                >
                  <View style={styles.optionHeader}>
                    <Text style={[styles.optionName, isSelected && styles.textWhite]}>
                      {opt.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedPill}>
                        <Text style={styles.selectedPillText}>SELECTED</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.optionSpecsRow}>
                    <Text style={styles.specChip}>⚡ Pre-out: {opt.preout}V RMS</Text>
                    <Text style={styles.specChip}>🎛️ EQ Bands: {opt.bands}</Text>
                    <Text style={styles.specChip}>Type: {opt.type.toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </InstrumentPanel>
      )}

      {/* Hardware Telemetry & DMM Gain Staging Summary Panel */}
      <InstrumentPanel
        variant="elevated"
        title="CALCULATED GAIN STAGING & CROSSOVER NETWORK"
        subtitle="Multimeter AC Target Voltages ( = \sqrt{P \times R}$) & Filter Cutoffs"
        badge="CALCULATED"
        status="ok"
        style={styles.summaryPanel}
      >
        <View style={styles.readoutGrid4}>
          <Readout
            label="FRONT TARGET AC"
            value={vFront}
            unit="V AC"
            secondaryValue={${frontRms}W @ Ω}
            size="md"
          />
          <Readout
            label="REAR TARGET AC"
            value={vRear}
            unit="V AC"
            secondaryValue={rearRms > 0 ? ${rearRms}W @ Ω : 'DELETE'}
            size="md"
          />
          <Readout
            label="SUBWOOFER TARGET"
            value={vSub}
            unit="V AC"
            secondaryValue={${subRms}W @ Ω}
            size="md"
            status="ok"
          />
          <Readout
            label="SUBSONIC HPF"
            value={subsonicHz}
            unit="Hz"
            secondaryValue={${resolvedBoxTune}Hz Box}
            size="md"
            status={isPorted ? 'warning' : 'normal'}
          />
        </View>

        {/* Navigation Buttons Row */}
        <View style={styles.btnRow}>
          {onBack && (
            <Button
              label="← Back to Vehicle"
              variant="outline"
              size="lg"
              onPress={onBack}
              style={styles.navBtn}
            />
          )}
          {onContinue && (
            <Button
              label="Continue to Acoustic Calibration →"
              variant="solid"
              size="lg"
              onPress={onContinue}
              style={[styles.navBtn, { flex: 1.5 }]}
            />
          )}
        </View>
      </InstrumentPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: tokens.spacing.lg,
  },
  introHeader: {
    gap: tokens.spacing.xs,
  },
  stepTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    letterSpacing: 0.5,
  },
  stepSubtitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.sm,
    color: tokens.colors.text.secondary,
    lineHeight: 20,
  },
  categoryNavRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.bg.panel,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
  },
  categoryTabActive: {
    backgroundColor: tokens.colors.bg.elevated,
    borderColor: tokens.colors.border.active,
  },
  categoryTabIcon: {
    fontSize: tokens.typography.sizes.sm,
  },
  categoryTabText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.medium,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
  },
  categoryTabTextActive: {
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.semibold,
  },
  optionsList: {
    gap: tokens.spacing.sm,
  },
  optionCard: {
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  optionCardActive: {
    backgroundColor: tokens.colors.bg.panel,
    borderColor: tokens.colors.border.active,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionName: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.base,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.primary,
    flex: 1,
  },
  selectedPill: {
    backgroundColor: tokens.colors.chrome.buttonBg,
    borderColor: tokens.colors.border.active,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
  },
  selectedPillText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
  },
  optionSpecsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
    marginTop: 2,
  },
  specChip: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.secondary,
    backgroundColor: tokens.colors.bg.panel,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.hairline,
  },
  optionDescText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.secondary,
    lineHeight: 16,
  },
  rearDeleteDesc: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.muted,
    fontStyle: 'italic',
  },
  subCategoryBlock: {
    gap: tokens.spacing.md,
  },
  tuningControlSection: {
    gap: tokens.spacing.md,
    alignItems: 'center',
  },
  sliderWrap: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
  },
  subsonicWarningCard: {
    width: '100%',
    backgroundColor: tokens.colors.status.warningBg,
    borderColor: tokens.colors.status.warningBorder,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    padding: tokens.spacing.md,
    gap: 4,
  },
  subsonicWarningTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.status.warning,
    letterSpacing: 0.5,
  },
  subsonicWarningText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.primary,
    lineHeight: 18,
  },
  monoHighlight: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.status.warning,
  },
  summaryPanel: {
    gap: tokens.spacing.md,
  },
  readoutGrid4: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.sm,
  },
  navBtn: {
    flex: 1,
  },
  textWhite: {
    color: tokens.colors.text.primary,
  },
});

export default StepHardware;
