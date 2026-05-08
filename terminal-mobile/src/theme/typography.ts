export const fontFamilies = {
  display: 'BarlowCondensed_700Bold',
  body: 'IBMPlexSans_400Regular',
  bodyMedium: 'IBMPlexSans_500Medium',
  bodySemiBold: 'IBMPlexSans_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
} as const;

export const typeScale = {
  display1: {
    fontFamily: fontFamilies.display,
    fontSize: 48,
    lineHeight: 48,
    letterSpacing: -0.48,
    textTransform: 'uppercase' as const,
  },
  display2: {
    fontFamily: fontFamilies.display,
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -0.36,
    textTransform: 'uppercase' as const,
  },
  display3: {
    fontFamily: fontFamilies.display,
    fontSize: 28,
    lineHeight: 31,
    letterSpacing: -0.28,
    textTransform: 'uppercase' as const,
  },
  h1: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 22,
    lineHeight: 26,
  },
  h2: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 17,
    lineHeight: 22,
  },
  h3: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.52,
    textTransform: 'uppercase' as const,
  },
  body1: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
    lineHeight: 24,
  },
  body2: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.66,
    textTransform: 'uppercase' as const,
  },
  mono1: {
    fontFamily: fontFamilies.mono,
    fontSize: 15,
    lineHeight: 21,
  },
  mono2: {
    fontFamily: fontFamilies.mono,
    fontSize: 13,
    lineHeight: 18,
  },
  mono3: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.22,
  },
} as const;
