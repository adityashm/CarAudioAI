import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  getPlans,
  createOrder,
  verifyPayment,
  initiateWebRazorpayCheckout,
  PaymentPlan,
  FALLBACK_PLANS,
} from '@/services/paymentService';
import { UserProfile, getCurrentUser } from '@/services/authService';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onPlanUpgraded: (newTier: 'free' | 'pro_monthly' | 'pro_yearly' | 'installer') => void;
}

export default function PaymentModal({
  visible,
  onClose,
  currentUser,
  onPlanUpgraded,
}: PaymentModalProps) {
  const [plans, setPlans] = useState<PaymentPlan[]>(FALLBACK_PLANS);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadPlans();
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [visible]);

  const loadPlans = async () => {
    const fetched = await getPlans();
    setPlans(fetched);
  };

  const handleSubscribe = async (plan: PaymentPlan) => {
    if (plan.price_inr === 0) {
      setSuccessMsg('You are already on the Free tier.');
      return;
    }

    setLoadingPlan(plan.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Create order
      const order = await createOrder(plan.id);

      // 2. Open Razorpay Checkout (Web or simulated)
      initiateWebRazorpayCheckout({
        orderId: order.order_id,
        amountInr: order.amount_inr,
        planId: plan.id as any,
        userPhone: currentUser?.phone_number || '+919876543210',
        onSuccess: async (paymentId, orderId, signature) => {
          try {
            // 3. Verify payment signature
            const verifyRes = await verifyPayment(
              orderId,
              paymentId,
              signature,
              plan.id as any
            );
            setSuccessMsg(
              `Payment Successful! Upgraded to ${plan.name} (Order: ${orderId.slice(0, 14)}...)`
            );
            onPlanUpgraded(plan.id as any);
            setLoadingPlan(null);
            setTimeout(() => {
              onClose();
            }, 1800);
          } catch (verifyErr: any) {
            setErrorMsg(verifyErr.message || 'Payment signature verification failed.');
            setLoadingPlan(null);
          }
        },
        onDismiss: () => {
          setLoadingPlan(null);
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate payment. Please try again.');
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    const userTier = currentUser?.subscription_tier || 'free';
    if (planId === 'free' && userTier === 'free') return true;
    if (planId === 'pro_monthly' && userTier === 'pro_monthly') return true;
    if (planId === 'pro_yearly' && (userTier === 'pro_yearly' || userTier === 'installer')) return true;
    return false;
  };

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
                <View style={styles.goldDot} />
                <Text style={styles.modalTitle}>Upgrade to CarAudioAI Pro</Text>
              </View>
              <Text style={styles.modalSub}>
                Studio-grade acoustic calibration, Linkwitz-Riley crossovers, and direct DSP flashing
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {successMsg && (
            <View style={styles.alertSuccess}>
              <Text style={styles.alertSuccessText}>🎉 {successMsg}</Text>
            </View>
          )}

          {errorMsg && (
            <View style={styles.alertError}>
              <Text style={styles.alertErrorText}>⚠️ {errorMsg}</Text>
            </View>
          )}

          {/* Pricing Plans Grid */}
          <ScrollView
            style={styles.plansScrollView}
            contentContainerStyle={styles.plansContainer}
            showsVerticalScrollIndicator={false}
          >
            {plans.map((plan) => {
              const active = isCurrentPlan(plan.id);
              const isPopular = plan.id === 'pro_monthly';
              const isYearly = plan.id === 'pro_yearly';

              return (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    isPopular && styles.planCardPopular,
                    isYearly && styles.planCardYearly,
                    active && styles.planCardActive,
                  ]}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <View
                      style={[
                        styles.planBadge,
                        isYearly ? styles.badgeGold : styles.badgeCyan,
                      ]}
                    >
                      <Text style={styles.planBadgeText}>{plan.badge}</Text>
                    </View>
                  )}

                  <Text style={styles.planName}>{plan.name}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <Text style={styles.priceValue}>{plan.price_inr}</Text>
                    <Text style={styles.priceInterval}>
                      {plan.price_inr === 0 ? '' : ` / ${plan.interval}`}
                    </Text>
                  </View>

                  <View style={styles.featuresList}>
                    {plan.features.map((feature, i) => (
                      <View key={i} style={styles.featureItem}>
                        <Text style={styles.featureCheck}>✓</Text>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.subscribeBtn,
                      active && styles.subscribeBtnCurrent,
                      isYearly && !active && styles.subscribeBtnGold,
                    ]}
                    disabled={active || loadingPlan !== null}
                    onPress={() => handleSubscribe(plan)}
                  >
                    {loadingPlan === plan.id ? (
                      <ActivityIndicator color="#020617" />
                    ) : (
                      <Text
                        style={[
                          styles.subscribeBtnText,
                          active && styles.subscribeBtnCurrentText,
                          isYearly && !active && styles.subscribeBtnGoldText,
                        ]}
                      >
                        {active
                          ? 'Current Plan'
                          : plan.price_inr === 0
                          ? 'Free Tier'
                          : `Pay with Razorpay (₹${plan.price_inr}) →`}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* Secure Payment Footer Note */}
          <View style={styles.secureFooter}>
            <Text style={styles.secureText}>
              🔒 Secured with 256-Bit Razorpay HMAC-SHA256 • UPI, Cards, NetBanking Supported
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 780,
    maxHeight: '90%',
    backgroundColor: '#0a101f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    padding: 20,
    shadowColor: '#06b6d4',
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 12,
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  alertSuccessText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  alertErrorText: {
    color: '#ef4444',
    fontSize: 12,
  },
  plansScrollView: {
    flexGrow: 0,
  },
  plansContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  planCard: {
    flex: 1,
    minWidth: 220,
    maxWidth: 240,
    backgroundColor: '#070d18',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    position: 'relative',
  },
  planCardPopular: {
    borderColor: '#06b6d4',
    backgroundColor: '#091c2e',
  },
  planCardYearly: {
    borderColor: '#f59e0b',
    backgroundColor: '#1c1608',
  },
  planCardActive: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeCyan: {
    backgroundColor: '#06b6d4',
  },
  badgeGold: {
    backgroundColor: '#f59e0b',
  },
  planBadgeText: {
    color: '#020617',
    fontSize: 9,
    fontWeight: '900',
  },
  planName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  currencySymbol: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceValue: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    marginHorizontal: 2,
  },
  priceInterval: {
    color: '#94a3b8',
    fontSize: 11,
  },
  featuresList: {
    gap: 8,
    marginBottom: 16,
    minHeight: 140,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  featureCheck: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  subscribeBtn: {
    backgroundColor: '#06b6d4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  subscribeBtnGold: {
    backgroundColor: '#f59e0b',
  },
  subscribeBtnCurrent: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
  },
  subscribeBtnText: {
    color: '#020617',
    fontSize: 11,
    fontWeight: 'bold',
  },
  subscribeBtnGoldText: {
    color: '#020617',
  },
  subscribeBtnCurrentText: {
    color: '#94a3b8',
  },
  secureFooter: {
    marginTop: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
  },
  secureText: {
    color: '#64748b',
    fontSize: 10,
  },
});
