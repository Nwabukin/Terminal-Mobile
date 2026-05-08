import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconMap2, IconCalendar, IconMessage, IconUser } from '@tabler/icons-react-native';
import { MapScreen } from '../screens/renter/MapScreen';
import { BookingsScreen } from '../screens/shared/BookingsScreen';
import { ThreadListScreen } from '../screens/shared/ThreadListScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { colors, spacing } from '../theme';
import type { RenterTabParamList } from './types';

const Tab = createBottomTabNavigator<RenterTabParamList>();

export function RenterTabs() {
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
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.4,
        },
      }}
    >
      <Tab.Screen
        name="Search"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color }) => <IconMap2 color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ color }) => <IconCalendar color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={ThreadListScreen}
        options={{
          tabBarIcon: ({ color }) => <IconMessage color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <IconUser color={color} size={22} strokeWidth={1.5} />,
        }}
      />
    </Tab.Navigator>
  );
}
