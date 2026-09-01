import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { tokens } from '../../design-system/tokens';
import { InstrumentPanel } from '../ui/InstrumentPanel';
import { Button } from '../ui/Button';
import { Readout } from '../ui/Readout';
import {
  sendOtp,
  verifyOtp,
  getCurrentUser,
  logout,
  UserProfile,
} from '../../services/authService';

export interface PhoneOtpModalProps {
  visible: boolean;
  onClose: () => void;
  onUserChange?: (user: UserProfile | null) => void;
  onSuccess?: (user: UserProfile) => void;
}

export const PhoneOtpModal: React.FC<PhoneOtpModalProps> = ({
  visible,
  onClose,
  onUserChange,
  onSuccess,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 6-digit OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  // 30s resend timer state
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [isResendActive, setIsResendActive] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  // Load current user when modal becomes visible
  useEffect(() => {
    if (visible) {
      loadUser();
      setErrorMsg(null);
      setSuccessMsg(null);
    } else {
      stopTimer();
    }
  }, [visible]);

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (onUserChange) onUserChange(user);
    } catch (e) {
      console.warn('[PhoneOtpModal] Failed to load user:', e);
    }
  };

  // Timer helper
  const startResendTimer = useCallback(() => {
    setResendTimer(30);
    setIsResendActive(true);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setIsResendActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  const formattedFullPhone = +91;

  const handleSendOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const clean = phoneDigits.replace(/\D/g, '');
    if (clean.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(formattedFullPhone);
      setStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
      startResendTimer();
      setSuccessMsg(res.message || 'OTP sent successfully! (Dev code: 123456)');
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to dispatch OTP SMS. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResendActive || loading) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await sendOtp(formattedFullPhone);
      startResendTimer();
      setSuccessMsg(res.message || 'New OTP sent successfully! (Dev code: 123456)');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    setErrorMsg(null);
    const cleaned = text.replace(/[^0-9]/g, '');

    // Handle full paste (e.g. user pasted 6 digits into any box)
    if (cleaned.length >= 6) {
      const nextDigits = cleaned.slice(0, 6).split('');
      setOtpDigits(nextDigits);
      otpInputRefs.current[5]?.focus();
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = cleaned ? cleaned.charAt(cleaned.length - 1) : '';
    setOtpDigits(nextDigits);

    // Auto-focus next box if digit was typed
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otpDigits[index] === '' && index > 0) {
        // Move to previous box and clear it
        const nextDigits = [...otpDigits];
        nextDigits[index - 1] = '';
        setOtpDigits(nextDigits);
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const otpCode = otpDigits.join('');

    if (otpCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(formattedFullPhone, otpCode, name.trim() || undefined);
      const user: UserProfile = {
        id: res.user_id,
        phone_number: res.phone_number,
        name: name.trim() || 'Car Audio Enthusiast',
        subscription_tier: res.subscription_tier,
      };
      setCurrentUser(user);
      if (onUserChange) onUserChange(user);
      if (onSuccess) onSuccess(user);
      setSuccessMsg('Authentication verified. Welcome!');
      setTimeout(() => {
        onClose();
        setStep('phone');
        setOtpDigits(['', '', '', '', '', '']);
      }, 900);
    } catch (e: any) {
      setErrorMsg(e.message || 'Invalid or expired OTP code. Use 123456 for dev mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    if (onUserChange) onUserChange(null);
    setSuccessMsg('Signed out successfully.');
    setStep('phone');
    setPhoneDigits('');
    setOtpDigits(['', '', '', '', '', '']);
    stopTimer();
  };

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'pro_monthly':
        return 'PRO MONTHLY';
      case 'pro_yearly':
      case 'installer':
        return 'INSTALLER PRO';
      default:
        return 'FREE TIER';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <InstrumentPanel
          variant="elevated"
          title={currentUser ? 'USER ACCOUNT' : 'PHONE AUTHENTICATION'}
          subtitle={
            currentUser
              ? 'DSP Session & Cloud Preset Sync'
              : 'Secure Indian Mobile (+91) OTP Login'
          }
          badge={currentUser ? 'AUTHENTICATED' : 'SECURE RHD'}
          status={currentUser ? 'ok' : 'neutral'}
          action={
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} testID="auth-close-btn">
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          }
          style={styles.modalPanel}
        >
          {/* If already authenticated */}
          {currentUser ? (
            <View style={styles.profileSection}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarIcon}>🎛️</Text>
              </View>

              <Text style={styles.userName}>{currentUser.name || 'Car Audio Installer'}</Text>
              <Text style={styles.userPhone}>{currentUser.phone_number}</Text>

              <View style={styles.badgeRow}>
                <View style={styles.tierPill}>
                  <View style={styles.tierDot} />
                  <Text style={styles.tierPillText}>
                    {getTierLabel(currentUser.subscription_tier)}
                  </Text>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <Readout
                  label="VEHICLE PROFILES"
                  value="UNLIMITED"
                  size="sm"
                  orientation="horizontal"
                  style={styles.statReadout}
                />
                <Readout
                  label="DSP EXPORTERS"
                  value="XML + JSON"
                  size="sm"
                  orientation="horizontal"
                  style={styles.statReadout}
                />
                <Readout
                  label="ACOUSTIC ENGINE"
                  value="34.3"
                  unit="cm/ms"
                  size="sm"
                  orientation="horizontal"
                  style={styles.statReadout}
                />
              </View>

              {successMsg && (
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>{successMsg}</Text>
                </View>
              )}

              <View style={styles.authBtnRow}>
                <Button
                  label="Sign Out"
                  variant="outline"
                  size="md"
                  onPress={handleLogout}
                  style={styles.fullWidthBtn}
                />
                <Button
                  label="Done"
                  variant="solid"
                  size="md"
                  onPress={onClose}
                  style={styles.fullWidthBtn}
                />
              </View>
            </View>
          ) : (
            /* Unauthenticated Login Flow */
            <View style={styles.formSection}>
              {step === 'phone' ? (
                <>
                  <Text style={styles.guideText}>
                    Sign in with your Indian phone number to synchronize custom DSP calibrations, Linkwitz-Riley crossovers, and amplifier gain staging.
                  </Text>

                  {/* Optional Name */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>FULL NAME / INSTALLER HANDLE (OPTIONAL)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Aditya Sharma"
                      placeholderTextColor={tokens.colors.text.muted}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  {/* Phone Input with +91 prefix */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>INDIAN MOBILE NUMBER</Text>
                    <View style={styles.phoneInputRow}>
                      <View style={styles.prefixBox}>
                        <Text style={styles.prefixText}>🇮🇳 +91</Text>
                      </View>
                      <TextInput
                        style={[styles.textInput, styles.phoneInput]}
                        placeholder="98765 43210"
                        placeholderTextColor={tokens.colors.text.muted}
                        value={phoneDigits}
                        onChangeText={(t) => setPhoneDigits(t.replace(/[^0-9]/g, '').slice(0, 10))}
                        keyboardType="phone-pad"
                        maxLength={10}
                      />
                    </View>
                  </View>

                  {errorMsg && (
                    <View style={styles.errorBanner}>
                      <Text style={styles.errorText}>{errorMsg}</Text>
                    </View>
                  )}
                  {successMsg && (
                    <View style={styles.successBanner}>
                      <Text style={styles.successText}>{successMsg}</Text>
                    </View>
                  )}

                  <Button
                    label="Send 6-Digit OTP SMS →"
                    variant="solid"
                    size="lg"
                    loading={loading}
                    disabled={loading || phoneDigits.length < 10}
                    onPress={handleSendOtp}
                    style={styles.actionBtn}
                  />
                </>
              ) : (
                /* OTP Verification Step */
                <>
                  <Text style={styles.guideText}>
                    Enter the 6-digit verification code sent to{' '}
                    <Text style={styles.phoneHighlight}>{formattedFullPhone}</Text>
                  </Text>

                  {/* 6 Discrete Monospace OTP Boxes */}
                  <View style={styles.otpGrid}>
                    {otpDigits.map((digit, idx) => (
                      <TextInput
                        key={idx}
                        ref={(ref) => {
                          otpInputRefs.current[idx] = ref;
                        }}
                        style={[
                          styles.otpBox,
                          digit !== '' && styles.otpBoxFilled,
                        ]}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, idx)}
                        onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                        textAlign="center"
                      />
                    ))}
                  </View>

                  {/* Resend Timer & Change Phone Row */}
                  <View style={styles.otpMetaRow}>
                    <TouchableOpacity
                      onPress={() => {
                        stopTimer();
                        setStep('phone');
                        setErrorMsg(null);
                      }}
                      style={styles.changePhoneBtn}
                    >
                      <Text style={styles.changePhoneText}>← Change Number</Text>
                    </TouchableOpacity>

                    {isResendActive ? (
                      <Text style={styles.timerText}>
                        Resend code in <Text style={styles.timerMono}>{resendTimer}s</Text>
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                        <Text style={styles.resendLinkText}>Resend OTP SMS</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Dev mode helper notice */}
                  <View style={styles.devNoticeBox}>
                    <Text style={styles.devNoticeText}>
                      💡 Dev Mode: Enter <Text style={styles.devCodeMono}>123456</Text> to authenticate immediately.
                    </Text>
                  </View>

                  {errorMsg && (
                    <View style={styles.errorBanner}>
                      <Text style={styles.errorText}>{errorMsg}</Text>
                    </View>
                  )}
                  {successMsg && (
                    <View style={styles.successBanner}>
                      <Text style={styles.successText}>{successMsg}</Text>
                    </View>
                  )}

                  <Button
                    label="Verify & Authenticate"
                    variant="solid"
                    size="lg"
                    loading={loading}
                    disabled={loading || otpDigits.some((d) => d === '')}
                    onPress={handleVerifyOtp}
                    style={styles.actionBtn}
                  />
                </>
              )}
            </View>
          )}
        </InstrumentPanel>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: tokens.colors.bg.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.md,
  },
  modalPanel: {
    width: '100%',
    maxWidth: 460,
  },
  closeBtn: {
    padding: tokens.spacing.xs,
  },
  closeBtnText: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.md,
    fontFamily: tokens.typography.fontFamily.mono,
  },
  formSection: {
    gap: tokens.spacing.md,
  },
  guideText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.sm,
    color: tokens.colors.text.secondary,
    lineHeight: 20,
  },
  phoneHighlight: {
    fontFamily: tokens.typography.fontFamily.mono,
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.semibold,
  },
  inputGroup: {
    gap: tokens.spacing.xs,
  },
  fieldLabel: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm + 2,
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.sizes.base,
    fontFamily: tokens.typography.fontFamily.sans,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  prefixBox: {
    backgroundColor: tokens.colors.bg.panel,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefixText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.base,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.primary,
  },
  phoneInput: {
    flex: 1,
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.md,
    letterSpacing: 1.5,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tokens.spacing.xs + 2,
    marginVertical: tokens.spacing.xs,
  },
  otpBox: {
    flex: 1,
    height: 52,
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    color: tokens.colors.text.primary,
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    textAlign: 'center',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  otpBoxFilled: {
    borderColor: tokens.colors.border.active,
    backgroundColor: tokens.colors.bg.panel,
  },
  otpMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
  },
  changePhoneBtn: {
    paddingVertical: tokens.spacing.xs,
  },
  changePhoneText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.secondary,
  },
  timerText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.muted,
  },
  timerMono: {
    fontFamily: tokens.typography.fontFamily.mono,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.weights.medium,
  },
  resendLinkText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.primary,
    textDecorationLine: 'underline',
  },
  devNoticeBox: {
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.hairline,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    padding: tokens.spacing.sm,
  },
  devNoticeText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.muted,
  },
  devCodeMono: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.secondary,
  },
  actionBtn: {
    marginTop: tokens.spacing.sm,
  },
  errorBanner: {
    backgroundColor: tokens.colors.status.dangerBg,
    borderColor: tokens.colors.status.dangerBorder,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    padding: tokens.spacing.sm,
  },
  errorText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.status.danger,
  },
  successBanner: {
    backgroundColor: tokens.colors.status.okBg,
    borderColor: tokens.colors.status.okBorder,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    padding: tokens.spacing.sm,
  },
  successText: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.status.ok,
  },
  profileSection: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.sm,
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.bg.inset,
    borderColor: tokens.colors.border.active,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  avatarIcon: {
    fontSize: 24,
  },
  userName: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.primary,
  },
  userPhone: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.sm,
    color: tokens.colors.text.secondary,
  },
  badgeRow: {
    marginVertical: tokens.spacing.xs,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: tokens.colors.status.okBg,
    borderColor: tokens.colors.status.okBorder,
    borderWidth: 1,
    borderRadius: tokens.radius.full,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs - 1,
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.status.ok,
  },
  tierPillText: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.status.ok,
    letterSpacing: 0.5,
  },
  statsContainer: {
    width: '100%',
    gap: tokens.spacing.xs,
    marginVertical: tokens.spacing.sm,
  },
  statReadout: {
    width: '100%',
  },
  authBtnRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    width: '100%',
    marginTop: tokens.spacing.sm,
  },
  fullWidthBtn: {
    flex: 1,
  },
});

export default PhoneOtpModal;
