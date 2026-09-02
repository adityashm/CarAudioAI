import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
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
  brandGroups: BrandGroup<T>[];
  selectedItem: T;
  onSelectItem: (item: T) => void;
  renderCustomBadge?: (item: T) => React.ReactNode;
}

export default function EquipmentBrandModelSelector<T extends { id: string; name: string; model?: string; desc?: string; rms?: number; ohms?: number; preout?: number; tuneHz?: number; hpf?: number; sensitivity?: number }>({
  categoryTitle,
  categoryNumber,
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
          <View style={styles.categoryNumBadge}>
            <Text style={styles.categoryNumber}>{categoryNumber}</Text>
          </View>
          <Text style={styles.categoryTitle}>{categoryTitle}</Text>
        </View>
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeLabel}>ACTIVE:</Text>
          <Text style={styles.selectedBadgeText} numberOfLines={1}>
            {selectedItem.model || selectedItem.name.split('(')[0]}
          </Text>
        </View>
      </View>

      {/* Brand Selector Pill Row */}
      <Text style={styles.sectionSubLabel}>1. SELECT MANUFACTURER / BRAND</Text>
      <View style={styles.brandRow}>
        {brandGroups.map((b) => {
          const isBrandActive = b.id === selectedBrandId;
          const isBrandSelected = b.models.some((m) => m.id === selectedItem.id);
          return (
            <TouchableOpacity
              key={b.id}
              activeOpacity={0.7}
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
              <Text
                style={[
                  styles.brandChipText,
                  isBrandActive ? styles.textBlackBold : isBrandSelected ? styles.textCyan : styles.textLight
                ]}
              >
                {b.brand}
              </Text>
              <View style={[styles.brandCountPill, isBrandActive && styles.brandCountPillActive]}>
                <Text style={[styles.brandCountText, isBrandActive && styles.textBlackBold]}>
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
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Model Cards Grid */}
      <Text style={styles.sectionSubLabel}>
        2. SELECT SPECIFIC MODEL ({filteredModels.length} AVAILABLE)
      </Text>
      <View style={styles.modelGrid}>
        {filteredModels.map((item) => {
          const isSelected = item.id === selectedItem.id;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              style={[styles.modelCard, isSelected && styles.modelCardActive]}
              onPress={() => onSelectItem(item)}
            >
              <View style={styles.modelCardTop}>
                <View style={{ flex: 1, paddingRight: 12 }}>
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
                    <Text style={styles.specChipCyanMono}>{item.rms} W</Text>
                  </View>
                )}
                {item.ohms !== undefined && item.ohms > 0 && (
                  <View style={styles.specChip}>
                    <Text style={styles.specChipLabel}>Impedance:</Text>
                    <Text style={styles.specChipPurpleMono}>{item.ohms} Ω</Text>
                  </View>
                )}
                {item.sensitivity !== undefined && item.sensitivity > 0 && (
                  <View style={styles.specChip}>
                    <Text style={styles.specChipLabel}>Sensitivity:</Text>
                    <Text style={styles.specChipGreenMono}>{item.sensitivity} dB</Text>
                  </View>
                )}
                {item.preout !== undefined && (
                  <View style={styles.specChip}>
                    <Text style={styles.specChipLabel}>Pre-out:</Text>
                    <Text style={styles.specChipCyanMono}>{item.preout} V</Text>
                  </View>
                )}
                {item.hpf !== undefined && item.hpf > 0 && (
                  <View style={styles.specChip}>
                    <Text style={styles.specChipLabel}>HPF Cutoff:</Text>
                    <Text style={styles.specChipValueMono}>~{item.hpf} Hz</Text>
                  </View>
                )}
                {item.tuneHz !== undefined && item.tuneHz > 0 && (
                  <View style={styles.specChip}>
                    <Text style={styles.specChipLabel}>Box Tuning:</Text>
                    <Text style={styles.specChipAmberMono}>{item.tuneHz} Hz</Text>
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
    backgroundColor: '#0c0f17',
    borderRadius: 20,
    padding: 22,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#1e2430',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#181d28',
  },
  categoryTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryNumBadge: {
    backgroundColor: '#161d28',
    borderWidth: 1,
    borderColor: '#263142',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryNumber: {
    color: '#22d3ee',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  categoryTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: -0.4,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#121722',
    borderWidth: 1,
    borderColor: '#222d3d',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    maxWidth: 280,
  },
  selectedBadgeLabel: {
    color: '#22d3ee',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionSubLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 10,
    marginTop: 6,
    letterSpacing: 1,
  },
  brandRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#07090e',
    borderWidth: 1,
    borderColor: '#1e2430',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9999,
    cursor: Platform.OS === 'web' ? ('pointer' as any) : undefined,
  },
  brandChipActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  brandChipContainsSelected: {
    borderColor: '#22d3ee',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  brandChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textLight: {
    color: '#cbd5e1',
  },
  textCyan: {
    color: '#22d3ee',
    fontWeight: 'bold',
  },
  textBlackBold: {
    color: '#050505',
    fontWeight: '900',
  },
  brandCountPill: {
    backgroundColor: '#161d28',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  brandCountPillActive: {
    backgroundColor: '#cbd5e1',
  },
  brandCountText: {
    color: '#94a3b8',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  searchInput: {
    backgroundColor: '#07090e',
    borderWidth: 1,
    borderColor: '#1e2430',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 13,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 14,
    top: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1e2430',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearchText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modelGrid: {
    gap: 10,
  },
  modelCard: {
    backgroundColor: '#07090e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a202c',
    cursor: Platform.OS === 'web' ? ('pointer' as any) : undefined,
  },
  modelCardActive: {
    borderColor: '#ffffff',
    backgroundColor: '#111622',
  },
  modelCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modelCardTitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 20,
  },
  modelCardDesc: {
    color: '#8b949e',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  radioCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2d3748',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCheckActive: {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    marginTop: 4,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0e131d',
    borderWidth: 1,
    borderColor: '#1e2838',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specChipLabel: {
    color: '#8b949e',
    fontSize: 10,
  },
  specChipCyanMono: {
    color: '#22d3ee',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  specChipPurpleMono: {
    color: '#a78bfa',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  specChipGreenMono: {
    color: '#4ade80',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  specChipAmberMono: {
    color: '#f59e0b',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  specChipValueMono: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  textWhite: {
    color: '#ffffff',
  },
});
