/**
 * CarAudioAI - Acoustic Sound Deadening & Damping Sheet Calculator
 * Calculates precise vibration damping (butyl sheet) & acoustic absorption (closed-cell foam)
 * coverage by car body panel and category.
 */

export interface PanelDampingSpec {
  id: string;
  name: string;
  description: string;
  areaSqFt: number;
  layers: "single" | "dual" | "triple";
  sheetsRequired: number; // Based on standard 4 sq. ft per sheet (e.g. 500mm x 750mm)
  materialType: string;
  noiseBenefitDb: number;
  weightKg: number;
}

export interface VehicleDampingPlan {
  vehicleCategory: string;
  panels: PanelDampingSpec[];
  totalAreaSqFt: number;
  totalSheetsRequired: number;
  totalWeightAddedKg: number;
  expectedRoadNoiseReductionDb: number;
  acousticRecommendations: string[];
}

export function calculateVehicleDamping(
  category: "Hatchback" | "Sedan" | "Compact SUV" | "Midsize SUV" | "Full-Size SUV" | string,
  includeRoof: boolean = true,
  includeFloor: boolean = true
): VehicleDampingPlan {
  // Base scale factors by cabin size
  let scale = 1.0;
  if (category.includes("Hatchback")) scale = 0.85;
  else if (category.includes("Sedan")) scale = 1.0;
  else if (category.includes("Compact SUV")) scale = 1.1;
  else if (category.includes("Midsize SUV")) scale = 1.25;
  else if (category.includes("Full-Size SUV")) scale = 1.45;

  const panels: PanelDampingSpec[] = [
    {
      id: "doors_front",
      name: "Front Doors (Dual-Layer Acoustic Seal)",
      description: "Outer door skin damping + Inner service holes barrier seal to form a rigid speaker baffle enclosure.",
      areaSqFt: +(10.0 * scale).toFixed(1),
      layers: "dual",
      sheetsRequired: Math.ceil(10.0 * scale / 3.8),
      materialType: "2.0mm Butyl + 100μm Aluminum Foil",
      noiseBenefitDb: 2.2,
      weightKg: +(3.2 * scale).toFixed(1),
    },
    {
      id: "doors_rear",
      name: "Rear Doors (Outer Skin & Door Card)",
      description: "Vibration deadening on outer metal skin and acoustic egg-crate foam on plastic door trims.",
      areaSqFt: +(8.0 * scale).toFixed(1),
      layers: "dual",
      sheetsRequired: Math.ceil(8.0 * scale / 3.8),
      materialType: "2.0mm Butyl + 6mm Closed-Cell Foam",
      noiseBenefitDb: 1.5,
      weightKg: +(2.6 * scale).toFixed(1),
    },
    {
      id: "trunk_floor",
      name: "Trunk Floor & Spare Wheel Well",
      description: "Eliminates bass cancellation caused by vibrating spare wheel well and boot sheet metal flexing.",
      areaSqFt: +(12.0 * scale).toFixed(1),
      layers: "dual",
      sheetsRequired: Math.ceil(12.0 * scale / 3.8),
      materialType: "2.5mm Heavy Butyl Damping",
      noiseBenefitDb: 1.8,
      weightKg: +(4.5 * scale).toFixed(1),
    },
  ];

  if (includeRoof) {
    panels.push({
      id: "roof",
      name: "Roof / Headliner Panel",
      description: "Damps rain noise and stops massive sheet metal resonance when subwoofer delivers sub-40Hz SPL.",
      areaSqFt: +(14.0 * scale).toFixed(1),
      layers: "single",
      sheetsRequired: Math.ceil(14.0 * scale / 3.8),
      materialType: "2.0mm Butyl + 10mm Thermal Acoustic Foam",
      noiseBenefitDb: 1.4,
      weightKg: +(4.0 * scale).toFixed(1),
    });
  }

  if (includeFloor) {
    panels.push({
      id: "cabin_floor",
      name: "Cabin Floor & Firewall",
      description: "Blocks direct tyre roar, road texture vibration, and engine exhaust drone through floorpan.",
      areaSqFt: +(20.0 * scale).toFixed(1),
      layers: "triple",
      sheetsRequired: Math.ceil(20.0 * scale / 3.8),
      materialType: "3.0mm Multi-Layer Butyl + Mass Loaded Vinyl Barrier",
      noiseBenefitDb: 2.8,
      weightKg: +(8.5 * scale).toFixed(1),
    });
  }

  const totalArea = +panels.reduce((sum, p) => sum + p.areaSqFt, 0).toFixed(1);
  const totalSheets = panels.reduce((sum, p) => sum + p.sheetsRequired, 0);
  const totalWeight = +panels.reduce((sum, p) => sum + p.weightKg, 0).toFixed(1);
  const totalNoiseRed = +Math.min(6.5, panels.reduce((sum, p) => sum + p.noiseBenefitDb * 0.65, 0)).toFixed(1);

  return {
    vehicleCategory: category,
    panels,
    totalAreaSqFt: totalArea,
    totalSheetsRequired: totalSheets,
    totalWeightAddedKg: totalWeight,
    expectedRoadNoiseReductionDb: totalNoiseRed,
    acousticRecommendations: [
      "Door sealing transforms hollow door cavities into rigid sealed enclosures, improving mid-bass punch by +3 to +4.5 dB.",
      "Always degrease metal panels with Isopropyl Alcohol (IPA) before rolling butyl sheets with a ribbed roller to avoid air bubbles.",
      "Deadening trunk floor and wheel arches increases perceived subwoofer bass cleanliness by reducing standing wave panel flex.",
    ],
  };
}
