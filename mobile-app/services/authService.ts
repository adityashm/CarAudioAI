import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './api';

export interface UserProfile {
  id: number;
  phone_number: string;
  name?: string;
  subscription_tier: 'free' | 'pro_monthly' | 'pro_yearly' | 'installer';
  subscription_expires_at?: string | null;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  status: string;
}

export interface VerifyOtpResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  phone_number: string;
  subscription_tier: 'free' | 'pro_monthly' | 'pro_yearly' | 'installer';
}

/**
 * Send 6-digit OTP to Indian phone number (+91...)
 */
export async function sendOtp(phoneNumber: string): Promise<SendOtpResponse> {
  // Format phone number to clean +91 format if needed
  let cleaned = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
  if (!cleaned.startsWith('+91') && !cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = `+91${cleaned}`;
    }
  }

  try {
    const response = await apiClient.post<SendOtpResponse>('/api/auth/send-otp', {
      phone_number: cleaned,
    });
    return response.data;
  } catch (error: any) {
    console.warn('[AuthService] sendOtp failed, falling back to simulated OTP:', error.message);
    // Offline / Fallback response
    return {
      success: true,
      message: 'Demo mode active. Use OTP: 123456',
      status: 'development_mode',
    };
  }
}

/**
 * Verify OTP code and save JWT token & user profile
 */
export async function verifyOtp(
  phoneNumber: string,
  otpCode: string,
  name?: string
): Promise<VerifyOtpResponse> {
  let cleaned = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
  if (!cleaned.startsWith('+91') && !cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = `+91${cleaned}`;
    }
  }

  try {
    const response = await apiClient.post<VerifyOtpResponse>('/api/auth/verify-otp', {
      phone_number: cleaned,
      otp_code: otpCode,
      name: name || 'Car Audio Enthusiast',
    });

    const data = response.data;
    if (data.access_token) {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      const userProfile: UserProfile = {
        id: data.user_id,
        phone_number: data.phone_number,
        name: name || 'Car Audio Enthusiast',
        subscription_tier: data.subscription_tier,
      };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
    }
    return data;
  } catch (error: any) {
    console.warn('[AuthService] verifyOtp backend error, checking dev fallback:', error.message);
    // Development fallback if offline and OTP is 123456
    if (otpCode === '123456') {
      const mockToken = `mock_jwt_token_${Date.now()}`;
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
      const fallbackUser: UserProfile = {
        id: 1,
        phone_number: cleaned,
        name: name || 'Car Audio Enthusiast',
        subscription_tier: 'free',
      };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser));
      return {
        access_token: mockToken,
        token_type: 'bearer',
        user_id: 1,
        phone_number: cleaned,
        subscription_tier: 'free',
      };
    }
    throw new Error(error.response?.data?.detail || 'Invalid or expired OTP code');
  }
}

/**
 * Fetch authenticated user profile from backend with local cache fallback
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;

    try {
      const response = await apiClient.get<UserProfile>('/api/auth/me');
      const user = response.data;
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (apiError) {
      // Backend offline, fallback to cached user
      const cached = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached) as UserProfile;
      }
      return null;
    }
  } catch (e) {
    console.warn('[AuthService] getCurrentUser error:', e);
    return null;
  }
}

/**
 * Get stored token string
 */
export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Log out and clear stored session
 */
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  await AsyncStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Update locally cached user subscription tier (after payment)
 */
export async function updateCachedSubscriptionTier(
  tier: 'free' | 'pro_monthly' | 'pro_yearly' | 'installer'
): Promise<UserProfile | null> {
  try {
    const cached = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (cached) {
      const user: UserProfile = JSON.parse(cached);
      user.subscription_tier = tier;
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
    const newUser: UserProfile = {
      id: 1,
      phone_number: '+919876543210',
      name: 'Car Audio Enthusiast',
      subscription_tier: tier,
    };
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  } catch (e) {
    console.warn('[AuthService] updateCachedSubscriptionTier error:', e);
    return null;
  }
}
