import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { tokens } from '../../design-system/tokens';
import { InstrumentPanel } from '../ui/InstrumentPanel';
import { Readout } from '../ui/Readout';
import { Button } from '../ui/Button';
import { CarModelData } from '../../constants/catalog';

export type SoundProfileId = 'sql' | 'harman' | 'vocal';
export type ListeningPosition = 'driver_rhd' | 'passenger_lhd' | 'all_cabin';

export interface CalibrationConfig {
  soundProfile: SoundProfileId;
  listeningPosition: ListeningPosition;
}

export interface StepCalibrationProps {
  config: CalibrationConfig;
  selectedModel: CarModelData;
  onChangeConfig: (newConfig: CalibrationConfig) => void;
  onBack?: () => void;
  onContinue?: () => void;
}

const SPEED_OF_SOUND = 34.3; // cm/ms @ 20°C

const SOUND_PROFILES = [
  {
    id: 'sql' as SoundProfileId,
    name: 'PUNJABI BASS SQL (PUNCH & IMPACT)',
    subtitle: 'Deep Sub-Bass Boost (+5.5dB @ 63Hz) & High Transient Impact',
    desc: 'Engineered for Punjabi hits, Bollywood beats, Hip-Hop & EDM. Features heavy low-end authority, aggressive kick punch, and an acoustic notch at the vehicle standing wave frequency to eliminate cabin boom.',
    badge: 'HIGH IMPACT',
    gains: [4.0, 5.5, 2.0, -1.5, 0.0, 0.0, 0.5, 1.0, -1.0, 1.5, 1.5, 2.0, 1.5, 1.5],
    status: 'ok' as const,
  },
  {
    id: 'harman' as SoundProfileId,
    name: 'HARMAN REFERENCE TARGET (AUDIOPHILE)',
    subtitle: 'Neutral Studio Reference & Accurate Soundstage Imaging',
    desc: 'Based on the Harman Automotive Acoustic Target Curve. Perfectly linear midrange, natural vocal timbre, smooth +3dB sub-bass shelf, and transparent treble extension.',
    badge: 'STUDIO REFERENCE',
    gains: [3.0, 3.0, 1.5, -1.0, 0.0, 0.0, 0.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.0],
    status: 'neutral' as const,
  },
  {
    id: 'vocal' as SoundProfileId,
    name: 'VOCAL CLARITY & GHAZAL (PODCAST)',
    subtitle: 'Enhanced Midrange Intelligibility & Reduced Bass Boom',
    desc: 'Optimized for podcasts, ghazals, acoustic instruments, and radio dialogue. Features boosted speech presence (+2.0dB @ 1kHz–2kHz) with trimmed low frequencies to maximize vocal clarity.',
    badge: 'SPEECH FOCUS',
    gains: [1.0, 1.0, 0.0, -2.0, 1.0, 1.5, 2.0, 1.5, 0.0, 1.0, 1.0, 1.0, 0.5, 0.5],
    status: 'info' as const,
  },
];

const LISTENING_POSITIONS = [
  {
    id: 'driver_rhd' as ListeningPosition,
    title: 'DRIVER SEAT (RHD INDIA)',
    subtitle: 'Precision Time Alignment sweet spot for Indian Driver (Front Right)',
    badge: 'RHD DEFAULT',
  },
  {
    id: 'passenger_lhd' as ListeningPosition,
    title: 'FRONT PASSENGER (LEFT)',
    subtitle: 'Sweet spot optimized for the front passenger seat',
    badge: 'PASSENGER',
  },
  {
    id: 'all_cabin' as ListeningPosition,
    title: 'ALL CABIN (BALANCED / DIFFERENTIAL)',
    subtitle: 'Zero or minimal delay compromise for all passengers equally',
    badge: 'ALL PASSENGERS',
  },
];

export const StepCalibration: React.FC<StepCalibrationProps> = ({
  config,
  selectedModel,
  onChangeConfig,
  onBack,
  onContinue,
}) => {
  // Compute delays based on selected listening position
  const computedDelays = useMemo(() => {
    const raw = selectedModel.distances_rhd;

    if (config.listeningPosition === 'all_cabin') {
      return {
        FL: 0.0,
        FR: 0.0,
        RL: 0.0,
        RR: 0.0,
        SUB: 0.0,
        reference: 'Equalized (0ms)',
      };
    }

    if (config.listeningPosition === 'passenger_lhd') {
      // In LHD/Passenger mode, FL is closest, FR is further
      const pseudoDist = {
        FL: raw.FR,
        FR: raw.FL,
        RL: raw.RR,
        RR: raw.RL,
        SUB: raw.SUB,
      };
      const maxD = Math.max(pseudoDist.FL, pseudoDist.FR, pseudoDist.RL, pseudoDist.RR, pseudoDist.SUB);
      return {
        FL: +((maxD - pseudoDist.FL) / SPEED_OF_SOUND).toFixed(2),
        FR: +((maxD - pseudoDist.FR) / SPEED_OF_SOUND).toFixed(2),
        RL: +((maxD - pseudoDist.RL) / SPEED_OF_SOUND).toFixed(2),
        RR: +((maxD - pseudoDist.RR) / SPEED_OF_SOUND).toFixed(2),
        SUB: +((maxD - pseudoDist.SUB) / SPEED_OF_SOUND).toFixed(2),
        reference: 'Passenger Left Target',
      };
    }

    // Default: Driver RHD (FR is closest to driver)
    const maxD = Math.max(raw.FL, raw.FR, raw.RL, raw.RR, raw.SUB);
    return {
      FL: +((maxD - raw.FL) / SPEED_OF_SOUND).toFixed(2),
      FR: +((maxD - raw.FR) / SPEED_OF_SOUND).toFixed(2),
      RL: +((maxD - raw.RL) / SPEED_OF_SOUND).toFixed(2),
      RR: +((maxD - raw.RR) / SPEED_OF_SOUND).toFixed(2),
      SUB: +((maxD - raw.SUB) / SPEED_OF_SOUND).toFixed(2),
      reference: 'Boot Subwoofer Reference',
    };
  }, [config.listeningPosition, selectedModel]);

  const activeProfileData = useMemo(() => {
    return SOUND_PROFILES.find((p) => p.id === config.soundProfile) || SOUND_PROFILES[0];
  }, [config.soundProfile]);

  return (
    <View style={styles.container}>
      {/* Intro Header */}
      <View style={styles.introHeader}>
        <Text style={styles.stepTitle}>ACOUSTIC CALIBRATION & TARGET CURVE</Text>
        <Text style={styles.stepSubtitle}>
          Select your target sound profile and primary listening sweet spot. Our AI engine optimizes 14-band Bezier equalization and millisecond delays.
        </Text>
      </View>

      {/* 1. Target Sound Profile Selection */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>1. SELECT ACOUSTIC TARGET PROFILE</Text>

        <View style={styles.profilesGrid}>
          {SOUND_PROFILES.map((profile) => {
            const isSelected = config.soundProfile === profile.id;
            return (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.profileCard,
                  isSelected && styles.profileCardActive,
                ]}
                onPress={() => onChangeConfig({ ...config, soundProfile: profile.id })}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.profileTitleGroup}>
                    <Text style={[styles.profileName, isSelected && styles.textWhite]}>
                      {profile.name}
                    </Text>
                    <Text style={styles.profileSubtitle}>{profile.subtitle}</Text>
                  </View>
                  <View
                    style={[
                      styles.profileBadge,
                      isSelected && styles.profileBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.profileBadgeText,
                        isSelected && styles.textWhite,
                      ]}
                    >
                      {profile.badge}
                    </Text>
                  </View>
                </View>

                <Text style={styles.profileDesc}>{profile.desc}</Text>

                {/* EQ Sample Readout preview */}
                <View style={styles.eqGainsPreviewRow}>
                  <Text style={styles.eqGainChip}>Sub: +{profile.gains[1]}dB @ 63Hz</Text>
                  <Text style={styles.eqGainChip}>Notch: {profile.gains[3]}dB @ 200Hz</Text>
                  <Text style={styles.eqGainChip}>Treble: +{profile.gains[11]}dB @ 12kHz</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Primary Listening Position Selection */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>2. PRIMARY LISTENING POSITION (TIME ALIGNMENT FOCUS)</Text>

        <View style={styles.positionsList}>
          {LISTENING_POSITIONS.map((pos) => {
            const isSelected = config.listeningPosition === pos.id;
            return (
              <TouchableOpacity
                key={pos.id}
                style={[
                  styles.posCard,
                  isSelected && styles.posCardActive,
                ]}
                onPress={() => onChangeConfig({ ...config, listeningPosition: pos.id })}
              >
                <View style={styles.posRadioDot}>
                  {isSelected && <View style={styles.posRadioInner} />}
                </View>

                <View style={styles.posContent}>
                  <View style={styles.posTitleRow}>
                    <Text style={[styles.posTitle, isSelected && styles.textWhite]}>
                      {pos.title}
                    </Text>
                    <View style={styles.posBadge}>
                      <Text style={styles.posBadgeText}>{pos.badge}</Text>
                    </View>
                  </View>
                  <Text style={styles.posSubtitle}>{pos.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Live Calibration Telemetry Summary */}
      <InstrumentPanel
        variant="elevated"
        title="CALCULATED TIME ALIGNMENT & ACOUSTIC DELAYS"
        subtitle={Speed of Sound:  cm/ms | Ref: }
        badge={activeProfileData.badge}
        status="ok"
        style={styles.summaryPanel}
      >
        <View style={styles.delaysGrid}>
          <Readout
            label="FRONT RIGHT (FR)"
            value={computedDelays.FR}
            unit="ms"
            secondaryValue="DRIVER DOOR"
            size="md"
            status={config.listeningPosition === 'driver_rhd' ? 'warning' : 'normal'}
          />
          <Readout
            label="FRONT LEFT (FL)"
            value={computedDelays.FL}
            unit="ms"
            secondaryValue="PASSENGER DOOR"
            size="md"
          />
          <Readout
            label="REAR RIGHT (RR)"
            value={computedDelays.RR}
            unit="ms"
            secondaryValue="BEHIND DRIVER"
            size="md"
          />
          <Readout
            label="REAR LEFT (RL)"
            value={computedDelays.RL}
            unit="ms"
            secondaryValue="REAR PASSENGER"
            size="md"
          />
          <Readout
            label="SUBWOOFER"
            value={computedDelays.SUB}
            unit="ms"
            secondaryValue="BOOT ENCLOSURE"
            size="md"
            status="ok"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          {onBack && (
            <Button
              label="← Back to Audio Gear"
              variant="outline"
              size="lg"
              onPress={onBack}
              style={styles.navBtn}
            />
          )}
          {onContinue && (
            <Button
              label="Generate AI DSP Profile →"
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
  sectionBlock: {
    gap: tokens.spacing.sm,
  },
  sectionTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs + 1,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
  },
  profilesGrid: {
    gap: tokens.spacing.sm,
  },
  profileCard: {
    backgroundColor: tokens.colors.bg.panel,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    gap: tokens.spacing.xs + 2,
  },
  profileCardActive: {
    backgroundColor: tokens.colors.bg.elevated,
    borderColor: tokens.colors.border.active,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: tokens.spacing.sm,
  },
  profileTitleGroup: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.base,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.primary,
  },
  profileSubtitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.secondary,
  },
  profileBadge: {
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
  },
  profileBadgeActive: {
    borderColor: tokens.colors.border.active,
  },
  profileBadgeText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
  },
  profileDesc: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.secondary,
    lineHeight: 18,
  },
  eqGainsPreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
    marginTop: 2,
  },
  eqGainChip: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs - 1,
    color: tokens.colors.text.secondary,
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
  },
  positionsList: {
    gap: tokens.spacing.sm,
  },
  posCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    backgroundColor: tokens.colors.bg.panel,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  posCardActive: {
    backgroundColor: tokens.colors.bg.elevated,
    borderColor: tokens.colors.border.active,
  },
  posRadioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: tokens.colors.border.active,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.bg.inset,
  },
  posRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.text.primary,
  },
  posContent: {
    flex: 1,
    gap: 2,
  },
  posTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  posTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.primary,
  },
  posBadge: {
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 1,
  },
  posBadgeText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    color: tokens.colors.text.muted,
  },
  posSubtitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.secondary,
  },
  summaryPanel: {
    gap: tokens.spacing.md,
  },
  delaysGrid: {
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

export default StepCalibration;
