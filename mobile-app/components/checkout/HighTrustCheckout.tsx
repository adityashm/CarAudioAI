import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { tokens } from '../../design-system/tokens';
import { PaymentPlan, FALLBACK_PLANS } from '../../services/paymentService';
import { UserProfile } from '../../services/authService';

export interface GstBreakdown {
  totalInr: number;
  basePriceInr: number;
  cgstInr: number;
  sgstInr: number;
  totalTaxInr: number;
  formattedSummary: {
    baseLine: string;
    cgstLine: string;
    sgstLine: string;
    totalTaxLine: string;
    totalLine: string;
  };
}

/**
 * Compute 18% Indian GST (9% CGST + 9% SGST) breakdown from inclusive amount
 */
export function calculateGstInclusive(totalAmount: number): GstBreakdown {
  if (totalAmount === 0) {
    return {
      totalInr: 0,
      basePriceInr: 0,
      cgstInr: 0,
      sgstInr: 0,
      totalTaxInr: 0,
      formattedSummary: {
        baseLine: 'Base Subscription Price: ₹0.00',
        cgstLine: 'Central GST (CGST @ 9%): ₹0.00',
        sgstLine: 'State GST (SGST @ 9%):   ₹0.00',
        totalTaxLine: 'Total GST (18%):         ₹0.00',
        totalLine: 'Total Invoiced Amount:   ₹0.00',
      },
    };
  }

  const GST_RATE = 0.18;
  const SPLIT_RATE = 0.09;

  const basePrice = +(totalAmount / (1 + GST_RATE)).toFixed(2);
  const cgst = +(basePrice * SPLIT_RATE).toFixed(2);
  const sgst = +(basePrice * SPLIT_RATE).toFixed(2);
  const totalTax = +(cgst + sgst).toFixed(2);

  return {
    totalInr: totalAmount,
    basePriceInr: basePrice,
    cgstInr: cgst,
    sgstInr: sgst,
    totalTaxInr: totalTax,
    formattedSummary: {
      baseLine: `Base Subscription Price: ₹${basePrice.toFixed(2)}`,
      cgstLine: `Central GST (CGST @ 9%): ₹${cgst.toFixed(2)}`,
      sgstLine: `State GST (SGST @ 9%):   ₹${sgst.toFixed(2)}`,
      totalTaxLine: `Total GST (18%):         ₹${totalTax.toFixed(2)}`,
      totalLine: `Total Invoiced Amount:   ₹${totalAmount.toFixed(2)}`,
    },
  };
}

export interface CheckoutTierInfo {
  id: 'free' | 'pro_monthly' | 'pro_yearly';
  displayName: string;
  subtitle: string;
  badge?: string;
  priceInr: number;
  periodLabel: string;
  features: string[];
}

export const CHECKOUT_TIERS: CheckoutTierInfo[] = [
  {
    id: 'free',
    displayName: 'Free Enthusiast',
    subtitle: 'Standard Cabin Presets',
    badge: 'COMMUNITY',
    priceInr: 0,
    periodLabel: 'Lifetime Access',
    features: [
      'Basic 14-Band Graphic Equalizer',
      'Standard Cabin Delay Presets',
      'Pink Noise Calibration Tone',
      '1 Saved Vehicle Sound Profile',
    ],
  },
  {
    id: 'pro_monthly',
    displayName: 'Pro Audio Tuner',
    subtitle: 'Precision DSP Calibration',
    badge: 'MOST POPULAR',
    priceInr: 99,
    periodLabel: 'per month',
    features: [
      'All 14 EQ Bands with Bezier Spline Curve',
      'Live Web Audio RTA FFT Spectrum Analyzer',
      'Pioneer XML & MiniDSP JSON 1-Click Export',
      'Millimeter Asymmetric RHD Time Alignment',
      'Linkwitz-Riley 24dB Crossover Matrix',
      'Ported Box Subsonic Safety Protection',
    ],
  },
  {
    id: 'pro_yearly',
    displayName: 'Installer Commercial',
    subtitle: 'Workshop Multi-Car Suite',
    badge: 'BEST VALUE (2 MOS FREE)',
    priceInr: 999,
    periodLabel: 'per year',
    features: [
      'Unlimited Vehicle Calibrations',
      'Installer Multi-Car Garage & Workshop Mode',
      'Printable PDF & WhatsApp Audio Handover Sheets',
      'Priority DMM AC Voltage Gain-Staging Calculator',
      'RTA Acoustic Measurement Smoothing (1/3 Octave)',
      'Priority DSP Calibration Engineering Support',
    ],
  },
];

export interface HighTrustCheckoutProps {
  currentUser?: UserProfile | null;
  selectedPlanId?: 'free' | 'pro_monthly' | 'pro_yearly';
  onSelectPlan?: (planId: 'free' | 'pro_monthly' | 'pro_yearly') => void;
  onProceedToPay: (plan: PaymentPlan) => void;
  loadingPlanId?: string | null;
  successMessage?: string | null;
  errorMessage?: string | null;
  onClose?: () => void;
}

export const HighTrustCheckout: React.FC<HighTrustCheckoutProps> = ({
  currentUser,
  selectedPlanId: controlledSelectedPlanId,
  onSelectPlan: controlledOnSelectPlan,
  onProceedToPay,
  loadingPlanId = null,
  successMessage = null,
  errorMessage = null,
  onClose,
}) => {
  // Internal state if uncontrolled
  const [internalPlanId, setInternalPlanId] = useState<'free' | 'pro_monthly' | 'pro_yearly'>('pro_monthly');

  const selectedTierId = controlledSelectedPlanId ?? internalPlanId;

  const handleSelectTier = (tierId: 'free' | 'pro_monthly' | 'pro_yearly') => {
    if (controlledOnSelectPlan) {
      controlledOnSelectPlan(tierId);
    } else {
      setInternalPlanId(tierId);
    }
  };

  const selectedTier = useMemo(() => {
    return CHECKOUT_TIERS.find((t) => t.id === selectedTierId) || CHECKOUT_TIERS[1];
  }, [selectedTierId]);

  const gstBreakdown = useMemo(() => {
    return calculateGstInclusive(selectedTier.priceInr);
  }, [selectedTier.priceInr]);

  const isUserCurrentTier = (tierId: string): boolean => {
    const userTier = currentUser?.subscription_tier || 'free';
    if (tierId === 'free' && userTier === 'free') return true;
    if (tierId === 'pro_monthly' && userTier === 'pro_monthly') return true;
    if (tierId === 'pro_yearly' && (userTier === 'pro_yearly' || userTier === 'installer')) return true;
    return false;
  };

  const currentTierIsSelected = isUserCurrentTier(selectedTier.id);

  const handleCtaPress = () => {
    const matchedFallbackPlan = FALLBACK_PLANS.find((p) => p.id === selectedTier.id) || {
      id: selectedTier.id,
      name: selectedTier.displayName,
      price_inr: selectedTier.priceInr,
      interval: selectedTier.id === 'pro_yearly' ? 'year' : selectedTier.id === 'pro_monthly' ? 'month' : 'lifetime',
      features: selectedTier.features,
    };
    onProceedToPay(matchedFallbackPlan);
  };

  const isActionLoading = loadingPlanId === selectedTier.id;

  return (
    <View style={styles.rootContainer}>
      {/* Instrumentation Header */}
      <View style={styles.instrumentHeader}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.statusIndicatorRow}>
            <View style={styles.instrumentStatusDot} />
            <Text style={styles.categoryLabel}>RAZORPAY SECURE GATEWAY • TAX INVOICE</Text>
          </View>
          <Text style={styles.mainTitle}>Upgrade Acoustic Calibration Suite</Text>
          <Text style={styles.subtitleText}>
            Professional DSP tuning, live FFT telemetry &amp; compliant Indian GST invoicing
          </Text>
        </View>

        {onClose && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close Checkout"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Alerts */}
      {successMessage && (
        <View style={styles.alertSuccessContainer}>
          <View style={styles.alertIconBox}>
            <Text style={styles.alertSuccessIcon}>✓</Text>
          </View>
          <View style={styles.alertTextGroup}>
            <Text style={styles.alertSuccessTitle}>SUBSCRIPTION ACTIVATED</Text>
            <Text style={styles.alertSuccessMessage}>{successMessage}</Text>
          </View>
        </View>
      )}

      {errorMessage && (
        <View style={styles.alertErrorContainer}>
          <View style={styles.alertIconBox}>
            <Text style={styles.alertErrorIcon}>⚠️</Text>
          </View>
          <View style={styles.alertTextGroup}>
            <Text style={styles.alertErrorTitle}>TRANSACTION NOTICE</Text>
            <Text style={styles.alertErrorMessage}>{errorMessage}</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tier Selection Matrix */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>1. SELECT SUBSCRIPTION PLAN</Text>
          <Text style={styles.sectionSubtitle}>Choose tier for single vehicle or workshop calibration</Text>
        </View>

        <View style={styles.tierGrid}>
          {CHECKOUT_TIERS.map((tier) => {
            const isSelected = tier.id === selectedTierId;
            const isCurrent = isUserCurrentTier(tier.id);

            return (
              <TouchableOpacity
                key={tier.id}
                activeOpacity={0.85}
                onPress={() => handleSelectTier(tier.id)}
                style={[
                  styles.tierCard,
                  isSelected && styles.tierCardSelected,
                  isCurrent && styles.tierCardCurrent,
                ]}
              >
                {/* Top Badge */}
                {tier.badge && (
                  <View
                    style={[
                      styles.tierBadge,
                      tier.id === 'pro_yearly'
                        ? styles.tierBadgeGold
                        : tier.id === 'pro_monthly'
                        ? styles.tierBadgePrimary
                        : styles.tierBadgeDefault,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tierBadgeText,
                        tier.id === 'pro_yearly'
                          ? styles.tierBadgeTextGold
                          : tier.id === 'pro_monthly'
                          ? styles.tierBadgeTextPrimary
                          : styles.tierBadgeTextDefault,
                      ]}
                    >
                      {tier.badge}
                    </Text>
                  </View>
                )}

                {/* Plan Identity */}
                <View style={styles.tierHeader}>
                  <View style={styles.tierRadioRow}>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.tierDisplayName}>{tier.displayName}</Text>
                  </View>
                  <Text style={styles.tierSubtitle}>{tier.subtitle}</Text>
                </View>

                {/* Price Display */}
                <View style={styles.tierPriceContainer}>
                  <View style={styles.tierPriceRow}>
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <Text style={styles.tierPriceNumeral}>
                      {tier.priceInr === 0 ? '0' : tier.priceInr.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <Text style={styles.tierPeriodLabel}>{tier.periodLabel}</Text>
                </View>

                {/* Current Active Status Indicator */}
                {isCurrent && (
                  <View style={styles.activePlanChip}>
                    <Text style={styles.activePlanChipText}>CURRENT PLAN</Text>
                  </View>
                )}

                {/* Features List */}
                <View style={styles.featureListContainer}>
                  {tier.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureItemRow}>
                      <Text style={styles.featureCheckMark}>✓</Text>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Monospace Line-Item Invoice Summary */}
        <View style={styles.invoicePanel}>
          <View style={styles.invoiceHeaderRow}>
            <View>
              <Text style={styles.invoiceSectionTitle}>2. MONOSPACE LINE-ITEM INVOICE SUMMARY</Text>
              <Text style={styles.invoiceSubtext}>
                HSN/SAC 998313 (IT / Audio Software Calibration Services) • GST Breakdown
              </Text>
            </View>
            <View style={styles.gstTag}>
              <Text style={styles.gstTagText}>18% GST INCL.</Text>
            </View>
          </View>

          <View style={styles.monospaceTable}>
            {/* Base Subscription Price */}
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Base Subscription Price ({selectedTier.displayName})</Text>
              <Text style={styles.tableValueMono}>
                ₹{gstBreakdown.basePriceInr.toFixed(2).padStart(8, ' ')}
              </Text>
            </View>

            {/* Central GST 9% */}
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Central GST (CGST @ 9%)</Text>
              <Text style={styles.tableValueMono}>
                ₹{gstBreakdown.cgstInr.toFixed(2).padStart(8, ' ')}
              </Text>
            </View>

            {/* State GST 9% */}
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>State GST (SGST @ 9%)</Text>
              <Text style={styles.tableValueMono}>
                ₹{gstBreakdown.sgstInr.toFixed(2).padStart(8, ' ')}
              </Text>
            </View>

            {/* Total Tax Amount */}
            <View style={styles.tableRowTax}>
              <Text style={styles.tableLabelSubtle}>Total Tax Decomposition (18% GST)</Text>
              <Text style={styles.tableValueTaxMono}>
                ₹{gstBreakdown.totalTaxInr.toFixed(2).padStart(8, ' ')}
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.tableDivider} />

            {/* Final Total Payable */}
            <View style={styles.tableTotalRow}>
              <View>
                <Text style={styles.tableTotalLabel}>FINAL TOTAL PAYABLE</Text>
                <Text style={styles.tableTotalSublabel}>All applicable taxes &amp; gateway fees included</Text>
              </View>
              <Text style={styles.tableTotalValueMono}>
                ₹{gstBreakdown.totalInr.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Trust, Security & Compliance Indicators */}
        <View style={styles.trustContainer}>
          <Text style={styles.trustSectionTitle}>3. SECURITY &amp; COMPLIANCE ASSURANCE</Text>

          <View style={styles.badgeRow}>
            <View style={styles.trustBadgeCard}>
              <Text style={styles.trustBadgeIcon}>🔒</Text>
              <View>
                <Text style={styles.trustBadgeTitle}>256-BIT SSL ENCRYPTION</Text>
                <Text style={styles.trustBadgeDesc}>End-to-end encrypted telemetry</Text>
              </View>
            </View>

            <View style={styles.trustBadgeCard}>
              <Text style={styles.trustBadgeIcon}>🛡️</Text>
              <View>
                <Text style={styles.trustBadgeTitle}>PCI-DSS LEVEL 1</Text>
                <Text style={styles.trustBadgeDesc}>Certified payment security</Text>
              </View>
            </View>

            <View style={styles.trustBadgeCard}>
              <Text style={styles.trustBadgeIcon}>⚡</Text>
              <View>
                <Text style={styles.trustBadgeTitle}>INSTANT ACTIVATION</Text>
                <Text style={styles.trustBadgeDesc}>Direct DSP flashing unlocked</Text>
              </View>
            </View>

            <View style={styles.trustBadgeCard}>
              <Text style={styles.trustBadgeIcon}>🇮🇳</Text>
              <View>
                <Text style={styles.trustBadgeTitle}>RBI / NPCI COMPLIANT</Text>
                <Text style={styles.trustBadgeDesc}>Indian banking standard</Text>
              </View>
            </View>
          </View>

          {/* Payment Methods Accepted */}
          <View style={styles.paymentMethodsRow}>
            <Text style={styles.paymentMethodLabel}>ACCEPTED CHANNELS:</Text>
            <View style={styles.paymentPillsContainer}>
              <View style={styles.paymentPill}><Text style={styles.paymentPillText}>UPI (GPay / PhonePe / Paytm / BHIM)</Text></View>
              <View style={styles.paymentPill}><Text style={styles.paymentPillText}>RuPay</Text></View>
              <View style={styles.paymentPill}><Text style={styles.paymentPillText}>Visa &amp; Mastercard</Text></View>
              <View style={styles.paymentPill}><Text style={styles.paymentPillText}>50+ Indian NetBanking</Text></View>
              <View style={styles.paymentPill}><Text style={styles.paymentPillText}>Corporate Invoicing</Text></View>
            </View>
          </View>
        </View>

        {/* Clean Solid Chrome CTA Button */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[
              styles.chromeCtaButton,
              currentTierIsSelected && styles.chromeCtaButtonDisabled,
              isActionLoading && styles.chromeCtaButtonLoading,
            ]}
            disabled={currentTierIsSelected || isActionLoading}
            onPress={handleCtaPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Proceed with ${selectedTier.displayName}`}
          >
            {isActionLoading ? (
              <View style={styles.ctaLoadingRow}>
                <ActivityIndicator size="small" color={tokens.colors.text.primary} />
                <Text style={styles.chromeCtaButtonText}>INITIALIZING RAZORPAY GATEWAY...</Text>
              </View>
            ) : (
              <View style={styles.ctaContentRow}>
                <Text style={styles.chromeCtaButtonText}>
                  {currentTierIsSelected
                    ? 'CURRENT ACTIVE PLAN'
                    : selectedTier.priceInr === 0
                    ? 'START FREE CALIBRATION'
                    : `PROCEED TO PAY ₹${selectedTier.priceInr.toFixed(2)}`}
                </Text>
                {!currentTierIsSelected && (
                  <Text style={styles.ctaArrowSymbol}>→</Text>
                )}
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.ctaGuaranteeText}>
            🔒 256-Bit Razorpay Signature Auth • Instant Activation Guarantee • Cancel Anytime
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    backgroundColor: tokens.colors.bg.base,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border.subtle,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 820,
    maxHeight: '92%',
  },
  instrumentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.hairline,
    backgroundColor: tokens.colors.bg.panel,
  },
  headerTitleGroup: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  instrumentStatusDot: {
    width: 6,
    height: 6,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.status.ok,
  },
  categoryLabel: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.8,
  },
  mainTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    letterSpacing: 0.3,
  },
  subtitleText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs + 1,
    color: tokens.colors.text.secondary,
    lineHeight: 18,
  },
  closeButton: {
    padding: tokens.spacing.sm,
    marginLeft: tokens.spacing.md,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.bg.elevated,
    borderWidth: 1,
    borderColor: tokens.colors.border.hairline,
  },
  closeButtonText: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.bold,
    lineHeight: 14,
  },
  alertSuccessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.status.okBg,
    borderWidth: 1,
    borderColor: tokens.colors.status.okBorder,
    marginHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing.lg,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    gap: tokens.spacing.md,
  },
  alertIconBox: {
    width: 24,
    height: 24,
    borderRadius: tokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertSuccessIcon: {
    color: tokens.colors.status.ok,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.bold,
  },
  alertTextGroup: {
    flex: 1,
  },
  alertSuccessTitle: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.status.ok,
    letterSpacing: 0.5,
  },
  alertSuccessMessage: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.primary,
    marginTop: 2,
  },
  alertErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.status.dangerBg,
    borderWidth: 1,
    borderColor: tokens.colors.status.dangerBorder,
    marginHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing.lg,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    gap: tokens.spacing.md,
  },
  alertErrorIcon: {
    color: tokens.colors.status.danger,
    fontSize: tokens.typography.sizes.sm,
  },
  alertErrorTitle: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.status.danger,
    letterSpacing: 0.5,
  },
  alertErrorMessage: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.primary,
    marginTop: 2,
  },
  scrollBody: {
    flexGrow: 1,
  },
  scrollContent: {
    padding: tokens.spacing.xl,
    gap: tokens.spacing.xl,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs + 1,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    letterSpacing: 0.6,
  },
  sectionSubtitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.muted,
  },
  tierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
  },
  tierCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: tokens.colors.bg.panel,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.hairline,
    padding: tokens.spacing.lg,
    position: 'relative',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
      } as any,
    }),
  },
  tierCardSelected: {
    borderColor: tokens.colors.border.active,
    backgroundColor: tokens.colors.bg.elevated,
  },
  tierCardCurrent: {
    borderColor: tokens.colors.status.okBorder,
  },
  tierBadge: {
    position: 'absolute',
    top: -9,
    right: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
  },
  tierBadgePrimary: {
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.active,
  },
  tierBadgeGold: {
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.status.warningBorder,
  },
  tierBadgeDefault: {
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
  },
  tierBadgeText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    fontWeight: tokens.typography.weights.bold,
    letterSpacing: 0.4,
  },
  tierBadgeTextPrimary: {
    color: tokens.colors.text.primary,
  },
  tierBadgeTextGold: {
    color: tokens.colors.status.warning,
  },
  tierBadgeTextDefault: {
    color: tokens.colors.text.muted,
  },
  tierHeader: {
    gap: 4,
    marginBottom: tokens.spacing.md,
  },
  tierRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    borderColor: tokens.colors.border.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: tokens.colors.text.primary,
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.text.primary,
  },
  tierDisplayName: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.base,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
  },
  tierSubtitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.secondary,
    marginLeft: 22,
  },
  tierPriceContainer: {
    paddingVertical: tokens.spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: tokens.colors.border.hairline,
    marginBottom: tokens.spacing.md,
  },
  tierPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencyPrefix: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.secondary,
    marginRight: 2,
  },
  tierPriceNumeral: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes['2xl'],
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  tierPeriodLabel: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.muted,
    marginTop: 2,
  },
  activePlanChip: {
    backgroundColor: tokens.colors.status.okBg,
    borderColor: tokens.colors.status.okBorder,
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
    alignSelf: 'flex-start',
    marginBottom: tokens.spacing.sm,
  },
  activePlanChipText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.status.ok,
    letterSpacing: 0.5,
  },
  featureListContainer: {
    gap: tokens.spacing.sm,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.xs + 2,
  },
  featureCheckMark: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.status.ok,
    lineHeight: 16,
  },
  featureText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.secondary,
    lineHeight: 16,
    flex: 1,
  },
  invoicePanel: {
    backgroundColor: tokens.colors.bg.inset,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.subtle,
    padding: tokens.spacing.lg,
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.hairline,
    paddingBottom: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  invoiceSectionTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs + 1,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    letterSpacing: 0.6,
  },
  invoiceSubtext: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.muted,
    marginTop: 2,
  },
  gstTag: {
    backgroundColor: tokens.colors.bg.elevated,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
  },
  gstTagText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 9,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
  },
  monospaceTable: {
    gap: tokens.spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableRowTax: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: tokens.spacing.md,
  },
  tableLabel: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs + 1,
    color: tokens.colors.text.secondary,
  },
  tableLabelSubtle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.muted,
    fontStyle: 'italic',
  },
  tableValueMono: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
    color: tokens.colors.text.primary,
    letterSpacing: 0.5,
  },
  tableValueTaxMono: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs + 1,
    fontWeight: tokens.typography.weights.regular,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
  },
  tableDivider: {
    height: 1,
    backgroundColor: tokens.colors.border.active,
    marginVertical: tokens.spacing.xs,
  },
  tableTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: tokens.spacing.xs,
  },
  tableTotalLabel: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    letterSpacing: 0.5,
  },
  tableTotalSublabel: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs - 1,
    color: tokens.colors.text.muted,
    marginTop: 2,
  },
  tableTotalValueMono: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    letterSpacing: 0.5,
  },
  trustContainer: {
    gap: tokens.spacing.md,
  },
  trustSectionTitle: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs + 1,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    letterSpacing: 0.6,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  trustBadgeCard: {
    flex: 1,
    minWidth: 160,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    backgroundColor: tokens.colors.bg.panel,
    borderWidth: 1,
    borderColor: tokens.colors.border.hairline,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  trustBadgeIcon: {
    fontSize: tokens.typography.sizes.md,
  },
  trustBadgeTitle: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 10,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    letterSpacing: 0.4,
  },
  trustBadgeDesc: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs - 1,
    color: tokens.colors.text.muted,
    marginTop: 2,
  },
  paymentMethodsRow: {
    backgroundColor: tokens.colors.bg.inset,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.hairline,
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  paymentMethodLabel: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: 10,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
  },
  paymentPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs + 2,
  },
  paymentPill: {
    backgroundColor: tokens.colors.bg.elevated,
    borderWidth: 1,
    borderColor: tokens.colors.border.hairline,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 3,
  },
  paymentPillText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs - 1,
    color: tokens.colors.text.secondary,
  },
  ctaContainer: {
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.xs,
  },
  chromeCtaButton: {
    backgroundColor: tokens.colors.chrome.buttonBg,
    borderWidth: 1,
    borderColor: tokens.colors.chrome.border,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      } as any,
    }),
  },
  chromeCtaButtonDisabled: {
    backgroundColor: tokens.colors.chrome.disabledBg,
    borderColor: tokens.colors.chrome.disabledBorder,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      } as any,
    }),
  },
  chromeCtaButtonLoading: {
    opacity: 0.8,
  },
  ctaContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  ctaLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  chromeCtaButtonText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.base,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    letterSpacing: 0.6,
  },
  ctaArrowSymbol: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
  },
  ctaGuaranteeText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.muted,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default HighTrustCheckout;
