import {
  INDIAN_CAR_MAKES,
  HEAD_UNIT_OPTIONS,
  FRONT_SPEAKER_OPTIONS,
  REAR_SPEAKER_OPTIONS,
  AMPLIFIER_OPTIONS,
  SUBWOOFER_OPTIONS,
  CarModelData,
  VehicleMake,
} from '../constants/catalog';

describe('Vehicle Onboarding & Acoustic Dimensions Catalog (F10)', () => {
  // =========================================================================
  // 1. INDIAN VEHICLE MAKES CATALOG MATRIX
  // =========================================================================
  describe('Indian Car Manufacturers (25+ Makes)', () => {
    test('contains at least 25 Indian market vehicle manufacturers', () => {
      expect(INDIAN_CAR_MAKES.length).toBeGreaterThanOrEqual(25);
    });

    test('includes all key Indian market brands including mass-market, SUV, luxury, and EV makes', () => {
      const makeIds = INDIAN_CAR_MAKES.map((m) => m.id);
      expect(makeIds).toContain('skoda');
      expect(makeIds).toContain('maruti');
      expect(makeIds).toContain('hyundai');
      expect(makeIds).toContain('tata');
      expect(makeIds).toContain('mahindra');
      expect(makeIds).toContain('toyota');
      expect(makeIds).toContain('kia');
      expect(makeIds).toContain('vw');
      expect(makeIds).toContain('honda');
      expect(makeIds).toContain('mg');
      expect(makeIds).toContain('renault');
      expect(makeIds).toContain('nissan');
      expect(makeIds).toContain('jeep');
      expect(makeIds).toContain('bmw');
      expect(makeIds).toContain('mercedes');
      expect(makeIds).toContain('audi');
      expect(makeIds).toContain('volvo');
      expect(makeIds).toContain('byd');
      expect(makeIds).toContain('landrover');
      expect(makeIds).toContain('porsche');
      expect(makeIds).toContain('ford');
      expect(makeIds).toContain('citroen');
      expect(makeIds).toContain('force');
      expect(makeIds).toContain('lexus');
      expect(makeIds).toContain('jaguar');
    });

    test('each manufacturer has valid metadata (id, name, country, badgeColor, non-empty models)', () => {
      INDIAN_CAR_MAKES.forEach((make: VehicleMake) => {
        expect(make.id).toBeTruthy();
        expect(make.name).toBeTruthy();
        expect(make.country).toBeTruthy();
        expect(make.badgeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(Array.isArray(make.models)).toBe(true);
        expect(make.models.length).toBeGreaterThan(0);
      });
    });
  });

  // =========================================================================
  // 2. VEHICLE CABIN MODELS & ACOUSTIC GEOMETRIES (25+ Models)
  // =========================================================================
  describe('Vehicle Cabin Models & RHD Acoustic Distances (25+ Models)', () => {
    const allModels: CarModelData[] = INDIAN_CAR_MAKES.flatMap((m) => m.models);

    test('total Indian vehicle cabin models count is >= 25', () => {
      expect(allModels.length).toBeGreaterThanOrEqual(25);
    });

    test('every model has complete physical and acoustic properties', () => {
      allModels.forEach((car: CarModelData) => {
        expect(car.id).toBeTruthy();
        expect(car.make).toBeTruthy();
        expect(car.model).toBeTruthy();
        expect(car.year).toBeTruthy();
        expect(car.category).toBeTruthy();
        expect(car.wheelbase).toBeGreaterThan(2000); // Wheelbase > 2000mm
        expect(car.cabinVolumeM3).toBeGreaterThan(2.0); // Cabin volume > 2.0 m3
        expect(car.resonantFreqHz).toBeGreaterThanOrEqual(150); // Standing wave resonance 150 - 250 Hz
        expect(car.resonantFreqHz).toBeLessThanOrEqual(250);

        // Speaker mounting specs
        expect(car.speakerSizes.front).toBeTruthy();
        expect(car.speakerSizes.rear).toBeTruthy();
        expect(car.speakerSizes.tweeterLocation).toBeTruthy();
        expect(car.speakerSizes.maxDepthMm).toBeGreaterThanOrEqual(50);
      });
    });

    test('validates RHD driver seating geometry invariants across all models', () => {
      allModels.forEach((car: CarModelData) => {
        const { FL, FR, RL, RR, SUB } = car.distances_rhd;

        // In an Indian RHD cabin from driver seat (Right side):
        // 1. Front Left (passenger) is farther than Front Right (driver door): FL > FR
        expect(FL).toBeGreaterThan(FR);
        // 2. Rear Left (diagonal passenger) is farther than Rear Right (behind driver): RL > RR
        expect(RL).toBeGreaterThan(RR);
        // 3. Boot Subwoofer is the furthest audio source: SUB > FL, FR, RL, RR
        expect(SUB).toBeGreaterThan(FL);
        expect(SUB).toBeGreaterThan(FR);
        expect(SUB).toBeGreaterThan(RL);
        expect(SUB).toBeGreaterThan(RR);
      });
    });

    test('verifies specific Skoda Kylaq benchmark acoustic specs', () => {
      const kylaq = allModels.find((c) => c.id === 'skoda_kylaq');
      expect(kylaq).toBeDefined();
      expect(kylaq?.make).toBe('Škoda');
      expect(kylaq?.model).toBe('Kylaq (2025)');
      expect(kylaq?.wheelbase).toBe(2566);
      expect(kylaq?.cabinVolumeM3).toBe(3.1);
      expect(kylaq?.resonantFreqHz).toBe(195);
      expect(kylaq?.distances_rhd).toEqual({
        FL: 138,
        FR: 95,
        RL: 155,
        RR: 115,
        SUB: 210,
      });
      expect(kylaq?.speakerSizes.front).toContain('6.5" Component');
      expect(kylaq?.speakerSizes.tweeterLocation).toContain('A-Pillar');
    });

    test('verifies Maruti Swift and Mahindra Thar benchmark specs', () => {
      const swift = allModels.find((c) => c.id === 'maruti_swift');
      expect(swift).toBeDefined();
      expect(swift?.distances_rhd).toEqual({
        FL: 130,
        FR: 88,
        RL: 145,
        RR: 105,
        SUB: 190,
      });

      const thar = allModels.find((c) => c.id === 'mahindra_thar');
      expect(thar).toBeDefined();
      expect(thar?.category).toBe('Off-Road SUV');
      expect(thar?.distances_rhd).toEqual({
        FL: 128,
        FR: 85,
        RL: 140,
        RR: 100,
        SUB: 180,
      });
    });
  });

  // =========================================================================
  // 3. AUDIO HARDWARE CATALOG OPTIONS
  // =========================================================================
  describe('Audio Equipment Options Catalog (Head Units, Speakers, Amps, Subs)', () => {
    test('head units catalog includes high-res and DSP head units with preout voltages', () => {
      expect(HEAD_UNIT_OPTIONS.length).toBeGreaterThanOrEqual(5);

      const nakamichi = HEAD_UNIT_OPTIONS.find((h) => h.id === 'nakamichi_nam5510');
      expect(nakamichi).toBeDefined();
      expect(nakamichi?.preout).toBe(2.0);
      expect(nakamichi?.bands).toBe(14);

      const pioneer = HEAD_UNIT_OPTIONS.find((h) => h.id === 'pioneer_80prs');
      expect(pioneer).toBeDefined();
      expect(pioneer?.preout).toBe(5.0);
      expect(pioneer?.bands).toBe(31);
    });

    test('front speaker options provide RMS ratings, impedance, and HPF cutoffs', () => {
      expect(FRONT_SPEAKER_OPTIONS.length).toBeGreaterThanOrEqual(5);

      const sony = FRONT_SPEAKER_OPTIONS.find((s) => s.id === 'sony_xs162gs');
      expect(sony).toBeDefined();
      expect(sony?.rms).toBe(45);
      expect(sony?.ohms).toBe(4);
      expect(sony?.hpf).toBe(80);

      const focal = FRONT_SPEAKER_OPTIONS.find((s) => s.id === 'focal_access');
      expect(focal?.rms).toBe(60);
      expect(focal?.ohms).toBe(4);
      expect(focal?.sensitivity).toBeGreaterThan(90);
    });

    test('rear speaker options include coaxial options and rear delete SQ setup', () => {
      expect(REAR_SPEAKER_OPTIONS.length).toBeGreaterThanOrEqual(4);
      const rearDelete = REAR_SPEAKER_OPTIONS.find((s) => s.id === 'none');
      expect(rearDelete).toBeDefined();
      expect(rearDelete?.rms).toBe(0);
    });

    test('amplifier options include dual amp setup, 4-channel, and DSP amplifier', () => {
      expect(AMPLIFIER_OPTIONS.length).toBeGreaterThanOrEqual(4);

      const dualAmp = AMPLIFIER_OPTIONS.find((a) => a.id === 'moco_and_sb');
      expect(dualAmp).toBeDefined();
      expect(dualAmp?.frontRms).toBe(60);
      expect(dualAmp?.subRms).toBe(250);
      expect(dualAmp?.hasSubChannel).toBe(true);

      const sonyAmp = AMPLIFIER_OPTIONS.find((a) => a.id === 'sony_xm_n1004');
      expect(sonyAmp?.frontRms).toBe(70);
    });

    test('subwoofer options include ported enclosures with tune frequencies and sealed options', () => {
      expect(SUBWOOFER_OPTIONS.length).toBeGreaterThanOrEqual(5);

      const pioneerSub = SUBWOOFER_OPTIONS.find((s) => s.id === 'pioneer_tsw307');
      expect(pioneerSub).toBeDefined();
      expect(pioneerSub?.type).toBe('ported');
      expect(pioneerSub?.tuneHz).toBe(35);
      expect(pioneerSub?.rms).toBe(250);
      expect(pioneerSub?.ohms).toBe(8);

      const jblSub = SUBWOOFER_OPTIONS.find((s) => s.id === 'jbl_basspro12');
      expect(jblSub?.type).toBe('ported');
      expect(jblSub?.tuneHz).toBe(38);

      const rockfordSub = SUBWOOFER_OPTIONS.find((s) => s.id === 'rockford_p3');
      expect(rockfordSub?.type).toBe('sealed');
      expect(rockfordSub?.tuneHz).toBe(0);
      expect(rockfordSub?.rms).toBe(600);
    });
  });
});
