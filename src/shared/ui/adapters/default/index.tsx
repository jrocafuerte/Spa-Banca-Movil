/**
 * Adaptador POR DEFECTO del contrato de UI: implementación propia con
 * primitivas de react-native y Design Tokens. Sirve de referencia para
 * escribir el adaptador del Design System del banco (ver ../README.md).
 */
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type {
  ButtonProps,
  CardProps,
  ChipProps,
  ErrorTextProps,
  HeaderButtonProps,
  IconName,
  IconProps,
  InlineProps,
  LabelProps,
  ProviderProps,
  RowProps,
  ScreenProps,
  SpacerProps,
  SwitchFieldProps,
  TextFieldProps,
  TitleProps,
  UiKit,
} from '../../contract';
import { useTheme } from '../../theme';

function Provider({ children }: ProviderProps) {
  return <>{children}</>;
}

function Screen({ children, scroll = true, center = false, refreshing, onRefresh }: ScreenProps) {
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
function Inline({ children, gap = 'sm', wrap = false, justify = 'flex-start' }: InlineProps) {
  const t = useTheme();
  return (
    <View style={[styles.inline, { gap: t.spacing[gap], flexWrap: wrap ? 'wrap' : 'nowrap', justifyContent: justify }]}>
      {children}
    </View>
  );
}

function Spacer({ size = 'sm' }: SpacerProps) {
  const t = useTheme();
  return <View style={{ height: t.spacing[size] }} />;
}

function Loading() {
  const t = useTheme();
  return (
    <View style={[styles.fill, styles.center]}>
      <ActivityIndicator color={t.color.primary} />
    </View>
  );
}

function Title({ children }: TitleProps) {
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

function Label({ children, muted, center }: LabelProps) {
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

function Card({ children, selected, onPress, accessibilityLabel }: CardProps) {
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

function Button({ title, onPress, disabled, loading, variant = 'primary' }: ButtonProps) {
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
function HeaderButton({ label, glyph, onPress }: HeaderButtonProps) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={t.spacing.md}>
      <Text style={{ color: t.color.primary, fontSize: t.font.size.display, paddingHorizontal: t.spacing.sm }}>
        {glyph}
      </Text>
    </Pressable>
  );
}

function TextField({ label, error, ...props }: TextFieldProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: t.spacing.xs }}>
      <Text style={{ color: t.color.textMuted, fontSize: t.font.size.label }}>{label}</Text>
      <TextInput
        placeholderTextColor={t.color.textMuted}
        // Evita que el teclado aprenda/sugiera datos sensibles
        autoCorrect={false}
        spellCheck={false}
        autoCapitalize="none"
        {...props}
        accessibilityLabel={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          color: t.color.text,
          backgroundColor: t.color.surface,
          borderColor: error ? t.color.danger : focused ? t.color.borderSelected : t.color.border,
          borderWidth: t.border.width.thin, // ancho constante: sin saltos de layout al enfocar
          // El foco se indica con el borde de marca (sin el anillo genérico del sistema/navegador)
          outlineWidth: 0,
          outlineStyle: 'solid', // con 'auto' Chrome ignora el ancho 0 y dibuja su anillo
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

function SwitchField({ label, value, onChange }: SwitchFieldProps) {
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

function ErrorText({ children }: ErrorTextProps) {
  const t = useTheme();
  if (!children) return null;
  return (
    <Text style={{ color: t.color.danger, fontSize: t.font.size.body }} accessibilityRole="alert">
      {children}
    </Text>
  );
}

function Row({ left, right, sub }: RowProps) {
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

function Chip({ label, selected, onPress }: ChipProps) {
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

const IONICONS: Record<IconName, keyof typeof Ionicons.glyphMap> = {
  home: 'home-outline',
  transfer: 'swap-horizontal-outline',
  pay: 'wallet-outline',
  card: 'card-outline',
  services: 'receipt-outline',
  'chevron-right': 'chevron-forward',
  back: 'chevron-back',
  success: 'checkmark-circle',
};

function Icon({ name, color, size, accessibilityLabel }: IconProps) {
  const t = useTheme();
  return (
    <Ionicons
      name={IONICONS[name]}
      color={typeof color === 'number' ? undefined : (color ?? t.color.text)}
      size={size ?? t.font.size.title}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={!accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    />
  );
}

export const defaultKit = {
  Provider,
  Screen,
  Inline,
  Spacer,
  Loading,
  Title,
  Label,
  Card,
  Button,
  HeaderButton,
  TextField,
  SwitchField,
  ErrorText,
  Row,
  Chip,
  Icon,
} satisfies UiKit;
