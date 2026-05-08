import { useEffect, useRef, useCallback } from 'react';

export function useAbly(channelName: string | null, onMessage?: (msg: unknown) => void) {
  const channelRef = useRef<unknown>(null);

  const subscribe = useCallback(() => {
    if (!channelName || !onMessage) return;
    // Ably integration will be implemented in Wave 03
  }, [channelName, onMessage]);

  useEffect(() => {
    subscribe();
    return () => {
      channelRef.current = null;
    };
  }, [subscribe]);

  return { channel: channelRef.current };
}
