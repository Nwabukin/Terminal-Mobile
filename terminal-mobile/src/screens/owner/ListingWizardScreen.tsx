import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import {
  IconCrane,
  IconTruck,
  IconBuildingWarehouse,
  IconAnchor,
  IconBuildingFactory2,
  IconArrowLeft,
  IconX,
  IconPhoto,
} from '@tabler/icons-react-native';

import { colors } from '../../theme/colors';
import { typeScale, fontFamilies } from '../../theme/typography';
import { spacing, radii, screenPadding } from '../../theme/spacing';
import apiClient from '../../api/client';
import { Button } from '../../components/Button';

const TOTAL_STEPS = 6;

const RESOURCE_TYPES = [
  { id: 'equipment', label: 'Equipment', Icon: IconCrane },
  { id: 'vehicle', label: 'Vehicle', Icon: IconTruck },
  { id: 'warehouse', label: 'Warehouse', Icon: IconBuildingWarehouse },
  { id: 'terminal', label: 'Terminal', Icon: IconAnchor },
  { id: 'facility', label: 'Facility', Icon: IconBuildingFactory2 },
] as const;

interface SpecPair {
  key: string;
  value: string;
}

interface WizardState {
  resource_type: string;
  title: string;
  category: string;
  price_daily: string;
  price_weekly: string;
  price_monthly: string;
  location_address: string;
  location_city: string;
  latitude: string;
  longitude: string;
  description: string;
  specs: SpecPair[];
  photos: ImagePicker.ImagePickerAsset[];
}

const INITIAL_STATE: WizardState = {
  resource_type: '',
  title: '',
  category: '',
  price_daily: '',
  price_weekly: '',
  price_monthly: '',
  location_address: '',
  location_city: '',
  latitude: '',
  longitude: '',
  description: '',
  specs: [{ key: '', value: '' }],
  photos: [],
};

export default function ListingWizardScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardState>(INITIAL_STATE);

  const updateField = useCallback(
    <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      const specsObj: Record<string, string> = {};
      form.specs
        .filter((s) => s.key.trim() && s.value.trim())
        .forEach((s) => {
          specsObj[s.key.trim()] = s.value.trim();
        });

      const payload = {
        resource_type: form.resource_type,
        title: form.title,
        category: form.category,
        price_daily: form.price_daily || null,
        price_weekly: form.price_weekly || null,
        price_monthly: form.price_monthly || null,
        location_address: form.location_address,
        location_city: form.location_city,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        description: form.description,
        specs: specsObj,
      };

      const { data: listingRes } = await apiClient.post('/listings/', payload);
      const listingId = listingRes.data?.id ?? listingRes.id;

      for (let i = 0; i < form.photos.length; i++) {
        const photo = form.photos[i];
        const formData = new FormData();
        formData.append('file', {
          uri: photo.uri,
          type: photo.mimeType ?? 'image/jpeg',
          name: photo.fileName ?? `photo_${i}.jpg`,
        } as any);
        formData.append('is_primary', i === 0 ? 'true' : 'false');
        formData.append('display_order', String(i));

        await apiClient.post(`/listings/${listingId}/media/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      await apiClient.patch(`/listings/${listingId}/status/`, {
        status: 'active',
      });

      return listingId;
    },
    onSuccess: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      Alert.alert('Listing published', 'Your asset is now live.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Could not create listing. Try again.');
    },
  });

  const handleSaveDraft = useCallback(async () => {
    try {
      const specsObj: Record<string, string> = {};
      form.specs
        .filter((s) => s.key.trim() && s.value.trim())
        .forEach((s) => {
          specsObj[s.key.trim()] = s.value.trim();
        });

      await apiClient.post('/listings/', {
        resource_type: form.resource_type || 'equipment',
        title: form.title || 'Untitled draft',
        category: form.category,
        price_daily: form.price_daily || null,
        price_weekly: form.price_weekly || null,
        price_monthly: form.price_monthly || null,
        location_address: form.location_address,
        location_city: form.location_city,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        description: form.description,
        specs: specsObj,
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      Alert.alert('Draft saved', '', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save draft.');
    }
  }, [form, navigation, queryClient]);

  const handlePickPhotos = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      updateField('photos', [...form.photos, ...result.assets]);
    }
  }, [form.photos, updateField]);

  const removePhoto = useCallback(
    (index: number) => {
      updateField(
        'photos',
        form.photos.filter((_, i) => i !== index),
      );
    },
    [form.photos, updateField],
  );

  const addSpec = useCallback(() => {
    updateField('specs', [...form.specs, { key: '', value: '' }]);
  }, [form.specs, updateField]);

  const removeSpec = useCallback(
    (index: number) => {
      updateField(
        'specs',
        form.specs.filter((_, i) => i !== index),
      );
    },
    [form.specs, updateField],
  );

  const updateSpec = useCallback(
    (index: number, field: 'key' | 'value', val: string) => {
      const updated = [...form.specs];
      updated[index] = { ...updated[index], [field]: val };
      updateField('specs', updated);
    },
    [form.specs, updateField],
  );

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < TOTAL_STEPS) setStep(step + 1);
  };
  const goBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 1:
        return !!form.resource_type && !!form.title.trim();
      case 2:
        return !!(form.price_daily || form.price_weekly || form.price_monthly);
      case 3:
        return !!form.location_address.trim() && !!form.location_city.trim();
      case 4:
        return !!form.description.trim();
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const renderProgressBar = () => (
    <View style={s.progressBar}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            s.progressSegment,
            i < step - 1 && s.progressFilled,
            i === step - 1 && s.progressActive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={s.stepTitle}>Resource type</Text>
            <View style={s.typeGrid}>
              {RESOURCE_TYPES.map(({ id, label, Icon }) => (
                <Pressable
                  key={id}
                  style={[
                    s.typeCard,
                    form.resource_type === id && s.typeCardSelected,
                  ]}
                  onPress={() => updateField('resource_type', id)}
                >
                  <Icon
                    size={28}
                    color={
                      form.resource_type === id
                        ? colors.forge
                        : colors.textSecondary
                    }
                    strokeWidth={1.5}
                  />
                  <Text
                    style={[
                      s.typeLabel,
                      form.resource_type === id && s.typeLabelSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.fieldLabel}>Title</Text>
            <TextInput
              style={s.input}
              value={form.title}
              onChangeText={(v) => updateField('title', v)}
              placeholder="e.g. 50-ton crawler crane"
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={s.fieldLabel}>Category</Text>
            <TextInput
              style={s.input}
              value={form.category}
              onChangeText={(v) => updateField('category', v)}
              placeholder="e.g. Heavy lift"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={s.stepTitle}>Pricing</Text>

            <Text style={s.fieldLabel}>Daily rate</Text>
            <View style={s.priceRow}>
              <Text style={s.currencyPrefix}>{'\u20A6'}</Text>
              <TextInput
                style={s.priceInput}
                value={form.price_daily}
                onChangeText={(v) => updateField('price_daily', v)}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>

            <Text style={s.fieldLabel}>Weekly rate</Text>
            <View style={s.priceRow}>
              <Text style={s.currencyPrefix}>{'\u20A6'}</Text>
              <TextInput
                style={s.priceInput}
                value={form.price_weekly}
                onChangeText={(v) => updateField('price_weekly', v)}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>

            <Text style={s.fieldLabel}>Monthly rate</Text>
            <View style={s.priceRow}>
              <Text style={s.currencyPrefix}>{'\u20A6'}</Text>
              <TextInput
                style={s.priceInput}
                value={form.price_monthly}
                onChangeText={(v) => updateField('price_monthly', v)}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={s.stepTitle}>Location</Text>

            <Text style={s.fieldLabel}>Address</Text>
            <TextInput
              style={s.input}
              value={form.location_address}
              onChangeText={(v) => updateField('location_address', v)}
              placeholder="Street address"
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={s.fieldLabel}>City</Text>
            <TextInput
              style={s.input}
              value={form.location_city}
              onChangeText={(v) => updateField('location_city', v)}
              placeholder="City"
              placeholderTextColor={colors.textTertiary}
            />

            <View style={s.coordRow}>
              <View style={s.coordField}>
                <Text style={s.fieldLabel}>Latitude</Text>
                <TextInput
                  style={s.input}
                  value={form.latitude}
                  onChangeText={(v) => updateField('latitude', v)}
                  placeholder="0.0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
              <View style={s.coordField}>
                <Text style={s.fieldLabel}>Longitude</Text>
                <TextInput
                  style={s.input}
                  value={form.longitude}
                  onChangeText={(v) => updateField('longitude', v)}
                  placeholder="0.0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View>
            <Text style={s.stepTitle}>Details</Text>

            <Text style={s.fieldLabel}>Description</Text>
            <TextInput
              style={[s.input, s.textArea]}
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Describe your asset"
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />

            <View style={s.specsHeader}>
              <Text style={s.fieldLabel}>Specifications</Text>
              <Pressable onPress={addSpec}>
                <Text style={s.addLink}>Add spec</Text>
              </Pressable>
            </View>
            {form.specs.map((spec, i) => (
              <View key={i} style={s.specRow}>
                <TextInput
                  style={[s.input, s.specInput]}
                  value={spec.key}
                  onChangeText={(v) => updateSpec(i, 'key', v)}
                  placeholder="Key"
                  placeholderTextColor={colors.textTertiary}
                />
                <TextInput
                  style={[s.input, s.specInput]}
                  value={spec.value}
                  onChangeText={(v) => updateSpec(i, 'value', v)}
                  placeholder="Value"
                  placeholderTextColor={colors.textTertiary}
                />
                {form.specs.length > 1 && (
                  <Pressable
                    onPress={() => removeSpec(i)}
                    style={s.removeSpecBtn}
                  >
                    <IconX size={16} color={colors.textTertiary} strokeWidth={1.5} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        );

      case 5:
        return (
          <View>
            <Text style={s.stepTitle}>Photos</Text>

            <Pressable style={s.photoPickerBtn} onPress={handlePickPhotos}>
              <IconPhoto size={24} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={s.photoPickerText}>Select photos</Text>
            </Pressable>

            <View style={s.photoGrid}>
              {form.photos.map((photo, i) => (
                <View key={i} style={s.photoThumb}>
                  <Image source={{ uri: photo.uri }} style={s.photoImage} />
                  {i === 0 && (
                    <View style={s.primaryBadge}>
                      <Text style={s.primaryBadgeText}>PRIMARY</Text>
                    </View>
                  )}
                  <Pressable
                    style={s.photoRemove}
                    onPress={() => removePhoto(i)}
                  >
                    <IconX size={14} color={colors.textOnAccent} strokeWidth={2} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        );

      case 6:
        return (
          <View>
            <Text style={s.stepTitle}>Review</Text>

            <View style={s.reviewCard}>
              <Text style={s.reviewLabel}>TYPE</Text>
              <Text style={s.reviewValue}>
                {form.resource_type || '--'}
              </Text>
            </View>

            <View style={s.reviewCard}>
              <Text style={s.reviewLabel}>TITLE</Text>
              <Text style={s.reviewValue}>{form.title || '--'}</Text>
            </View>

            <View style={s.reviewCard}>
              <Text style={s.reviewLabel}>PRICING</Text>
              {form.price_daily ? (
                <Text style={s.reviewMono}>
                  {'\u20A6'}{form.price_daily}/day
                </Text>
              ) : null}
              {form.price_weekly ? (
                <Text style={s.reviewMono}>
                  {'\u20A6'}{form.price_weekly}/week
                </Text>
              ) : null}
              {form.price_monthly ? (
                <Text style={s.reviewMono}>
                  {'\u20A6'}{form.price_monthly}/month
                </Text>
              ) : null}
            </View>

            <View style={s.reviewCard}>
              <Text style={s.reviewLabel}>LOCATION</Text>
              <Text style={s.reviewValue}>
                {form.location_address}, {form.location_city}
              </Text>
            </View>

            <View style={s.reviewCard}>
              <Text style={s.reviewLabel}>DESCRIPTION</Text>
              <Text style={s.reviewValue}>{form.description || '--'}</Text>
            </View>

            <View style={s.reviewCard}>
              <Text style={s.reviewLabel}>PHOTOS</Text>
              <Text style={s.reviewValue}>
                {form.photos.length} selected
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top bar */}
        <View style={s.topBar}>
          <Pressable onPress={goBack} style={s.backBtn}>
            <IconArrowLeft size={22} color={colors.textPrimary} strokeWidth={1.5} />
          </Pressable>
          {renderProgressBar()}
          <Pressable onPress={handleSaveDraft}>
            <Text style={s.saveDraftLink}>Save draft</Text>
          </Pressable>
        </View>

        {/* Step content */}
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.stepContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        {/* Bottom button */}
        <View style={s.bottomBar}>
          {step < TOTAL_STEPS ? (
            <Button
              title="Continue"
              onPress={goNext}
              disabled={!canContinue()}
              style={s.bottomButton}
            />
          ) : (
            <Button
              title="Publish"
              onPress={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
              disabled={!canContinue()}
              style={s.bottomButton}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.abyss,
  },
  flex: {
    flex: 1,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenPadding.horizontal,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backBtn: {
    padding: spacing.xs,
  },
  saveDraftLink: {
    ...typeScale.body2,
    color: colors.forge,
  },

  // Progress
  progressBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    height: 3,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.surfaceHigh,
  },
  progressFilled: {
    backgroundColor: colors.forge,
  },
  progressActive: {
    backgroundColor: colors.forgeLight,
  },

  // Step content
  stepContent: {
    paddingHorizontal: screenPadding.horizontal,
    paddingBottom: spacing['3xl'],
  },
  stepTitle: {
    ...typeScale.h1,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },

  // Type grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  typeCard: {
    width: '30%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeCardSelected: {
    borderColor: colors.forge,
    backgroundColor: colors.bgTintedAccent,
  },
  typeLabel: {
    ...typeScale.body2,
    color: colors.textSecondary,
  },
  typeLabelSelected: {
    color: colors.forge,
  },

  // Fields
  fieldLabel: {
    ...typeScale.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    marginTop: spacing.base,
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
  textArea: {
    minHeight: 100,
  },

  // Price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.default,
    paddingHorizontal: spacing.base,
  },
  currencyPrefix: {
    fontFamily: fontFamilies.mono,
    fontSize: 15,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  priceInput: {
    flex: 1,
    fontFamily: fontFamilies.mono,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },

  // Coords
  coordRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  coordField: {
    flex: 1,
  },

  // Specs
  specsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addLink: {
    ...typeScale.body2,
    color: colors.forge,
    marginTop: spacing.base,
  },
  specRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  specInput: {
    flex: 1,
  },
  removeSpecBtn: {
    padding: spacing.sm,
  },

  // Photos
  photoPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderStyle: 'dashed',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  photoPickerText: {
    ...typeScale.body1,
    color: colors.textSecondary,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  photoThumb: {
    width: 100,
    height: 100,
    borderRadius: radii.card,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: colors.forge,
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  primaryBadgeText: {
    ...typeScale.caption,
    fontSize: 8,
    color: colors.textOnAccent,
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Review
  reviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  reviewLabel: {
    ...typeScale.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  reviewValue: {
    ...typeScale.body1,
    color: colors.textPrimary,
  },
  reviewMono: {
    fontFamily: fontFamilies.mono,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textPrimary,
    marginTop: 2,
  },

  // Bottom
  bottomBar: {
    paddingHorizontal: screenPadding.horizontal,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.abyss,
  },
  bottomButton: {
    width: '100%',
  },
});
