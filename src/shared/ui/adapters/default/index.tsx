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
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowDown,
  faArrowLeft,
  faArrowRightArrowLeft,
  faArrowUp,
  faBuildingColumns,
  faChevronRight,
  faCircleCheck,
  faCreditCard,
  faFileInvoiceDollar,
  faHandHoldingDollar,
  faHouse,
  faRightFromBracket,
  faShareNodes,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useFonts } from 'expo-font';
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
import { FONT_ASSETS } from '../../fonts';
import { useTheme } from '../../theme';

/** Carga las fuentes del Design System antes de mostrar la UI (evita saltos de tipografía). */
function Provider({ children }: ProviderProps) {
  const [loaded, error] = useFonts(FONT_ASSETS);
  // Si falla la carga se continúa con la fuente del sistema: nunca bloquear la app.
  if (!loaded && !error) return null;
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
    <Text style={{ color: t.color.text, fontSize: t.font.size.title, ...t.text('bold') }} accessibilityRole="header">
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
        ...t.text(),
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
          borderRadius: t.radius.md,
          minHeight: t.size.control,
          paddingHorizontal: t.spacing.xl,
          justifyContent: 'center',
          alignItems: 'center',
        },
        disabled ? styles.disabled : pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={{ color: fg, fontSize: t.font.size.body, ...t.text('semibold') }}>{title}</Text>
      )}
    </Pressable>
  );
}

/** Botón de icono/texto para cabeceras nativas (p. ej. "atrás"). */
function HeaderButton({ label, icon, onPress }: HeaderButtonProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={t.spacing.md}
      style={{ paddingHorizontal: t.spacing.sm }}
    >
      <Icon name={icon} color={t.color.primary} size={t.font.size.title} />
    </Pressable>
  );
}

function TextField({ label, error, ...props }: TextFieldProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: t.spacing.xs }}>
      <Text style={{ color: t.color.textMuted, fontSize: t.font.size.label, ...t.text() }}>{label}</Text>
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
          minHeight: t.size.control,
          paddingHorizontal: t.spacing.md,
          fontSize: t.font.size.input,
          ...t.text(),
        }}
      />
      {error ? (
        <Text
          style={{ color: t.color.danger, fontSize: t.font.size.caption, ...t.text() }}
          accessibilityLiveRegion="polite"
        >
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
    <Text style={{ color: t.color.danger, fontSize: t.font.size.body, ...t.text() }} accessibilityRole="alert">
      {children}
    </Text>
  );
}

function Row({ left, right, sub, icon, chevron }: RowProps) {
  const t = useTheme();
  return (
    <View style={[styles.inline, { gap: t.spacing.md }]}>
      {icon ? <Icon name={icon} color={t.color.primary} size={t.font.size.title} /> : null}
      <View style={styles.fill}>
        <Text style={{ color: t.color.text, fontSize: t.font.size.body, ...t.text() }}>{left}</Text>
        {sub ? (
          <Text
            style={{
              color: t.color.textMuted,
              fontSize: t.font.size.caption,
              marginTop: t.spacing.xs / 2,
              ...t.text(),
            }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      {right ? (
        <Text style={{ color: t.color.text, fontSize: t.font.size.body, ...t.text('semibold') }}>{right}</Text>
      ) : null}
      {chevron ? <Icon name="chevron-right" color={t.color.textMuted} size={t.font.size.label} /> : null}
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
      <Text style={{ color: selected ? t.color.onPrimary : t.color.text, fontSize: t.font.size.label, ...t.text() }}>
        {label}
      </Text>
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

/** Íconos Font Awesome (los mismos que usa el Design System Beat; hoy el set Free). */
const ICONS: Record<IconName, IconDefinition> = {
  home: faHouse,
  transfer: faArrowRightArrowLeft,
  pay: faWallet,
  card: faCreditCard,
  services: faFileInvoiceDollar,
  account: faBuildingColumns,
  loan: faHandHoldingDollar,
  income: faArrowDown,
  expense: faArrowUp,
  logout: faRightFromBracket,
  share: faShareNodes,
  'chevron-right': faChevronRight,
  back: faArrowLeft,
  success: faCircleCheck,
};

function Icon({ name, color, size, accessibilityLabel }: IconProps) {
  const t = useTheme();
  const fill = typeof color === 'string' ? color : t.color.text;
  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={!accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    >
      <FontAwesomeIcon icon={ICONS[name]} color={fill} size={size ?? t.font.size.title} />
    </View>
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
