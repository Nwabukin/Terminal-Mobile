import React from 'react';
import {
  IconCrane,
  IconTruck,
  IconBuildingWarehouse,
  IconContainer,
  IconFence,
} from '@tabler/icons-react-native';
import { colors } from '../theme';

interface ResourceIconProps {
  resourceType: 'equipment' | 'vehicle' | 'warehouse' | 'terminal' | 'facility';
  size?: number;
  color?: string;
}

const ICON_MAP = {
  equipment: IconCrane,
  vehicle: IconTruck,
  warehouse: IconBuildingWarehouse,
  terminal: IconContainer,
  facility: IconFence,
} as const;

export function ResourceIcon({
  resourceType,
  size = 20,
  color = colors.textSecondary,
}: ResourceIconProps) {
  const Icon = ICON_MAP[resourceType] ?? IconCrane;
  return <Icon size={size} color={color} strokeWidth={1.5} />;
}
