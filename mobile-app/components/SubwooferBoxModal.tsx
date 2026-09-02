import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import {
  calculateSubwooferEnclosure,
  BoxCalculationResult,
} from "@/services/subwooferBoxEngine";

interface SubwooferBoxModalProps {
  visible: boolean;
  onClose: () => void;
  subwooferName: string;
  initialSizeInches?: number;
}

export default function SubwooferBoxModal({
  visible,
  onClose,
  subwooferName,
  initialSizeInches = 12,
}: SubwooferBoxModalProps) {
  const [subSize, setSubSize] = useState<number>(initialSizeInches);
  const [boxType, setBoxType] = useState<"sealed" | "ported">("ported");
  const [targetFb, setTargetFb] = useState<number>(34);
  const [portType, setPortType] = useState<"slot" | "round">("slot");
  const [woodThick, setWoodThick] = useState<number>(0.75);

  const calcResult: BoxCalculationResult = useMemo(() => {
    return calculateSubwooferEnclosure({
      subwooferSizeInches: subSize,
      boxType: boxType,
      targetFbHz: targetFb,
      portType: portType,
      woodThicknessInches: woodThick,
    });
  }, [subSize, boxType, targetFb, portType, woodThick]);

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
                <Text style={styles.modalTitle}>Subwoofer Enclosure Designer & Port Calculator</Text>
              </View>
              <Text style={styles.modalSub}>
                Thiele-Small electro-acoustic modeling, port chuffing velocity analysis & MDF cut sheet for {subwooferName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Control Bar: Subwoofer Size & Box Type */}
            <View style={styles.configRow}>
              {/* Driver Size */}
              <View style={styles.configCol}>
                <Text style={styles.configLabel}>DRIVER DIAMETER</Text>
                <View style={styles.pillGroup}>
                  {[8, 10, 12, 15].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[styles.pillBtn, subSize === size && styles.pillBtnActive]}
                      onPress={() => setSubSize(size)}
                    >
                      <Text style={[styles.pillBtnText, subSize === size && styles.pillBtnTextActive]}>
                        {size}"
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Box Type */}
              <View style={styles.configCol}>
                <Text style={styles.configLabel}>ALIGNMENT TYPE</Text>
                <View style={styles.pillGroup}>
                  <TouchableOpacity
                    style={[styles.pillBtn, boxType === "ported" && styles.pillBtnActive]}
                    onPress={() => setBoxType("ported")}
                  >
                    <Text style={[styles.pillBtnText, boxType === "ported" && styles.pillBtnTextActive]}>
                      Ported (Bass Reflex)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.pillBtn, boxType === "sealed" && styles.pillBtnActive]}
                    onPress={() => setBoxType("sealed")}
                  >
                    <Text style={[styles.pillBtnText, boxType === "sealed" && styles.pillBtnTextActive]}>
                      Sealed (SQ)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Port Settings (If Ported) */}
            {boxType === "ported" && (
              <View style={styles.portSettingsCard}>
                <View style={styles.portSettingsHeader}>
                  <Text style={styles.cardHeaderTitle}>Port Tuning & Geometry</Text>
                  <View style={styles.tuningPill}>
                    <Text style={styles.tuningPillText}>Target Tuning: {targetFb} Hz</Text>
                  </View>
                </View>

                {/* Tuning Presets */}
                <View style={styles.tuningPresetsRow}>
                  {[
                    { label: "Deep Lows (30 Hz)", fb: 30 },
                    { label: "Daily SQL (34 Hz)", fb: 34 },
                    { label: "Punchy Club (38 Hz)", fb: 38 },
                    { label: "High SPL (42 Hz)", fb: 42 },
                  ].map((preset) => (
                    <TouchableOpacity
                      key={preset.fb}
                      style={[styles.presetBtn, targetFb === preset.fb && styles.presetBtnActive]}
                      onPress={() => setTargetFb(preset.fb)}
                    >
                      <Text style={[styles.presetBtnText, targetFb === preset.fb && styles.presetBtnTextActive]}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Port Style */}
                <View style={styles.portStyleRow}>
                  <Text style={styles.subConfigLabel}>PORT DESIGN:</Text>
                  <View style={styles.pillGroup}>
                    <TouchableOpacity
                      style={[styles.pillSmallBtn, portType === "slot" && styles.pillBtnActive]}
                      onPress={() => setPortType("slot")}
                    >
                      <Text style={[styles.pillSmallBtnText, portType === "slot" && styles.pillBtnTextActive]}>
                        Slot Port (MDF Divider)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pillSmallBtn, portType === "round" && styles.pillBtnActive]}
                      onPress={() => setPortType("round")}
                    >
                      <Text style={[styles.pillSmallBtnText, portType === "round" && styles.pillBtnTextActive]}>
                        Round Aeroport (PVC)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Metric Readout Cards */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>NET INTERNAL VOLUME</Text>
                <Text style={styles.metricVal}>
                  {calcResult.netVolumeCuFt} <Text style={styles.metricUnit}>cu.ft ({calcResult.netVolumeLiters} L)</Text>
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>F3 (-3dB CUTOFF)</Text>
                <Text style={styles.metricVal}>
                  {calcResult.cutoffF3Hz} <Text style={styles.metricUnit}>Hz</Text>
                </Text>
              </View>

              {boxType === "ported" && calcResult.portSpecs && (
                <>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>PORT LENGTH (Lv)</Text>
                    <Text style={styles.metricVal}>
                      {calcResult.portSpecs.lengthInches}" <Text style={styles.metricUnit}>({calcResult.portSpecs.lengthCm} cm)</Text>
                    </Text>
                  </View>

                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>PORT AIR VELOCITY</Text>
                    <Text style={[styles.metricVal, calcResult.portSpecs.isChuffingRisk && { color: "#ef4444" }]}>
                      {calcResult.portSpecs.portAirVelocityMs} <Text style={styles.metricUnit}>m/s {calcResult.portSpecs.isChuffingRisk ? "⚠️ HIGH" : "✓ PASS"}</Text>
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Recommended External Box Dimensions */}
            <View style={styles.dimsCard}>
              <Text style={styles.dimsCardTitle}>📐 Recommended External Box Dimensions (0.75" / 18mm Wood)</Text>
              <View style={styles.dimsGrid}>
                <View style={styles.dimItem}>
                  <Text style={styles.dimLabel}>HEIGHT</Text>
                  <Text style={styles.dimVal}>{calcResult.recommendedDimensions.heightInches}" <Text style={styles.dimSub}>({calcResult.recommendedDimensions.heightCm} cm)</Text></Text>
                </View>
                <View style={styles.dimItem}>
                  <Text style={styles.dimLabel}>WIDTH</Text>
                  <Text style={styles.dimVal}>{calcResult.recommendedDimensions.widthInches}" <Text style={styles.dimSub}>({calcResult.recommendedDimensions.widthCm} cm)</Text></Text>
                </View>
                <View style={styles.dimItem}>
                  <Text style={styles.dimLabel}>DEPTH</Text>
                  <Text style={styles.dimVal}>{calcResult.recommendedDimensions.depthInches}" <Text style={styles.dimSub}>({calcResult.recommendedDimensions.depthCm} cm)</Text></Text>
                </View>
              </View>
            </View>

            {/* MDF Cut Sheet */}
            <View style={styles.cutSheetCard}>
              <Text style={styles.cutSheetTitle}>🪚 MDF Cut Sheet (Parts List)</Text>
              <View style={styles.cutSheetList}>
                <Text style={styles.cutSheetItem}>• {calcResult.cutSheetMdf.frontBack}</Text>
                <Text style={styles.cutSheetItem}>• {calcResult.cutSheetMdf.topBottom}</Text>
                <Text style={styles.cutSheetItem}>• {calcResult.cutSheetMdf.sides}</Text>
                {calcResult.cutSheetMdf.portWalls && (
                  <Text style={styles.cutSheetItem}>• {calcResult.cutSheetMdf.portWalls}</Text>
                )}
              </View>
            </View>

            {/* Acoustic Notes */}
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>💡 Builder Acoustic Advice:</Text>
              {calcResult.acousticNotes.map((note, idx) => (
                <Text key={idx} style={styles.noteItem}>• {note}</Text>
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
  configRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  configCol: {
    flex: 1,
    minWidth: 200,
  },
  configLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "monospace",
    marginBottom: 6,
  },
  pillGroup: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  pillBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  pillBtnActive: {
    backgroundColor: "#0284c7",
    borderColor: "#38bdf8",
  },
  pillBtnText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
  },
  pillBtnTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  portSettingsCard: {
    backgroundColor: "#070d18",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 14,
  },
  portSettingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardHeaderTitle: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "bold",
  },
  tuningPill: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
  tuningPillText: {
    color: "#38bdf8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  tuningPresetsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  presetBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  presetBtnActive: {
    backgroundColor: "#1e293b",
    borderColor: "#38bdf8",
  },
  presetBtnText: {
    color: "#94a3b8",
    fontSize: 10,
  },
  presetBtnTextActive: {
    color: "#38bdf8",
    fontWeight: "bold",
  },
  portStyleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    flexWrap: "wrap",
  },
  subConfigLabel: {
    color: "#64748b",
    fontSize: 10,
    fontFamily: "monospace",
  },
  pillSmallBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  pillSmallBtnText: {
    color: "#94a3b8",
    fontSize: 10,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
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
  dimsCard: {
    backgroundColor: "#0c1a2e",
    borderWidth: 1,
    borderColor: "#0284c7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  dimsCardTitle: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dimsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  dimItem: {
    flex: 1,
    minWidth: 100,
    backgroundColor: "#070d18",
    padding: 8,
    borderRadius: 8,
  },
  dimLabel: {
    color: "#64748b",
    fontSize: 9,
    fontFamily: "monospace",
  },
  dimVal: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "monospace",
    marginTop: 2,
  },
  dimSub: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "normal",
  },
  cutSheetCard: {
    backgroundColor: "#070d18",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 12,
  },
  cutSheetTitle: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cutSheetList: {
    gap: 4,
  },
  cutSheetItem: {
    color: "#cbd5e1",
    fontSize: 11,
    fontFamily: "monospace",
  },
  notesCard: {
    backgroundColor: "#070d18",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 10,
  },
  notesTitle: {
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },
  noteItem: {
    color: "#94a3b8",
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 3,
  },
});
