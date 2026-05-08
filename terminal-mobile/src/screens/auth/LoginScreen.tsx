import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typeScale } from '../../theme';

export function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.display}>TERMINAL</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
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
  display: {
    ...typeScale.display2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typeScale.body1,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
