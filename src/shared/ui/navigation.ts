import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './theme';

/** Opciones de cabecera nativa derivadas de los tokens (comunes a todos los Stacks). */
export function useHeaderOptions() {
  const t = useTheme();
  return {
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal' as const,
    headerStyle: { backgroundColor: t.color.surface },
    headerTintColor: t.color.primary,
    headerTitleStyle: { color: t.color.text, ...t.text('semibold') },
    contentStyle: { backgroundColor: t.color.background },
  };
}

/** Opciones de la barra de pestañas derivadas de los tokens. */
export function useTabOptions() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return {
    headerShadowVisible: false,
    headerStyle: { backgroundColor: t.color.surface },
    headerTitleStyle: { color: t.color.text, ...t.text('semibold') },
    tabBarActiveTintColor: t.color.primary,
    tabBarInactiveTintColor: t.color.textMuted,
    // Alto de línea explícito: Lexend es más alta que la fuente del sistema y la etiqueta se recortaba.
    tabBarLabelStyle: { fontSize: t.font.size.caption, lineHeight: t.font.size.caption + t.spacing.xs, ...t.text() },
    // Altura de la barra inferior del Design System + área segura del dispositivo.
    tabBarStyle: {
      backgroundColor: t.color.surface,
      borderTopColor: t.color.border,
      height: t.size.bottomBar + insets.bottom,
      paddingTop: t.spacing.xs,
      paddingBottom: insets.bottom + t.spacing.xs,
    },
    sceneStyle: { backgroundColor: t.color.background },
  };
}
