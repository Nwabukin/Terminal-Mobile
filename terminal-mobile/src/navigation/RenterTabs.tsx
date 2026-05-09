import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import { BookingsScreen } from '../screens/shared/BookingsScreen';
import { ThreadListScreen } from '../screens/shared/ThreadListScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { colors, spacing } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function RequestBookingPlaceholder() {
  return (
    <View style={phStyles.container}>
      <Text style={phStyles.text}>REQUEST BOOKING</Text>
      <Text style={phStyles.sub}>Coming in Wave 03</Text>
    </View>
  );
}

const phStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.abyss, justifyContent: 'center', alignItems: 'center' },
  text: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 28, color: colors.textPrimary, textTransform: 'uppercase' },
  sub: { fontFamily: 'IBMPlexSans_400Regular', fontSize: 13, color: colors.textTertiary, marginTop: 8 },
});

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
      <Stack.Screen name="RequestBooking" component={RequestBookingPlaceholder} />
    </Stack.Navigator>
  );
}
