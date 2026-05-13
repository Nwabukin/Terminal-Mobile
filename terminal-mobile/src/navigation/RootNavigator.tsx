import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { AuthNavigator } from './AuthNavigator';
import { RenterTabs } from './RenterTabs';
import { OwnerTabs } from './OwnerTabs';
import ListingWizardScreen from '../screens/owner/ListingWizardScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeRole = useAppStore((s) => s.activeRole);
  const hydrateRole = useAppStore((s) => s.hydrateRole);

  useEffect(() => {
    hydrateRole();
  }, [hydrateRole]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          {/*
            Remount when switching renter/owner so native stack + tabs do not leave
            a stale screen layer that intercepts touches (Android).
          */}
          <Stack.Screen
            key={activeRole}
            name="Main"
            component={activeRole === 'owner' ? OwnerTabs : RenterTabs}
          />
          <Stack.Screen
            name="ListingWizard"
            component={ListingWizardScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
