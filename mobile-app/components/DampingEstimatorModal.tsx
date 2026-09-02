import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  calculateVehicleDamping,
  VehicleDampingPlan,
} from "@/services/dampingCalculatorService";

interface DampingEstimatorModalProps {
  visible: boolean;
  onClose: () => void;
  carName: string;
  category: string;
}

export default function DampingEstimatorModal({
  visible,
  onClose,
  carName,
  category,
}: DampingEstimatorModalProps) {
  const [includeRoof, setIncludeRoof] = useState(true);
  const [includeFloor, setIncludeFloor] = useState(true);

  const plan: VehicleDampingPlan = useMemo(() => {
    return calculateVehicleDamping(category, includeRoof, includeFloor);
  }, [category, includeRoof, includeFloor]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <View style={styles.headerTitleRow}>
                <View style={styles.cyanDot} />
                <Text style={styles.modalTitle}>Acoustic Sound Deadening & Damping Calculator</Text>
              </View>
              <Text style={styles.modalSub}>
                Vehicle panel surface area estimation, butyl damping sheets & road noise reduction for {carName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Scope Toggles */}
            <View style={styles.scopeCard}>
              <Text style={styles.scopeTitle}>INSTALLATION COVERAGE SCOPE:</Text>
              <View style={styles.togglesRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, includeRoof && styles.toggleBtnActive]}
                  onPress={() => setIncludeRoof(!includeRoof)}
                >
                  <Text style={[styles.toggleBtnText, includeRoof && styles.toggleBtnTextActive]}>
                    {includeRoof ? "✓ Roof Included" : "+ Add Roof"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleBtn, includeFloor && styles.toggleBtnActive]}
                  onPress={() => setIncludeFloor(!includeFloor)}
                >
                  <Text style={[styles.toggleBtnText, includeFloor && styles.toggleBtnTextActive]}>
                    {includeFloor ? "✓ Floor & Firewall Included" : "+ Add Floor/Firewall"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Impact Metric Hero Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>SHEETS REQUIRED</Text>
                <Text style={styles.metricVal}>
                  {plan.totalSheetsRequired} <Text style={styles.metricUnit}>Sheets (4 sq.ft)</Text>
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>TOTAL COVERAGE</Text>
                <Text style={styles.metricVal}>
                  {plan.totalAreaSqFt} <Text style={styles.metricUnit}>sq.ft</Text>
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>WEIGHT ADDED</Text>
                <Text style={styles.metricVal}>
                  +{plan.totalWeightAddedKg} <Text style={styles.metricUnit}>kg</Text>
                </Text>
              </View>

              <View style={[styles.metricCard, { borderColor: "#10b981" }]}>
                <Text style={styles.metricLabel}>ROAD NOISE REDUCTION</Text>
                <Text style={[styles.metricVal, { color: "#10b981" }]}>
                  -{plan.expectedRoadNoiseReductionDb} <Text style={styles.metricUnit}>dB (~40% quieter)</Text>
                </Text>
              </View>
            </View>

            {/* Panel-by-Panel Breakdown */}
            <View style={styles.panelsCard}>
              <Text style={styles.panelsTitle}>📦 Panel-by-Panel Installation Breakdown:</Text>
              <View style={styles.panelList}>
                {plan.panels.map((panel) => (
                  <View key={panel.id} style={styles.panelRow}>
                    <View style={styles.panelHeader}>
                      <Text style={styles.panelName}>{panel.name}</Text>
                      <Text style={styles.panelBadge}>
                        {panel.sheetsRequired} sheets ({panel.areaSqFt} sq.ft)
                      </Text>
                    </View>
                    <Text style={styles.panelDesc}>{panel.description}</Text>
                    <View style={styles.panelMaterialRow}>
                      <Text style={styles.materialTag}>🛠️ {panel.materialType}</Text>
                      <Text style={styles.benefitTag}>⚡ -{panel.noiseBenefitDb} dB</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Professional Installation Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Professional Installer Guidelines:</Text>
              {plan.acousticRecommendations.map((tip, idx) => (
                <Text key={idx} style={styles.tipItem}>• {tip}</Text>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "92%",
    backgroundColor: "#0a101f",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
    padding: 20,
    shadowColor: "#06b6d4",
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    paddingBottom: 12,
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cyanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#06b6d4",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalSub: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 4,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: "#94a3b8",
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollArea: {
    flexGrow: 0,
  },
  scopeCard: {
    backgroundColor: "#070d18",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 14,
  },
  scopeTitle: {
    color: "#64748b",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "bold",
    marginBottom: 8,
  },
  togglesRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  toggleBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  toggleBtnActive: {
    backgroundColor: "#0284c7",
    borderColor: "#38bdf8",
  },
  toggleBtnText: {
    color: "#94a3b8",
    fontSize: 11,
  },
  toggleBtnTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  metricCard: {
    flex: 1,
    minWidth: 135,
    backgroundColor: "#070d18",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  metricLabel: {
    color: "#64748b",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "bold",
    marginBottom: 2,
  },
  metricVal: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  metricUnit: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "normal",
  },
  panelsCard: {
    backgroundColor: "#070d18",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 14,
  },
  panelsTitle: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
  },
  panelList: {
    gap: 10,
  },
  panelRow: {
    backgroundColor: "#0a101f",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e2430",
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
    gap: 6,
  },
  panelName: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  panelBadge: {
    color: "#38bdf8",
    fontSize: 10,
    fontFamily: "monospace",
    backgroundColor: "#0f172a",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  panelDesc: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  panelMaterialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  materialTag: {
    color: "#cbd5e1",
    fontSize: 10,
    fontFamily: "monospace",
  },
  benefitTag: {
    color: "#10b981",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  tipsCard: {
    backgroundColor: "#070d18",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  tipsTitle: {
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tipItem: {
    color: "#94a3b8",
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 3,
  },
});
