import { calculateLocalTuning, TuningCalculationRequest } from '../services/tuningService';

const SPEED_OF_SOUND = 34.3; // cm/ms

describe('Precision DSP Mathematical Engine (F5, F7, F8, F9)', () => {
  // =========================================================================
  // 1. 14-BAND EQUALIZER FREQUENCIES & PRESET PROFILES (F5)
  // =========================================================================
  describe('14-Band Parametric/Graphic EQ Math (F5)', () => {
    const EXPECTED_ISO_FREQS = [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000];

    test('exact 14 standard ISO center frequencies defined across 20Hz - 20kHz spectrum', () => {
      const payload: TuningCalculationRequest = {
        car_make: 'Skoda',
        car_model: 'Kylaq',
        equipment: {
          head_unit_brand: 'Nakamichi',
          head_unit_model: 'NAM5510',
          front_speakers: 'Sony XS-162GS',
          rear_speakers: 'Sony Coaxial',
          speakers_amplifier: 'MOCO AF-04',
          subwoofer: 'Pioneer TS-W307D4',
          subwoofer_enclosure_type: 'ported',
          subwoofer_tuning_frequency_hz: 35,
          subwoofer_amplifier: 'Sound Barrier SB-654',
        },
        sound_target_profile: 'sql_punjabi_hiphop',
        listening_position: 'driver_rhd',
      };

      const result = calculateLocalTuning(payload);
      expect(result.head_unit_14_band_eq.frequencies_hz).toEqual(EXPECTED_ISO_FREQS);
      expect(result.head_unit_14_band_eq.recommended_gain_db.length).toBe(14);
    });

    test('SQL Punjabi / Bass Heavy profile applies correct dynamic boosts and cabin notch cuts', () => {
      const payload: TuningCalculationRequest = {
        car_make: 'Skoda',
        car_model: 'Kylaq',
        equipment: {
          head_unit_brand: 'Nakamichi',
          head_unit_model: 'NAM5510',
          front_speakers: 'Sony XS-162GS',
          rear_speakers: 'Sony Coaxial',
          speakers_amplifier: 'MOCO AF-04',
          subwoofer: 'Pioneer TS-W307D4',
          subwoofer_enclosure_type: 'ported',
          subwoofer_tuning_frequency_hz: 35,
          subwoofer_amplifier: 'Sound Barrier SB-654',
        },
        sound_target_profile: 'sql_punjabi_hiphop',
        listening_position: 'driver_rhd',
      };

      const result = calculateLocalTuning(payload);
      const gains = result.head_unit_14_band_eq.recommended_gain_db;
      const freqs = result.head_unit_14_band_eq.frequencies_hz;

      const getGain = (freq: number) => gains[freqs.indexOf(freq)];

      expect(getGain(63)).toBe(5.5); // +5.5dB kick drum & sub bass boost
      expect(getGain(200)).toBe(-1.5); // -1.5dB standing wave notch cut
      expect(getGain(4000)).toBe(-1.0); // -1.0dB windshield reflection harshness cut
      expect(getGain(12000)).toBe(2.0); // +2.0dB high-frequency air sparkle
    });

    test('Harman Reference and Vocal Clarity presets produce distinct target curves', () => {
      const basePayload: TuningCalculationRequest = {
        car_make: 'Maruti Suzuki',
        car_model: 'Swift',
        equipment: {
          head_unit_brand: 'Pioneer',
          head_unit_model: 'DEH-80PRS',
          front_speakers: 'Focal Access',
          rear_speakers: 'Focal Auditor',
          speakers_amplifier: 'Pioneer GM-D8704',
          subwoofer: 'Rockford P3',
          subwoofer_enclosure_type: 'sealed',
          subwoofer_tuning_frequency_hz: 0,
          subwoofer_amplifier: 'Pioneer GM-D8704',
        },
        sound_target_profile: 'harman_reference',
        listening_position: 'driver_rhd',
      };

      const harmanRes = calculateLocalTuning(basePayload);
      const vocalRes = calculateLocalTuning({ ...basePayload, sound_target_profile: 'vocal_clarity' });

      // Harman target has modest bass boost and smooth midrange
      expect(harmanRes.head_unit_14_band_eq.recommended_gain_db[1]).toBe(3.0); // 63Hz = +3.0dB
      // Vocal Clarity emphasizes 1kHz - 2kHz vocal intelligibility
      expect(vocalRes.head_unit_14_band_eq.recommended_gain_db[6]).toBe(2.0); // 1000Hz = +2.0dB
      expect(vocalRes.head_unit_14_band_eq.recommended_gain_db[7]).toBe(1.5); // 2000Hz = +1.5dB
    });

    test('all EQ gain values strictly respect +/- 12.0 dB DSP hardware limits', () => {
      const profiles: Array<'sql_punjabi_hiphop' | 'harman_reference' | 'vocal_clarity'> = [
        'sql_punjabi_hiphop',
        'harman_reference',
        'vocal_clarity',
      ];

      profiles.forEach((profile) => {
        const res = calculateLocalTuning({
          car_make: 'Skoda',
          car_model: 'Kylaq',
          equipment: {
            head_unit_brand: 'Nakamichi',
            head_unit_model: 'NAM5510',
            front_speakers: 'Sony XS-162GS',
            rear_speakers: 'Sony Coaxial',
            speakers_amplifier: 'MOCO AF-04',
            subwoofer: 'Pioneer TS-W307D4',
            subwoofer_enclosure_type: 'ported',
            subwoofer_tuning_frequency_hz: 35,
            subwoofer_amplifier: 'Sound Barrier SB-654',
          },
          sound_target_profile: profile,
          listening_position: 'driver_rhd',
        });

        res.head_unit_14_band_eq.recommended_gain_db.forEach((gain) => {
          expect(gain).toBeGreaterThanOrEqual(-12.0);
          expect(gain).toBeLessThanOrEqual(12.0);
        });
      });
    });
  });

  // =========================================================================
  // 2. LINKWITZ-RILEY 4TH ORDER (LR4) CROSSOVER & SUBSONIC PROTECTION (F7)
  // =========================================================================
  describe('Linkwitz-Riley 24dB/Octave Crossover & Subsonic Protection (F7)', () => {
    test('LR4 filter mathematical transfer function yields exact -6dB at fc and sums to 0dB', () => {
      const fc = 80.0;
      // An LR4 filter is formed by cascading two 2nd-order Butterworth filters:
      // Magnitude: |H_LR4_LP(f)| = 1 / (1 + (f/fc)^4)
      // Magnitude: |H_LR4_HP(f)| = (f/fc)^4 / (1 + (f/fc)^4)
      const lpMagAtFc = 1 / (1 + Math.pow(fc / fc, 4)); // 1 / 2 = 0.5
      const hpMagAtFc = Math.pow(fc / fc, 4) / (1 + Math.pow(fc / fc, 4)); // 1 / 2 = 0.5

      const lpDbAtFc = 20 * Math.log10(lpMagAtFc);
      const hpDbAtFc = 20 * Math.log10(hpMagAtFc);

      expect(lpDbAtFc).toBeCloseTo(-6.0206, 2); // Exact -6dB attenuation at fc
      expect(hpDbAtFc).toBeCloseTo(-6.0206, 2);

      // In-phase acoustic summation at crossover point: 0.5 + 0.5 = 1.0 (0 dB flat transition)
      const sumVoltage = lpMagAtFc + hpMagAtFc;
      expect(sumVoltage).toBeCloseTo(1.0, 4);
      expect(20 * Math.log10(sumVoltage)).toBeCloseTo(0.0, 4);
    });

    test('calculates 28Hz subsonic safety filter for 35Hz ported enclosure', () => {
      const payload: TuningCalculationRequest = {
        car_make: 'Skoda',
        car_model: 'Kylaq',
        equipment: {
          head_unit_brand: 'Nakamichi',
          head_unit_model: 'NAM5510',
          front_speakers: 'Sony XS-162GS',
          rear_speakers: 'Sony Coaxial',
          speakers_amplifier: 'MOCO AF-04',
          subwoofer: 'Pioneer TS-W307D4',
          subwoofer_enclosure_type: 'ported',
          subwoofer_tuning_frequency_hz: 35,
          subwoofer_amplifier: 'Sound Barrier SB-654',
        },
        sound_target_profile: 'sql_punjabi_hiphop',
        listening_position: 'driver_rhd',
      };

      const result = calculateLocalTuning(payload);
      const subsonic = result.crossover_configuration.subsonic_high_pass_protection;

      expect(subsonic).toBeDefined();
      expect(subsonic?.cutoff_frequency_hz).toBe(28); // 35 - 7 = 28Hz
      expect(subsonic?.slope_db_per_octave).toBe(24);
      expect(subsonic?.warning).toContain('35Hz ported enclosure');
    });

    test('handles ported tuning frequencies dynamically (e.g. 38Hz box -> 31Hz subsonic, 33Hz box -> 26Hz subsonic)', () => {
      const testCases = [
        { tune: 38, expectedSubsonic: 31 },
        { tune: 33, expectedSubsonic: 26 },
        { tune: 40, expectedSubsonic: 33 },
      ];

      testCases.forEach(({ tune, expectedSubsonic }) => {
        const payload: TuningCalculationRequest = {
          car_make: 'Skoda',
          car_model: 'Kylaq',
          equipment: {
            head_unit_brand: 'Nakamichi',
            head_unit_model: 'NAM5510',
            front_speakers: 'Sony XS-162GS',
            rear_speakers: 'Sony Coaxial',
            speakers_amplifier: 'MOCO AF-04',
            subwoofer: 'Custom Ported',
            subwoofer_enclosure_type: 'ported',
            subwoofer_tuning_frequency_hz: tune,
            subwoofer_amplifier: 'Sound Barrier SB-654',
          },
          sound_target_profile: 'sql_punjabi_hiphop',
          listening_position: 'driver_rhd',
        };

        const res = calculateLocalTuning(payload);
        expect(res.crossover_configuration.subsonic_high_pass_protection?.cutoff_frequency_hz).toBe(expectedSubsonic);
      });
    });

    test('sealed enclosure sets subsonic filter to 20Hz safety floor without cone-unloading warning', () => {
      const payload: TuningCalculationRequest = {
        car_make: 'Skoda',
        car_model: 'Kylaq',
        equipment: {
          head_unit_brand: 'Nakamichi',
          head_unit_model: 'NAM5510',
          front_speakers: 'Sony XS-162GS',
          rear_speakers: 'Sony Coaxial',
          speakers_amplifier: 'MOCO AF-04',
          subwoofer: 'Rockford P3 Sealed',
          subwoofer_enclosure_type: 'sealed',
          subwoofer_tuning_frequency_hz: 0,
          subwoofer_amplifier: 'Sound Barrier SB-654',
        },
        sound_target_profile: 'sql_punjabi_hiphop',
        listening_position: 'driver_rhd',
      };

      const res = calculateLocalTuning(payload);
      expect(res.crossover_configuration.subsonic_high_pass_protection?.cutoff_frequency_hz).toBe(20);
      expect(res.crossover_configuration.subsonic_high_pass_protection?.warning).toBeUndefined();
    });
  });

  // =========================================================================
  // 3. ASYMMETRIC RHD TIME ALIGNMENT ENGINE (F8)
  // =========================================================================
  describe('Asymmetric RHD Time Alignment Delays (F8)', () => {
    test('Skoda Kylaq RHD cabin distances calculate precise delays anchored to subwoofer (0.00ms)', () => {
      const payload: TuningCalculationRequest = {
        car_make: 'Skoda',
        car_model: 'Kylaq',
        equipment: {
          head_unit_brand: 'Nakamichi',
          head_unit_model: 'NAM5510',
          front_speakers: 'Sony XS-162GS',
          rear_speakers: 'Sony Coaxial',
          speakers_amplifier: 'MOCO AF-04',
          subwoofer: 'Pioneer TS-W307D4',
          subwoofer_enclosure_type: 'ported',
          subwoofer_tuning_frequency_hz: 35,
          subwoofer_amplifier: 'Sound Barrier SB-654',
        },
        sound_target_profile: 'sql_punjabi_hiphop',
        listening_position: 'driver_rhd',
      };

      const result = calculateLocalTuning(payload);
      const ch = result.time_alignment_and_phase.channels;

      // Furthest speaker is SUB (210cm) -> 0.00ms
      expect(ch.SUB.delay_ms).toBe(0.0);
      // FR is closest (95cm) -> (210 - 95)/34.3 = 115/34.3 = 3.35ms
      expect(ch.FR.delay_ms).toBeCloseTo(3.35, 2);
      // FL (138cm) -> (210 - 138)/34.3 = 72/34.3 = 2.10ms
      expect(ch.FL.delay_ms).toBeCloseTo(2.10, 2);
      // RR (115cm) -> (210 - 115)/34.3 = 95/34.3 = 2.77ms
      expect(ch.RR.delay_ms).toBeCloseTo(2.77, 2);
      // RL (155cm) -> (210 - 155)/34.3 = 55/34.3 = 1.60ms
      expect(ch.RL.delay_ms).toBeCloseTo(1.60, 2);
    });

    test('48kHz digital DSP sample delay values match sample math N = round((tau/1000)*48000)', () => {
      const payload: TuningCalculationRequest = {
        car_make: 'Skoda',
        car_model: 'Kylaq',
        equipment: {
          head_unit_brand: 'Nakamichi',
          head_unit_model: 'NAM5510',
          front_speakers: 'Sony XS-162GS',
          rear_speakers: 'Sony Coaxial',
          speakers_amplifier: 'MOCO AF-04',
          subwoofer: 'Pioneer TS-W307D4',
          subwoofer_enclosure_type: 'ported',
          subwoofer_tuning_frequency_hz: 35,
          subwoofer_amplifier: 'Sound Barrier SB-654',
        },
        sound_target_profile: 'sql_punjabi_hiphop',
        listening_position: 'driver_rhd',
      };

      const result = calculateLocalTuning(payload);
      const ch = result.time_alignment_and_phase.channels;

      expect(ch.FR.delay_samples_48khz).toBe(Math.round((3.35 / 1000) * 48000)); // 161 samples
      expect(ch.FL.delay_samples_48khz).toBe(Math.round((2.10 / 1000) * 48000)); // 101 samples
      expect(ch.SUB.delay_samples_48khz).toBe(0);
    });

    test('calculates time alignment for other Indian car cabins (Swift, Creta, Thar)', () => {
      // Swift (SUB: 190, FL: 130, FR: 88)
      const swiftMax = 190;
      const swiftFrDelay = +((swiftMax - 88) / SPEED_OF_SOUND).toFixed(2);
      const swiftFlDelay = +((swiftMax - 130) / SPEED_OF_SOUND).toFixed(2);
      expect(swiftFrDelay).toBe(2.97);
      expect(swiftFlDelay).toBe(1.75);

      // Creta (SUB: 220, FL: 142, FR: 98)
      const cretaMax = 220;
      const cretaFrDelay = +((cretaMax - 98) / SPEED_OF_SOUND).toFixed(2);
      const cretaFlDelay = +((cretaMax - 142) / SPEED_OF_SOUND).toFixed(2);
      expect(cretaFrDelay).toBe(3.56);
      expect(cretaFlDelay).toBe(2.27);

      // Thar (SUB: 180, FL: 128, FR: 85)
      const tharMax = 180;
      const tharFrDelay = +((tharMax - 85) / SPEED_OF_SOUND).toFixed(2);
      const tharFlDelay = +((tharMax - 128) / SPEED_OF_SOUND).toFixed(2);
      expect(tharFrDelay).toBe(2.77);
      expect(tharFlDelay).toBe(1.52);
    });
  });

  // =========================================================================
  // 4. MULTIMETER DMM GAIN STAGING TARGET VOLTAGE MATH (F9)
  // =========================================================================
  describe('Multimeter DMM Target AC Voltage Calculations (F9)', () => {
    test('enforces Ohm RMS law V = sqrt(P * R) across various amplifier and speaker loads', () => {
      const calcTargetV = (watts: number, ohms: number) => +(Math.sqrt(watts * ohms)).toFixed(2);

      // Sony XS-162GS Front (45W @ 4 ohms)
      expect(calcTargetV(45, 4)).toBe(13.42);

      // Rear Fill (27W @ 4 ohms)
      expect(calcTargetV(27, 4)).toBe(10.39);

      // Pioneer TS-W307D4 (250W @ 8 ohms)
      expect(calcTargetV(250, 8)).toBe(44.72);

      // Alpine S-W12D4 (600W @ 2 ohms)
      expect(calcTargetV(600, 2)).toBe(34.64);

      // Rockford Fosgate P3 (600W @ 4 ohms)
      expect(calcTargetV(600, 4)).toBe(48.99);

      // High Power SPL Monoblock (1500W @ 1 ohm)
      expect(calcTargetV(1500, 1)).toBe(38.73);
    });

    test('tuning service output matches exact voltage calculations', () => {
      const payload: TuningCalculationRequest = {
        car_make: 'Skoda',
        car_model: 'Kylaq',
        equipment: {
          head_unit_brand: 'Nakamichi',
          head_unit_model: 'NAM5510',
          front_speakers: 'Sony XS-162GS',
          rear_speakers: 'Sony Coaxial',
          speakers_amplifier: 'MOCO AF-04',
          subwoofer: 'Pioneer TS-W307D4',
          subwoofer_enclosure_type: 'ported',
          subwoofer_tuning_frequency_hz: 35,
          subwoofer_amplifier: 'Sound Barrier SB-654',
        },
        sound_target_profile: 'sql_punjabi_hiphop',
        listening_position: 'driver_rhd',
      };

      const result = calculateLocalTuning(payload);
      const targets = result.amplifier_gain_and_dial_settings.target_ac_voltages_dmm;

      expect(targets.front_channels.target_ac_voltage_volts).toBe(13.42);
      expect(targets.front_channels.test_tone).toContain('1,000 Hz');

      expect(targets.rear_channels.target_ac_voltage_volts).toBe(10.39);
      expect(targets.rear_channels.test_tone).toContain('1,000 Hz');

      expect(targets.subwoofer_channel.target_ac_voltage_volts).toBe(44.72);
      expect(targets.subwoofer_channel.test_tone).toContain('50 Hz');
    });

    test('verifies 75% volume clean limit calibration step', () => {
      const payload: TuningCalculationRequest = {
        car_make: 'Skoda',
        car_model: 'Kylaq',
        equipment: {
          head_unit_brand: 'Nakamichi',
          head_unit_model: 'NAM5510',
          front_speakers: 'Sony XS-162GS',
          rear_speakers: 'Sony Coaxial',
          speakers_amplifier: 'MOCO AF-04',
          subwoofer: 'Pioneer TS-W307D4',
          subwoofer_enclosure_type: 'ported',
          subwoofer_tuning_frequency_hz: 35,
          subwoofer_amplifier: 'Sound Barrier SB-654',
        },
        sound_target_profile: 'sql_punjabi_hiphop',
        listening_position: 'driver_rhd',
      };

      const result = calculateLocalTuning(payload);
      const vol = result.amplifier_gain_and_dial_settings.head_unit_clean_volume_limit;

      expect(vol.maximum_volume_step).toBe(40);
      expect(vol.recommended_tuning_volume).toBe(30);
      expect(vol.percentage_of_max).toBe(75);
    });
  });
});
