import React, { useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono';
import * as SplashScreen from 'expo-splash-screen';

import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [fontsLoaded] = useFonts({
    BarlowCondensed_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexMono_400Regular,
  });

  useEffect(() => {
    hydrate();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.forge} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: colors.forge,
                background: colors.abyss,
                card: colors.surface,
                text: colors.textPrimary,
                border: colors.border,
                notification: colors.forge,
              },
              fonts: {
                regular: { fontFamily: 'IBMPlexSans_400Regular', fontWeight: '400' },
                medium: { fontFamily: 'IBMPlexSans_500Medium', fontWeight: '500' },
                bold: { fontFamily: 'IBMPlexSans_600SemiBold', fontWeight: '600' },
                heavy: { fontFamily: 'BarlowCondensed_700Bold', fontWeight: '700' },
              },
            }}
          >
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.abyss },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.abyss },
});
