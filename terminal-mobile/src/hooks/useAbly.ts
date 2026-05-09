import { useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAblyToken } from '../api/messaging';
import type { Message } from '../api/types';

let Ably: any = null;

try {
  Ably = require('ably');
} catch {
  // Ably not installed — will use polling fallback
}

export function useAbly(
  threadId: string,
  onMessage: (message: Message) => void,
) {
  const clientRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: tokenData } = useQuery({
    queryKey: ['ablyToken'],
    queryFn: getAblyToken,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  const setupAbly = useCallback(async () => {
    if (!Ably || !tokenData?.success || !tokenData.token) {
      return false;
    }

    try {
      const realtime = new Ably.Realtime({
        token: tokenData.token,
        autoConnect: true,
      });

      const channel = realtime.channels.get(`thread:${threadId}`);

      channel.subscribe('new_message', (msg: any) => {
        if (msg.data) {
          const messageData: Message = {
            id: msg.data.id,
            sender: {
              id: msg.data.sender_id,
              full_name: msg.data.sender_name,
              profile_photo: null,
            },
            body: msg.data.body,
            is_read: false,
            created_at: msg.data.created_at,
          };
          onMessage(messageData);
        }
      });

      clientRef.current = realtime;
      channelRef.current = channel;
      return true;
    } catch (error) {
      console.warn('[useAbly] Failed to connect:', error);
      return false;
    }
  }, [threadId, tokenData, onMessage]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;

    pollingRef.current = setInterval(async () => {
      try {
        const { getThreadDetail } = await import('../api/messaging');
        const result = await getThreadDetail(threadId);
        if (result.messages) {
          result.messages.forEach((msg: Message) => {
            onMessage(msg);
          });
        }
      } catch {
        // Silently fail polling
      }
    }, 10_000);
  }, [threadId, onMessage]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const connected = await setupAbly();
      if (!connected && mounted) {
        startPolling();
      }
    };

    init();

    return () => {
      mounted = false;

      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.close();
        clientRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [setupAbly, startPolling]);
}
