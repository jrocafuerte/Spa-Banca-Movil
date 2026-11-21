/**
 * Kit de UI de la app. Es la ÚNICA capa que importa primitivas visuales de
 * react-native (regla ESLint `no-restricted-imports` en pantallas). Todos los
 * valores visuales provienen de los Design Tokens (./theme).
 */
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type SpacingToken, useTheme } from './theme';

export { useTheme } from './theme';

export function Screen({
  children,
  scroll = true,
  center = false,
  refreshing,
  onRefresh,
}: {
  children: ReactNode;
  scroll?: boolean;
  center?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const t = useTheme();
  const content = (
    <View style={[{ padding: t.spacing.lg, gap: t.spacing.md }, center && styles.center]}>{children}</View>
  );
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: t.color.background }}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.color.primary} />
            ) : undefined
          }
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

/** Disposición horizontal con separación de tokens. */
export function Inline({
  children,
  gap = 'sm',
  wrap = false,
  justify = 'flex-start',
}: {
  children: ReactNode;
  gap?: SpacingToken;
  wrap?: boolean;
  justify?: 'flex-start' | 'space-between' | 'center';
}) {
  const t = useTheme();
  return (
    <View style={[styles.inline, { gap: t.spacing[gap], flexWrap: wrap ? 'wrap' : 'nowrap', justifyContent: justify }]}>
      {children}
    </View>
  );
}

export function Spacer({ size = 'sm' }: { size?: SpacingToken }) {
  const t = useTheme();
  return <View style={{ height: t.spacing[size] }} />;
}

export function Loading() {
  const t = useTheme();
  return (
    <View style={[styles.fill, styles.center]}>
      <ActivityIndicator color={t.color.primary} />
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <Text
      style={{ color: t.color.text, fontSize: t.font.size.title, fontWeight: t.font.weight.bold }}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}

export function Label({ children, muted, center }: { children: ReactNode; muted?: boolean; center?: boolean }) {
  const t = useTheme();
  return (
    <Text
      style={{
        color: muted ? t.color.textMuted : t.color.text,
        fontSize: t.font.size.body,
        textAlign: center ? 'center' : 'auto',
      }}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  selected,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  const s = [
    {
      backgroundColor: t.color.surface,
      borderColor: selected ? t.color.borderSelected : t.color.border,
      borderWidth: selected ? t.border.width.selected : t.border.width.thin,
      borderRadius: t.radius.lg,
      padding: t.spacing.lg,
      gap: t.spacing.sm,
    },
  ];
  return onPress ? (
    <Pressable
      style={({ pressed }) => [...s, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  ) : (
    <View style={s}>{children}</View>
  );
}

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const t = useTheme();
  const primary = variant === 'primary';
  const fg = primary ? t.color.onPrimary : t.color.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: primary ? t.color.primary : 'transparent',
          borderColor: t.color.primary,
          borderWidth: t.border.width.thin,
          borderRadius: t.radius.lg,
          paddingVertical: t.spacing.lg,
          alignItems: 'center',
        },
        disabled ? styles.disabled : pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={{ color: fg, fontSize: t.font.size.body, fontWeight: t.font.weight.semibold }}>{title}</Text>
      )}
    </Pressable>
  );
}

/** Botón de icono/texto para cabeceras nativas (p. ej. "atrás"). */
export function HeaderButton({ label, glyph, onPress }: { label: string; glyph: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={t.spacing.md}>
      <Text style={{ color: t.color.primary, fontSize: t.font.size.display, paddingHorizontal: t.spacing.sm }}>
        {glyph}
      </Text>
    </Pressable>
  );
}

export function TextField({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.xs }}>
      <Text style={{ color: t.color.textMuted, fontSize: t.font.size.label }}>{label}</Text>
      <TextInput
        placeholderTextColor={t.color.textMuted}
        autoCorrect={false}
        // Evita que el teclado aprenda/sugiera datos sensibles
        {...props}
        accessibilityLabel={label}
        style={{
          color: t.color.text,
          backgroundColor: t.color.surface,
          borderColor: error ? t.color.danger : t.color.border,
          borderWidth: t.border.width.thin,
          borderRadius: t.radius.md,
          padding: t.spacing.md,
          fontSize: t.font.size.input,
        }}
      />
      {error ? (
        <Text style={{ color: t.color.danger, fontSize: t.font.size.caption }} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function SwitchField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const t = useTheme();
  return (
    <Inline justify="space-between">
      <Label>{label}</Label>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ true: t.color.primary, false: t.color.border }}
      />
    </Inline>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  const t = useTheme();
  if (!children) return null;
  return (
    <Text style={{ color: t.color.danger, fontSize: t.font.size.body }} accessibilityRole="alert">
      {children}
    </Text>
  );
}

export function Row({ left, right, sub }: { left: ReactNode; right?: ReactNode; sub?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.inline, { gap: t.spacing.md }]}>
      <View style={styles.fill}>
        <Text style={{ color: t.color.text, fontSize: t.font.size.body }}>{left}</Text>
        {sub ? (
          <Text style={{ color: t.color.textMuted, fontSize: t.font.size.caption, marginTop: t.spacing.xs / 2 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right ? (
        <Text style={{ color: t.color.text, fontSize: t.font.size.body, fontWeight: t.font.weight.semibold }}>
          {right}
        </Text>
      ) : null}
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        borderWidth: t.border.width.thin,
        borderRadius: t.radius.pill,
        paddingVertical: t.spacing.sm,
        paddingHorizontal: t.spacing.md,
        borderColor: selected ? t.color.primary : t.color.border,
        backgroundColor: selected ? t.color.primary : t.color.surface,
      }}
    >
      <Text style={{ color: selected ? t.color.onPrimary : t.color.text, fontSize: t.font.size.label }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  inline: { flexDirection: 'row', alignItems: 'center' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.5 },
});
