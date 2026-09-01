import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { tokens } from '../../design-system/tokens';
import { InstrumentPanel } from '../ui/InstrumentPanel';
import { Button } from '../ui/Button';
import { Readout } from '../ui/Readout';
import {
  INDIAN_CAR_MAKES,
  HEAD_UNIT_OPTIONS,
  FRONT_SPEAKER_OPTIONS,
  REAR_SPEAKER_OPTIONS,
  AMPLIFIER_OPTIONS,
  SUBWOOFER_OPTIONS,
  VehicleMake,
  CarModelData,
} from '../../constants/catalog';
import { StepMakeModel } from './StepMakeModel';
import { StepHardware, HardwareConfig } from './StepHardware';
import { StepCalibration, CalibrationConfig } from './StepCalibration';

export interface OnboardingState {
  make: VehicleMake;
  model: CarModelData;
  hardware: HardwareConfig;
  calibration: CalibrationConfig;
}

export interface WizardContainerProps {
  initialState?: Partial<OnboardingState>;
  onComplete?: (state: OnboardingState) => void;
  onStepChange?: (step: 1 | 2 | 3 | 4) => void;
  onExportXml?: (state: OnboardingState) => void;
  onExportJson?: (state: OnboardingState) => void;
  onLaunchStudio?: (state: OnboardingState) => void;
  style?: StyleProp<ViewStyle>;
}

const SPEED_OF_SOUND = 34.3; // cm/ms @ 20°C

const WIZARD_STEPS = [
  { step: 1 as const, title: 'Make & Model', shortLabel: '1. Vehicle', icon: '🚗' },
  { step: 2 as const, title: 'Audio Hardware', shortLabel: '2. Hardware', icon: '🎛️' },
  { step: 3 as const, title: 'Acoustic Calibration', shortLabel: '3. Tuning', icon: '📐' },
  { step: 4 as const, title: 'DSP Profile Generated', shortLabel: '4. Summary', icon: '⚡' },
];

export const WizardContainer: React.FC<WizardContainerProps> = ({
  initialState,
  onComplete,
  onStepChange,
  onExportXml,
  onExportJson,
  onLaunchStudio,
  style,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Core Onboarding State
  const [selectedMake, setSelectedMake] = useState<VehicleMake>(
    initialState?.make || INDIAN_CAR_MAKES[0] // Default Skoda
  );

  const [selectedModel, setSelectedModel] = useState<CarModelData>(
    initialState?.model || INDIAN_CAR_MAKES[0].models[0] // Default Kylaq
  );

  const [hardwareConfig, setHardwareConfig] = useState<HardwareConfig>(
    initialState?.hardware || {
      headUnit: HEAD_UNIT_OPTIONS[0],
      frontSpeaker: FRONT_SPEAKER_OPTIONS[0],
      rearSpeaker: REAR_SPEAKER_OPTIONS[0],
      amplifier: AMPLIFIER_OPTIONS[0],
      subwoofer: SUBWOOFER_OPTIONS[0],
      boxTuningHz: 35,
    }
  );

  const [calibrationConfig, setCalibrationConfig] = useState<CalibrationConfig>(
    initialState?.calibration || {
      soundProfile: 'sql',
      listeningPosition: 'driver_rhd',
    }
  );

  const goToStep = (nextStep: 1 | 2 | 3 | 4) => {
    setCurrentStep(nextStep);
    if (onStepChange) onStepChange(nextStep);
  };

  const currentState: OnboardingState = useMemo(() => ({
    make: selectedMake,
    model: selectedModel,
    hardware: hardwareConfig,
    calibration: calibrationConfig,
  }), [selectedMake, selectedModel, hardwareConfig, calibrationConfig]);

  // Calculations for Step 4 (DSP Summary)
  const isPorted = hardwareConfig.subwoofer.type === 'ported';
  const boxTune = isPorted ? (hardwareConfig.boxTuningHz || 35) : 0;
  const subsonicHz = isPorted ? Math.max(20, boxTune - 7) : 20;

  const frontRms = hardwareConfig.customFrontRms || hardwareConfig.frontSpeaker.rms;
  const frontOhms = hardwareConfig.frontSpeaker.ohms;
  const vFront = +(Math.sqrt(frontRms * frontOhms)).toFixed(2);

  const rearRms = hardwareConfig.rearSpeaker.rms > 0 ? +(hardwareConfig.rearSpeaker.rms * 0.6).toFixed(1) : 0;
  const rearOhms = hardwareConfig.rearSpeaker.ohms;
  const vRear = rearRms > 0 ? +(Math.sqrt(rearRms * rearOhms)).toFixed(2) : 0;

  const subRms = hardwareConfig.customSubRms || hardwareConfig.subwoofer.rms;
  const subOhms = hardwareConfig.customSubOhms || hardwareConfig.subwoofer.ohms;
  const vSub = subRms > 0 && subOhms > 0 ? +(Math.sqrt(subRms * subOhms)).toFixed(2) : 0;

  const delays = useMemo(() => {
    const raw = selectedModel.distances_rhd;
    if (calibrationConfig.listeningPosition === 'all_cabin') {
      return { FL: 0, FR: 0, RL: 0, RR: 0, SUB: 0 };
    }
    const maxD = Math.max(raw.FL, raw.FR, raw.RL, raw.RR, raw.SUB);
    return {
      FL: +((maxD - raw.FL) / SPEED_OF_SOUND).toFixed(2),
      FR: +((maxD - raw.FR) / SPEED_OF_SOUND).toFixed(2),
      RL: +((maxD - raw.RL) / SPEED_OF_SOUND).toFixed(2),
      RR: +((maxD - raw.RR) / SPEED_OF_SOUND).toFixed(2),
      SUB: +((maxD - raw.SUB) / SPEED_OF_SOUND).toFixed(2),
    };
  }, [selectedModel, calibrationConfig.listeningPosition]);

  return (
    <View style={[styles.wrapper, style]}>
      {/* Step Indicator Header */}
      <InstrumentPanel
        variant="flat"
        noPadding
        style={styles.stepIndicatorPanel}
      >
        <View style={styles.stepIndicatorRow}>
          {WIZARD_STEPS.map((stepItem) => {
            const isActive = currentStep === stepItem.step;
            const isCompleted = currentStep > stepItem.step;

            return (
              <TouchableOpacity
                key={stepItem.step}
                style={[
                  styles.stepTab,
                  isActive && styles.stepTabActive,
                  isCompleted && styles.stepTabCompleted,
                ]}
                onPress={() => goToStep(stepItem.step)}
              >
                <View
                  style={[
                    styles.stepNumberBadge,
                    isActive && styles.stepNumberBadgeActive,
                    isCompleted && styles.stepNumberBadgeCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumberText,
                      isActive && styles.textBlack,
                      isCompleted && styles.textWhite,
                    ]}
                  >
                    {isCompleted ? '✓' : stepItem.step}
                  </Text>
                </View>

                <View style={styles.stepTextGroup}>
                  <Text
                    style={[
                      styles.stepShortLabel,
                      isActive && styles.stepLabelActive,
                      isCompleted && styles.stepLabelCompleted,
                    ]}
                  >
                    {stepItem.shortLabel}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </InstrumentPanel>

      {/* Main Step Content */}
      <View style={styles.contentContainer}>
        {/* STEP 1: MAKE & MODEL */}
        {currentStep === 1 && (
          <StepMakeModel
            selectedMake={selectedMake}
            selectedModel={selectedModel}
            onSelectMake={setSelectedMake}
            onSelectModel={setSelectedModel}
            onContinue={() => goToStep(2)}
          />
        )}

        {/* STEP 2: AUDIO HARDWARE */}
        {currentStep === 2 && (
          <StepHardware
            config={hardwareConfig}
            onChangeConfig={setHardwareConfig}
            onBack={() => goToStep(1)}
            onContinue={() => goToStep(3)}
          />
        )}

        {/* STEP 3: ACOUSTIC CALIBRATION */}
        {currentStep === 3 && (
          <StepCalibration
            config={calibrationConfig}
            selectedModel={selectedModel}
            onChangeConfig={setCalibrationConfig}
            onBack={() => goToStep(2)}
            onContinue={() => {
              goToStep(4);
              if (onComplete) onComplete(currentState);
            }}
          />
        )}

        {/* STEP 4: DSP PROFILE GENERATED SUMMARY */}
        {currentStep === 4 && (
          <View style={styles.summaryContainer}>
            <View style={styles.introHeader}>
              <Text style={styles.stepTitle}>AI DSP CALIBRATION COMPLETE</Text>
              <Text style={styles.stepSubtitle}>
                Custom acoustic profile generated for {selectedMake.name} {selectedModel.model}. Time alignment, gain staging voltages, and crossover networks are calibrated.
              </Text>
            </View>

            {/* Comprehensive Tuning Matrix Panel */}
            <InstrumentPanel
              variant="elevated"
              title="CALIBRATED SYSTEM OVERVIEW"
              subtitle={${selectedMake.name}  () • }
              badge="READY TO DEPLOY"
              status="ok"
              style={styles.summaryPanel}
            >
              {/* 1. Vehicle & Seating Dimensions */}
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>1. VEHICLE ACOUSTIC GEOMETRY</Text>
                <View style={styles.readoutGridRow}>
                  <Readout
                    label="CABIN VOLUME"
                    value={selectedModel.cabinVolumeM3}
                    unit="m³"
                    secondaryValue={${Math.round(selectedModel.cabinVolumeM3 * 1000)} L}
                    size="sm"
                  />
                  <Readout
                    label="STANDING WAVE"
                    value={selectedModel.resonantFreqHz}
                    unit="Hz"
                    secondaryValue="NOTCHED"
                    size="sm"
                  />
                  <Readout
                    label="SEATING FOCUS"
                    value={calibrationConfig.listeningPosition === 'driver_rhd' ? 'DRIVER (RHD)' : 'BALANCED'}
                    size="sm"
                  />
                  <Readout
                    label="WHEELBASE"
                    value={selectedModel.wheelbase}
                    unit="mm"
                    size="sm"
                  />
                </View>
              </View>

              {/* 2. Millisecond Time Alignment Delays */}
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>2. TIME ALIGNMENT DELAYS (SPEED: 34.3 cm/ms)</Text>
                <View style={styles.readoutGridRow}>
                  <Readout
                    label="FR (DRIVER)"
                    value={delays.FR}
                    unit="ms"
                    secondaryValue={${selectedModel.distances_rhd.FR}cm}
                    size="sm"
                    status="warning"
                  />
                  <Readout
                    label="FL (PASSENGER)"
                    value={delays.FL}
                    unit="ms"
                    secondaryValue={${selectedModel.distances_rhd.FL}cm}
                    size="sm"
                  />
                  <Readout
                    label="RR (REAR RIGHT)"
                    value={delays.RR}
                    unit="ms"
                    secondaryValue={${selectedModel.distances_rhd.RR}cm}
                    size="sm"
                  />
                  <Readout
                    label="RL (REAR LEFT)"
                    value={delays.RL}
                    unit="ms"
                    secondaryValue={${selectedModel.distances_rhd.RL}cm}
                    size="sm"
                  />
                  <Readout
                    label="SUB (BOOT)"
                    value={delays.SUB}
                    unit="ms"
                    secondaryValue={${selectedModel.distances_rhd.SUB}cm}
                    size="sm"
                    status="ok"
                  />
                </View>
              </View>

              {/* 3. Gain Staging & Multimeter Target Voltages */}
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>3. DMM GAIN STAGING TARGET VOLTAGES (75% CLEAN LIMIT)</Text>
                <View style={styles.readoutGridRow}>
                  <Readout
                    label="FRONT STAGE"
                    value={vFront}
                    unit="V AC"
                    secondaryValue={${frontRms}W @ Ω}
                    size="sm"
                  />
                  <Readout
                    label="REAR FILL"
                    value={vRear}
                    unit="V AC"
                    secondaryValue={rearRms > 0 ? ${rearRms}W @ Ω : 'DELETE'}
                    size="sm"
                  />
                  <Readout
                    label="SUBWOOFER"
                    value={vSub}
                    unit="V AC"
                    secondaryValue={${subRms}W @ Ω}
                    size="sm"
                    status="ok"
                  />
                  <Readout
                    label="SUBSONIC HPF"
                    value={subsonicHz}
                    unit="Hz"
                    secondaryValue={isPorted ? ${boxTune}Hz Box : 'SEALED'}
                    size="sm"
                    status={isPorted ? 'warning' : 'normal'}
                  />
                </View>
              </View>

              {/* 4. Equipment List Breakdown */}
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>4. HARDWARE CHAIN</Text>
                <View style={styles.gearList}>
                  <Text style={styles.gearItem}>• Head Unit: <Text style={styles.gearVal}>{hardwareConfig.headUnit.name}</Text></Text>
                  <Text style={styles.gearItem}>• Front Speakers: <Text style={styles.gearVal}>{hardwareConfig.frontSpeaker.name}</Text></Text>
                  <Text style={styles.gearItem}>• Rear Speakers: <Text style={styles.gearVal}>{hardwareConfig.rearSpeaker.name}</Text></Text>
                  <Text style={styles.gearItem}>• Subwoofer: <Text style={styles.gearVal}>{hardwareConfig.subwoofer.name}</Text></Text>
                  <Text style={styles.gearItem}>• Amplifier: <Text style={styles.gearVal}>{hardwareConfig.amplifier.name}</Text></Text>
                </View>
              </View>

              {/* Actions Button Group */}
              <View style={styles.finalActionsBlock}>
                {onLaunchStudio && (
                  <Button
                    label="Launch Live AI Tuning Studio →"
                    variant="solid"
                    size="lg"
                    onPress={() => onLaunchStudio(currentState)}
                    style={styles.primaryStudioBtn}
                  />
                )}

                <View style={styles.exportBtnRow}>
                  {onExportXml && (
                    <Button
                      label="Pioneer XML Export"
                      variant="outline"
                      size="md"
                      onPress={() => onExportXml(currentState)}
                      style={styles.exportBtn}
                    />
                  )}
                  {onExportJson && (
                    <Button
                      label="MiniDSP JSON Export"
                      variant="outline"
                      size="md"
                      onPress={() => onExportJson(currentState)}
                      style={styles.exportBtn}
                    />
                  )}
                </View>

                <Button
                  label="← Recalibrate Setup"
                  variant="ghost"
                  size="sm"
                  onPress={() => goToStep(1)}
                  style={styles.recalibrateBtn}
                />
              </View>
            </InstrumentPanel>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: tokens.spacing.md,
    width: '100%',
  },
  stepIndicatorPanel: {
    padding: 0,
    overflow: 'hidden',
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.bg.panel,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.hairline,
  },
  stepTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: tokens.spacing.sm + 2,
    paddingHorizontal: tokens.spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  stepTabActive: {
    backgroundColor: tokens.colors.bg.elevated,
    borderBottomColor: tokens.colors.text.primary,
  },
  stepTabCompleted: {
    backgroundColor: tokens.colors.bg.inset,
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberBadgeActive: {
    backgroundColor: tokens.colors.text.primary,
    borderColor: tokens.colors.text.primary,
  },
  stepNumberBadgeCompleted: {
    backgroundColor: tokens.colors.chrome.buttonBg,
    borderColor: tokens.colors.border.active,
  },
  stepNumberText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 10,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.secondary,
  },
  stepTextGroup: {
    justifyContent: 'center',
  },
  stepShortLabel: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.medium,
    color: tokens.colors.text.muted,
  },
  stepLabelActive: {
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.semibold,
  },
  stepLabelCompleted: {
    color: tokens.colors.text.secondary,
  },
  contentContainer: {
    width: '100%',
  },
  summaryContainer: {
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
  summaryPanel: {
    gap: tokens.spacing.md,
  },
  summarySection: {
    gap: tokens.spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.hairline,
    paddingBottom: tokens.spacing.md,
  },
  summarySectionTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
  },
  readoutGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs + 2,
  },
  gearList: {
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    padding: tokens.spacing.md,
    gap: 4,
  },
  gearItem: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.muted,
  },
  gearVal: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.medium,
  },
  finalActionsBlock: {
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.sm,
  },
  primaryStudioBtn: {
    width: '100%',
  },
  exportBtnRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  exportBtn: {
    flex: 1,
  },
  recalibrateBtn: {
    alignSelf: 'center',
  },
  textBlack: {
    color: tokens.colors.text.inverse,
  },
  textWhite: {
    color: tokens.colors.text.primary,
  },
});

export default WizardContainer;
