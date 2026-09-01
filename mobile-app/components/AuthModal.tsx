import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  sendOtp,
  verifyOtp,
  getCurrentUser,
  logout,
  UserProfile,
} from '@/services/authService';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onUserChange?: (user: UserProfile | null) => void;
}

export default function AuthModal({ visible, onClose, onUserChange }: AuthModalProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadUser();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [visible]);

  const loadUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
    if (onUserChange) onUserChange(user);
  };

  const handleSendOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(phone);
      setStep('otp');
      setSuccessMsg(res.message || 'OTP sent successfully! (Dev code: 123456)');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!otp || otp.length < 4) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp, name);
      const user: UserProfile = {
        id: res.user_id,
        phone_number: res.phone_number,
        name: name || 'Car Audio Enthusiast',
        subscription_tier: res.subscription_tier,
      };
      setCurrentUser(user);
      if (onUserChange) onUserChange(user);
      setSuccessMsg('Successfully logged in!');
      setTimeout(() => {
        onClose();
        setStep('phone');
        setOtp('');
      }, 1000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    if (onUserChange) onUserChange(null);
    setSuccessMsg('Logged out successfully.');
    setStep('phone');
    setPhone('+91');
    setOtp('');
  };

  const getTierBadgeStyle = (tier?: string) => {
    switch (tier) {
      case 'pro_monthly':
        return styles.tierPro;
      case 'pro_yearly':
      case 'installer':
        return styles.tierInstaller;
      default:
        return styles.tierFree;
    }
  };

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'pro_monthly':
        return '⚡ PRO SUBSCRIBER';
      case 'pro_yearly':
      case 'installer':
        return '👑 INSTALLER PRO';
      default:
        return '🌱 FREE TIER';
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
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.cyanDot} />
              <Text style={styles.modalTitle}>
                {currentUser ? 'Your Acoustic Account' : 'Phone OTP Authentication'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* If already logged in */}
          {currentUser ? (
            <View style={styles.profileContent}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>🎵</Text>
              </View>
              <Text style={styles.profileName}>{currentUser.name || 'Car Audio Enthusiast'}</Text>
              <Text style={styles.profilePhone}>{currentUser.phone_number}</Text>

              <View style={[styles.tierBadge, getTierBadgeStyle(currentUser.subscription_tier)]}>
                <Text style={styles.tierBadgeText}>{getTierLabel(currentUser.subscription_tier)}</Text>
              </View>

              <View style={styles.accountStatsBox}>
                <View style={styles.accountStatRow}>
                  <Text style={styles.accountStatKey}>Saved Car Profiles:</Text>
                  <Text style={styles.accountStatVal}>Unlimited</Text>
                </View>
                <View style={styles.accountStatRow}>
                  <Text style={styles.accountStatKey}>DSP Export Format:</Text>
                  <Text style={styles.accountStatVal}>Pioneer XML + MiniDSP JSON</Text>
                </View>
                <View style={styles.accountStatRow}>
                  <Text style={styles.accountStatKey}>Acoustic Speed:</Text>
                  <Text style={styles.accountStatVal}>34.3 cm/ms (20°C)</Text>
                </View>
              </View>

              {successMsg && <Text style={styles.successText}>{successMsg}</Text>}

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Login Form */
            <View style={styles.formContent}>
              <Text style={styles.formSubtitle}>
                Sign in with your Indian phone number to sync custom DSP profiles, gain staging logs, and unlock Pro features.
              </Text>

              {step === 'phone' ? (
                <>
                  <Text style={styles.inputLabel}>Full Name (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Aditya Sharma"
                    placeholderTextColor="#64748b"
                    value={name}
                    onChangeText={setName}
                  />

                  <Text style={styles.inputLabel}>Phone Number (+91)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+919876543210"
                    placeholderTextColor="#64748b"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />

                  {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
                  {successMsg && <Text style={styles.successText}>{successMsg}</Text>}

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleSendOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#020617" />
                    ) : (
                      <Text style={styles.primaryBtnText}>Send 6-Digit OTP SMS →</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Enter 6-Digit OTP sent to {phone}</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="123456"
                    placeholderTextColor="#64748b"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />

                  <Text style={styles.devHintText}>💡 Development Mode: Enter `123456` to sign in instantly.</Text>

                  {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
                  {successMsg && <Text style={styles.successText}>{successMsg}</Text>}

                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={() => setStep('phone')}
                      disabled={loading}
                    >
                      <Text style={styles.secondaryBtnText}>← Change Phone</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.primaryBtn, { flex: 1.5 }]}
                      onPress={handleVerifyOtp}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#020617" />
                      ) : (
                        <Text style={styles.primaryBtnText}>Verify & Sign In</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0a101f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    padding: 20,
    shadowColor: '#06b6d4',
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cyanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06b6d4',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContent: {
    gap: 8,
  },
  formSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  inputLabel: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#070d18',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
  },
  otpInput: {
    fontSize: 18,
    letterSpacing: 4,
    textAlign: 'center',
    color: '#06b6d4',
    fontWeight: 'bold',
  },
  devHintText: {
    color: '#64748b',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  successText: {
    color: '#10b981',
    fontSize: 12,
    marginTop: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  primaryBtn: {
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#06b6d4',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  primaryBtnText: {
    color: '#020617',
    fontSize: 13,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtnText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#070d18',
    borderWidth: 2,
    borderColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 26,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profilePhone: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  tierFree: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderWidth: 1,
    borderColor: '#64748b',
  },
  tierPro: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: '#06b6d4',
  },
  tierInstaller: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  tierBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  accountStatsBox: {
    width: '100%',
    backgroundColor: '#070d18',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 8,
    marginBottom: 16,
  },
  accountStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountStatKey: {
    color: '#64748b',
    fontSize: 11,
  },
  accountStatVal: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
