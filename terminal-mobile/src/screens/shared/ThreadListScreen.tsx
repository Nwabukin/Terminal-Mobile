import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typeScale } from '../../theme';

export function ThreadListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MESSAGES</Text>
      <Text style={styles.subtitle}>Your conversations</Text>
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
