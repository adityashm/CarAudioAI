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
  categoryTag?: 'popular' | 'suv' | 'luxury' | 'ev';
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
      },
      {
        id: 'honda_amaze',
        make: 'Honda',
        model: 'Amaze (3rd Gen)',
        year: '2021–2026',
        category: 'Sedan',
        wheelbase: 2470,
        cabinVolumeM3: 2.8,
        resonantFreqHz: 210,
        distances_rhd: { FL: 130, FR: 87, RL: 146, RR: 106, SUB: 194 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Mirror Sail', maxDepthMm: 64 }
      }
    ]
  },
  {
    id: 'mg',
    name: 'MG Motor',
    country: 'UK / India / SAIC',
    badgeColor: '#e11d48',
    categoryTag: 'popular',
    models: [
      {
        id: 'mg_hector',
        make: 'MG Motor',
        model: 'Hector / Hector Plus',
        year: '2021–2026',
        category: 'Midsize SUV',
        wheelbase: 2750,
        cabinVolumeM3: 3.8,
        resonantFreqHz: 180,
        distances_rhd: { FL: 149, FR: 101, RL: 172, RR: 128, SUB: 242 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 76 }
      },
      {
        id: 'mg_astor',
        make: 'MG Motor',
        model: 'Astor Savvy Pro',
        year: '2021–2026',
        category: 'Compact SUV',
        wheelbase: 2585,
        cabinVolumeM3: 3.1,
        resonantFreqHz: 196,
        distances_rhd: { FL: 138, FR: 94, RL: 156, RR: 114, SUB: 212 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 70 }
      },
      {
        id: 'mg_zs_ev',
        make: 'MG Motor',
        model: 'ZS EV Exclusive Plus',
        year: '2022–2026',
        category: 'Compact SUV',
        wheelbase: 2585,
        cabinVolumeM3: 3.1,
        resonantFreqHz: 196,
        distances_rhd: { FL: 138, FR: 94, RL: 156, RR: 114, SUB: 212 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 70 }
      },
      {
        id: 'mg_windsor',
        make: 'MG Motor',
        model: 'Windsor EV Essence',
        year: '2024–2026',
        category: 'Hatchback',
        wheelbase: 2700,
        cabinVolumeM3: 3.3,
        resonantFreqHz: 188,
        distances_rhd: { FL: 142, FR: 96, RL: 162, RR: 118, SUB: 222 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 72 }
      },
      {
        id: 'mg_gloster',
        make: 'MG Motor',
        model: 'Gloster 4x4 Savvy',
        year: '2021–2026',
        category: 'Full-Size SUV',
        wheelbase: 2950,
        cabinVolumeM3: 4.6,
        resonantFreqHz: 165,
        distances_rhd: { FL: 160, FR: 110, RL: 188, RR: 142, SUB: 265 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 85 }
      }
    ]
  },
  {
    id: 'renault',
    name: 'Renault',
    country: 'France / India',
    badgeColor: '#facc15',
    categoryTag: 'popular',
    models: [
      {
        id: 'renault_kiger',
        make: 'Renault',
        model: 'Kiger Turbo',
        year: '2021–2026',
        category: 'Compact SUV',
        wheelbase: 2500,
        cabinVolumeM3: 2.9,
        resonantFreqHz: 205,
        distances_rhd: { FL: 133, FR: 90, RL: 148, RR: 108, SUB: 198 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 66 }
      },
      {
        id: 'renault_kwid',
        make: 'Renault',
        model: 'Kwid Climber',
        year: '2020–2026',
        category: 'Hatchback',
        wheelbase: 2422,
        cabinVolumeM3: 2.6,
        resonantFreqHz: 218,
        distances_rhd: { FL: 126, FR: 84, RL: 140, RR: 100, SUB: 182 },
        speakerSizes: { front: '5.25" / 6.5"', rear: '5.25"', tweeterLocation: 'Dashboard', maxDepthMm: 55 }
      },
      {
        id: 'renault_triber',
        make: 'Renault',
        model: 'Triber 7-Seater',
        year: '2021–2026',
        category: 'MPV',
        wheelbase: 2636,
        cabinVolumeM3: 3.5,
        resonantFreqHz: 190,
        distances_rhd: { FL: 140, FR: 95, RL: 160, RR: 118, SUB: 220 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 68 }
      },
      {
        id: 'renault_duster',
        make: 'Renault',
        model: 'Duster (New Gen)',
        year: '2024–2026',
        category: 'Midsize SUV',
        wheelbase: 2673,
        cabinVolumeM3: 3.4,
        resonantFreqHz: 188,
        distances_rhd: { FL: 142, FR: 96, RL: 164, RR: 120, SUB: 225 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 72 }
      }
    ]
  },
  {
    id: 'nissan',
    name: 'Nissan',
    country: 'Japan',
    badgeColor: '#94a3b8',
    categoryTag: 'popular',
    models: [
      {
        id: 'nissan_magnite',
        make: 'Nissan',
        model: 'Magnite (2024 Facelift / Turbo)',
        year: '2024–2026',
        category: 'Compact SUV',
        wheelbase: 2500,
        cabinVolumeM3: 2.9,
        resonantFreqHz: 205,
        distances_rhd: { FL: 133, FR: 90, RL: 148, RR: 108, SUB: 198 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 66 }
      },
      {
        id: 'nissan_xtrail',
        make: 'Nissan',
        model: 'X-Trail (4th Gen e-POWER)',
        year: '2024–2026',
        category: 'Midsize SUV',
        wheelbase: 2705,
        cabinVolumeM3: 3.7,
        resonantFreqHz: 182,
        distances_rhd: { FL: 148, FR: 100, RL: 170, RR: 126, SUB: 236 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 78 }
      }
    ]
  },
  {
    id: 'jeep',
    name: 'Jeep',
    country: 'USA',
    badgeColor: '#84cc16',
    categoryTag: 'suv',
    models: [
      {
        id: 'jeep_compass',
        make: 'Jeep',
        model: 'Compass (Night Eagle / Model S)',
        year: '2021–2026',
        category: 'Midsize SUV',
        wheelbase: 2636,
        cabinVolumeM3: 3.4,
        resonantFreqHz: 188,
        distances_rhd: { FL: 143, FR: 97, RL: 163, RR: 121, SUB: 228 },
        speakerSizes: { front: '6x9" / 6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar / Dash', maxDepthMm: 78 }
      },
      {
        id: 'jeep_meridian',
        make: 'Jeep',
        model: 'Meridian 4x4 (Overland)',
        year: '2022–2026',
        category: 'Full-Size SUV',
        wheelbase: 2794,
        cabinVolumeM3: 4.1,
        resonantFreqHz: 174,
        distances_rhd: { FL: 153, FR: 104, RL: 177, RR: 133, SUB: 246 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 80 }
      },
      {
        id: 'jeep_wrangler',
        make: 'Jeep',
        model: 'Wrangler Rubicon 4x4',
        year: '2021–2026',
        category: 'Off-Road SUV',
        wheelbase: 3008,
        cabinVolumeM3: 3.7,
        resonantFreqHz: 180,
        distances_rhd: { FL: 148, FR: 98, RL: 168, RR: 124, SUB: 235 },
        speakerSizes: { front: '6.5" Dash Pod', rear: '6.5" Soundbar', tweeterLocation: 'Dash Corner', maxDepthMm: 75 }
      }
    ]
  },
  {
    id: 'bmw',
    name: 'BMW',
    country: 'Germany',
    badgeColor: '#60a5fa',
    categoryTag: 'luxury',
    models: [
      {
        id: 'bmw_3series',
        make: 'BMW',
        model: '3 Series Gran Limousine / M340i',
        year: '2021–2026',
        category: 'Sedan',
        wheelbase: 2851,
        cabinVolumeM3: 3.6,
        resonantFreqHz: 180,
        distances_rhd: { FL: 146, FR: 98, RL: 170, RR: 126, SUB: 235 },
        speakerSizes: { front: '4" Mid + 1" Tweeter', rear: '4" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 60 }
      },
      {
        id: 'bmw_5series',
        make: 'BMW',
        model: '5 Series Long Wheelbase (G68)',
        year: '2024–2026',
        category: 'Sedan',
        wheelbase: 3105,
        cabinVolumeM3: 4.2,
        resonantFreqHz: 168,
        distances_rhd: { FL: 158, FR: 106, RL: 184, RR: 138, SUB: 255 },
        speakerSizes: { front: '4" Mid + 1" Tweeter', rear: '4" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 62 }
      },
      {
        id: 'bmw_x1',
        make: 'BMW',
        model: 'X1 / iX1 sDrive',
        year: '2023–2026',
        category: 'Compact SUV',
        wheelbase: 2692,
        cabinVolumeM3: 3.3,
        resonantFreqHz: 190,
        distances_rhd: { FL: 142, FR: 96, RL: 162, RR: 120, SUB: 222 },
        speakerSizes: { front: '4" Mid + 1" Tweeter', rear: '4" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 60 }
      },
      {
        id: 'bmw_x3',
        make: 'BMW',
        model: 'X3 xDrive20d / M40i',
        year: '2022–2026',
        category: 'Midsize SUV',
        wheelbase: 2864,
        cabinVolumeM3: 3.8,
        resonantFreqHz: 178,
        distances_rhd: { FL: 150, FR: 102, RL: 174, RR: 130, SUB: 242 },
        speakerSizes: { front: '4" Mid + 1" Tweeter', rear: '4" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 65 }
      },
      {
        id: 'bmw_x5',
        make: 'BMW',
        model: 'X5 xDrive40i / 30d',
        year: '2023–2026',
        category: 'Full-Size SUV',
        wheelbase: 2975,
        cabinVolumeM3: 4.5,
        resonantFreqHz: 166,
        distances_rhd: { FL: 160, FR: 108, RL: 186, RR: 140, SUB: 260 },
        speakerSizes: { front: '4" Mid + 1" Tweeter', rear: '4" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 70 }
      }
    ]
  },
  {
    id: 'mercedes',
    name: 'Mercedes-Benz',
    country: 'Germany',
    badgeColor: '#cbd5e1',
    categoryTag: 'luxury',
    models: [
      {
        id: 'mercedes_cclass',
        make: 'Mercedes-Benz',
        model: 'C-Class (W206 C200/C220d)',
        year: '2022–2026',
        category: 'Sedan',
        wheelbase: 2865,
        cabinVolumeM3: 3.5,
        resonantFreqHz: 180,
        distances_rhd: { FL: 146, FR: 98, RL: 170, RR: 126, SUB: 236 },
        speakerSizes: { front: '4" Mid + 1" Tweeter', rear: '4" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 60 }
      },
      {
        id: 'mercedes_eclass',
        make: 'Mercedes-Benz',
        model: 'E-Class LWB (V214)',
        year: '2024–2026',
        category: 'Sedan',
        wheelbase: 3094,
        cabinVolumeM3: 4.2,
        resonantFreqHz: 168,
        distances_rhd: { FL: 158, FR: 106, RL: 184, RR: 138, SUB: 255 },
        speakerSizes: { front: '4" Mid + 1" Tweeter', rear: '4" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 62 }
      },
      {
        id: 'mercedes_glc',
        make: 'Mercedes-Benz',
        model: 'GLC 300 4MATIC',
        year: '2023–2026',
        category: 'Midsize SUV',
        wheelbase: 2888,
        cabinVolumeM3: 3.9,
        resonantFreqHz: 176,
        distances_rhd: { FL: 151, FR: 103, RL: 175, RR: 131, SUB: 244 },
        speakerSizes: { front: '4" Mid + 1" Tweeter', rear: '4" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 65 }
      },
      {
        id: 'mercedes_gle',
        make: 'Mercedes-Benz',
        model: 'GLE 300d / 450 LWB',
        year: '2023–2026',
        category: 'Full-Size SUV',
        wheelbase: 2995,
        cabinVolumeM3: 4.6,
        resonantFreqHz: 165,
        distances_rhd: { FL: 161, FR: 110, RL: 188, RR: 142, SUB: 265 },
        speakerSizes: { front: '4" Mid + 1" Tweeter', rear: '4" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 72 }
      }
    ]
  },
  {
    id: 'audi',
    name: 'Audi',
    country: 'Germany',
    badgeColor: '#f1f5f9',
    categoryTag: 'luxury',
    models: [
      {
        id: 'audi_a4',
        make: 'Audi',
        model: 'A4 40 TFSI Technology',
        year: '2021–2026',
        category: 'Sedan',
        wheelbase: 2820,
        cabinVolumeM3: 3.5,
        resonantFreqHz: 182,
        distances_rhd: { FL: 145, FR: 98, RL: 168, RR: 124, SUB: 234 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar / Dash', maxDepthMm: 75 }
      },
      {
        id: 'audi_a6',
        make: 'Audi',
        model: 'A6 45 TFSI Technology',
        year: '2021–2026',
        category: 'Sedan',
        wheelbase: 2924,
        cabinVolumeM3: 4.0,
        resonantFreqHz: 172,
        distances_rhd: { FL: 154, FR: 104, RL: 178, RR: 134, SUB: 248 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 78 }
      },
      {
        id: 'audi_q3',
        make: 'Audi',
        model: 'Q3 / Q3 Sportback Quattro',
        year: '2022–2026',
        category: 'Compact SUV',
        wheelbase: 2680,
        cabinVolumeM3: 3.3,
        resonantFreqHz: 190,
        distances_rhd: { FL: 141, FR: 96, RL: 162, RR: 120, SUB: 222 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 72 }
      },
      {
        id: 'audi_q5',
        make: 'Audi',
        model: 'Q5 45 TFSI Quattro',
        year: '2021–2026',
        category: 'Midsize SUV',
        wheelbase: 2820,
        cabinVolumeM3: 3.8,
        resonantFreqHz: 178,
        distances_rhd: { FL: 150, FR: 102, RL: 174, RR: 130, SUB: 242 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 78 }
      },
      {
        id: 'audi_q7',
        make: 'Audi',
        model: 'Q7 55 TFSI Quattro 7-Seat',
        year: '2022–2026',
        category: 'Full-Size SUV',
        wheelbase: 2994,
        cabinVolumeM3: 4.7,
        resonantFreqHz: 164,
        distances_rhd: { FL: 162, FR: 111, RL: 190, RR: 144, SUB: 268 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 85 }
      }
    ]
  },
  {
    id: 'volvo',
    name: 'Volvo',
    country: 'Sweden',
    badgeColor: '#38bdf8',
    categoryTag: 'luxury',
    models: [
      {
        id: 'volvo_xc40',
        make: 'Volvo',
        model: 'XC40 / EX40 Recharge',
        year: '2022–2026',
        category: 'Compact SUV',
        wheelbase: 2702,
        cabinVolumeM3: 3.3,
        resonantFreqHz: 188,
        distances_rhd: { FL: 142, FR: 97, RL: 163, RR: 121, SUB: 224 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 70 }
      },
      {
        id: 'volvo_xc60',
        make: 'Volvo',
        model: 'XC60 B5 Ultimate',
        year: '2021–2026',
        category: 'Midsize SUV',
        wheelbase: 2865,
        cabinVolumeM3: 3.9,
        resonantFreqHz: 176,
        distances_rhd: { FL: 151, FR: 103, RL: 176, RR: 132, SUB: 245 },
        speakerSizes: { front: '6.5" Component + Center', rear: '6.5" Coaxial', tweeterLocation: 'Door Top', maxDepthMm: 76 }
      },
      {
        id: 'volvo_xc90',
        make: 'Volvo',
        model: 'XC90 B6 Ultimate (B&W)',
        year: '2021–2026',
        category: 'Full-Size SUV',
        wheelbase: 2984,
        cabinVolumeM3: 4.8,
        resonantFreqHz: 162,
        distances_rhd: { FL: 164, FR: 112, RL: 192, RR: 146, SUB: 272 },
        speakerSizes: { front: '6.5" Component + Center', rear: '6.5" Coaxial', tweeterLocation: 'Door Top', maxDepthMm: 85 }
      }
    ]
  },
  {
    id: 'byd',
    name: 'BYD',
    country: 'China',
    badgeColor: '#2dd4bf',
    categoryTag: 'ev',
    models: [
      {
        id: 'byd_atto3',
        make: 'BYD',
        model: 'Atto 3 (Extended Range EV)',
        year: '2022–2026',
        category: 'Midsize SUV',
        wheelbase: 2720,
        cabinVolumeM3: 3.4,
        resonantFreqHz: 186,
        distances_rhd: { FL: 143, FR: 97, RL: 164, RR: 121, SUB: 226 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 72 }
      },
      {
        id: 'byd_seal',
        make: 'BYD',
        model: 'Seal Performance Dual Motor',
        year: '2024–2026',
        category: 'Sedan',
        wheelbase: 2920,
        cabinVolumeM3: 3.6,
        resonantFreqHz: 178,
        distances_rhd: { FL: 147, FR: 99, RL: 171, RR: 127, SUB: 238 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 75 }
      },
      {
        id: 'byd_emax7',
        make: 'BYD',
        model: 'eMAX 7 MPV (Superior)',
        year: '2024–2026',
        category: 'MPV',
        wheelbase: 2800,
        cabinVolumeM3: 4.2,
        resonantFreqHz: 174,
        distances_rhd: { FL: 154, FR: 105, RL: 178, RR: 134, SUB: 248 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 76 }
      }
    ]
  },
  {
    id: 'landrover',
    name: 'Land Rover',
    country: 'UK',
    badgeColor: '#10b981',
    categoryTag: 'suv',
    models: [
      {
        id: 'landrover_defender110',
        make: 'Land Rover',
        model: 'Defender 110 (HSE / V8)',
        year: '2021–2026',
        category: 'Off-Road SUV',
        wheelbase: 3022,
        cabinVolumeM3: 4.6,
        resonantFreqHz: 165,
        distances_rhd: { FL: 160, FR: 110, RL: 188, RR: 142, SUB: 265 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar / Dash', maxDepthMm: 85 }
      },
      {
        id: 'landrover_evoque',
        make: 'Land Rover',
        model: 'Range Rover Evoque',
        year: '2021–2026',
        category: 'Compact SUV',
        wheelbase: 2681,
        cabinVolumeM3: 3.2,
        resonantFreqHz: 192,
        distances_rhd: { FL: 140, FR: 95, RL: 160, RR: 118, SUB: 220 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Top', maxDepthMm: 72 }
      },
      {
        id: 'landrover_velar',
        make: 'Land Rover',
        model: 'Range Rover Velar Dynamic',
        year: '2022–2026',
        category: 'Midsize SUV',
        wheelbase: 2874,
        cabinVolumeM3: 3.8,
        resonantFreqHz: 178,
        distances_rhd: { FL: 150, FR: 102, RL: 174, RR: 130, SUB: 242 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Top', maxDepthMm: 78 }
      },
      {
        id: 'landrover_sport',
        make: 'Land Rover',
        model: 'Range Rover Sport Autobiography',
        year: '2023–2026',
        category: 'Full-Size SUV',
        wheelbase: 2997,
        cabinVolumeM3: 4.5,
        resonantFreqHz: 166,
        distances_rhd: { FL: 160, FR: 108, RL: 186, RR: 140, SUB: 262 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 85 }
      }
    ]
  },
  {
    id: 'porsche',
    name: 'Porsche',
    country: 'Germany',
    badgeColor: '#f59e0b',
    categoryTag: 'luxury',
    models: [
      {
        id: 'porsche_macan',
        make: 'Porsche',
        model: 'Macan / Macan EV',
        year: '2021–2026',
        category: 'Midsize SUV',
        wheelbase: 2807,
        cabinVolumeM3: 3.5,
        resonantFreqHz: 184,
        distances_rhd: { FL: 146, FR: 99, RL: 168, RR: 125, SUB: 232 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Dash Top', maxDepthMm: 75 }
      },
      {
        id: 'porsche_cayenne',
        make: 'Porsche',
        model: 'Cayenne GTS / Coupe',
        year: '2022–2026',
        category: 'Full-Size SUV',
        wheelbase: 2895,
        cabinVolumeM3: 4.3,
        resonantFreqHz: 170,
        distances_rhd: { FL: 157, FR: 106, RL: 182, RR: 137, SUB: 254 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Dash Top', maxDepthMm: 82 }
      },
      {
        id: 'porsche_911',
        make: 'Porsche',
        model: '911 Carrera GTS (992.2)',
        year: '2021–2026',
        category: 'Sedan',
        wheelbase: 2450,
        cabinVolumeM3: 2.3,
        resonantFreqHz: 225,
        distances_rhd: { FL: 124, FR: 82, RL: 136, RR: 96, SUB: 170 },
        speakerSizes: { front: '6.5" Door Woofer + 4" Mid', rear: '4" Coaxial', tweeterLocation: 'Dash Corner', maxDepthMm: 65 }
      },
      {
        id: 'porsche_taycan',
        make: 'Porsche',
        model: 'Taycan 4S / Turbo S',
        year: '2022–2026',
        category: 'Sedan',
        wheelbase: 2900,
        cabinVolumeM3: 3.4,
        resonantFreqHz: 182,
        distances_rhd: { FL: 146, FR: 98, RL: 168, RR: 124, SUB: 234 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 74 }
      }
    ]
  },
  {
    id: 'ford',
    name: 'Ford',
    country: 'USA',
    badgeColor: '#3b82f6',
    categoryTag: 'popular',
    models: [
      {
        id: 'ford_endeavour',
        make: 'Ford',
        model: 'Endeavour 4x4 (Titanium+ / Sport)',
        year: '2019–2026',
        category: 'Full-Size SUV',
        wheelbase: 2850,
        cabinVolumeM3: 4.4,
        resonantFreqHz: 168,
        distances_rhd: { FL: 158, FR: 107, RL: 184, RR: 139, SUB: 258 },
        speakerSizes: { front: '6x9" / 6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 85 }
      },
      {
        id: 'ford_ecosport',
        make: 'Ford',
        model: 'EcoSport S / Titanium',
        year: '2018–2024',
        category: 'Compact SUV',
        wheelbase: 2519,
        cabinVolumeM3: 2.9,
        resonantFreqHz: 205,
        distances_rhd: { FL: 134, FR: 91, RL: 149, RR: 109, SUB: 200 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 70 }
      },
      {
        id: 'ford_figo',
        make: 'Ford',
        model: 'Figo / Freestyle',
        year: '2018–2024',
        category: 'Hatchback',
        wheelbase: 2490,
        cabinVolumeM3: 2.8,
        resonantFreqHz: 210,
        distances_rhd: { FL: 130, FR: 88, RL: 145, RR: 105, SUB: 190 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 65 }
      }
    ]
  },
  {
    id: 'citroen',
    name: 'Citroën',
    country: 'France',
    badgeColor: '#f43f5e',
    categoryTag: 'popular',
    models: [
      {
        id: 'citroen_basalt',
        make: 'Citroën',
        model: 'Basalt Vision Coupe SUV',
        year: '2024–2026',
        category: 'Compact SUV',
        wheelbase: 2671,
        cabinVolumeM3: 3.2,
        resonantFreqHz: 192,
        distances_rhd: { FL: 139, FR: 95, RL: 158, RR: 116, SUB: 216 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 70 }
      },
      {
        id: 'citroen_c3_aircross',
        make: 'Citroën',
        model: 'C3 Aircross (7-Seater)',
        year: '2023–2026',
        category: 'Midsize SUV',
        wheelbase: 2671,
        cabinVolumeM3: 3.4,
        resonantFreqHz: 188,
        distances_rhd: { FL: 141, FR: 96, RL: 161, RR: 119, SUB: 222 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 72 }
      },
      {
        id: 'citroen_c3',
        make: 'Citroën',
        model: 'C3 / ë-C3 EV',
        year: '2022–2026',
        category: 'Hatchback',
        wheelbase: 2540,
        cabinVolumeM3: 2.8,
        resonantFreqHz: 208,
        distances_rhd: { FL: 132, FR: 89, RL: 147, RR: 107, SUB: 194 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 65 }
      }
    ]
  },
  {
    id: 'force',
    name: 'Force Motors',
    country: 'India',
    badgeColor: '#ea580c',
    categoryTag: 'suv',
    models: [
      {
        id: 'force_gurkha5',
        make: 'Force Motors',
        model: 'Gurkha 5-Door 4x4',
        year: '2024–2026',
        category: 'Off-Road SUV',
        wheelbase: 2825,
        cabinVolumeM3: 3.8,
        resonantFreqHz: 178,
        distances_rhd: { FL: 150, FR: 100, RL: 172, RR: 128, SUB: 240 },
        speakerSizes: { front: '6.5" Coaxial', rear: '6.5" Coaxial', tweeterLocation: 'Dashboard', maxDepthMm: 75 }
      },
      {
        id: 'force_gurkha3',
        make: 'Force Motors',
        model: 'Gurkha 3-Door 4x4',
        year: '2021–2026',
        category: 'Off-Road SUV',
        wheelbase: 2400,
        cabinVolumeM3: 3.0,
        resonantFreqHz: 212,
        distances_rhd: { FL: 130, FR: 86, RL: 142, RR: 102, SUB: 185 },
        speakerSizes: { front: '6.5" Coaxial', rear: '6.5" Coaxial', tweeterLocation: 'Dashboard', maxDepthMm: 70 }
      }
    ]
  },
  {
    id: 'lexus',
    name: 'Lexus',
    country: 'Japan',
    badgeColor: '#94a3b8',
    categoryTag: 'luxury',
    models: [
      {
        id: 'lexus_es300h',
        make: 'Lexus',
        model: 'ES 300h Luxury',
        year: '2021–2026',
        category: 'Sedan',
        wheelbase: 2870,
        cabinVolumeM3: 3.8,
        resonantFreqHz: 175,
        distances_rhd: { FL: 149, FR: 100, RL: 174, RR: 130, SUB: 244 },
        speakerSizes: { front: '6.5" Component + Center', rear: '6.5" Coaxial', tweeterLocation: 'Dash Corner', maxDepthMm: 78 }
      },
      {
        id: 'lexus_nx350h',
        make: 'Lexus',
        model: 'NX 350h F-Sport',
        year: '2022–2026',
        category: 'Midsize SUV',
        wheelbase: 2690,
        cabinVolumeM3: 3.4,
        resonantFreqHz: 186,
        distances_rhd: { FL: 143, FR: 97, RL: 164, RR: 121, SUB: 228 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 74 }
      },
      {
        id: 'lexus_rx350h',
        make: 'Lexus',
        model: 'RX 350h / 500h F-Sport',
        year: '2023–2026',
        category: 'Full-Size SUV',
        wheelbase: 2850,
        cabinVolumeM3: 4.2,
        resonantFreqHz: 170,
        distances_rhd: { FL: 156, FR: 106, RL: 180, RR: 136, SUB: 252 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'A-Pillar', maxDepthMm: 80 }
      }
    ]
  },
  {
    id: 'jaguar',
    name: 'Jaguar',
    country: 'UK',
    badgeColor: '#cbd5e1',
    categoryTag: 'luxury',
    models: [
      {
        id: 'jaguar_fpace',
        make: 'Jaguar',
        model: 'F-Pace R-Dynamic S',
        year: '2021–2026',
        category: 'Midsize SUV',
        wheelbase: 2874,
        cabinVolumeM3: 3.8,
        resonantFreqHz: 178,
        distances_rhd: { FL: 150, FR: 102, RL: 174, RR: 130, SUB: 242 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Top', maxDepthMm: 78 }
      },
      {
        id: 'jaguar_xe',
        make: 'Jaguar',
        model: 'XE P250 R-Dynamic',
        year: '2020–2025',
        category: 'Sedan',
        wheelbase: 2835,
        cabinVolumeM3: 3.4,
        resonantFreqHz: 184,
        distances_rhd: { FL: 145, FR: 98, RL: 168, RR: 124, SUB: 232 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 72 }
      },
      {
        id: 'jaguar_xf',
        make: 'Jaguar',
        model: 'XF P250 Prestige',
        year: '2020–2025',
        category: 'Sedan',
        wheelbase: 2960,
        cabinVolumeM3: 3.9,
        resonantFreqHz: 174,
        distances_rhd: { FL: 152, FR: 102, RL: 176, RR: 132, SUB: 246 },
        speakerSizes: { front: '6.5" Component', rear: '6.5" Coaxial', tweeterLocation: 'Door Sail', maxDepthMm: 75 }
      }
    ]
  }
];

// =========================================================================
// COMPREHENSIVE MULTI-BRAND AUDIO HARDWARE CATALOG
// =========================================================================

export interface HeadUnitItem {
  id: string;
  brand: string;
  model: string;
  name: string;
  preout: number; // Volts RMS
  bands: number;  // EQ bands
  type: 'touchscreen' | 'audiophile' | 'single_din' | 'android' | 'stock' | 'custom';
  dac?: string;
  hiResAudio?: boolean;
  wirelessCarPlay?: boolean;
  desc?: string;
}

export interface HeadUnitBrandGroup {
  id: string;
  brand: string;
  country: string;
  models: HeadUnitItem[];
}

export interface SpeakerItem {
  id: string;
  brand: string;
  model: string;
  name: string;
  type: 'component' | 'coaxial' | '3way' | 'stock' | 'custom';
  size: string;
  rms: number;  // Watts RMS per channel
  peak: number; // Watts Peak
  ohms: number; // Nominal Impedance
  hpf: number;  // Recommended High Pass Filter cutoff (Hz)
  sensitivity: number; // dB @ 1W/1m
  tweeterType?: string;
  desc?: string;
}

export interface SpeakerBrandGroup {
  id: string;
  brand: string;
  country: string;
  models: SpeakerItem[];
}

export interface AmplifierItem {
  id: string;
  brand: string;
  model: string;
  name: string;
  channels: string;
  frontRms: number; // Watts RMS per channel @ 4Ω
  rearRms: number;  // Watts RMS per channel @ 4Ω
  subRms: number;   // Watts RMS Sub channel @ 4Ω / 2Ω
  ampClass: 'Class-D' | 'Class-AB' | 'DSP-Amp' | 'Stock';
  hasSubChannel: boolean;
  snr?: number;     // Signal to Noise ratio dB
  desc?: string;
}

export interface AmplifierBrandGroup {
  id: string;
  brand: string;
  country: string;
  models: AmplifierItem[];
}

export interface SubwooferItem {
  id: string;
  brand: string;
  model: string;
  name: string;
  type: 'ported' | 'sealed' | 'underseat' | 'spare_wheel' | 'none' | 'custom';
  size: string;
  tuneHz: number;   // Port tuning frequency (0 for sealed)
  rms: number;      // Watts RMS
  peak: number;     // Watts Peak
  ohms: number;     // Wiring impedance (Ohms)
  voiceCoil: 'SVC 4Ω' | 'DVC 4Ω (2Ω/8Ω)' | 'DVC 2Ω (1Ω/4Ω)' | 'Active Amp' | 'None';
  desc?: string;
}

export interface SubwooferBrandGroup {
  id: string;
  brand: string;
  country: string;
  models: SubwooferItem[];
}

// -------------------------------------------------------------------------
// 1. HEAD UNIT BRANDS & MODELS
// -------------------------------------------------------------------------
export const HEAD_UNIT_BRANDS: HeadUnitBrandGroup[] = [
  {
    id: 'nakamichi',
    brand: 'Nakamichi',
    country: 'Japan',
    models: [
      { id: 'nakamichi_nam5510', brand: 'Nakamichi', model: 'NAM5510', name: 'Nakamichi NAM5510 (10.1" DSP Touchscreen)', preout: 4.0, bands: 14, type: 'touchscreen', hiResAudio: true, wirelessCarPlay: true, desc: '14-Band Parametric EQ, 4V Pre-outs, Optical TOSLINK output.' },
      { id: 'nakamichi_nam5210', brand: 'Nakamichi', model: 'NAM5210', name: 'Nakamichi NAM5210 (9" IPS Screen)', preout: 2.0, bands: 14, type: 'touchscreen', wirelessCarPlay: true, desc: '14-Band EQ, 2V Front/Rear/Sub Pre-outs.' },
      { id: 'nakamichi_nam5730', brand: 'Nakamichi', model: 'NAM5730', name: 'Nakamichi NAM5730 (Flagship 4K DSP)', preout: 4.0, bands: 31, type: 'touchscreen', hiResAudio: true, wirelessCarPlay: true, desc: '31-Band Active DSP, 4V Low-Noise Pre-outs.' },
      { id: 'nakamichi_nq711b', brand: 'Nakamichi', model: 'NQ711B', name: 'Nakamichi NQ711B (Single DIN Bluetooth)', preout: 2.0, bands: 10, type: 'single_din', desc: 'Audiophile Single DIN head unit with FLAC playback.' }
    ]
  },
  {
    id: 'pioneer',
    brand: 'Pioneer',
    country: 'Japan',
    models: [
      { id: 'pioneer_80prs', brand: 'Pioneer', model: 'DEH-80PRS', name: 'Pioneer DEH-80PRS (Audiophile Reference)', preout: 5.0, bands: 31, type: 'audiophile', hiResAudio: true, desc: 'Dual 24-bit Burr-Brown DACs, 31-Band L/R EQ, 5V Gold-Plated Pre-outs, Active 3-Way Mode.' },
      { id: 'pioneer_dmh_z5350bt', brand: 'Pioneer', model: 'DMH-Z5350BT', name: 'Pioneer DMH-Z5350BT (6.8" Capacitive)', preout: 4.0, bands: 13, type: 'touchscreen', wirelessCarPlay: true, desc: '13-Band Graphic EQ, 3x 4V RCA Pre-outs, Time Alignment.' },
      { id: 'pioneer_dmh_zf9350bt', brand: 'Pioneer', model: 'DMH-ZF9350BT', name: 'Pioneer DMH-ZF9350BT (9" Floating Display)', preout: 4.0, bands: 13, type: 'touchscreen', hiResAudio: true, wirelessCarPlay: true, desc: 'Hi-Res 24-bit/96kHz Audio, 13-Band EQ, Master Sound Reviver.' },
      { id: 'pioneer_dmh_a4450bt', brand: 'Pioneer', model: 'DMH-A4450BT', name: 'Pioneer DMH-A4450BT (Entry Touchscreen)', preout: 2.0, bands: 13, type: 'touchscreen', desc: '13-Band GEQ, 2V Pre-outs, Subwoofer Control.' },
      { id: 'pioneer_deh_s4250bt', brand: 'Pioneer', model: 'DEH-S4250BT', name: 'Pioneer DEH-S4250BT (Single-DIN CD/BT)', preout: 2.0, bands: 13, type: 'single_din', desc: '13-Band EQ, Smart Sync integration.' }
    ]
  },
  {
    id: 'sony',
    brand: 'Sony',
    country: 'Japan',
    models: [
      { id: 'sony_xav_9500es', brand: 'Sony', model: 'XAV-9500ES', name: 'Sony Mobile ES XAV-9500ES (Flagship High-Res)', preout: 5.0, bands: 14, type: 'audiophile', hiResAudio: true, wirelessCarPlay: true, desc: 'ESS 32-bit DAC, 5V High-Voltage Pre-outs, 14-Band EQ + Time Alignment, LDAC Bluetooth.' },
      { id: 'sony_xav_ax8500', brand: 'Sony', model: 'XAV-AX8500', name: 'Sony XAV-AX8500 (10.1" Anti-Glare)', preout: 5.0, bands: 14, type: 'touchscreen', hiResAudio: true, wirelessCarPlay: true, desc: '5V 3-Pre-outs, 14-Band Parametric EQ, HDMI Input.' },
      { id: 'sony_xav_ax5500', brand: 'Sony', model: 'XAV-AX5500', name: 'Sony XAV-AX5500 (6.95" Dual USB)', preout: 5.0, bands: 10, type: 'touchscreen', desc: '5V Pre-outs, 10-Band Graphic EQ with DSO soundstage enhancer.' },
      { id: 'sony_xav_ax3200', brand: 'Sony', model: 'XAV-AX3200', name: 'Sony XAV-AX3200 (6.95" A/V Touchscreen)', preout: 2.0, bands: 10, type: 'touchscreen', desc: '10-Band EQ, Extra Bass circuitry, A/V Input.' },
      { id: 'sony_dsx_a410bt', brand: 'Sony', model: 'DSX-A410BT', name: 'Sony DSX-A410BT (Mechless 1-DIN)', preout: 2.0, bands: 10, type: 'single_din', desc: '10-Band EQ, 2V Pre-outs, Dual Bluetooth.' }
    ]
  },
  {
    id: 'alpine',
    brand: 'Alpine',
    country: 'Japan',
    models: [
      { id: 'alpine_ilx_f511e', brand: 'Alpine', model: 'iLX-F511E (Halo11)', name: 'Alpine Halo11 iLX-F511E (11" Floating QLED)', preout: 4.0, bands: 13, type: 'touchscreen', hiResAudio: true, wirelessCarPlay: true, desc: 'Hi-Res 96kHz/24bit, 13-Band Parametric EQ, 4V Pre-outs, 6-Channel Time Correction.' },
      { id: 'alpine_ilx_f509e', brand: 'Alpine', model: 'iLX-F509E (Halo9)', name: 'Alpine Halo9 iLX-F509E (9" Floating QLED)', preout: 4.0, bands: 13, type: 'touchscreen', hiResAudio: true, wirelessCarPlay: true, desc: 'Class-D Built-in Power, 4V Pre-outs, Parametric EQ.' },
      { id: 'alpine_ilx_w670', brand: 'Alpine', model: 'iLX-W670', name: 'Alpine iLX-W670 (7" Double DIN)', preout: 4.0, bands: 13, type: 'touchscreen', desc: '13-Band EQ, 4V Front/Rear/Sub Pre-outs, Sound Boost.' },
      { id: 'alpine_ute_73bt', brand: 'Alpine', model: 'UTE-73BT', name: 'Alpine UTE-73BT (Single-DIN Bluetooth)', preout: 2.0, bands: 3, type: 'single_din', desc: 'BassEngine SQ, 24-bit DAC, 2V Pre-outs.' }
    ]
  },
  {
    id: 'jbl',
    brand: 'JBL (Harman)',
    country: 'USA',
    models: [
      { id: 'jbl_legend_cp100', brand: 'JBL', model: 'Legend CP100', name: 'JBL Legend CP100 (6.75" Touchscreen)', preout: 4.0, bands: 13, type: 'touchscreen', desc: 'Drive EQ, 4V Pre-outs, Apple CarPlay & Android Auto.' },
      { id: 'jbl_celebrity_150', brand: 'JBL', model: 'Celebrity 150', name: 'JBL Celebrity 150 (Single DIN Mechless)', preout: 2.0, bands: 7, type: 'single_din', desc: 'Preset EQ profiles, Bluetooth handsfree, SD/USB.' }
    ]
  },
  {
    id: 'blaupunkt',
    brand: 'Blaupunkt',
    country: 'Germany',
    models: [
      { id: 'blaupunkt_key_largo', brand: 'Blaupunkt', model: 'Key Largo 980', name: 'Blaupunkt Key Largo 980 (9"/10.1" Android)', preout: 2.0, bands: 16, type: 'android', wirelessCarPlay: true, desc: '16-Band DSP, 2.0V RCA outputs, 4GB RAM + 64GB ROM.' },
      { id: 'blaupunkt_san_diego', brand: 'Blaupunkt', model: 'San Diego 530', name: 'Blaupunkt San Diego 530 (6.2" Double DIN)', preout: 2.0, bands: 10, type: 'touchscreen', desc: '10-Band EQ, Front/Rear/Sub Pre-outs.' }
    ]
  },
  {
    id: 'oem_factory',
    brand: 'Factory OEM / Android',
    country: 'Global',
    models: [
      { id: 'factory_stock', brand: 'Factory OEM', model: 'Stock Infotainment', name: 'Factory Stock Screen (with High-to-Low Line Output Converter)', preout: 0.8, bands: 3, type: 'stock', desc: 'Factory speaker-level lines converted to RCA via LOC.' },
      { id: 'android_generic_12', brand: 'Android Aftermarket', model: 'Generic TS10 / T5', name: 'Generic Android Head Unit (12-Band DSP)', preout: 1.5, bands: 12, type: 'android', desc: 'Standard Android head unit with simulated DSP and 1.5V pre-outs.' }
    ]
  },
  {
    id: 'custom_hu',
    brand: 'Custom / Other',
    country: 'Custom',
    models: [
      { id: 'custom_headunit_spec', brand: 'Custom', model: 'Custom Head Unit', name: 'Custom / Unlisted Head Unit (Manual Specs)', preout: 2.0, bands: 10, type: 'custom', desc: 'Configure custom pre-out voltage and EQ band parameters.' }
    ]
  }
];

// -------------------------------------------------------------------------
// 2. FRONT / COMPONENT SPEAKER BRANDS & MODELS
// -------------------------------------------------------------------------
export const FRONT_SPEAKER_BRANDS: SpeakerBrandGroup[] = [
  {
    id: 'sony',
    brand: 'Sony',
    country: 'Japan',
    models: [
      { id: 'sony_xs162gs', brand: 'Sony', model: 'XS-162GS', name: 'Sony XS-162GS (6.5" 2-Way Components)', type: 'component', size: '6.5"', rms: 45, peak: 250, ohms: 4, hpf: 80, sensitivity: 89, tweeterType: '1" Silk Soft Dome', desc: 'Composite Polypropylene Cone, Foam Rubber Surround.' },
      { id: 'sony_xs160gs', brand: 'Sony', model: 'XS-160GS', name: 'Sony XS-160GS (6.5" 2-Way Coaxial)', type: 'coaxial', size: '6.5"', rms: 45, peak: 250, ohms: 4, hpf: 85, sensitivity: 89, tweeterType: 'Silk Dome Tweeter', desc: 'Wide dispersion coaxials for doors.' },
      { id: 'sony_xs162es', brand: 'Sony', model: 'XS-162ES', name: 'Sony Mobile ES XS-162ES (6.5" High-Res Components)', type: 'component', size: '6.5"', rms: 90, peak: 270, ohms: 4, hpf: 70, sensitivity: 89, tweeterType: '1" Synthetic Fiber Soft Dome', desc: 'MRC (Mica Reinforced Cellular) Aramid Fiber Matrix, Bi-Ampable Crossover.' },
      { id: 'sony_xs163es', brand: 'Sony', model: 'XS-163ES', name: 'Sony Mobile ES XS-163ES (3-Way Component System)', type: '3way', size: '6.5" + 3.5"', rms: 100, peak: 320, ohms: 4, hpf: 65, sensitivity: 89, tweeterType: '1" Soft Dome + 3.5" Midrange', desc: 'Audiophile 3-way stage with dedicated midrange drivers.' }
    ]
  },
  {
    id: 'pioneer',
    brand: 'Pioneer',
    country: 'Japan',
    models: [
      { id: 'pioneer_tsc601in', brand: 'Pioneer', model: 'TS-C601IN', name: 'Pioneer TS-C601IN (6.5" Special India Tuning)', type: 'component', size: '6.5"', rms: 60, peak: 380, ohms: 4, hpf: 80, sensitivity: 91, tweeterType: '29mm Balanced Dome', desc: 'Tuned specifically for Indian acoustic cabin preferences.' },
      { id: 'pioneer_tsa1600c', brand: 'Pioneer', model: 'TS-A1600C', name: 'Pioneer TS-A1600C (6.5" A-Series Components)', type: 'component', size: '6.5"', rms: 80, peak: 350, ohms: 4, hpf: 75, sensitivity: 91, tweeterType: '20mm Polyimide Hard Dome', desc: 'Carbon & MICA reinforced IMPP Cone.' },
      { id: 'pioneer_tsz65c', brand: 'Pioneer', model: 'TS-Z65C', name: 'Pioneer Z-Series TS-Z65C (High-Res 40kHz Components)', type: 'component', size: '6.5"', rms: 100, peak: 300, ohms: 4, hpf: 65, sensitivity: 88, tweeterType: '29mm Aluminum Alloy Dome', desc: 'Twaron aramid fiber cone, audiophile crossover with -3/0/+3dB attenuation.' },
      { id: 'pioneer_tsd65c', brand: 'Pioneer', model: 'TS-D65C', name: 'Pioneer D-Series TS-D65C (6.5" Open & Smooth)', type: 'component', size: '6.5"', rms: 90, peak: 270, ohms: 4, hpf: 70, sensitivity: 84, tweeterType: '26mm Polyester Soft Dome', desc: 'Aramid fiber interwoven with polypropylene.' }
    ]
  },
  {
    id: 'focal',
    brand: 'Focal',
    country: 'France',
    models: [
      { id: 'focal_ase165', brand: 'Focal', model: 'Auditor ASE 165', name: 'Focal Auditor ASE 165 (6.5" 2-Way Components)', type: 'component', size: '6.5"', rms: 60, peak: 120, ohms: 4, hpf: 75, sensitivity: 91.5, tweeterType: 'Inverted Mylar Dome', desc: 'Polypropylene cone, butyl surround, crisp French sound signature.' },
      { id: 'focal_ps165sf', brand: 'Focal', model: 'Slatefiber PS 165 SF', name: 'Focal Slatefiber PS 165 SF (6.5" Made in France)', type: 'component', size: '6.5"', rms: 80, peak: 160, ohms: 4, hpf: 70, sensitivity: 91, tweeterType: 'Aluminum/Magnesium Inverted Dome', desc: 'Recycled non-woven carbon fibers embedded in thermoplastic polymer.' },
      { id: 'focal_ps165fse', brand: 'Focal', model: 'Flax Evo PS 165 FSE', name: 'Focal Flax Evo PS 165 FSE (Slim 6.5" Audiophile)', type: 'component', size: '6.5"', rms: 60, peak: 120, ohms: 4, hpf: 70, sensitivity: 91.5, tweeterType: 'TAM Inverted M-Profile Dome', desc: 'Natural French Flax cone with TMD rubber surround.' },
      { id: 'focal_es165k', brand: 'Focal', model: 'K2 Power ES 165 K', name: 'Focal K2 Power ES 165 K (Yellow Aramid Kevlar)', type: 'component', size: '6.5"', rms: 100, peak: 200, ohms: 4, hpf: 60, sensitivity: 92.8, tweeterType: 'TKM M-Profile Aramid Fiber', desc: 'Iconic yellow K2 sandwich cone with high dynamic headroom.' }
    ]
  },
  {
    id: 'morel',
    brand: 'Morel',
    country: 'Israel',
    models: [
      { id: 'morel_maximo_ultra', brand: 'Morel', model: 'Maximo Ultra 602 HE', name: 'Morel Maximo Ultra 602 HE (High Efficiency 6.5")', type: 'component', size: '6.5"', rms: 90, peak: 180, ohms: 4, hpf: 70, sensitivity: 90.5, tweeterType: '25mm Soft Silk Dome', desc: 'Treated paper composite cone, warm, lush vocal tonality.' },
      { id: 'morel_tempo_ultra', brand: 'Morel', model: 'Tempo Ultra 602 MkII', name: 'Morel Tempo Ultra 602 MkII (High-Power 6.5")', type: 'component', size: '6.5"', rms: 120, peak: 250, ohms: 4, hpf: 65, sensitivity: 90, tweeterType: '28mm Acuflex Soft Dome', desc: 'Large 1.5" voice coil, high power handling, precise musical imaging.' },
      { id: 'morel_virtus_nano', brand: 'Morel', model: 'Virtus Nano Carbon 602', name: 'Morel Virtus Nano Carbon 602 (Ultra-Shallow 17mm)', type: 'component', size: '6.5"', rms: 100, peak: 300, ohms: 4, hpf: 70, sensitivity: 88, tweeterType: '28mm Acuflex Silk Dome', desc: 'Only 17mm mounting depth, ideal for shallow doors like Swift & Creta.' }
    ]
  },
  {
    id: 'hertz',
    brand: 'Hertz',
    country: 'Italy',
    models: [
      { id: 'hertz_uno_k165', brand: 'Hertz', model: 'Uno K 165', name: 'Hertz Uno K 165 (6.5" High-Sensitivity)', type: 'component', size: '6.5"', rms: 70, peak: 300, ohms: 4, hpf: 80, sensitivity: 93.5, tweeterType: '24mm Neodymium PEI Dome', desc: 'Water-repellent pressed paper cone, 93.5dB high-efficiency output.' },
      { id: 'hertz_dieci_dsk165', brand: 'Hertz', model: 'Dieci DSK 165.3', name: 'Hertz Dieci DSK 165.3 (6.5" 2-Way System)', type: 'component', size: '6.5"', rms: 80, peak: 160, ohms: 4, hpf: 75, sensitivity: 93, tweeterType: '24mm PEI Dome + Neodymium', desc: 'V-cone profile for best off-axis dispersion.' },
      { id: 'hertz_cento_ck165', brand: 'Hertz', model: 'Cento CK 165', name: 'Hertz Cento CK 165 (6.5" High-Fidelity)', type: 'component', size: '6.5"', rms: 95, peak: 285, ohms: 4, hpf: 70, sensitivity: 93, tweeterType: '26mm Tetolon Fiber Soft Dome', desc: 'SPP-M (Semi-Pressed Paper-Mica) cone with compact crossover.' }
    ]
  },
  {
    id: 'alpine',
    brand: 'Alpine',
    country: 'Japan',
    models: [
      { id: 'alpine_s2_s65c', brand: 'Alpine', model: 'S2-S65C', name: 'Alpine S-Series S2-S65C (Hi-Res 6.5" Components)', type: 'component', size: '6.5"', rms: 80, peak: 240, ohms: 4, hpf: 75, sensitivity: 88, tweeterType: '1" Silk Soft Dome', desc: 'Polypropylene, Glass Fiber, and Mica Cone Materials with HAMR Surround.' },
      { id: 'alpine_r2_s65c', brand: 'Alpine', model: 'R2-S65C', name: 'Alpine R-Series R2-S65C (High-Power 100W Hi-Res)', type: 'component', size: '6.5"', rms: 100, peak: 300, ohms: 4, hpf: 65, sensitivity: 88, tweeterType: '1" Magnesium Hard Dome (40kHz)', desc: 'Glass Fiber Reinforced Cone with multi-roll surround.' }
    ]
  },
  {
    id: 'jbl',
    brand: 'JBL (Harman)',
    country: 'USA',
    models: [
      { id: 'jbl_club_6500c', brand: 'JBL', model: 'Club 6500C', name: 'JBL Club 6500C (6.5" 3Ω Components)', type: 'component', size: '6.5"', rms: 60, peak: 180, ohms: 3, hpf: 80, sensitivity: 92, tweeterType: 'Edge-Driven Silk Dome', desc: '3Ω low impedance design extracts maximum power from amps/headunits.' },
      { id: 'jbl_stage3_607c', brand: 'JBL', model: 'Stage3 607C', name: 'JBL Stage3 607C (6.5" Plus One Cone)', type: 'component', size: '6.5"', rms: 50, peak: 250, ohms: 3, hpf: 85, sensitivity: 92, tweeterType: 'Edge-Driven Dome', desc: 'Plus One woofer cone architecture provides up to 35% more cone area.' },
      { id: 'jbl_stadium_62cf', brand: 'JBL', model: 'Stadium 62CF', name: 'JBL Stadium 62CF (Audiophile Aluminum Dome)', type: 'component', size: '6.5"', rms: 110, peak: 330, ohms: 3, hpf: 65, sensitivity: 93, tweeterType: '3/4" Aluminum Dome', desc: 'Converts to 3-way with optional Stadium 22S midrange.' }
    ]
  },
  {
    id: 'rockford',
    brand: 'Rockford Fosgate',
    country: 'USA',
    models: [
      { id: 'rockford_r165_s', brand: 'Rockford Fosgate', model: 'Prime R165-S', name: 'Rockford Fosgate Prime R165-S (6.5" 2-Way)', type: 'component', size: '6.5"', rms: 40, peak: 80, ohms: 4, hpf: 85, sensitivity: 89, tweeterType: '1/2" Mylar Balanced Dome', desc: 'Mica-injected polypropylene cone with foam surround.' },
      { id: 'rockford_p165_si', brand: 'Rockford Fosgate', model: 'Punch P165-SI', name: 'Rockford Fosgate Punch P165-SI (6.5" Component)', type: 'component', size: '6.5"', rms: 60, peak: 120, ohms: 4, hpf: 75, sensitivity: 89, tweeterType: '1" PEI Dome', desc: 'VAST (Vertical Attach Surround Technique) increases effective radiating area.' }
    ]
  },
  {
    id: 'blam',
    brand: 'Blam Audio',
    country: 'France',
    models: [
      { id: 'blam_relax_165rs', brand: 'Blam', model: 'Relax 165 RS', name: 'Blam Relax 165 RS (6.5" High-Efficiency 2Ω)', type: 'component', size: '6.5"', rms: 75, peak: 150, ohms: 2, hpf: 75, sensitivity: 93, tweeterType: '20mm Soft Dome', desc: '2Ω high-efficiency voice coil designed to boost output from factory/aftermarket amps.' },
      { id: 'blam_live_l165p', brand: 'Blam', model: 'Live L165P', name: 'Blam Live L165P Power System (3Ω 90W RMS)', type: 'component', size: '6.5"', rms: 90, peak: 180, ohms: 3, hpf: 65, sensitivity: 91.5, tweeterType: '25mm High-Resolution Soft Dome', desc: 'Machined cast aluminum basket with composite fiber cone.' }
    ]
  },
  {
    id: 'custom_spk',
    brand: 'Custom / Other',
    country: 'Custom',
    models: [
      { id: 'custom_front_speaker', brand: 'Custom', model: 'Custom Driver', name: 'Custom / Unlisted 2-Way Components (Manual Specs)', type: 'custom', size: '6.5"', rms: 60, peak: 180, ohms: 4, hpf: 80, sensitivity: 90, desc: 'Input custom RMS wattage and impedance.' }
    ]
  }
];

// -------------------------------------------------------------------------
// 3. REAR SPEAKER BRANDS & MODELS
// -------------------------------------------------------------------------
export const REAR_SPEAKER_BRANDS: SpeakerBrandGroup[] = [
  {
    id: 'none',
    brand: 'Rear Delete / None',
    country: 'Global',
    models: [
      { id: 'none', brand: 'None', model: 'Rear Delete', name: 'None / Rear Delete (Pure Front Soundstage SQ Setup)', type: 'stock', size: 'None', rms: 0, peak: 0, ohms: 4, hpf: 0, sensitivity: 0, desc: 'Rear channels muted to preserve pinpoint front vocal soundstage.' }
    ]
  },
  {
    id: 'sony',
    brand: 'Sony',
    country: 'Japan',
    models: [
      { id: 'sony_xs162gs_coax', brand: 'Sony', model: 'XS-160GS', name: 'Sony XS-160GS (6.5" 2-Way Coaxials)', type: 'coaxial', size: '6.5"', rms: 45, peak: 250, ohms: 4, hpf: 85, sensitivity: 89, desc: 'Matching rear door coaxials for XS-162GS front stage.' },
      { id: 'sony_xs_gtf1639', brand: 'Sony', model: 'XS-GTF1639', name: 'Sony XS-GTF1639 (6.5" 3-Way Coaxials)', type: 'coaxial', size: '6.5"', rms: 45, peak: 270, ohms: 4, hpf: 90, sensitivity: 90, desc: 'HOP aramid carbon fiber matrix woofer.' }
    ]
  },
  {
    id: 'pioneer',
    brand: 'Pioneer',
    country: 'Japan',
    models: [
      { id: 'pioneer_tsg1620f', brand: 'Pioneer', model: 'TS-G1620F', name: 'Pioneer TS-G1620F (6.5" 2-Way Coaxials)', type: 'coaxial', size: '6.5"', rms: 40, peak: 300, ohms: 4, hpf: 90, sensitivity: 89, desc: 'IMPP composite cone rear fill.' },
      { id: 'pioneer_tsa1670f', brand: 'Pioneer', model: 'TS-A1670F', name: 'Pioneer TS-A1670F (6.5" 3-Way Coaxials)', type: 'coaxial', size: '6.5"', rms: 70, peak: 320, ohms: 4, hpf: 85, sensitivity: 87, desc: 'High-power 3-way coaxial rear fill.' }
    ]
  },
  {
    id: 'jbl',
    brand: 'JBL (Harman)',
    country: 'USA',
    models: [
      { id: 'jbl_club_622', brand: 'JBL', model: 'Club 622', name: 'JBL Club 622 (6.5" 2-Way Coaxials 3Ω)', type: 'coaxial', size: '6.5"', rms: 60, peak: 180, ohms: 3, hpf: 85, sensitivity: 93, desc: '3-ohm architecture extracts maximum output.' },
      { id: 'jbl_stage2_624', brand: 'JBL', model: 'Stage2 624', name: 'JBL Stage2 624 (6.5" 2-Way Coaxials)', type: 'coaxial', size: '6.5"', rms: 40, peak: 240, ohms: 4, hpf: 90, sensitivity: 91, desc: 'Injection-molded polypropylene cone.' }
    ]
  },
  {
    id: 'focal',
    brand: 'Focal',
    country: 'France',
    models: [
      { id: 'focal_acx165', brand: 'Focal', model: 'Auditor ACX 165', name: 'Focal Auditor ACX 165 (6.5" 2-Way Coaxials)', type: 'coaxial', size: '6.5"', rms: 60, peak: 120, ohms: 4, hpf: 85, sensitivity: 91.5, desc: 'Inverted mylar dome tweeter for crisp ambient fill.' }
    ]
  },
  {
    id: 'hertz',
    brand: 'Hertz',
    country: 'Italy',
    models: [
      { id: 'hertz_dieci_dcx165', brand: 'Hertz', model: 'Dieci DCX 165.3', name: 'Hertz Dieci DCX 165.3 (6.5" 2-Way Coaxials)', type: 'coaxial', size: '6.5"', rms: 60, peak: 120, ohms: 4, hpf: 85, sensitivity: 93, desc: 'Neodymium tweeter with PEI dome.' }
    ]
  }
];

// -------------------------------------------------------------------------
// 4. POWER AMPLIFIER BRANDS & MODELS
// -------------------------------------------------------------------------
export const AMPLIFIER_BRANDS: AmplifierBrandGroup[] = [
  {
    id: 'installer_combos',
    brand: 'Installer Combos (Budget & Multi-Amp)',
    country: 'India / Global',
    models: [
      {
        id: 'moco_and_sb',
        brand: 'MOCO + Sound Barrier',
        model: 'AF-04 + SB-654 Dual Amp',
        name: 'Dual Amp Setup: MOCO AF-04 (4-Ch Doors 60W) + Sound Barrier SB-654 (Mono Sub 250W)',
        channels: '4-Ch + Mono',
        frontRms: 60,
        rearRms: 60,
        subRms: 250,
        ampClass: 'Class-AB',
        hasSubChannel: true,
        desc: 'Dedicated 4-channel AB amp for front/rear speakers + high current mono class-D sub block.'
      },
      {
        id: 'headunit_power',
        brand: 'Head Unit Power',
        model: 'Direct Internal IC',
        name: 'Direct Head Unit Internal Power (No External Amplifier ~18W RMS)',
        channels: '4-Ch Internal',
        frontRms: 18,
        rearRms: 18,
        subRms: 0,
        ampClass: 'Stock',
        hasSubChannel: false,
        desc: 'Running speakers directly off headunit internal MOSFET 4x50W Max (~18W RMS).'
      }
    ]
  },
  {
    id: 'sony',
    brand: 'Sony',
    country: 'Japan',
    models: [
      {
        id: 'sony_xm_n1004',
        brand: 'Sony',
        model: 'XM-N1004',
        name: 'Sony XM-N1004 (4-Channel 70W x 4 @ 4Ω / 175W x 2 Bridged)',
        channels: '4-Channel',
        frontRms: 70,
        rearRms: 70,
        subRms: 175,
        ampClass: 'Class-AB',
        hasSubChannel: false,
        desc: 'High power Class-AB amplifier with Automatic Thermal Control.'
      },
      {
        id: 'sony_xm_4es',
        brand: 'Sony',
        model: 'XM-4ES Mobile ES',
        name: 'Sony Mobile ES XM-4ES (4-Channel High-Res 100W x 4 @ 4Ω)',
        channels: '4-Channel',
        frontRms: 100,
        rearRms: 100,
        subRms: 330,
        ampClass: 'Class-D',
        hasSubChannel: false,
        desc: 'High-Resolution Class-D with optimized output coils for low noise.'
      },
      {
        id: 'sony_xm_5es',
        brand: 'Sony',
        model: 'XM-5ES Mobile ES',
        name: 'Sony Mobile ES XM-5ES (5-Channel 100W x 4 + 450W x 1 Sub)',
        channels: '5-Channel',
        frontRms: 100,
        rearRms: 100,
        subRms: 450,
        ampClass: 'Class-D',
        hasSubChannel: true,
        desc: 'All-in-one 5-channel system amplifier for 4 doors + dedicated 450W mono sub channel.'
      }
    ]
  },
  {
    id: 'pioneer',
    brand: 'Pioneer',
    country: 'Japan',
    models: [
      {
        id: 'pioneer_gm_dx874',
        brand: 'Pioneer',
        model: 'GM-DX874 Class-FD',
        name: 'Pioneer GM-DX874 (Hi-Res 100W x 4 @ 4Ω / 300W x 2 Bridged)',
        channels: '4-Channel',
        frontRms: 100,
        rearRms: 100,
        subRms: 300,
        ampClass: 'Class-D',
        hasSubChannel: false,
        desc: 'Class-FD high efficiency with gold plated terminals and high capacity capacitors.'
      },
      {
        id: 'pioneer_gm_e7004',
        brand: 'Pioneer',
        model: 'GM-E7004',
        name: 'Pioneer GM-E7004 (4-Channel 70W x 4 @ 4Ω)',
        channels: '4-Channel',
        frontRms: 70,
        rearRms: 70,
        subRms: 190,
        ampClass: 'Class-AB',
        hasSubChannel: false,
        desc: 'Budget-friendly reliable 4-channel power.'
      },
      {
        id: 'pioneer_gm_d9701',
        brand: 'Pioneer',
        model: 'GM-D9701 Monoblock',
        name: 'Pioneer GM-D9701 (Class-D Monoblock 500W @ 4Ω / 800W @ 2Ω / 1200W @ 1Ω)',
        channels: 'Monoblock Sub',
        frontRms: 0,
        rearRms: 0,
        subRms: 800,
        ampClass: 'Class-D',
        hasSubChannel: true,
        desc: 'Dedicated heavy subwoofer amplifier with wired bass boost remote.'
      }
    ]
  },
  {
    id: 'alpine',
    brand: 'Alpine',
    country: 'Japan',
    models: [
      {
        id: 'alpine_s2_a36f',
        brand: 'Alpine',
        model: 'S2-A36F',
        name: 'Alpine S-Series S2-A36F (Hi-Res 60W x 4 @ 4Ω / 90W x 4 @ 2Ω)',
        channels: '4-Channel',
        frontRms: 60,
        rearRms: 60,
        subRms: 180,
        ampClass: 'Class-D',
        hasSubChannel: false,
        desc: 'Hi-Res certified Class-D with redesigned heatsink.'
      },
      {
        id: 'alpine_r2_a60f',
        brand: 'Alpine',
        model: 'R2-A60F',
        name: 'Alpine R-Series R2-A60F (100W x 4 @ 4Ω / 150W x 4 @ 2Ω)',
        channels: '4-Channel',
        frontRms: 100,
        rearRms: 100,
        subRms: 300,
        ampClass: 'Class-D',
        hasSubChannel: false,
        desc: 'High damping factor for tight, controlled midbass.'
      }
    ]
  },
  {
    id: 'jbl',
    brand: 'JBL (Harman)',
    country: 'USA',
    models: [
      {
        id: 'jbl_club_a754',
        brand: 'JBL',
        model: 'Club A754',
        name: 'JBL Club A754 (75W x 4 @ 4Ω / 100W x 4 @ 2Ω / 200W x 2 Bridged)',
        channels: '4-Channel',
        frontRms: 75,
        rearRms: 75,
        subRms: 200,
        ampClass: 'Class-AB',
        hasSubChannel: false,
        desc: 'Variable crossovers and bass boost with speaker-level inputs.'
      },
      {
        id: 'jbl_club_a600',
        brand: 'JBL',
        model: 'Club A600 Monoblock',
        name: 'JBL Club A600 (Monoblock 350W @ 4Ω / 600W @ 2Ω)',
        channels: 'Monoblock Sub',
        frontRms: 0,
        rearRms: 0,
        subRms: 600,
        ampClass: 'Class-D',
        hasSubChannel: true,
        desc: 'Class-D mono subwoofer amplifier with phase switch and subsonic filter.'
      }
    ]
  },
  {
    id: 'dsp_brands',
    brand: 'DSP Amplifiers (Helix / Musway / Zapco)',
    country: 'Germany / USA',
    models: [
      {
        id: 'helix_v_eight_dsp',
        brand: 'Helix',
        model: 'V EIGHT DSP MK2',
        name: 'Helix V EIGHT DSP MK2 (8-Channel DSP Amp 75W x 8 @ 4Ω / 120W x 8 @ 2Ω)',
        channels: '8-Channel DSP',
        frontRms: 75,
        rearRms: 75,
        subRms: 400,
        ampClass: 'DSP-Amp',
        hasSubChannel: true,
        desc: '64-bit Audio DSP with 10 DSP channels and ACO platform.'
      },
      {
        id: 'musway_m6v3',
        brand: 'Musway',
        model: 'M6v3 DSP',
        name: 'Musway M6v3 (6-Channel Class-D DSP Amp 70W x 6 @ 4Ω)',
        channels: '6-Channel DSP',
        frontRms: 70,
        rearRms: 70,
        subRms: 210,
        ampClass: 'DSP-Amp',
        hasSubChannel: true,
        desc: 'Compact German-engineered Class-D DSP amplifier.'
      }
    ]
  },
  {
    id: 'custom_amp',
    brand: 'Custom / Other',
    country: 'Custom',
    models: [
      {
        id: 'custom_amplifier_spec',
        brand: 'Custom',
        model: 'Custom Amp',
        name: 'Custom / Unlisted Power Amplifier (Manual RMS Specs)',
        channels: '4-Channel',
        frontRms: 75,
        rearRms: 75,
        subRms: 250,
        ampClass: 'Class-D',
        hasSubChannel: true,
        desc: 'Manually specify per-channel RMS wattage.'
      }
    ]
  }
];

// -------------------------------------------------------------------------
// 5. SUBWOOFER & ENCLOSURE BRANDS & MODELS
// -------------------------------------------------------------------------
export const SUBWOOFER_BRANDS: SubwooferBrandGroup[] = [
  {
    id: 'pioneer',
    brand: 'Pioneer',
    country: 'Japan',
    models: [
      {
        id: 'pioneer_tsw307',
        brand: 'Pioneer',
        model: 'TS-W307D4 Ported 35Hz',
        name: 'Pioneer TS-W307D4 (12" DVC Ported Box @ 35Hz Slot Port)',
        type: 'ported',
        size: '12"',
        tuneHz: 35,
        rms: 250,
        peak: 1000,
        ohms: 8,
        voiceCoil: 'DVC 4Ω (2Ω/8Ω)',
        desc: 'Deep loud bass tuned for Punjabi, Hip-Hop & EDM.'
      },
      {
        id: 'pioneer_tsw312d4',
        brand: 'Pioneer',
        model: 'TS-W312D4 Champion Series',
        name: 'Pioneer TS-W312D4 (12" Champion Series Ported @ 36Hz)',
        type: 'ported',
        size: '12"',
        tuneHz: 36,
        rms: 500,
        peak: 1600,
        ohms: 2,
        voiceCoil: 'DVC 4Ω (2Ω/8Ω)',
        desc: 'High SPL champion series with dual spider and honeycomb cone.'
      },
      {
        id: 'pioneer_tswx130ea',
        brand: 'Pioneer',
        model: 'TS-WX130EA Underseat',
        name: 'Pioneer TS-WX130EA (8" Underseat Compact Active Subwoofer)',
        type: 'underseat',
        size: '8"',
        tuneHz: 0,
        rms: 50,
        peak: 160,
        ohms: 4,
        voiceCoil: 'Active Amp',
        desc: 'Stealth underseat bass with built-in Class-D amplifier.'
      }
    ]
  },
  {
    id: 'jbl',
    brand: 'JBL (Harman)',
    country: 'USA',
    models: [
      {
        id: 'jbl_basspro12',
        brand: 'JBL',
        model: 'BassPro 12 Ported',
        name: 'JBL BassPro 12 (12" Factory Ported Enclosure @ 38Hz Slipstream)',
        type: 'ported',
        size: '12"',
        tuneHz: 38,
        rms: 150,
        peak: 450,
        ohms: 4,
        voiceCoil: 'SVC 4Ω',
        desc: 'Patented Slipstream port design eliminates port turbulence and chuffing.'
      },
      {
        id: 'jbl_basspro_hub',
        brand: 'JBL',
        model: 'BassPro Hub Spare Wheel',
        name: 'JBL BassPro Hub (11" Spare Wheel Well Active Subwoofer 200W)',
        type: 'spare_wheel',
        size: '11"',
        tuneHz: 0,
        rms: 200,
        peak: 600,
        ohms: 4,
        voiceCoil: 'Active Amp',
        desc: 'Mounts completely inside the spare wheel well with zero loss of boot luggage space.'
      },
      {
        id: 'jbl_club_1224',
        brand: 'JBL',
        model: 'Club 1224 SSI',
        name: 'JBL Club 1224 (12" Selectable Smart Impedance 2Ω/4Ω Sealed Box)',
        type: 'sealed',
        size: '12"',
        tuneHz: 0,
        rms: 275,
        peak: 1100,
        ohms: 4,
        voiceCoil: 'SVC 4Ω',
        desc: 'SSI switch allows instant toggle between 2-ohm and 4-ohm load.'
      }
    ]
  },
  {
    id: 'sony',
    brand: 'Sony',
    country: 'Japan',
    models: [
      {
        id: 'sony_xsw124gs',
        brand: 'Sony',
        model: 'XS-W124GS Ported 34Hz',
        name: 'Sony XS-W124GS (12" 4Ω SVC Ported Box @ 34Hz)',
        type: 'ported',
        size: '12"',
        tuneHz: 34,
        rms: 350,
        peak: 1800,
        ohms: 4,
        voiceCoil: 'SVC 4Ω',
        desc: 'Dimpled cone woofer with stroke stabilizer rubber surround.'
      },
      {
        id: 'sony_xs_aw8',
        brand: 'Sony',
        model: 'XS-AW8 Underseat',
        name: 'Sony XS-AW8 (8" Slim Underseat Active Subwoofer 75W RMS)',
        type: 'underseat',
        size: '8"',
        tuneHz: 0,
        rms: 75,
        peak: 160,
        ohms: 4,
        voiceCoil: 'Active Amp',
        desc: 'Compact sealed cast-aluminum chassis with wired bass remote.'
      }
    ]
  },
  {
    id: 'rockford',
    brand: 'Rockford Fosgate',
    country: 'USA',
    models: [
      {
        id: 'rockford_p3d4_12',
        brand: 'Rockford Fosgate',
        model: 'Punch P3D4-12 Sealed 1.25 cu ft',
        name: 'Rockford Fosgate Punch P3D4-12 (12" 600W RMS Sealed Box)',
        type: 'sealed',
        size: '12"',
        tuneHz: 0,
        rms: 600,
        peak: 1200,
        ohms: 2,
        voiceCoil: 'DVC 4Ω (2Ω/8Ω)',
        desc: 'Anodized aluminum cone and dustcap with VAST surround.'
      },
      {
        id: 'rockford_p300_12',
        brand: 'Rockford Fosgate',
        model: 'Punch P300-12 Powered',
        name: 'Rockford Fosgate Punch P300-12 (12" All-In-One 300W Powered Sub)',
        type: 'sealed',
        size: '12"',
        tuneHz: 0,
        rms: 300,
        peak: 600,
        ohms: 4,
        voiceCoil: 'Active Amp',
        desc: 'Closed-loop design with built-in 300W amplifier and quick-disconnect harness.'
      }
    ]
  },
  {
    id: 'alpine',
    brand: 'Alpine',
    country: 'Japan',
    models: [
      {
        id: 'alpine_sw12',
        brand: 'Alpine',
        model: 'S-W12D4 Custom Ported 33Hz',
        name: 'Alpine S-Series S-W12D4 (12" DVC Custom Ported @ 33Hz)',
        type: 'ported',
        size: '12"',
        tuneHz: 33,
        rms: 600,
        peak: 1800,
        ohms: 2,
        voiceCoil: 'DVC 4Ω (2Ω/8Ω)',
        desc: 'Ultra-deep sub-bass extension down to 25Hz.'
      },
      {
        id: 'alpine_pwe_s8',
        brand: 'Alpine',
        model: 'PWE-S8 Underseat',
        name: 'Alpine PWE-S8 (8" Quad-Coil Underseat Active Subwoofer 120W)',
        type: 'underseat',
        size: '8"',
        tuneHz: 0,
        rms: 120,
        peak: 240,
        ohms: 4,
        voiceCoil: 'Active Amp',
        desc: 'Die-cast aluminum frame with side-panel controls.'
      }
    ]
  },
  {
    id: 'focal',
    brand: 'Focal',
    country: 'France',
    models: [
      {
        id: 'focal_sub_p25db',
        brand: 'Focal',
        model: 'Sub P 25 DB Sealed',
        name: 'Focal Performance Sub P 25 DB (10" 250W RMS Sealed Box)',
        type: 'sealed',
        size: '10"',
        tuneHz: 0,
        rms: 250,
        peak: 500,
        ohms: 2,
        voiceCoil: 'DVC 4Ω (2Ω/8Ω)',
        desc: 'Polypropylene cone with high excursion for deep, punchy musical bass.'
      }
    ]
  },
  {
    id: 'none',
    brand: 'No Subwoofer Installed',
    country: 'Global',
    models: [
      {
        id: 'none',
        brand: 'None',
        model: 'No Subwoofer',
        name: 'No Subwoofer Installed (Door Speakers Full-Range)',
        type: 'none',
        size: 'None',
        tuneHz: 0,
        rms: 0,
        peak: 0,
        ohms: 0,
        voiceCoil: 'None',
        desc: 'Doors handle lower frequencies without dedicated sub.'
      }
    ]
  }
];

// -------------------------------------------------------------------------
// FLATTENED BACKWARD-COMPATIBLE OPTION EXPORTS
// -------------------------------------------------------------------------
export const HEAD_UNIT_OPTIONS = HEAD_UNIT_BRANDS.flatMap((b) => b.models);
export const FRONT_SPEAKER_OPTIONS = FRONT_SPEAKER_BRANDS.flatMap((b) => b.models);
export const REAR_SPEAKER_OPTIONS = REAR_SPEAKER_BRANDS.flatMap((b) => b.models);
export const AMPLIFIER_OPTIONS = AMPLIFIER_BRANDS.flatMap((b) => b.models);
export const SUBWOOFER_OPTIONS = SUBWOOFER_BRANDS.flatMap((b) => b.models);
