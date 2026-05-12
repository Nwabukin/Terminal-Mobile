import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

import { colors } from '../../theme/colors';
import { typeScale } from '../../theme/typography';
import { spacing, radii, screenPadding } from '../../theme/spacing';
import { getThreads } from '../../api/messaging';
import { EmptyState } from '../../components/EmptyState';
import type { Thread } from '../../api/types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface ThreadRowProps {
  thread: Thread;
  onPress: (thread: Thread) => void;
}

function ThreadRow({ thread, onPress }: ThreadRowProps) {
  const participantName = thread.other_participant?.full_name ?? 'Unknown';
  const lastBody = thread.last_message?.body ?? '';
  const timestamp = thread.last_message?.created_at
    ? formatDistanceToNow(new Date(thread.last_message.created_at), { addSuffix: true })
    : '';

  return (
    <Pressable
      style={({ pressed }) => [s.threadRow, pressed && s.threadRowPressed]}
      onPress={() => onPress(thread)}
    >
      {/* Avatar */}
      <View style={s.avatar}>
        <Text style={s.avatarText}>{getInitials(participantName)}</Text>
      </View>

      {/* Content */}
      <View style={s.threadContent}>
        <View style={s.threadTopRow}>
          <Text style={s.participantName} numberOfLines={1}>
            {participantName}
          </Text>
          {timestamp ? <Text style={s.timestamp}>{timestamp}</Text> : null}
        </View>

        {lastBody ? (
          <Text style={s.lastMessage} numberOfLines={1}>
            {lastBody}
          </Text>
        ) : null}

        {/* Booking banner */}
        {thread.is_booking_thread && thread.listing_title ? (
          <View style={s.bookingBanner}>
            <Text style={s.bookingBannerText} numberOfLines={1}>
              {thread.listing_title}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Unread badge */}
      {thread.unread_count > 0 && (
        <View style={s.unreadBadge}>
          <Text style={s.unreadText}>{thread.unread_count}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function ThreadListScreen() {
  const navigation = useNavigation<any>();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['threads'],
    queryFn: getThreads,
    refetchInterval: 15000,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const threads: Thread[] = data?.data ?? [];

  const handleThreadPress = useCallback(
    (thread: Thread) => {
      navigation.navigate('Thread', { threadId: thread.id });
    },
    [navigation],
  );

  const renderThread = useCallback(
    ({ item }: { item: Thread }) => (
      <ThreadRow thread={item} onPress={handleThreadPress} />
    ),
    [handleThreadPress],
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.headerSection}>
        <Text style={s.heading}>Messages</Text>
      </View>

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={renderThread}
        contentContainerStyle={s.list}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              title="No conversations"
              description="Start a conversation from a listing page."
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.abyss,
  },
  headerSection: {
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
  },
  heading: {
    ...typeScale.h1,
    color: colors.textPrimary,
  },
  list: {
    paddingHorizontal: screenPadding.horizontal,
    flexGrow: 1,
  },

  // Thread row
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  threadRowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forgeDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typeScale.caption,
    color: colors.forgeLight,
  },
  threadContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  threadTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  participantName: {
    ...typeScale.h2,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  timestamp: {
    ...typeScale.mono3,
    color: colors.textTertiary,
  },
  lastMessage: {
    ...typeScale.body2,
    color: colors.textSecondary,
  },
  bookingBanner: {
    backgroundColor: colors.signalDim,
    borderRadius: radii.default,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  bookingBannerText: {
    ...typeScale.mono3,
    color: colors.signalSoft,
  },

  // Unread badge
  unreadBadge: {
    backgroundColor: colors.forge,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    ...typeScale.mono3,
    color: colors.textOnAccent,
  },
});
