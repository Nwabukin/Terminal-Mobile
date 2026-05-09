import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
import * as authApi from '../api/auth';
import { fetchMe } from '../api/users';
import type { LoginFormData, RegisterFormData } from '../utils/validation';

export function useAuth() {
  const { setUser, setTokens, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const tokens = await authApi.login(data);
      await setTokens({ access: tokens.access, refresh: tokens.refresh });

      const meResponse = await fetchMe();
      setUser(meResponse.data);
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Couldn't reach the server. Tap to retry.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      await setTokens(response.tokens);
      setUser({
        id: response.user.id,
        email: response.user.email,
        full_name: response.user.full_name,
        is_owner: response.user.is_owner,
        is_renter: response.user.is_renter,
        phone: data.phone,
        first_name: data.first_name,
        last_name: data.last_name,
        profile_photo: null,
        bio: '',
        verification_level: 0,
        is_phone_verified: false,
        is_email_verified: true,
        is_id_verified: false,
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      const errors = err.response?.data?.errors || err.response?.data;
      if (typeof errors === 'object' && errors !== null) {
        const firstKey = Object.keys(errors)[0];
        const firstError = Array.isArray(errors[firstKey])
          ? errors[firstKey][0]
          : errors[firstKey];
        setError(String(firstError));
      } else {
        setError("Couldn't reach the server. Tap to retry.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhone = async (otpCode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.verifyPhone({ otp_code: otpCode });
      const meResponse = await fetchMe();
      setUser(meResponse.data);
    } catch (err: any) {
      const message =
        err.response?.data?.errors?.otp_code ||
        err.response?.data?.message ||
        'Invalid or expired code. Request a new one.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    try {
      await authApi.resendOtp();
    } catch {
      setError("Couldn't send a new code. Tap to retry.");
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (refreshToken) {
        await authApi.logout({ refresh: refreshToken });
      }
    } catch {
      // Logout is best-effort
    } finally {
      await clearAuth();
    }
  };

  return {
    isLoading,
    error,
    setError,
    handleLogin,
    handleRegister,
    handleVerifyPhone,
    handleResendOtp,
    handleLogout,
  };
}
