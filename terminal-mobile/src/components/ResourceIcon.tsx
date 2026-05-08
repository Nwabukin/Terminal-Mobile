import React from 'react';
import {
  IconCrane,
  IconTruck,
  IconBuildingWarehouse,
  IconBox,
  IconBuildingFortress,
} from '@tabler/icons-react-native';
import type { ColorValue } from 'react-native';

type ResourceType = 'equipment' | 'vehicle' | 'warehouse' | 'terminal' | 'facility';

interface ResourceIconProps {
  type: ResourceType;
  size?: number;
  color?: ColorValue;
}

const iconMap = {
  equipment: IconCrane,
  vehicle: IconTruck,
  warehouse: IconBuildingWarehouse,
  terminal: IconBox,
  facility: IconBuildingFortress,
};

export function ResourceIcon({ type, size = 24, color }: ResourceIconProps) {
  const Icon = iconMap[type] || IconBuildingWarehouse;
  return <Icon size={size} color={color as string} strokeWidth={1.5} />;
}
