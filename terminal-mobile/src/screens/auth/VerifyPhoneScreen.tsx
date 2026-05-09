import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { typeScale, fontFamilies } from '../../theme/typography';
import { spacing, radii, screenPadding } from '../../theme/spacing';

const OTP_LENGTH = 6;

export function VerifyPhoneScreen() {
  const { handleVerifyPhone, handleResendOtp, isLoading, error, setError } =
    useAuth();
  const user = useAuthStore((s) => s.user);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDigitChange = (text: string, index: number) => {
    if (text.length > 1) {
      const pasted = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const newDigits = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < OTP_LENGTH) {
          newDigits[index + i] = pasted[i];
        }
      }
      setDigits(newDigits);
      const nextIndex = Math.min(index + pasted.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = text.replace(/\D/g, '');
    setDigits(newDigits);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = digits.join('');
    if (code.length !== OTP_LENGTH) return;
    try {
      await handleVerifyPhone(code);
    } catch {
      // Error is set in useAuth
    }
  };

  const handleResend = async () => {
    await handleResendOtp();
    setResendCooldown(60);
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.heading}>VERIFY PHONE</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{' '}
              <Text style={styles.phone}>{user?.phone ?? 'your phone'}</Text>.
            </Text>
            <Text style={styles.hint}>
              Check the server console for the OTP code.
            </Text>
          </View>

          {error && (
            <TouchableOpacity
              style={styles.errorBanner}
              onPress={() => setError(null)}
            >
              <Text style={styles.errorText}>{error}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.otpRow}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : undefined,
                ]}
                value={digit}
                onChangeText={(text) => handleDigitChange(text, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="number-pad"
                maxLength={index === 0 ? OTP_LENGTH : 1}
                selectTextOnFocus
                caretHidden
              />
            ))}
          </View>

          <Button
            title="Verify"
            onPress={handleSubmit}
            isLoading={isLoading}
            disabled={!isComplete}
            style={styles.submitButton}
          />

          <View style={styles.resendRow}>
            {resendCooldown > 0 ? (
              <Text style={styles.resendCooldownText}>
                Resend available in {resendCooldown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendText}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.abyss,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: screenPadding.horizontal,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  heading: {
    ...typeScale.display3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typeScale.body1,
    color: colors.textSecondary,
  },
  phone: {
    color: colors.textPrimary,
  },
  hint: {
    ...typeScale.body2,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  errorBanner: {
    backgroundColor: colors.bgTintedDanger,
    borderRadius: 4,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  errorText: {
    ...typeScale.body2,
    color: colors.alertSoft,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  otpBox: {
    flex: 1,
    height: 56,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.default,
    textAlign: 'center',
    fontFamily: fontFamilies.mono,
    fontSize: 24,
    color: colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: colors.forge,
  },
  submitButton: {
    marginBottom: spacing.xl,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendText: {
    ...typeScale.body1,
    color: colors.forge,
  },
  resendCooldownText: {
    ...typeScale.body2,
    color: colors.textTertiary,
  },
});
