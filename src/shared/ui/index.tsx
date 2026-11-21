import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, useTheme } from './theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const t = useTheme();
  const content = <View style={{ padding: spacing(4), gap: spacing(3) }}>{children}</View>;
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: t.bg }}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <Text style={[styles.title, { color: t.text }]} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Label({ children, muted }: { children: ReactNode; muted?: boolean }) {
  const t = useTheme();
  return <Text style={{ color: muted ? t.muted : t.text, fontSize: 15 }}>{children}</Text>;
}

export function Card({
  children,
  style,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  const s = [styles.card, { backgroundColor: t.surface, borderColor: t.border }, style];
  return onPress ? (
    <Pressable
      style={({ pressed }) => [...s, pressed && { opacity: 0.7 }]}
      onPress={onPress}
      accessibilityRole="button"
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? t.primary : 'transparent',
          borderColor: t.primary,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? t.onPrimary : t.primary} />
      ) : (
        <Text style={[styles.buttonText, { color: primary ? t.onPrimary : t.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function TextField({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: spacing(1.5) }}>
      <Text style={{ color: t.muted, fontSize: 14 }}>{label}</Text>
      <TextInput
        placeholderTextColor={t.muted}
        autoCorrect={false}
        // Evita que el teclado aprenda/sugiera datos sensibles
        {...props}
        accessibilityLabel={label}
        style={[styles.input, { color: t.text, backgroundColor: t.surface, borderColor: error ? t.danger : t.border }]}
      />
      {error ? (
        <Text style={{ color: t.danger, fontSize: 13 }} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  const t = useTheme();
  if (!children) return null;
  return (
    <Text style={{ color: t.danger }} accessibilityRole="alert">
      {children}
    </Text>
  );
}

export function Row({ left, right, sub }: { left: ReactNode; right?: ReactNode; sub?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.text, fontSize: 16 }}>{left}</Text>
        {sub ? <Text style={{ color: t.muted, fontSize: 13, marginTop: 2 }}>{sub}</Text> : null}
      </View>
      {right ? <Text style={{ color: t.text, fontSize: 16, fontWeight: '600' }}>{right}</Text> : null}
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
      style={[
        styles.chip,
        { borderColor: selected ? t.primary : t.border, backgroundColor: selected ? t.primary : t.surface },
      ]}
    >
      <Text style={{ color: selected ? t.onPrimary : t.text }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700' },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius, padding: spacing(4), gap: spacing(2) },
  button: { borderRadius: radius, borderWidth: 1, paddingVertical: spacing(4), alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, padding: spacing(3.5), fontSize: 17 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  chip: { borderWidth: 1, borderRadius: 999, paddingVertical: spacing(2), paddingHorizontal: spacing(3.5) },
});
