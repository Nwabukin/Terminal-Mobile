export const colors = {
  // Foundation surfaces
  abyss: '#0C0C0F',
  surface: '#131318',
  surfaceElevated: '#1A1A22',
  surfaceHigh: '#22222C',
  border: '#2A2A36',
  borderActive: '#3E3E50',

  // Forge accent
  forgeLight: '#FF8C24',
  forge: '#E8750A',
  forgeMid: '#B85A07',
  forgeDim: '#7A3D04',
  amber: '#F5A623',
  amberDim: '#2A1E08',

  // Semantic
  clear: '#16A34A',
  clearSoft: '#4ADE80',
  clearDim: '#0A3D22',
  signal: '#3B82F6',
  signalSoft: '#60A5FA',
  signalDim: '#1E3A6E',
  alert: '#EF4444',
  alertSoft: '#F87171',
  alertDim: '#4A1010',

  // Text
  textPrimary: '#F1F1F8',
  textSecondary: '#8E8EA8',
  textTertiary: '#52526A',
  textOnAccent: '#FFFFFF',

  // Semantic role tokens
  bgApp: '#0C0C0F',
  bgCard: '#131318',
  bgInput: '#1A1A22',
  bgHover: '#22222C',
  bgTintedSuccess: '#0A3D22',
  bgTintedInfo: '#1E3A6E',
  bgTintedWarn: '#2A1E08',
  bgTintedDanger: '#4A1010',
  bgTintedAccent: '#7A3D04',

  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorToken = keyof typeof colors;
