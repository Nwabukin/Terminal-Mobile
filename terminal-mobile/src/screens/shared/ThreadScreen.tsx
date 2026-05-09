import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isToday, isYesterday } from 'date-fns';

import { colors } from '../../theme/colors';
import { typeScale } from '../../theme/typography';
import { spacing, radii, screenPadding } from '../../theme/spacing';
import { getThreadDetail, sendMessage } from '../../api/messaging';
import { useAuthStore } from '../../store/authStore';
import { useAbly } from '../../hooks/useAbly';
import type { Message, Thread } from '../../api/types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return `Today \u00B7 ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Yesterday \u00B7 ${format(date, 'HH:mm')}`;
  return format(date, 'MMM d \u00B7 HH:mm');
}

function shouldShowDateSeparator(current: Message, previous: Message | undefined): boolean {
  if (!previous) return true;
  const currentDate = new Date(current.created_at).toDateString();
  const previousDate = new Date(previous.created_at).toDateString();
  return currentDate !== previousDate;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <View style={[s.bubbleWrapper, isOwn ? s.bubbleWrapperOwn : s.bubbleWrapperOther]}>
      <View style={[s.bubble, isOwn ? s.bubbleOwn : s.bubbleOther]}>
        <Text style={[s.bubbleText, isOwn ? s.bubbleTextOwn : s.bubbleTextOther]}>
          {message.body}
        </Text>
      </View>
      <View style={[s.bubbleMeta, isOwn ? s.bubbleMetaOwn : s.bubbleMetaOther]}>
        <Text style={s.bubbleTime}>{format(new Date(message.created_at), 'HH:mm')}</Text>
        {isOwn && message.is_read && (
          <Text style={s.readReceipt}>{'\u2713\u2713'}</Text>
        )}
      </View>
    </View>
  );
}

export function ThreadScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const threadId: string = route.params?.threadId;

  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: () => getThreadDetail(threadId),
    enabled: !!threadId,
  });

  const thread: Thread | undefined = data?.thread;
  const serverMessages: Message[] = data?.messages ?? [];

  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const allMessages = useMemo(() => {
    const merged = [...serverMessages];
    for (const lm of localMessages) {
      if (!merged.find((m) => m.id === lm.id)) {
        merged.push(lm);
      }
    }
    merged.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    return merged;
  }, [serverMessages, localMessages]);

  useEffect(() => {
    if (serverMessages.length > 0) {
      setLocalMessages([]);
    }
  }, [serverMessages]);

  useAbly(threadId ? `thread:${threadId}` : null, (msg: unknown) => {
    const incoming = msg as Message;
    if (!incoming?.id) return;
    setLocalMessages((prev) => {
      if (prev.find((m) => m.id === incoming.id)) return prev;
      return [...prev, incoming];
    });
    queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendMessage(threadId, { body }),
    onSuccess: (response) => {
      if (response.data) {
        setLocalMessages((prev) => {
          if (prev.find((m) => m.id === response.data!.id)) return prev;
          return [...prev, response.data!];
        });
      }
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });

  const handleSend = useCallback(() => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    setMessageText('');
    sendMutation.mutate(trimmed);
  }, [messageText, sendMutation]);

  useEffect(() => {
    if (allMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [allMessages.length]);

  const participantName = thread?.other_participant?.full_name ?? 'Unknown';

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwn = item.sender.id === currentUserId;
      const showDate = shouldShowDateSeparator(item, allMessages[index - 1]);

      return (
        <>
          {showDate && (
            <View style={s.dateSeparator}>
              <Text style={s.dateSeparatorText}>{formatMessageDate(item.created_at)}</Text>
            </View>
          )}
          <MessageBubble message={item} isOwn={isOwn} />
        </>
      );
    },
    [currentUserId, allMessages],
  );

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backArrow}>{'\u2190'}</Text>
        </Pressable>
        <View style={s.headerAvatar}>
          <Text style={s.headerAvatarText}>{getInitials(participantName)}</Text>
        </View>
        <View style={s.headerInfo}>
          <View style={s.headerNameRow}>
            <Text style={s.headerName} numberOfLines={1}>{participantName}</Text>
            <Text style={s.shieldIcon}>{'\u26E8'}</Text>
          </View>
          <Text style={s.headerSub}>typically replies in {'<'}1h</Text>
        </View>
      </View>

      {/* Booking banner */}
      {thread?.is_booking_thread && thread.listing_title ? (
        <View style={s.bookingBanner}>
          <Text style={s.bookingBannerText}>{thread.listing_title}</Text>
        </View>
      ) : null}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={allMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={s.messageList}
        showsVerticalScrollIndicator={false}
      />

      {/* Composer */}
      <View style={[s.composer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          style={s.composerInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textTertiary}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={2000}
        />
        <Pressable
          style={[s.sendBtn, !messageText.trim() && s.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!messageText.trim() || sendMutation.isPending}
        >
          <Text style={s.sendBtnIcon}>{'\u2191'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.abyss,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenPadding.horizontal,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.abyss,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  backArrow: {
    ...typeScale.h1,
    color: colors.textPrimary,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.forgeDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerAvatarText: {
    ...typeScale.caption,
    color: colors.forgeLight,
  },
  headerInfo: {
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerName: {
    ...typeScale.h2,
    color: colors.textPrimary,
  },
  shieldIcon: {
    ...typeScale.body2,
    color: colors.textTertiary,
  },
  headerSub: {
    ...typeScale.mono3,
    color: colors.textTertiary,
    marginTop: 1,
  },

  // Booking banner
  bookingBanner: {
    backgroundColor: colors.signalDim,
    paddingHorizontal: screenPadding.horizontal,
    paddingVertical: spacing.sm,
  },
  bookingBannerText: {
    ...typeScale.mono3,
    color: colors.signalSoft,
  },

  // Messages
  messageList: {
    paddingHorizontal: screenPadding.horizontal,
    paddingVertical: spacing.base,
    flexGrow: 1,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: spacing.base,
  },
  dateSeparatorText: {
    ...typeScale.mono3,
    color: colors.textTertiary,
  },
  bubbleWrapper: {
    marginBottom: spacing.sm,
    maxWidth: '80%',
  },
  bubbleWrapperOwn: {
    alignSelf: 'flex-end',
  },
  bubbleWrapperOther: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: spacing.md,
  },
  bubbleOwn: {
    backgroundColor: colors.forgeDim,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 12,
  },
  bubbleText: {
    ...typeScale.body1,
  },
  bubbleTextOwn: {
    color: colors.forgeLight,
  },
  bubbleTextOther: {
    color: colors.textPrimary,
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  bubbleMetaOwn: {
    justifyContent: 'flex-end',
  },
  bubbleMetaOther: {
    justifyContent: 'flex-start',
  },
  bubbleTime: {
    ...typeScale.mono3,
    color: colors.textTertiary,
  },
  readReceipt: {
    ...typeScale.mono3,
    color: colors.signalSoft,
  },

  // Composer
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.abyss,
    gap: spacing.sm,
  },
  composerInput: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.card,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    ...typeScale.body1,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.forge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnIcon: {
    ...typeScale.h2,
    color: colors.textOnAccent,
  },
});
