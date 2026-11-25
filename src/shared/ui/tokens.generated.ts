// ARCHIVO GENERADO por design-tokens/build.mjs — NO EDITAR. Modifica design-tokens/*.tokens.json
/* eslint-disable */
export const tokens = {
  color: {
    light: {
      background: '#ffffff',
      surface: '#ffffff',
      text: '#1a1a1a',
      textMuted: '#474747',
      primary: '#008292',
      onPrimary: '#ffffff',
      danger: '#be1125',
      success: '#0a7111',
      border: '#cccccc',
      borderSelected: '#008292',
    },
    dark: {
      background: '#1a1a1a',
      surface: '#2b2b2b',
      text: '#ffffff',
      textMuted: '#cccccc',
      primary: '#06a3b6',
      onPrimary: '#1a1a1a',
      danger: '#fe5c58',
      success: '#2faa2f',
      border: '#5e5e5e',
      borderSelected: '#06a3b6',
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
    md: 8,
    lg: 12,
    pill: 999,
  },
  size: {
    control: 48,
    bottomBar: 64,
  },
  font: {
    family: {
      base: 'Lexend',
    },
    size: {
      caption: 12,
      label: 14,
      body: 16,
      input: 16,
      title: 22,
      display: 26,
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
