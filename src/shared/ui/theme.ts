import { useColorScheme } from 'react-native';
import { typeface } from './fonts';
import { type ColorTokens, tokens } from './tokens.generated';

/**
 * Tema = tokens generados desde design-tokens/*.tokens.json (W3C DTCG), hoy
 * importados del Design System Beat (design-tokens/import-beat.mjs).
 * Ningún componente ni pantalla define colores, tamaños, tipografía o
 * espaciados propios: todo sale de aquí.
 */
export type WeightToken = keyof typeof tokens.font.weight;

export interface Theme {
  color: ColorTokens;
  spacing: typeof tokens.spacing;
  radius: typeof tokens.radius;
  size: typeof tokens.size;
  font: typeof tokens.font;
  border: typeof tokens.border;
  /** Estilo tipográfico (familia + peso) de los tokens. */
  text: (weight?: WeightToken) => ReturnType<typeof typeface>;
}

const text = (weight: WeightToken = 'regular') => typeface(tokens.font.family.base, tokens.font.weight[weight]);
const scales = {
  spacing: tokens.spacing,
  radius: tokens.radius,
  size: tokens.size,
  font: tokens.font,
  border: tokens.border,
  text,
};
const themes: Record<'light' | 'dark', Theme> = {
  light: { color: tokens.color.light, ...scales },
  dark: { color: tokens.color.dark, ...scales },
};

export const useTheme = (): Theme => themes[useColorScheme() === 'dark' ? 'dark' : 'light'];

export type SpacingToken = keyof typeof tokens.spacing;
