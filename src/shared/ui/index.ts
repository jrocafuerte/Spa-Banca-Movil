/**
 * API pública de UI para pantallas y features. Nunca importar adaptadores ni
 * librerías de Design System directamente (lo impide ESLint).
 */
import { kit } from './kit';

export const {
  Provider: UiProvider,
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
} = kit;

export type * from './contract';
export { useTheme } from './theme';
