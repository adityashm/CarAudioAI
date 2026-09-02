import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { tokens } from '../../design-system/tokens';
import { InstrumentPanel } from '../ui/InstrumentPanel';
import { Readout } from '../ui/Readout';
import { Button } from '../ui/Button';
import {
  INDIAN_CAR_MAKES,
  VehicleMake,
  CarModelData,
} from '../../constants/catalog';
import { CarBrandLogo } from '../ui/CarBrandLogo';

const SPEED_OF_SOUND = 34.3; // cm/ms @ 20°C

export interface StepMakeModelProps {
  selectedMake: VehicleMake;
  selectedModel: CarModelData;
  onSelectMake: (make: VehicleMake) => void;
  onSelectModel: (model: CarModelData) => void;
  onContinue?: () => void;
}

export const StepMakeModel: React.FC<StepMakeModelProps> = ({
  selectedMake,
  selectedModel,
  onSelectMake,
  onSelectModel,
  onContinue,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Filter makes and models based on search query
  const filteredMakes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return INDIAN_CAR_MAKES;

    return INDIAN_CAR_MAKES.map((make) => {
      const makeMatches = make.name.toLowerCase().includes(query) || make.country.toLowerCase().includes(query);
      const matchingModels = make.models.filter(
        (m) =>
          m.model.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query) ||
          m.year.toLowerCase().includes(query)
      );
      if (makeMatches) return make;
      if (matchingModels.length > 0) {
        return { ...make, models: matchingModels };
      }
      return null;
    }).filter(Boolean) as VehicleMake[];
  }, [searchQuery]);

  // All available categories across all models
  const categories = useMemo(() => {
    const set = new Set<string>();
    INDIAN_CAR_MAKES.forEach((make) => {
      make.models.forEach((m) => set.add(m.category));
    });
    return ['ALL', ...Array.from(set)];
  }, []);

  // Filter models for currently selected make
  const displayedModels = useMemo(() => {
    let list = selectedMake.models;
    if (activeCategoryFilter !== 'ALL') {
      list = list.filter((m) => m.category === activeCategoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.model.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.year.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedMake, activeCategoryFilter, searchQuery]);

  // Calculate RHD Time Alignment Delays for selected car
  const delays = useMemo(() => {
    const dist = selectedModel.distances_rhd;
    const maxDist = Math.max(dist.FL, dist.FR, dist.RL, dist.RR, dist.SUB);
    return {
      FL: +((maxDist - dist.FL) / SPEED_OF_SOUND).toFixed(2),
      FR: +((maxDist - dist.FR) / SPEED_OF_SOUND).toFixed(2),
      RL: +((maxDist - dist.RL) / SPEED_OF_SOUND).toFixed(2),
      RR: +((maxDist - dist.RR) / SPEED_OF_SOUND).toFixed(2),
      SUB: +((maxDist - dist.SUB) / SPEED_OF_SOUND).toFixed(2),
      maxDist,
    };
  }, [selectedModel]);

  // Cabin Volume in Liters (1 m3 = 1000 L)
  const cabinVolumeLiters = Math.round(selectedModel.cabinVolumeM3 * 1000);

  return (
    <View style={styles.container}>
      {/* Header Overview */}
      <View style={styles.introHeader}>
        <Text style={styles.stepTitle}>VEHICLE SEATING & CABIN GEOMETRY</Text>
        <Text style={styles.stepSubtitle}>
          Select your Indian market vehicle to load factory RHD driver dimensions, cabin volume, and standing wave resonance.
        </Text>
      </View>

      {/* Search & Category Filter Bar */}
      <InstrumentPanel variant="flat" noPadding style={styles.searchPanel}>
        <View style={styles.searchBarRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search manufacturer or model (e.g. Skoda Kylaq, Thar, Creta, Swift)..."
            placeholderTextColor={tokens.colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                activeCategoryFilter === cat && styles.categoryPillActive,
              ]}
              onPress={() => setActiveCategoryFilter(cat)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  activeCategoryFilter === cat && styles.categoryPillTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </InstrumentPanel>

      {/* 1. Indian Vehicle Manufacturers (9 Makes) */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>1. INDIAN MANUFACTURERS</Text>
          <Text style={styles.sectionCountText}>
            {filteredMakes.length} OF {INDIAN_CAR_MAKES.length} BRANDS
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.makesScrollRow}
        >
          {filteredMakes.map((make) => {
            const isSelected = selectedMake.id === make.id;
            return (
              <TouchableOpacity
                key={make.id}
                style={[
                  styles.makeCard,
                  isSelected && styles.makeCardActive,
                  isSelected && { borderColor: make.badgeColor },
                ]}
                onPress={() => {
                  onSelectMake(make);
                  // Default to first model in newly selected make
                  if (make.models.length > 0) {
                    onSelectModel(make.models[0]);
                  }
                }}
              >
                <View style={styles.makeCardTop}>
                  <View
                    style={[
                      styles.makeLogoFrame,
                      isSelected && { backgroundColor: '#161b24', borderColor: make.badgeColor }
                    ]}
                  >
                    <CarBrandLogo
                      makeId={make.id}
                      size={28}
                      color={isSelected ? '#ffffff' : make.badgeColor}
                      isSelected={isSelected}
                    />
                  </View>
                  <View style={styles.makeCountryBadge}>
                    <View style={[styles.makeBadgeDot, { backgroundColor: make.badgeColor }]} />
                    <Text style={styles.makeCountry}>{make.country.split('/')[0].trim()}</Text>
                  </View>
                </View>

                <Text style={[styles.makeName, isSelected && styles.textWhite]}>
                  {make.name}
                </Text>

                <View style={[styles.makeModelCount, isSelected && { backgroundColor: make.badgeColor + '22' }]}>
                  <Text style={[styles.makeModelCountText, isSelected && { color: make.badgeColor, fontWeight: 'bold' }]}>
                    {make.models.length} {make.models.length === 1 ? 'MODEL' : 'MODELS'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. Model Selector */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>2. {selectedMake.name.toUpperCase()} CABIN MODELS</Text>
          <Text style={styles.sectionCountText}>
            {displayedModels.length} AVAILABLE
          </Text>
        </View>

        <View style={styles.modelsGrid}>
          {displayedModels.map((model) => {
            const isSelected = selectedModel.id === model.id;
            return (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelCard,
                  isSelected && styles.modelCardActive,
                ]}
                onPress={() => onSelectModel(model)}
              >
                <View style={styles.modelCardHeader}>
                  <View style={styles.modelTitleGroup}>
                    <Text style={[styles.modelTitle, isSelected && styles.textWhite]}>
                      {model.model}
                    </Text>
                    <Text style={styles.modelYear}>{model.year}</Text>
                  </View>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{model.category}</Text>
                  </View>
                </View>

                {/* Micro Readout Bar */}
                <View style={styles.microTelemetryRow}>
                  <View style={styles.microCell}>
                    <Text style={styles.microLabel}>VOL</Text>
                    <Text style={styles.microVal}>{model.cabinVolumeM3} m³</Text>
                  </View>
                  <View style={styles.microDivider} />
                  <View style={styles.microCell}>
                    <Text style={styles.microLabel}>WHEELBASE</Text>
                    <Text style={styles.microVal}>{model.wheelbase} mm</Text>
                  </View>
                  <View style={styles.microDivider} />
                  <View style={styles.microCell}>
                    <Text style={styles.microLabel}>RESONANCE</Text>
                    <Text style={styles.microVal}>{model.resonantFreqHz} Hz</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Selected Cabin Acoustic Geometry & RHD Dimensions */}
      <InstrumentPanel
        variant="elevated"
        title={${selectedMake.name}  — ACOUSTIC GEOMETRY}
        subtitle="RHD (Right-Hand Drive) Indian Driver Seating Geometry & Standing Wave Modes"
        badge={selectedModel.category.toUpperCase()}
        status="ok"
        style={styles.telemetryPanel}
      >
        {/* Primary In-Cabin Acoustic Readouts */}
        <View style={styles.readoutGrid3}>
          <Readout
            label="CABIN VOLUME"
            value={selectedModel.cabinVolumeM3}
            unit="m³"
            secondaryValue={cabinVolumeLiters}
            secondaryUnit="L"
            size="md"
          />
          <Readout
            label="STANDING WAVE MODE"
            value={selectedModel.resonantFreqHz}
            unit="Hz"
            secondaryValue="IN-CABIN BOOM"
            size="md"
            status={selectedModel.resonantFreqHz >= 200 ? 'warning' : 'normal'}
          />
          <Readout
            label="WHEELBASE SPAN"
            value={selectedModel.wheelbase}
            unit="mm"
            secondaryValue="MQB/CHASSIS"
            size="md"
          />
        </View>

        {/* Driver RHD Seating Distances & Delay Alignment */}
        <View style={styles.geometrySubSection}>
          <View style={styles.geometryHeaderRow}>
            <Text style={styles.geometryTitle}>
              DRIVER (FRONT RIGHT) SEATING DISTANCES & DELAYS
            </Text>
            <Text style={styles.speedFormulaText}>
              DELAY = ΔDIST / 34.3 cm/ms
            </Text>
          </View>

          <View style={styles.distancesGrid}>
            <View style={styles.distanceItem}>
              <View style={styles.speakerPill}>
                <Text style={styles.speakerPillText}>FR (DRIVER)</Text>
              </View>
              <Readout
                label="DISTANCE"
                value={selectedModel.distances_rhd.FR}
                unit="cm"
                size="sm"
                orientation="horizontal"
              />
              <Readout
                label="DELAY"
                value={delays.FR}
                unit="ms"
                size="sm"
                orientation="horizontal"
                status="warning"
              />
            </View>

            <View style={styles.distanceItem}>
              <View style={styles.speakerPill}>
                <Text style={styles.speakerPillText}>FL (PASSENGER)</Text>
              </View>
              <Readout
                label="DISTANCE"
                value={selectedModel.distances_rhd.FL}
                unit="cm"
                size="sm"
                orientation="horizontal"
              />
              <Readout
                label="DELAY"
                value={delays.FL}
                unit="ms"
                size="sm"
                orientation="horizontal"
              />
            </View>

            <View style={styles.distanceItem}>
              <View style={styles.speakerPill}>
                <Text style={styles.speakerPillText}>RR (REAR RIGHT)</Text>
              </View>
              <Readout
                label="DISTANCE"
                value={selectedModel.distances_rhd.RR}
                unit="cm"
                size="sm"
                orientation="horizontal"
              />
              <Readout
                label="DELAY"
                value={delays.RR}
                unit="ms"
                size="sm"
                orientation="horizontal"
              />
            </View>

            <View style={styles.distanceItem}>
              <View style={styles.speakerPill}>
                <Text style={styles.speakerPillText}>RL (REAR LEFT)</Text>
              </View>
              <Readout
                label="DISTANCE"
                value={selectedModel.distances_rhd.RL}
                unit="cm"
                size="sm"
                orientation="horizontal"
              />
              <Readout
                label="DELAY"
                value={delays.RL}
                unit="ms"
                size="sm"
                orientation="horizontal"
              />
            </View>

            <View style={styles.distanceItem}>
              <View style={[styles.speakerPill, styles.subPill]}>
                <Text style={styles.speakerPillText}>SUB (BOOT)</Text>
              </View>
              <Readout
                label="DISTANCE"
                value={selectedModel.distances_rhd.SUB}
                unit="cm"
                size="sm"
                orientation="horizontal"
              />
              <Readout
                label="DELAY"
                value={delays.SUB}
                unit="ms"
                size="sm"
                orientation="horizontal"
                status="ok"
              />
            </View>
          </View>
        </View>

        {/* Speaker Factory Mounting Constraints */}
        <View style={styles.speakerMountBox}>
          <Text style={styles.speakerMountTitle}>FACTORY SPEAKER FITMENT SPECS</Text>
          <View style={styles.speakerMountRow}>
            <View style={styles.fitmentCell}>
              <Text style={styles.fitmentKey}>Front Stage:</Text>
              <Text style={styles.fitmentVal}>{selectedModel.speakerSizes.front}</Text>
            </View>
            <View style={styles.fitmentCell}>
              <Text style={styles.fitmentKey}>Tweeter Location:</Text>
              <Text style={styles.fitmentVal}>{selectedModel.speakerSizes.tweeterLocation}</Text>
            </View>
            <View style={styles.fitmentCell}>
              <Text style={styles.fitmentKey}>Rear Doors:</Text>
              <Text style={styles.fitmentVal}>{selectedModel.speakerSizes.rear}</Text>
            </View>
            <View style={styles.fitmentCell}>
              <Text style={styles.fitmentKey}>Max Depth:</Text>
              <Text style={styles.fitmentVal}>{selectedModel.speakerSizes.maxDepthMm} mm</Text>
            </View>
          </View>
        </View>

        {/* Continue to Step 2 Button */}
        {onContinue && (
          <View style={styles.actionRow}>
            <Button
              label={Configure Audio Gear for  →}
              variant="solid"
              size="lg"
              onPress={onContinue}
              style={styles.continueBtn}
            />
          </View>
        )}
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
  searchPanel: {
    padding: 0,
    overflow: 'hidden',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    backgroundColor: tokens.colors.bg.inset,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.hairline,
  },
  searchIcon: {
    fontSize: tokens.typography.sizes.base,
    marginRight: tokens.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.sm,
    color: tokens.colors.text.primary,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  clearBtn: {
    padding: tokens.spacing.xs,
  },
  clearBtnText: {
    fontFamily: tokens.typography.fontFamily.mono,
    color: tokens.colors.text.muted,
    fontSize: tokens.typography.sizes.xs,
  },
  categoryPillsContainer: {
    flexDirection: 'row',
    gap: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs + 2,
  },
  categoryPill: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    borderColor: tokens.colors.border.hairline,
    backgroundColor: tokens.colors.bg.panel,
  },
  categoryPillActive: {
    borderColor: tokens.colors.border.active,
    backgroundColor: tokens.colors.bg.elevated,
  },
  categoryPillText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.medium,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.3,
  },
  categoryPillTextActive: {
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.semibold,
  },
  sectionBlock: {
    gap: tokens.spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs + 1,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
  },
  sectionCountText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs - 1,
    color: tokens.colors.text.muted,
  },
  makesScrollRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    paddingVertical: 2,
  },
  makeCard: {
    width: 155,
    backgroundColor: tokens.colors.bg.panel,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    gap: tokens.spacing.xs,
    justifyContent: 'space-between',
  },
  makeCardActive: {
    backgroundColor: tokens.colors.bg.elevated,
  },
  makeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  makeLogoFrame: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.sm + 2,
    backgroundColor: tokens.colors.bg.inset,
    borderWidth: 1,
    borderColor: tokens.colors.border.hairline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  makeCountryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  makeBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  makeCountry: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: 9,
    color: tokens.colors.text.muted,
    textTransform: 'uppercase',
  },
  makeName: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.base,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.primary,
  },
  makeModelCount: {
    marginTop: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: tokens.radius.full,
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.bg.inset,
  },
  makeModelCountText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    color: tokens.colors.text.secondary,
  },
  modelsGrid: {
    gap: tokens.spacing.sm,
  },
  modelCard: {
    backgroundColor: tokens.colors.bg.panel,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  modelCardActive: {
    borderColor: tokens.colors.border.active,
    backgroundColor: tokens.colors.bg.elevated,
  },
  modelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modelTitleGroup: {
    gap: 2,
  },
  modelTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.primary,
  },
  modelYear: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.muted,
  },
  categoryBadge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs - 1,
    fontWeight: tokens.typography.weights.medium,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
  },
  microTelemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
  },
  microCell: {
    alignItems: 'center',
    gap: 2,
  },
  microDivider: {
    width: 1,
    height: 16,
    backgroundColor: tokens.colors.border.hairline,
  },
  microLabel: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: 9,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.muted,
  },
  microVal: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
  },
  telemetryPanel: {
    gap: tokens.spacing.md,
  },
  readoutGrid3: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    flexWrap: 'wrap',
  },
  geometrySubSection: {
    gap: tokens.spacing.sm,
    paddingTop: tokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.hairline,
  },
  geometryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
  },
  geometryTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
  },
  speedFormulaText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 10,
    color: tokens.colors.text.muted,
  },
  distancesGrid: {
    gap: tokens.spacing.xs,
  },
  distanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs + 2,
    gap: tokens.spacing.sm,
  },
  speakerPill: {
    width: 110,
  },
  subPill: {},
  speakerPillText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
  },
  speakerMountBox: {
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    padding: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  speakerMountTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
  },
  speakerMountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
  },
  fitmentCell: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'baseline',
  },
  fitmentKey: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.muted,
  },
  fitmentVal: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.medium,
  },
  actionRow: {
    marginTop: tokens.spacing.sm,
  },
  continueBtn: {
    width: '100%',
  },
  textWhite: {
    color: tokens.colors.text.primary,
  },
});

export default StepMakeModel;
