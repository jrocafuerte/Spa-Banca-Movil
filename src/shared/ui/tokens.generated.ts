// ARCHIVO GENERADO por design-tokens/build.mjs — NO EDITAR. Modifica design-tokens/*.tokens.json
/* eslint-disable */
export const tokens = {
  color: {
    light: {
      background: '#F4F6FA',
      surface: '#FFFFFF',
      text: '#0F1B2D',
      textMuted: '#5B6B80',
      primary: '#0B5FFF',
      onPrimary: '#FFFFFF',
      danger: '#C62828',
      success: '#1B7F4B',
      border: '#E2E7EF',
      borderSelected: '#0B5FFF',
    },
    dark: {
      background: '#0B1220',
      surface: '#141D2E',
      text: '#E8EEF8',
      textMuted: '#9AA9BF',
      primary: '#5B8CFF',
      onPrimary: '#FFFFFF',
      danger: '#EF5350',
      success: '#4CAF80',
      border: '#24324A',
      borderSelected: '#5B8CFF',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 14,
    pill: 999,
  },
  font: {
    size: {
      caption: 13,
      label: 14,
      body: 16,
      input: 17,
      title: 22,
      display: 28,
    },
    weight: {
      regular: '400',
      semibold: '600',
      bold: '700',
    },
  },
  border: {
    width: {
      thin: 1,
      selected: 2,
    },
  },
} as const;

export type ColorTokens = { readonly [K in keyof typeof tokens.color.light]: string };
