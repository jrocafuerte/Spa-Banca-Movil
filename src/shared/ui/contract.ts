/**
 * CONTRATO DE COMPONENTES DE UI (independiente de cualquier librería).
 *
 * Las pantallas (src/app, src/features) solo conocen estas interfaces. Cada
 * Design System se integra con un ADAPTADOR (src/shared/ui/adapters/<nombre>)
 * que implementa `UiKit` y debe pasar la suite de conformidad
 * (src/shared/ui/__tests__/contract.test.tsx), que incluye requisitos de
 * accesibilidad y de seguridad (p. ej. campos de clave).
 *
 * Reglas para evolucionar el contrato:
 * - Props semánticas (qué es), no visuales (cómo se ve): nada de colores ni estilos.
 * - Agregar props opcionales es compatible; cambiar/eliminar exige actualizar todos los adaptadores.
 */
import type { ComponentType, ReactNode } from 'react';
import type { tokens } from './tokens.generated';

export type SpacingToken = keyof typeof tokens.spacing;

export interface ProviderProps {
  children: ReactNode;
}

export interface ScreenProps {
  children: ReactNode;
  /** Contenido desplazable (por defecto true). */
  scroll?: boolean;
  /** Centra el contenido (pantallas de estado / bloqueo). */
  center?: boolean;
  /** Pull-to-refresh. */
  refreshing?: boolean;
  onRefresh?: () => void;
}

export interface InlineProps {
  children: ReactNode;
  gap?: SpacingToken;
  wrap?: boolean;
  justify?: 'flex-start' | 'space-between' | 'center';
}

export interface SpacerProps {
  size?: SpacingToken;
}

export interface TitleProps {
  children: ReactNode;
}

export interface LabelProps {
  children: ReactNode;
  muted?: boolean;
  center?: boolean;
}

export interface CardProps {
  children: ReactNode;
  /** Estado seleccionado (debe exponerse como accessibilityState.selected). */
  selected?: boolean;
  /** Si existe, la tarjeta es un botón accesible. */
  onPress?: () => void;
  accessibilityLabel?: string;
}

export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  /** Muestra progreso y NO permite pulsar (evita dobles envíos de operaciones). */
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export interface HeaderButtonProps {
  /** Etiqueta accesible obligatoria (el glifo no es legible por lectores de pantalla). */
  label: string;
  glyph: string;
  onPress: () => void;
}

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'phone-pad' | 'email-address';
  /** SEGURIDAD: el adaptador debe ocultar el texto. */
  secureTextEntry?: boolean;
  /** SEGURIDAD: el adaptador debe deshabilitar copiar/pegar. */
  contextMenuHidden?: boolean;
  autoComplete?: 'off' | 'username' | 'current-password' | 'one-time-code';
  textContentType?: 'none' | 'username' | 'password' | 'oneTimeCode';
}

export interface SwitchFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export interface ErrorTextProps {
  /** Si está vacío no se renderiza nada. Debe anunciarse (accessibilityRole="alert"). */
  children?: ReactNode;
}

export interface RowProps {
  left: ReactNode;
  right?: ReactNode;
  sub?: ReactNode;
}

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export interface UiKit {
  /** Envoltorio raíz (p. ej. el ThemeProvider del Design System). */
  Provider: ComponentType<ProviderProps>;
  Screen: ComponentType<ScreenProps>;
  Inline: ComponentType<InlineProps>;
  Spacer: ComponentType<SpacerProps>;
  Loading: ComponentType;
  Title: ComponentType<TitleProps>;
  Label: ComponentType<LabelProps>;
  Card: ComponentType<CardProps>;
  Button: ComponentType<ButtonProps>;
  HeaderButton: ComponentType<HeaderButtonProps>;
  TextField: ComponentType<TextFieldProps>;
  SwitchField: ComponentType<SwitchFieldProps>;
  ErrorText: ComponentType<ErrorTextProps>;
  Row: ComponentType<RowProps>;
  Chip: ComponentType<ChipProps>;
}
