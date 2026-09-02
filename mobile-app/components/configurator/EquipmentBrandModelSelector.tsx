import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';

interface BrandGroup<T> {
  id: string;
  brand: string;
  country?: string;
  models: T[];
}

interface EquipmentBrandModelSelectorProps<T extends { id: string; name: string; model?: string; desc?: string }> {
  categoryTitle: string;
  categoryNumber: string;
  icon: string;
  brandGroups: BrandGroup<T>[];
  selectedItem: T;
  onSelectItem: (item: T) => void;
  renderCustomBadge?: (item: T) => React.ReactNode;
}

export default function EquipmentBrandModelSelector<T extends { id: string; name: string; model?: string; desc?: string; rms?: number; ohms?: number; preout?: number; tuneHz?: number; hpf?: number }>({
  categoryTitle,
  categoryNumber,
  icon,
  brandGroups,
  selectedItem,
  onSelectItem,
}: EquipmentBrandModelSelectorProps<T>) {
  // Find initial brand of the selected item
  const initialBrandId = brandGroups.find((b) => b.models.some((m) => m.id === selectedItem.id))?.id || brandGroups[0]?.id || '';
  const [selectedBrandId, setSelectedBrandId] = useState<string>(initialBrandId);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeBrandGroup = brandGroups.find((b) => b.id === selectedBrandId) || brandGroups[0];

  const filteredModels = (activeBrandGroup?.models || []).filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.model && m.model.toLowerCase().includes(q)) ||
      (m.desc && m.desc.toLowerCase().includes(q))
    );
  });

  return (
    <View style={styles.container}>
      {/* Category Header */}
      <View style={styles.categoryHeader}>
        <View style={styles.categoryTitleGroup}>
          <Text style={styles.categoryNumber}>{categoryNumber}</Text>
          <Text style={styles.categoryTitle}>{categoryTitle}</Text>
        </View>
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>
            Selected: <Text style={styles.textWhite}>{selectedItem.model || selectedItem.name.split('(')[0]}</Text>
          </Text>
        </View>
      </View>

      {/* Brand Horizontal Scroll / Wrap Row */}
      <Text style={styles.sectionSubLabel}>1. Select Brand / Manufacturer:</Text>
      <View style={styles.brandRow}>
        {brandGroups.map((b) => {
          const isBrandActive = b.id === selectedBrandId;
          const isBrandSelected = b.models.some((m) => m.id === selectedItem.id);
          return (
            <TouchableOpacity
              key={b.id}
              style={[
                styles.brandChip,
                isBrandActive && styles.brandChipActive,
                isBrandSelected && !isBrandActive && styles.brandChipContainsSelected
              ]}
              onPress={() => {
                setSelectedBrandId(b.id);
                setSearchQuery('');
              }}
            >
              <Text style={[styles.brandChipText, (isBrandActive || isBrandSelected) && styles.textWhite]}>
                {b.brand}
              </Text>
              <View style={[styles.brandCountPill, isBrandActive && styles.brandCountPillActive]}>
                <Text style={[styles.brandCountText, isBrandActive && styles.textBlack]}>
                  {b.models.length}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Input for Models within Brand */}
      {activeBrandGroup?.models.length > 2 && (
        <View style={styles.searchContainer}>
          <TextInput
            placeholder={`Search ${activeBrandGroup.brand} models (e.g. series, wattage, specs)...`}
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      )}

      {/* Model Cards Grid */}
      <Text style={styles.sectionSubLabel}>2. Select Specific {activeBrandGroup?.brand} Model:</Text>
      <View style={styles.modelGrid}>
        {filteredModels.map((item) => {
          const isSelected = item.id === selectedItem.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.modelCard, isSelected && styles.modelCardActive]}
              onPress={() => onSelectItem(item)}
            >
              <View style={styles.modelCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modelCardTitle, isSelected && styles.textWhite]}>
                    {item.name}
                  </Text>
                  {item.desc && (
                    <Text style={styles.modelCardDesc} numberOfLines={2}>
                      {item.desc}
                    </Text>
                  )}
                </View>
                <View style={[styles.radioCheck, isSelected && styles.radioCheckActive]}>
                  {isSelected && <View style={styles.radioInnerDot} />}
                </View>
              </View>

              {/* Technical Spec Strip */}
              <View style={styles.specPillRow}>
                {item.rms !== undefined && item.rms > 0 && (
                  <View style={styles.specChip}>
                    <Text style={styles.specChipLabel}>RMS Power:</Text>
                    <Text style={styles.specChipValue}>{item.rms} W</Text>
                  </View>
                )}
                {item.ohms !== undefined && item.ohms > 0 && (
                  <View style={styles.specChip}>
                    <Text style={styles.specChipLabel}>Impedance:</Text>
                    <Text style={styles.specChipValue}>{item.ohms} Ω</Text>
                  </View>
                )}
                {item.preout !== undefined && (
                  <View style={styles.specChip}>
                    <Text style={styles.specChipLabel}>Pre-out:</Text>
                    <Text style={styles.specChipValue}>{item.preout} V</Text>
                  </View>
                )}
                {item.hpf !== undefined && item.hpf > 0 && (
                  <View style={styles.specChip}>
                    <Text style={styles.specChipLabel}>HPF Cutoff:</Text>
                    <Text style={styles.specChipValue}>~{item.hpf} Hz</Text>
                  </View>
                )}
                {item.tuneHz !== undefined && item.tuneHz > 0 && (
                  <View style={styles.specChip}>
                    <Text style={styles.specChipLabel}>Box Tuning:</Text>
                    <Text style={styles.specChipValue}>{item.tuneHz} Hz</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0d14',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1e2430',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#161922',
  },
  categoryTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryNumber: {
    color: '#22d3ee',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  selectedBadge: {
    backgroundColor: '#12151d',
    borderWidth: 1,
    borderColor: '#242936',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  selectedBadgeText: {
    color: '#8b949e',
    fontSize: 11,
  },
  sectionSubLabel: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 10,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  brandRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#06080d',
    borderWidth: 1,
    borderColor: '#1e2430',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  brandChipActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  brandChipContainsSelected: {
    borderColor: '#22d3ee',
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  brandChipText: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '600',
  },
  brandCountPill: {
    backgroundColor: '#161922',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 9999,
  },
  brandCountPillActive: {
    backgroundColor: '#e2e8f0',
  },
  brandCountText: {
    color: '#6e7681',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#06080d',
    borderWidth: 1,
    borderColor: '#1e2430',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 12,
  },
  modelGrid: {
    gap: 8,
  },
  modelCard: {
    backgroundColor: '#06080d',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e2430',
  },
  modelCardActive: {
    borderColor: '#ffffff',
    backgroundColor: '#0e121a',
  },
  modelCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  modelCardTitle: {
    color: '#8b949e',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modelCardDesc: {
    color: '#6e7681',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
  },
  radioCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#30363d',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCheckActive: {
    borderColor: '#ffffff',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  specPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0c0f16',
    borderWidth: 1,
    borderColor: '#1c222e',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  specChipLabel: {
    color: '#6e7681',
    fontSize: 10,
  },
  specChipValue: {
    color: '#22d3ee',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  textWhite: {
    color: '#ffffff',
  },
  textBlack: {
    color: '#050505',
  },
});
