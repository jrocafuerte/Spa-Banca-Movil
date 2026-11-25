/**
 * Registro de fuentes de la app. La FAMILIA viene de los Design Tokens
 * (font.family.base, hoy "Lexend" del Design System Beat); aquí solo se
 * registran los archivos de cada peso. En Android una fuente personalizada
 * necesita un nombre por peso (fontWeight no sintetiza variantes).
 *
 * Para otra familia: agregar sus archivos en FONT_ASSETS y sus nombres en FACES.
 */
import { Lexend_400Regular } from '@expo-google-fonts/lexend/400Regular';
import { Lexend_600SemiBold } from '@expo-google-fonts/lexend/600SemiBold';
import { Lexend_700Bold } from '@expo-google-fonts/lexend/700Bold';

export const FONT_ASSETS = { Lexend_400Regular, Lexend_600SemiBold, Lexend_700Bold };

type Weight = '400' | '600' | '700';

const FACES: Record<string, Partial<Record<Weight, keyof typeof FONT_ASSETS>>> = {
  Lexend: { '400': 'Lexend_400Regular', '600': 'Lexend_600SemiBold', '700': 'Lexend_700Bold' },
};

/** Estilo tipográfico para una familia y peso de los tokens. */
export function typeface(family: string, weight: string): { fontFamily?: string; fontWeight?: Weight } {
  const face = FACES[family]?.[weight as Weight];
  // Familia registrada: el peso va en el nombre. Si no, se delega en el sistema.
  return face ? { fontFamily: face } : { fontWeight: weight as Weight };
}
