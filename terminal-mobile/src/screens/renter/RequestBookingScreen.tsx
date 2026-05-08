import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typeScale } from '../../theme';

export function RequestBookingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>REQUEST BOOKING</Text>
      <Text style={styles.subtitle}>Pick dates and send request</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.abyss,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    ...typeScale.display3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typeScale.body1,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
