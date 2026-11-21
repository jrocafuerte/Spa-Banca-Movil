import { useColorScheme } from 'react-native';
import { type ColorTokens, tokens } from './tokens.generated';

/**
 * Tema = tokens generados desde design-tokens/*.tokens.json (W3C DTCG).
 * Ningún componente ni pantalla define colores, tamaños o espaciados propios:
 * todo sale de aquí, por lo que cambiar los tokens del Design System
 * reestiliza la app completa sin tocar código.
 */
export interface Theme {
  color: ColorTokens;
  spacing: typeof tokens.spacing;
  radius: typeof tokens.radius;
  font: typeof tokens.font;
  border: typeof tokens.border;
}

const scales = { spacing: tokens.spacing, radius: tokens.radius, font: tokens.font, border: tokens.border };
const themes: Record<'light' | 'dark', Theme> = {
  light: { color: tokens.color.light, ...scales },
  dark: { color: tokens.color.dark, ...scales },
};

export const useTheme = (): Theme => themes[useColorScheme() === 'dark' ? 'dark' : 'light'];

export type SpacingToken = keyof typeof tokens.spacing;
