import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typeScale } from '../theme';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  action?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ title, action, onAction, icon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {action && onAction && (
        <Button title={action} onPress={onAction} style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    ...typeScale.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  },
});
