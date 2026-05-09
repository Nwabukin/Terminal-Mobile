import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import { ResourceIcon } from './ResourceIcon';
import { formatCurrency } from '../utils/format';

interface MapPinProps {
  resourceType: 'equipment' | 'vehicle' | 'warehouse' | 'terminal' | 'facility';
  priceDaily: string | null;
  isSelected: boolean;
}

export function MapPin({ resourceType, priceDaily, isSelected }: MapPinProps) {
  const price = priceDaily ? parseFloat(priceDaily) : null;

  return (
    <View
      style={[
        styles.container,
        isSelected && styles.containerSelected,
      ]}
    >
      <ResourceIcon
        resourceType={resourceType}
        size={14}
        color={isSelected ? colors.white : colors.textSecondary}
      />
      {price !== null && (
        <Text
          style={[
            styles.price,
            isSelected && styles.priceSelected,
          ]}
          numberOfLines={1}
        >
          {formatCurrency(price)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  containerSelected: {
    backgroundColor: colors.forge,
    borderColor: colors.forge,
    transform: [{ scale: 1.1 }],
    zIndex: 10,
  },
  price: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 11,
    lineHeight: 14,
    color: colors.textPrimary,
  },
  priceSelected: {
    color: colors.white,
  },
});
