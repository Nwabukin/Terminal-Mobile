import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  IconCheck,
  IconClock,
  IconUpload,
  IconChevronRight,
  IconLogout,
} from '@tabler/icons-react-native';

import { colors } from '../../theme/colors';
import { typeScale, fontFamilies } from '../../theme/typography';
import { spacing, radii, screenPadding } from '../../theme/spacing';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import apiClient from '../../api/client';
import { API_BASE_URL } from '../../utils/constants';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const activeRole = useAppStore((s) => s.activeRole);
  const setActiveRole = useAppStore((s) => s.setActiveRole);

  const isOwner = activeRole === 'owner';
  const [passwordExpanded, setPasswordExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [togglingRole, setTogglingRole] = useState(false);
  const [uploadingKyc, setUploadingKyc] = useState(false);

  const handleRoleToggle = useCallback(
    async (value: boolean) => {
      const newRole = value ? 'owner' : 'renter';
      setTogglingRole(true);
      try {
        await apiClient.patch('/users/me/role/', {
          is_owner: value,
          is_renter: !value,
        });
        await setActiveRole(newRole);
      } catch {
        Alert.alert('Error', 'Could not update role.');
      } finally {
        setTogglingRole(false);
      }
    },
    [setActiveRole],
  );

  const handleKycUpload = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      type: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? 'document.jpg',
    } as any);
    formData.append('document_type', 'id');

    setUploadingKyc(true);
    try {
      await apiClient.post('/users/me/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Document uploaded', 'Verification will be reviewed.');
    } catch {
      Alert.alert('Error', 'Could not upload document.');
    } finally {
      setUploadingKyc(false);
    }
  }, []);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setChangingPassword(true);
    try {
      await apiClient.post('/auth/password/change/', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      Alert.alert('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordExpanded(false);
    } catch {
      Alert.alert('Error', 'Could not change password.');
    } finally {
      setChangingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handleLogout = useCallback(() => {
    Alert.alert('Log out', 'End your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => clearAuth(),
      },
    ]);
  }, [clearAuth]);

  const verificationRows = [
    {
      label: 'Phone',
      verified: user?.is_phone_verified ?? false,
    },
    {
      label: 'Email',
      verified: user?.is_email_verified ?? false,
    },
    {
      label: 'ID',
      verified: user?.is_id_verified ?? false,
    },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={s.profileHeader}>
          <Avatar
            uri={user?.profile_photo}
            initials={getInitials(user?.full_name ?? '??')}
            size={80}
          />
          <Text style={s.fullName}>{user?.full_name ?? '--'}</Text>
          <Text style={s.email}>{user?.email ?? '--'}</Text>
        </View>

        {/* Role toggle */}
        <View style={s.card}>
          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>I am an owner</Text>
            <Switch
              value={isOwner}
              onValueChange={handleRoleToggle}
              trackColor={{ false: colors.surfaceHigh, true: colors.forgeDim }}
              thumbColor={isOwner ? colors.forge : colors.textSecondary}
              disabled={togglingRole}
            />
          </View>
        </View>

        {/* Verification */}
        <View style={s.card}>
          <Text style={s.cardLabel}>VERIFICATION</Text>
          {verificationRows.map((row) => (
            <View key={row.label} style={s.verifyRow}>
              <Text style={s.verifyLabel}>{row.label}</Text>
              {row.verified ? (
                <IconCheck size={18} color={colors.clear} strokeWidth={1.5} />
              ) : (
                <IconClock size={18} color={colors.textTertiary} strokeWidth={1.5} />
              )}
            </View>
          ))}
        </View>

        {/* KYC upload */}
        <View style={s.card}>
          <Text style={s.cardLabel}>DOCUMENTS</Text>
          <Button
            title={uploadingKyc ? 'Uploading...' : 'Upload ID document'}
            onPress={handleKycUpload}
            variant="secondary"
            isLoading={uploadingKyc}
            style={s.kycButton}
          />
        </View>

        {/* Change password */}
        <Pressable
          style={s.card}
          onPress={() => setPasswordExpanded(!passwordExpanded)}
        >
          <View style={s.expandableHeader}>
            <Text style={s.cardLabel}>CHANGE PASSWORD</Text>
            <IconChevronRight
              size={18}
              color={colors.textTertiary}
              strokeWidth={1.5}
              style={passwordExpanded ? s.chevronDown : undefined}
            />
          </View>

          {passwordExpanded && (
            <View style={s.passwordForm}>
              <TextInput
                style={s.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
              />
              <TextInput
                style={s.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
              />
              <TextInput
                style={s.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
              />
              <Button
                title="Update password"
                onPress={handleChangePassword}
                isLoading={changingPassword}
                style={s.passwordBtn}
              />
            </View>
          )}
        </Pressable>

        {/* Log out */}
        <Pressable style={s.logoutRow} onPress={handleLogout}>
          <IconLogout size={20} color={colors.alert} strokeWidth={1.5} />
          <Text style={s.logoutText}>Log out</Text>
        </Pressable>

        {/* App info */}
        <View style={s.appInfo}>
          <Text style={s.appInfoText}>Terminal Mobile v1.0.0</Text>
          <Text style={s.appInfoUrl}>{API_BASE_URL}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.abyss,
  },
  scrollContent: {
    paddingHorizontal: screenPadding.horizontal,
    paddingBottom: spacing['3xl'],
  },

  // Header
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  fullName: {
    ...typeScale.h1,
    color: colors.textPrimary,
    marginTop: spacing.base,
  },
  email: {
    ...typeScale.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  cardLabel: {
    ...typeScale.caption,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    ...typeScale.body1,
    color: colors.textPrimary,
  },

  // Verification
  verifyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  verifyLabel: {
    ...typeScale.body1,
    color: colors.textPrimary,
  },

  // KYC
  kycButton: {
    marginTop: spacing.xs,
  },

  // Password
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chevronDown: {
    transform: [{ rotate: '90deg' }],
  },
  passwordForm: {
    marginTop: spacing.base,
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.default,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    ...typeScale.body1,
    color: colors.textPrimary,
  },
  passwordBtn: {
    marginTop: spacing.sm,
  },

  // Logout
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    marginTop: spacing.base,
  },
  logoutText: {
    ...typeScale.body1,
    color: colors.alert,
  },

  // App info
  appInfo: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  appInfoText: {
    ...typeScale.mono3,
    color: colors.textTertiary,
  },
  appInfoUrl: {
    ...typeScale.mono3,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
