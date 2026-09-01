import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
} from 'react-native';
import {
  createOrder,
  verifyPayment,
  initiateWebRazorpayCheckout,
  PaymentPlan,
} from '../services/paymentService';
import { UserProfile } from '../services/authService';
import { tokens } from '../design-system/tokens';
import { HighTrustCheckout } from './checkout';

export interface PaymentModalProps {
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
  const [selectedPlanId, setSelectedPlanId] = useState<'free' | 'pro_monthly' | 'pro_yearly'>('pro_monthly');
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSuccessMsg(null);
      setErrorMsg(null);
      setLoadingPlanId(null);
      // Auto-select pro_monthly if current user is on free, or match their tier
      const userTier = currentUser?.subscription_tier;
      if (userTier === 'pro_yearly' || userTier === 'installer') {
        setSelectedPlanId('pro_yearly');
      } else if (userTier === 'pro_monthly') {
        setSelectedPlanId('pro_monthly');
      } else {
        setSelectedPlanId('pro_monthly');
      }
    }
  }, [visible, currentUser]);

  const handleProceedToPay = async (plan: PaymentPlan) => {
    if (plan.price_inr === 0 || plan.id === 'free') {
      setSuccessMsg('Active on Free Enthusiast Tier.');
      onPlanUpgraded('free');
      setTimeout(() => {
        onClose();
      }, 1200);
      return;
    }

    setLoadingPlanId(plan.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Create Razorpay order in INR
      const order = await createOrder(plan.id);

      // 2. Trigger Razorpay Checkout (Web SDK or simulated gateway)
      initiateWebRazorpayCheckout({
        orderId: order.order_id,
        amountInr: order.amount_inr,
        planId: plan.id as 'pro_monthly' | 'pro_yearly',
        userPhone: currentUser?.phone_number || '+919876543210',
        onSuccess: async (paymentId, orderId, signature) => {
          try {
            // 3. Verify cryptographic HMAC signature
            const verifyRes = await verifyPayment(
              orderId,
              paymentId,
              signature,
              plan.id as 'free' | 'pro_monthly' | 'pro_yearly'
            );

            setSuccessMsg(
              `Payment of ₹${order.amount_inr}.00 Verified! Upgraded to ${plan.name}. [Payment Ref: ${paymentId.slice(0, 16)}]`
            );
            onPlanUpgraded(plan.id as any);
            setLoadingPlanId(null);

            // Auto dismiss after user sees verified state
            setTimeout(() => {
              onClose();
            }, 2000);
          } catch (verifyErr: any) {
            setErrorMsg(verifyErr?.message || 'Payment signature verification failed.');
            setLoadingPlanId(null);
          }
        },
        onDismiss: () => {
          setLoadingPlanId(null);
        },
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initialize payment gateway. Please try again.');
      setLoadingPlanId(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <HighTrustCheckout
          currentUser={currentUser}
          selectedPlanId={selectedPlanId}
          onSelectPlan={(tierId) => setSelectedPlanId(tierId)}
          onProceedToPay={handleProceedToPay}
          loadingPlanId={loadingPlanId}
          successMessage={successMsg}
          errorMessage={errorMsg}
          onClose={onClose}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: tokens.colors.bg.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.lg,
  },
});
