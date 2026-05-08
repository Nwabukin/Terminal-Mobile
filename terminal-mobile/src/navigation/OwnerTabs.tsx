import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconBuildingWarehouse, IconCalendar, IconMessage, IconUser } from '@tabler/icons-react-native';
import { BookingsScreen } from '../screens/shared/BookingsScreen';
import { ThreadListScreen } from '../screens/shared/ThreadListScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { OwnerDashboardScreen } from '../screens/owner/OwnerDashboardScreen';
import { colors, spacing } from '../theme';
import type { OwnerTabParamList } from './types';

const Tab = createBottomTabNavigator<OwnerTabParamList>();

export function OwnerTabs() {
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
        name="Listings"
        component={OwnerDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <IconBuildingWarehouse color={color} size={22} strokeWidth={1.5} />
          ),
        }}
      />
      <Tab.Screen
        name="OwnerBookings"
        component={BookingsScreen}
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <IconCalendar color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="OwnerMessages"
        component={ThreadListScreen}
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <IconMessage color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="OwnerProfile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconUser color={color} size={22} strokeWidth={1.5} />,
        }}
      />
    </Tab.Navigator>
  );
}
