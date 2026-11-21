# Adaptadores de UI (Design System intercambiable)

```
Pantallas (src/app, src/features)
      │  solo importan  src/shared/ui        ← API pública (index.ts)
      ▼
contract.ts  (UiKit: props semánticas, sin estilos)
      ▲
kit.ts  ── elige UN adaptador ──►  adapters/default   (kit propio + Design Tokens)
                                   adapters/<tu-ds>   (envuelve tu librería React Native)
```

- **contract.ts** — interfaces de cada componente (`ButtonProps`, `TextFieldProps`…) y el tipo `UiKit`.
- **adapters/default** — implementación de referencia con primitivas de React Native y tokens.
- **kit.ts** — la **única línea** que decide qué adaptador usa la app.
- **\_\_tests\_\_/contract.test.tsx** — suite de conformidad (comportamiento, accesibilidad y seguridad)
  que corre en CI contra el adaptador seleccionado.

ESLint impide que pantallas/features importen adaptadores, `kit.ts`, primitivas visuales de
`react-native` o el paquete de tu Design System (declararlo en `DESIGN_SYSTEM_PACKAGES` de
`eslint.config.js`).

## Integrar tu Design System React Native

1. Instala tu librería (p. ej. `npm i @banco/react-native-ds`) y agrégala a `DESIGN_SYSTEM_PACKAGES`.
2. Crea `adapters/banco/index.tsx` mapeando cada componente del contrato a los tuyos. Solo se traducen
   props: la pantalla no cambia. Ejemplo (nombres de la librería ilustrativos):

   ```tsx
   import { BancoThemeProvider, Btn, Input, ListItem, Tag, Toggle, Heading, Body, Surface } from '@banco/react-native-ds';
   import { defaultKit } from '../default';
   import { tokens } from '../../tokens.generated';
   import type { ButtonProps, TextFieldProps, UiKit } from '../../contract';

   function Button({ title, onPress, disabled, loading, variant = 'primary' }: ButtonProps) {
     return (
       <Btn
         label={title}
         onPress={onPress}
         kind={variant === 'primary' ? 'filled' : 'outlined'}
         disabled={disabled || loading}   // el contrato exige que loading impida pulsar
         isLoading={loading}
         accessibilityState={{ disabled: disabled || loading, busy: loading }}
       />
     );
   }

   function TextField({ label, error, secureTextEntry, contextMenuHidden, ...rest }: TextFieldProps) {
     return (
       <Input
         label={label}
         helperText={error}
         status={error ? 'error' : 'default'}
         secure={secureTextEntry}
         // Requisitos de seguridad del contrato (los valida la suite):
         textInputProps={{ secureTextEntry, contextMenuHidden, autoCorrect: false, spellCheck: false, accessibilityLabel: label }}
         {...rest}
       />
     );
   }

   export const bancoKit = {
     ...defaultKit, // migración gradual: lo que aún no tengas en tu DS sigue usando el kit por defecto
     // Si tu ThemeProvider acepta un tema, aliméntalo con los tokens generados (misma fuente que el resto)
     Provider: ({ children }) => <BancoThemeProvider theme={tokens}>{children}</BancoThemeProvider>,
     Button,
     TextField,
     Title: ({ children }) => <Heading level={1} accessibilityRole="header">{children}</Heading>,
     Chip: ({ label, selected, onPress }) => (
       <Tag label={label} active={selected} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }} />
     ),
   } satisfies UiKit;
   ```

3. Cambia la selección en `kit.ts`:
   ```ts
   import { bancoKit } from './adapters/banco';
   export const kit: UiKit = bancoKit;
   ```
4. Ejecuta `npm test`: la suite de conformidad debe pasar completa (si tu componente no expone un rol,
   una etiqueta accesible o una prop de seguridad, el adaptador debe agregarlo).
5. Si tu Design System trae sus propios tokens, úsalos como fuente en `design-tokens/` (ver
   `design-tokens/README.md`) para que app y micro frontend sigan alineados.

## Reglas del contrato

- Props **semánticas** (qué es), nunca visuales (colores, estilos): el aspecto lo decide el adaptador.
- Agregar props opcionales es compatible; cambiar o eliminar exige actualizar todos los adaptadores.
- Cada componente nuevo del contrato debe tener casos en la suite de conformidad.
