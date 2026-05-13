import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  IconBuildingWarehouse,
  IconCalendar,
  IconMessage,
  IconUser,
} from '@tabler/icons-react-native';

import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import ListingDetailScreen from '../screens/renter/ListingDetailScreen';
import { RequestBookingScreen } from '../screens/renter/RequestBookingScreen';
import { BookingsScreen } from '../screens/shared/BookingsScreen';
import { BookingDetailScreen } from '../screens/owner/BookingDetailScreen';
import { ThreadListScreen } from '../screens/shared/ThreadListScreen';
import { ThreadScreen } from '../screens/shared/ThreadScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { colors } from '../theme/colors';
import { fontFamilies } from '../theme/typography';
import { spacing } from '../theme/spacing';
import type { OwnerStackParamList, OwnerTabParamList } from './types';

const Tab = createBottomTabNavigator<OwnerTabParamList>();
const Stack = createNativeStackNavigator<OwnerStackParamList>();

const TAB_LABELS: Record<string, string> = {
  Listings: 'Yard',
  OwnerBookings: 'Bookings',
  OwnerMessages: 'Messages',
  OwnerProfile: 'Profile',
};

function TabBarIcon({
  focused,
  color,
  routeName,
  children,
}: {
  focused: boolean;
  color: string;
  routeName: string;
  children: React.ReactNode;
}) {
  return (
    <View style={tabIconStyles.wrapper}>
      {focused ? (
        <View style={tabIconStyles.indicator} pointerEvents="none" />
      ) : null}
      {children}
      <Text
        style={[
          tabIconStyles.label,
          { color: focused ? colors.forge : colors.textTertiary },
        ]}
      >
        {TAB_LABELS[routeName] ?? routeName}
      </Text>
    </View>
  );
}

function OwnerTabsInner() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingTop: spacing.xs,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: colors.forge,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={OwnerDashboardScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon focused={focused} color={color} routeName="Listings">
              <IconBuildingWarehouse
                size={22}
                color={color}
                strokeWidth={1.5}
              />
            </TabBarIcon>
          ),
        }}
      />
      <Tab.Screen
        name="OwnerBookings"
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              routeName="OwnerBookings"
            >
              <IconCalendar size={22} color={color} strokeWidth={1.5} />
            </TabBarIcon>
          ),
        }}
      />
      <Tab.Screen
        name="OwnerMessages"
        component={ThreadListScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              routeName="OwnerMessages"
            >
              <IconMessage size={22} color={color} strokeWidth={1.5} />
            </TabBarIcon>
          ),
        }}
      />
      <Tab.Screen
        name="OwnerProfile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              routeName="OwnerProfile"
            >
              <IconUser size={22} color={color} strokeWidth={1.5} />
            </TabBarIcon>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function OwnerTabs() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.abyss },
      }}
    >
      <Stack.Screen name="OwnerHome" component={OwnerTabsInner} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <Stack.Screen
        name="RequestBooking"
        component={RequestBookingScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="Thread" component={ThreadScreen} />
    </Stack.Navigator>
  );
}

const tabIconStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  indicator: {
    position: 'absolute',
    top: -8,
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.forge,
  },
  label: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10,
    lineHeight: 14,
  },
});
