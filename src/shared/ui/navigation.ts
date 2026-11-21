import { useTheme } from './theme';

/** Opciones de cabecera nativa derivadas de los tokens (comunes a todos los Stacks). */
export function useHeaderOptions() {
  const t = useTheme();
  return {
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal' as const,
    headerStyle: { backgroundColor: t.color.surface },
    headerTintColor: t.color.primary,
    headerTitleStyle: { color: t.color.text, fontWeight: t.font.weight.semibold },
    contentStyle: { backgroundColor: t.color.background },
  };
}

/** Opciones de la barra de pestañas derivadas de los tokens. */
export function useTabOptions() {
  const t = useTheme();
  return {
    headerShadowVisible: false,
    headerStyle: { backgroundColor: t.color.surface },
    headerTitleStyle: { color: t.color.text, fontWeight: t.font.weight.semibold },
    tabBarActiveTintColor: t.color.primary,
    tabBarInactiveTintColor: t.color.textMuted,
    tabBarStyle: { backgroundColor: t.color.surface, borderTopColor: t.color.border },
    sceneStyle: { backgroundColor: t.color.background },
  };
}
