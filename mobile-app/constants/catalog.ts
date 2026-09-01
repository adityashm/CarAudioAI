// Comprehensive Catalog of Indian Vehicles and Audio Hardware for CarAudioAI

export interface CarModelData {
  id: string;
  make: string;
  model: string;
  year: string;
  category: 'Hatchback' | 'Compact SUV' | 'Midsize SUV' | 'Off-Road SUV' | 'Sedan' | 'Full-Size SUV' | 'MPV';
  wheelbase: number; // mm
  cabinVolumeM3: number;
  resonantFreqHz: number; // In-cabin standing wave peak
  distances_rhd: {
    FL: number; // cm
    FR: number;
    RL: number;
    RR: number;
    SUB: number;
  };
  speakerSizes: {
    front: string;
    rear: string;
    tweeterLocation: string;
    maxDepthMm: number;
  };
}

export interface VehicleMake {
  id: string;
  name: string;
  country: string;
  badgeColor: string;
  models: CarModelData[];
}

export const INDIAN_CAR_MAKES: VehicleMake[] = [
  {
    id: 'skoda',
    name: 'Škoda',
    country: 'Czech Republic / India',
    badgeColor: '#4ade80',
    models: [
      {
        id: 'skoda_kylaq',
        make: 'Škoda',
        model: 'Kylaq (2025)',
        year: '2024–2026',
        category: 'Compact SUV',
        wheelbase: 2566,
        cabinVolumeM3: 3.1,
        resonantFreqHz: 195,
        distances_rhd: { FL: 138, FR: 95, RL: 155, RR: 115, SUB: 210 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar / Sail', maxDepthMm: 68 }
      },
      {
        id: 'skoda_kushaq',
        make: 'Škoda',
        model: 'Kushaq',
        year: '2021–2025',
        category: 'Midsize SUV',
        wheelbase: 2651,
        cabinVolumeM3: 3.3,
        resonantFreqHz: 190,
        distances_rhd: { FL: 142, FR: 98, RL: 160, RR: 118, SUB: 218 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 72 }
      },
      {
        id: 'skoda_slavia',
        make: 'Škoda',
        model: 'Slavia',
        year: '2022–2025',
        category: 'Sedan',
        wheelbase: 2651,
        cabinVolumeM3: 3.4,
        resonantFreqHz: 185,
        distances_rhd: { FL: 140, FR: 96, RL: 165, RR: 122, SUB: 225 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 70 }
      }
    ]
  },
  {
    id: 'maruti',
    name: 'Maruti Suzuki',
    country: 'Japan / India',
    badgeColor: '#38bdf8',
    models: [
      {
        id: 'maruti_swift',
        make: 'Maruti Suzuki',
        model: 'Swift (2024)',
        year: '2024–2026',
        category: 'Hatchback',
        wheelbase: 2450,
        cabinVolumeM3: 2.8,
        resonantFreqHz: 210,
        distances_rhd: { FL: 130, FR: 88, RL: 145, RR: 105, SUB: 190 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 65 }
      },
      {
        id: 'maruti_brezza',
        make: 'Maruti Suzuki',
        model: 'Brezza',
        year: '2022–2025',
        category: 'Compact SUV',
        wheelbase: 2500,
        cabinVolumeM3: 3.0,
        resonantFreqHz: 200,
        distances_rhd: { FL: 135, FR: 92, RL: 152, RR: 112, SUB: 205 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 75 }
      },
      {
        id: 'maruti_baleno',
        make: 'Maruti Suzuki',
        model: 'Baleno',
        year: '2022–2025',
        category: 'Hatchback',
        wheelbase: 2520,
        cabinVolumeM3: 2.9,
        resonantFreqHz: 205,
        distances_rhd: { FL: 132, FR: 90, RL: 148, RR: 108, SUB: 195 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Mirror Sail', maxDepthMm: 68 }
      },
      {
        id: 'maruti_jimny',
        make: 'Maruti Suzuki',
        model: 'Jimny 5-Door',
        year: '2023–2025',
        category: 'Off-Road SUV',
        wheelbase: 2590,
        cabinVolumeM3: 2.7,
        resonantFreqHz: 220,
        distances_rhd: { FL: 126, FR: 84, RL: 138, RR: 98, SUB: 175 },
        speakerSizes: { front: '5.25" / 6.5"', rear: '5.25"', tweeterLocation: 'Dashboard', maxDepthMm: 60 }
      },
      {
        id: 'maruti_grand_vitara',
        make: 'Maruti Suzuki',
        model: 'Grand Vitara',
        year: '2022–2025',
        category: 'Midsize SUV',
        wheelbase: 2600,
        cabinVolumeM3: 3.3,
        resonantFreqHz: 195,
        distances_rhd: { FL: 140, FR: 96, RL: 158, RR: 116, SUB: 215 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 72 }
      }
    ]
  },
  {
    id: 'hyundai',
    name: 'Hyundai',
    country: 'South Korea / India',
    badgeColor: '#60a5fa',
    models: [
      {
        id: 'hyundai_creta',
        make: 'Hyundai',
        model: 'Creta (2024 Facelift)',
        year: '2024–2026',
        category: 'Midsize SUV',
        wheelbase: 2610,
        cabinVolumeM3: 3.3,
        resonantFreqHz: 192,
        distances_rhd: { FL: 142, FR: 98, RL: 160, RR: 120, SUB: 220 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 72 }
      },
      {
        id: 'hyundai_venue',
        make: 'Hyundai',
        model: 'Venue',
        year: '2022–2025',
        category: 'Compact SUV',
        wheelbase: 2500,
        cabinVolumeM3: 2.9,
        resonantFreqHz: 205,
        distances_rhd: { FL: 134, FR: 91, RL: 149, RR: 109, SUB: 200 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 68 }
      },
      {
        id: 'hyundai_i20',
        make: 'Hyundai',
        model: 'i20 (3rd Gen)',
        year: '2020–2025',
        category: 'Hatchback',
        wheelbase: 2580,
        cabinVolumeM3: 2.9,
        resonantFreqHz: 208,
        distances_rhd: { FL: 133, FR: 89, RL: 148, RR: 108, SUB: 195 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 65 }
      }
    ]
  },
  {
    id: 'tata',
    name: 'Tata Motors',
    country: 'India',
    badgeColor: '#a855f7',
    models: [
      {
        id: 'tata_nexon',
        make: 'Tata',
        model: 'Nexon (2024 Facelift)',
        year: '2023–2026',
        category: 'Compact SUV',
        wheelbase: 2498,
        cabinVolumeM3: 3.1,
        resonantFreqHz: 198,
        distances_rhd: { FL: 136, FR: 92, RL: 150, RR: 110, SUB: 205 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 70 }
      },
      {
        id: 'tata_harrier',
        make: 'Tata',
        model: 'Harrier',
        year: '2023–2026',
        category: 'Midsize SUV',
        wheelbase: 2741,
        cabinVolumeM3: 3.7,
        resonantFreqHz: 180,
        distances_rhd: { FL: 150, FR: 102, RL: 172, RR: 128, SUB: 235 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 78 }
      },
      {
        id: 'tata_punch',
        make: 'Tata',
        model: 'Punch',
        year: '2021–2025',
        category: 'Compact SUV',
        wheelbase: 2445,
        cabinVolumeM3: 2.8,
        resonantFreqHz: 212,
        distances_rhd: { FL: 131, FR: 88, RL: 144, RR: 104, SUB: 190 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 65 }
      }
    ]
  },
  {
    id: 'mahindra',
    name: 'Mahindra',
    country: 'India',
    badgeColor: '#f97316',
    models: [
      {
        id: 'mahindra_thar',
        make: 'Mahindra',
        model: 'Thar 4x4 / Roxx',
        year: '2020–2026',
        category: 'Off-Road SUV',
        wheelbase: 2450,
        cabinVolumeM3: 3.0,
        resonantFreqHz: 215,
        distances_rhd: { FL: 128, FR: 85, RL: 140, RR: 100, SUB: 180 },
        speakerSizes: { front: '6.5" Roof / Dash', rear: '6.5" Roof Bar', tweeterLocation: 'Dashboard Top', maxDepthMm: 65 }
      },
      {
        id: 'mahindra_scorpio_n',
        make: 'Mahindra',
        model: 'Scorpio-N',
        year: '2022–2026',
        category: 'Full-Size SUV',
        wheelbase: 2750,
        cabinVolumeM3: 4.1,
        resonantFreqHz: 175,
        distances_rhd: { FL: 152, FR: 104, RL: 176, RR: 132, SUB: 245 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 80 }
      },
      {
        id: 'mahindra_xuv700',
        make: 'Mahindra',
        model: 'XUV700',
        year: '2021–2026',
        category: 'Full-Size SUV',
        wheelbase: 2750,
        cabinVolumeM3: 4.0,
        resonantFreqHz: 178,
        distances_rhd: { FL: 154, FR: 105, RL: 178, RR: 134, SUB: 248 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 80 }
      }
    ]
  },
  {
    id: 'toyota',
    name: 'Toyota',
    country: 'Japan',
    badgeColor: '#ef4444',
    models: [
      {
        id: 'toyota_fortuner',
        make: 'Toyota',
        model: 'Fortuner (Legender / GR-S)',
        year: '2021–2026',
        category: 'Full-Size SUV',
        wheelbase: 2745,
        cabinVolumeM3: 4.2,
        resonantFreqHz: 172,
        distances_rhd: { FL: 155, FR: 105, RL: 180, RR: 135, SUB: 250 },
        speakerSizes: { front: '6x9" / 6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Dash Top', maxDepthMm: 85 }
      },
      {
        id: 'toyota_hyryder',
        make: 'Toyota',
        model: 'Urban Cruiser Hyryder',
        year: '2022–2026',
        category: 'Midsize SUV',
        wheelbase: 2600,
        cabinVolumeM3: 3.3,
        resonantFreqHz: 195,
        distances_rhd: { FL: 140, FR: 96, RL: 158, RR: 116, SUB: 215 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 72 }
      },
      {
        id: 'toyota_innova_hycross',
        make: 'Toyota',
        model: 'Innova Hycross',
        year: '2023–2026',
        category: 'MPV',
        wheelbase: 2850,
        cabinVolumeM3: 4.5,
        resonantFreqHz: 168,
        distances_rhd: { FL: 158, FR: 108, RL: 185, RR: 140, SUB: 260 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 80 }
      }
    ]
  },
  {
    id: 'kia',
    name: 'Kia',
    country: 'South Korea',
    badgeColor: '#ec4899',
    models: [
      {
        id: 'kia_seltos',
        make: 'Kia',
        model: 'Seltos (Facelift)',
        year: '2023–2026',
        category: 'Midsize SUV',
        wheelbase: 2610,
        cabinVolumeM3: 3.3,
        resonantFreqHz: 192,
        distances_rhd: { FL: 142, FR: 98, RL: 160, RR: 120, SUB: 220 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 72 }
      },
      {
        id: 'kia_sonet',
        make: 'Kia',
        model: 'Sonet',
        year: '2024–2026',
        category: 'Compact SUV',
        wheelbase: 2500,
        cabinVolumeM3: 2.9,
        resonantFreqHz: 204,
        distances_rhd: { FL: 134, FR: 91, RL: 149, RR: 109, SUB: 200 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 68 }
      }
    ]
  },
  {
    id: 'vw',
    name: 'Volkswagen',
    country: 'Germany / India',
    badgeColor: '#0284c7',
    models: [
      {
        id: 'vw_taigun',
        make: 'Volkswagen',
        model: 'Taigun',
        year: '2021–2026',
        category: 'Midsize SUV',
        wheelbase: 2651,
        cabinVolumeM3: 3.3,
        resonantFreqHz: 190,
        distances_rhd: { FL: 142, FR: 98, RL: 160, RR: 118, SUB: 218 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 72 }
      },
      {
        id: 'vw_virtus',
        make: 'Volkswagen',
        model: 'Virtus',
        year: '2022–2026',
        category: 'Sedan',
        wheelbase: 2651,
        cabinVolumeM3: 3.4,
        resonantFreqHz: 185,
        distances_rhd: { FL: 140, FR: 96, RL: 165, RR: 122, SUB: 225 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 70 }
      }
    ]
  },
  {
    id: 'honda',
    name: 'Honda',
    country: 'Japan',
    badgeColor: '#10b981',
    models: [
      {
        id: 'honda_city',
        make: 'Honda',
        model: 'City (5th Gen)',
        year: '2020–2026',
        category: 'Sedan',
        wheelbase: 2600,
        cabinVolumeM3: 3.2,
        resonantFreqHz: 194,
        distances_rhd: { FL: 138, FR: 94, RL: 162, RR: 120, SUB: 220 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Mirror Sail', maxDepthMm: 68 }
      },
      {
        id: 'honda_elevate',
        make: 'Honda',
        model: 'Elevate',
        year: '2023–2026',
        category: 'Midsize SUV',
        wheelbase: 2650,
        cabinVolumeM3: 3.4,
        resonantFreqHz: 188,
        distances_rhd: { FL: 141, FR: 97, RL: 160, RR: 119, SUB: 222 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 72 }
      }
    ]
  }
];

// Hardware Options Catalog
export const HEAD_UNIT_OPTIONS = [
  { id: 'nakamichi_nam5510', name: 'Nakamichi NAM5510 (14-Band EQ, 2.0V Pre-out)', preout: 2.0, bands: 14, type: 'touchscreen' },
  { id: 'pioneer_80prs', name: 'Pioneer DEH-80PRS (31-Band Active DSP, 5.0V Pre-out)', preout: 5.0, bands: 31, type: 'audiophile' },
  { id: 'sony_gs9', name: 'Sony RSX-GS9 High-Res DSD (10-Band EQ, 5.0V Pre-out)', preout: 5.0, bands: 10, type: 'audiophile' },
  { id: 'alpine_ilx650', name: 'Alpine iLX-W650 (9-Band Parametric, 4.0V Pre-out)', preout: 4.0, bands: 9, type: 'touchscreen' },
  { id: 'android_generic', name: 'Android Screen (10/12-Band EQ, 1.5V Pre-out)', preout: 1.5, bands: 12, type: 'android' },
  { id: 'factory_stock', name: 'Factory Stock OEM Screen (3-Band Bass/Mid/Treble, High-Level)', preout: 0.8, bands: 3, type: 'stock' }
];

export const FRONT_SPEAKER_OPTIONS = [
  { id: 'sony_xs162gs', name: 'Sony XS-162GS (6.5" 2-Way Components)', rms: 45, ohms: 4, hpf: 80, sensitivity: 89 },
  { id: 'focal_access', name: 'Focal Access 165-AS (6.5" Components, Glass Fiber Cone)', rms: 60, ohms: 4, hpf: 75, sensitivity: 91.3 },
  { id: 'morel_maximo', name: 'Morel Maximo Ultra 602 (6.5" Audiophile Components)', rms: 90, ohms: 4, hpf: 70, sensitivity: 90.5 },
  { id: 'hertz_uno', name: 'Hertz Uno K 165 (6.5" High-Efficiency Components)', rms: 70, ohms: 4, hpf: 80, sensitivity: 93.5 },
  { id: 'jbl_stage3', name: 'JBL Stage3 607C (6.5" Components, Plus One Cone)', rms: 50, ohms: 3, hpf: 85, sensitivity: 92 },
  { id: 'factory_stock', name: 'Factory Stock Door Speakers (Paper Cone)', rms: 15, ohms: 4, hpf: 90, sensitivity: 86 }
];

export const REAR_SPEAKER_OPTIONS = [
  { id: 'sony_xs162gs_coax', name: 'Sony XS-162GS (6.5" Coaxials)', rms: 45, ohms: 4, hpf: 90 },
  { id: 'focal_acx165', name: 'Focal Auditor ACX 165 (6.5" Coaxials)', rms: 60, ohms: 4, hpf: 85 },
  { id: 'hertz_dcx', name: 'Hertz Dieci DCX 165.3 (6.5" Coaxials)', rms: 60, ohms: 4, hpf: 85 },
  { id: 'jbl_stage3_627', name: 'JBL Stage3 627 (6.5" Coaxials)', rms: 45, ohms: 3, hpf: 90 },
  { id: 'factory_stock_rear', name: 'Factory Stock Rear Door Speakers', rms: 15, ohms: 4, hpf: 100 },
  { id: 'none', name: 'None / Rear Delete (Pure Front Soundstage SQ Setup)', rms: 0, ohms: 4, hpf: 0 }
];

export const AMPLIFIER_OPTIONS = [
  {
    id: 'moco_and_sb',
    name: 'Dual Amp Setup: MOCO AF-04 (4-Ch Doors) + Sound Barrier SB-654 (Mono Sub)',
    frontRms: 60,
    rearRms: 60,
    subRms: 250,
    hasSubChannel: true
  },
  {
    id: 'sony_xm_n1004',
    name: '4-Channel Amplifier: Sony XM-N1004 (70W x 4 @ 4Ω)',
    frontRms: 70,
    rearRms: 70,
    subRms: 175,
    hasSubChannel: false
  },
  {
    id: 'pioneer_gm_d8704',
    name: '4-Channel Class-FD: Pioneer GM-D8704 (100W x 4 @ 4Ω)',
    frontRms: 100,
    rearRms: 100,
    subRms: 300,
    hasSubChannel: false
  },
  {
    id: 'dsp_amp_8ch',
    name: '8-Channel DSP Amplifier (e.g. Helix / Musway / Zapco 8x60W)',
    frontRms: 75,
    rearRms: 60,
    subRms: 350,
    hasSubChannel: true
  },
  {
    id: 'headunit_power',
    name: 'Direct Head Unit Internal Power (No External Amplifier ~20W RMS)',
    frontRms: 18,
    rearRms: 18,
    subRms: 0,
    hasSubChannel: false
  }
];

export const SUBWOOFER_OPTIONS = [
  {
    id: 'pioneer_tsw307',
    name: 'Pioneer TS-W307D4 (12" DVC Ported @ 35Hz Slot Port)',
    type: 'ported',
    tuneHz: 35,
    rms: 250,
    ohms: 8,
    desc: 'Deep loud bass tuned for Punjabi, Hip-Hop & EDM.'
  },
  {
    id: 'jbl_basspro12',
    name: 'JBL BassPro 12 (12" Factory Ported Enclosure @ 38Hz)',
    type: 'ported',
    tuneHz: 38,
    rms: 150,
    ohms: 4,
    desc: 'High-efficiency factory ported box with Slipstream port.'
  },
  {
    id: 'rockford_p3',
    name: 'Rockford Fosgate P3D4-12 (12" Sealed Enclosure 1.25 cu ft)',
    type: 'sealed',
    tuneHz: 0,
    rms: 600,
    ohms: 4,
    desc: 'Ultra-tight, accurate musical punch with smooth low-end rolloff.'
  },
  {
    id: 'alpine_sw12',
    name: 'Alpine S-W12D4 (12" Custom Ported @ 33Hz)',
    type: 'ported',
    tuneHz: 33,
    rms: 600,
    ohms: 2,
    desc: 'Ultra-deep sub-bass extension down to 25Hz.'
  },
  {
    id: 'underseat_compact',
    name: 'Under-Seat Active Subwoofer (8" Die-Cast Sealed Box)',
    type: 'sealed',
    tuneHz: 0,
    rms: 120,
    ohms: 4,
    desc: 'Space-saving stealth bass directly under driver or passenger seat.'
  },
  {
    id: 'spare_wheel_sub',
    name: 'Spare Wheel Well Subwoofer (11" Sealed Round Box)',
    type: 'sealed',
    tuneHz: 0,
    rms: 200,
    ohms: 4,
    desc: 'Zero boot space loss; mounted inside spare tire cavity.'
  },
  {
    id: 'none',
    name: 'No Subwoofer Installed (Door Speakers Full-Range)',
    type: 'none',
    tuneHz: 0,
    rms: 0,
    ohms: 0,
    desc: 'Doors handle lower frequencies without dedicated sub.'
  }
];
