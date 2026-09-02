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
