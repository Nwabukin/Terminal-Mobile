import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  IconMap2,
  IconCalendar,
  IconMessage,
  IconUser,
} from '@tabler/icons-react-native';

import MapScreen from '../screens/renter/MapScreen';
import ListingDetailScreen from '../screens/renter/ListingDetailScreen';
import { RequestBookingScreen } from '../screens/renter/RequestBookingScreen';
import { BookingsScreen } from '../screens/shared/BookingsScreen';
import { BookingDetailScreen } from '../screens/owner/BookingDetailScreen';
import { ThreadListScreen } from '../screens/shared/ThreadListScreen';
import { ThreadScreen } from '../screens/shared/ThreadScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { colors, spacing } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function RenterTabsInner() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 56 + 34,
          paddingTop: spacing.xs,
        },
        tabBarActiveTintColor: colors.forge,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontFamily: 'IBMPlexSans_500Medium',
          fontSize: 10,
          lineHeight: 14,
        },
      }}
    >
      <Tab.Screen
        name="Search"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color }) => <IconMap2 size={22} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ color }) => <IconCalendar size={22} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={ThreadListScreen}
        options={{
          tabBarIcon: ({ color }) => <IconMessage size={22} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <IconUser size={22} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RenterTabs() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.abyss },
      }}
    >
      <Stack.Screen name="RenterHome" component={RenterTabsInner} />
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
