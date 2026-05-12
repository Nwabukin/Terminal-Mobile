import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
  addMonths,
  subMonths,
  isBefore,
  isAfter,
  isSameDay,
  startOfDay,
  differenceInDays,
} from 'date-fns';

import { colors } from '../../theme/colors';
import { typeScale } from '../../theme/typography';
import { spacing, radii, screenPadding } from '../../theme/spacing';
import { createBooking } from '../../api/bookings';
import { fetchListingDetail } from '../../api/listings';
import { formatCurrency } from '../../utils/format';
import type { Listing } from '../../api/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TOTAL_STEPS = 3;
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type DurationType = 'daily' | 'weekly' | 'monthly';

interface DurationOption {
  type: DurationType;
  label: string;
  priceKey: 'price_daily' | 'price_weekly' | 'price_monthly';
  unitLabel: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  { type: 'daily', label: 'Daily', priceKey: 'price_daily', unitLabel: '/day' },
  { type: 'weekly', label: 'Weekly', priceKey: 'price_weekly', unitLabel: '/week' },
  { type: 'monthly', label: 'Monthly', priceKey: 'price_monthly', unitLabel: '/month' },
];

const WINDOW_HEIGHT = Dimensions.get('window').height;
/** Sheet needs a bounded height so a flex:1 ScrollView between header and footer does not collapse to zero. */
const SHEET_HEIGHT = Math.round(WINDOW_HEIGHT * 0.88);

export function RequestBookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const routeListing = route.params?.listing as Listing | undefined;
  const listingId: string | undefined = routeListing?.id ?? route.params?.listingId;

  const {
    data: fetchedListing,
    isLoading: listingLoading,
    isError: listingError,
  } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => fetchListingDetail(listingId!),
    enabled: !!listingId,
  });

  const listing = fetchedListing ?? routeListing;

  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [durationType, setDurationType] = useState<DurationType>('daily');
  const [renterNote, setRenterNote] = useState('');

  const today = useMemo(() => startOfDay(new Date()), []);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPadding = getDay(monthStart);
    return { days, startPadding };
  }, [currentMonth]);

  const handleDayPress = useCallback(
    (day: Date) => {
      if (isBefore(day, today)) return;
      if (!startDate || (startDate && endDate)) {
        setStartDate(day);
        setEndDate(null);
      } else if (isBefore(day, startDate)) {
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    },
    [startDate, endDate, today],
  );

  const isInRange = useCallback(
    (day: Date) => {
      if (!startDate || !endDate) return false;
      return isAfter(day, startDate) && isBefore(day, endDate);
    },
    [startDate, endDate],
  );

  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  }, [startDate, endDate]);

  const totalAmount = useMemo(() => {
    if (!listing || !startDate || !endDate) return 0;
    const priceStr = listing[DURATION_OPTIONS.find((o) => o.type === durationType)!.priceKey];
    if (!priceStr) return 0;
    const rate = parseFloat(priceStr);
    if (durationType === 'daily') return rate * durationDays;
    if (durationType === 'weekly') return rate * Math.ceil(durationDays / 7);
    return rate * Math.ceil(durationDays / 30);
  }, [listing, startDate, endDate, durationType, durationDays]);

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      Alert.alert('Request sent', 'The owner will review your booking request.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: () => {
      Alert.alert('Something went wrong', 'Could not submit your booking request. Try again.');
    },
  });

  const handleSubmit = () => {
    if (!listing || !startDate || !endDate) return;
    mutation.mutate({
      listing_id: listing.id,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      duration_type: durationType,
      renter_note: renterNote || undefined,
    });
  };

  const canContinue =
    (step === 1 && startDate && endDate) ||
    (step === 2 && durationType) ||
    step === 3;

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else handleSubmit();
  };

  const renderCalendar = () => (
    <View style={s.calendarContainer}>
      <View style={s.monthNav}>
        <Pressable onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <Text style={s.monthNavArrow}>{'<'}</Text>
        </Pressable>
        <Text style={s.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <Pressable onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <Text style={s.monthNavArrow}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={s.dayLabelsRow}>
        {DAY_LABELS.map((d) => (
          <View key={d} style={s.dayLabelCell}>
            <Text style={s.dayLabelText}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={s.calendarGrid}>
        {Array.from({ length: calendarDays.startPadding }).map((_, i) => (
          <View key={`pad-${i}`} style={s.dayCell} />
        ))}
        {calendarDays.days.map((day) => {
          const isPast = isBefore(day, today);
          const isStart = startDate && isSameDay(day, startDate);
          const isEnd = endDate && isSameDay(day, endDate);
          const inRange = isInRange(day);
          const isSelected = isStart || isEnd;

          return (
            <Pressable
              key={day.toISOString()}
              style={[
                s.dayCell,
                inRange && s.dayCellInRange,
                isSelected && s.dayCellSelected,
              ]}
              onPress={() => handleDayPress(day)}
              disabled={isPast}
            >
              <Text
                style={[
                  s.dayText,
                  isPast && s.dayTextPast,
                  isSelected && s.dayTextSelected,
                  inRange && s.dayTextInRange,
                ]}
              >
                {format(day, 'd')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {startDate && (
        <View style={s.selectionSummary}>
          <Text style={s.selectionLabel}>
            {format(startDate, 'MMM d, yyyy')}
            {endDate ? ` \u2013 ${format(endDate, 'MMM d, yyyy')}` : ' \u2013 select end date'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderDuration = () => (
    <View style={s.durationContainer}>
      <Text style={s.stepHeading}>Select pricing type</Text>
      {DURATION_OPTIONS.map((option) => {
        const priceStr = listing?.[option.priceKey];
        if (!priceStr) return null;
        const isActive = durationType === option.type;
        return (
          <Pressable
            key={option.type}
            style={[s.durationCard, isActive && s.durationCardActive]}
            onPress={() => setDurationType(option.type)}
          >
            <View style={s.radioRow}>
              <View style={[s.radioOuter, isActive && s.radioOuterActive]}>
                {isActive && <View style={s.radioInner} />}
              </View>
              <View style={s.durationInfo}>
                <Text style={s.durationLabel}>{option.label}</Text>
                <Text style={s.durationPrice}>
                  {formatCurrency(parseFloat(priceStr))}{option.unitLabel}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}

      {durationDays > 0 && (
        <View style={s.calcSummary}>
          <Text style={s.calcLabel}>{durationDays} days selected</Text>
          <Text style={s.calcTotal}>{formatCurrency(totalAmount)}</Text>
        </View>
      )}
    </View>
  );

  const renderReview = () => (
    <View style={s.reviewContainer}>
      <Text style={s.stepHeading}>Review your request</Text>

      <View style={s.reviewCard}>
        <Text style={s.reviewCardLabel}>LISTING</Text>
        <Text style={s.reviewCardValue}>{listing?.title}</Text>
      </View>

      <View style={s.reviewCard}>
        <Text style={s.reviewCardLabel}>DATES</Text>
        <Text style={s.reviewCardValue}>
          {startDate && format(startDate, 'MMM d, yyyy')}
          {' \u2013 '}
          {endDate && format(endDate, 'MMM d, yyyy')}
        </Text>
        <Text style={s.reviewCardSub}>
          {durationDays} days \u00B7 {durationType}
        </Text>
      </View>

      <View style={s.reviewCard}>
        <Text style={s.reviewCardLabel}>TOTAL</Text>
        <Text style={s.reviewTotal}>{formatCurrency(totalAmount)}</Text>
      </View>

      <View style={s.noteContainer}>
        <Text style={s.noteLabel}>Note to owner (optional)</Text>
        <TextInput
          style={s.noteInput}
          placeholder="Add any details about your needs..."
          placeholderTextColor={colors.textTertiary}
          value={renterNote}
          onChangeText={setRenterNote}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  if (!listingId) {
    return (
      <View style={s.backdrop}>
        <Pressable style={s.backdropTouchable} onPress={() => navigation.goBack()} />
        <View style={[s.sheet, { height: SHEET_HEIGHT, paddingBottom: insets.bottom + spacing.base }]}>
          <View style={s.header}>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={s.backArrow}>{'\u2190'}</Text>
            </Pressable>
          </View>
          <View style={s.missingListingBody}>
            <Text style={s.stepHeading}>Could not open booking</Text>
            <Text style={s.missingListingHint}>Go back and try again from the listing.</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={s.backdrop}>
      <Pressable style={s.backdropTouchable} onPress={() => navigation.goBack()} />

      <View
        style={[
          s.sheet,
          { height: SHEET_HEIGHT, paddingBottom: insets.bottom + spacing.base },
        ]}
      >
        {/* Progress bar */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
        </View>

        {/* Header */}
        <View style={s.header}>
          {step > 1 ? (
            <Pressable onPress={() => setStep(step - 1)}>
              <Text style={s.backArrow}>{'\u2190'}</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={s.backArrow}>{'\u2190'}</Text>
            </Pressable>
          )}
          <Text style={s.stepCounter}>Step {step} of {TOTAL_STEPS}</Text>
        </View>

        <ScrollView
          style={s.body}
          contentContainerStyle={s.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {listingError ? (
            <Text style={s.errorText}>Could not load this listing. Pull back and try again.</Text>
          ) : listingLoading && !listing ? (
            <Text style={s.loadingHint}>Loading listing…</Text>
          ) : null}
          {step === 1 && renderCalendar()}
          {step === 2 && renderDuration()}
          {step === 3 && renderReview()}
        </ScrollView>

        {/* Footer */}
        <View style={s.footer}>
          <Pressable
            style={[s.continueBtn, !canContinue && s.continueBtnDisabled]}
            onPress={handleNext}
            disabled={!canContinue || mutation.isPending}
          >
            <Text style={s.continueBtnText}>
              {step === TOTAL_STEPS
                ? mutation.isPending
                  ? 'Submitting...'
                  : 'Submit request'
                : 'Continue'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    flexDirection: 'column',
    backgroundColor: colors.abyss,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
  },
  missingListingBody: {
    flex: 1,
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: spacing.lg,
  },
  missingListingHint: {
    ...typeScale.body2,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  loadingHint: {
    ...typeScale.body2,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typeScale.body2,
    color: colors.forgeLight,
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 2,
    backgroundColor: colors.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.forge,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: screenPadding.horizontal,
    paddingVertical: spacing.md,
  },
  backArrow: {
    ...typeScale.h1,
    color: colors.textPrimary,
  },
  stepCounter: {
    ...typeScale.mono3,
    color: colors.textSecondary,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: screenPadding.horizontal,
    paddingBottom: spacing.xl,
  },
  footer: {
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueBtn: {
    backgroundColor: colors.forge,
    borderRadius: radii.default,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueBtnText: {
    ...typeScale.h2,
    color: colors.textOnAccent,
  },

  // Calendar
  calendarContainer: {
    marginTop: spacing.sm,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  monthNavArrow: {
    ...typeScale.h1,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
  },
  monthTitle: {
    ...typeScale.h2,
    color: colors.textPrimary,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  dayLabelCell: {
    width: '14.28%' as any,
    alignItems: 'center',
  },
  dayLabelText: {
    ...typeScale.mono3,
    color: colors.textTertiary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%' as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: colors.forge,
    borderRadius: radii.default,
  },
  dayCellInRange: {
    backgroundColor: colors.forgeDim,
  },
  dayText: {
    ...typeScale.body2,
    color: colors.textPrimary,
  },
  dayTextPast: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  dayTextSelected: {
    color: colors.textOnAccent,
  },
  dayTextInRange: {
    color: colors.forgeLight,
  },
  selectionSummary: {
    marginTop: spacing.base,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectionLabel: {
    ...typeScale.mono2,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Duration
  durationContainer: {
    marginTop: spacing.sm,
  },
  stepHeading: {
    ...typeScale.h1,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  durationCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  durationCardActive: {
    backgroundColor: colors.forgeDim,
    borderColor: colors.forge,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioOuterActive: {
    borderColor: colors.forge,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.forge,
  },
  durationInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationLabel: {
    ...typeScale.body1,
    color: colors.textPrimary,
  },
  durationPrice: {
    ...typeScale.mono1,
    color: colors.forgeLight,
  },
  calcSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  calcLabel: {
    ...typeScale.body2,
    color: colors.textSecondary,
  },
  calcTotal: {
    ...typeScale.h1,
    color: colors.forgeLight,
  },

  // Review
  reviewContainer: {
    marginTop: spacing.sm,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  reviewCardLabel: {
    ...typeScale.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  reviewCardValue: {
    ...typeScale.body1,
    color: colors.textPrimary,
  },
  reviewCardSub: {
    ...typeScale.mono3,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  reviewTotal: {
    ...typeScale.h1,
    color: colors.forgeLight,
  },
  noteContainer: {
    marginTop: spacing.sm,
  },
  noteLabel: {
    ...typeScale.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  noteInput: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.base,
    color: colors.textPrimary,
    ...typeScale.body1,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
