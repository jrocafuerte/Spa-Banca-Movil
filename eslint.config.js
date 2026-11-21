// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/**
 * Paquetes del Design System del banco (p. ej. '@banco/react-native-ds').
 * Solo pueden importarse dentro de src/shared/ui/adapters/**.
 */
const DESIGN_SYSTEM_PACKAGES = [];

/** Valores visuales fijos prohibidos: deben venir de los Design Tokens. */
const HEX_COLOR = {
  selector: "Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
  message: 'Usa un token de color (useTheme().color.*); no colores fijos. Ver design-tokens/README.md',
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'android/*', 'ios/*', 'coverage/*', 'src/shared/ui/tokens.generated.ts'],
  },
  {
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': ['error', HEX_COLOR],
    },
  },
  {
    // Pantallas y features: solo componentes del kit (src/shared/ui), que es la capa
    // reemplazable por el Design System del banco.
    files: ['src/app/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: [
                'View',
                'Text',
                'TextInput',
                'Pressable',
                'TouchableOpacity',
                'TouchableHighlight',
                'ScrollView',
                'FlatList',
                'SectionList',
                'Switch',
                'Image',
                'ActivityIndicator',
                'RefreshControl',
                'StyleSheet',
                'Button',
                'Modal',
              ],
              message: 'Importa componentes desde src/shared/ui (capa del Design System).',
            },
            ...DESIGN_SYSTEM_PACKAGES.map((name) => ({
              name,
              message: 'El Design System solo se usa a través de su adaptador (src/shared/ui/adapters).',
            })),
          ],
          patterns: [
            {
              group: ['**/shared/ui/adapters/**', '**/shared/ui/kit'],
              message: 'Usa la API pública src/shared/ui; el adaptador se elige solo en kit.ts.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        HEX_COLOR,
        {
          selector: "JSXAttribute[name.name='style'][value.type='JSXExpressionContainer']",
          message: 'Sin estilos inline en pantallas: usa props del kit de UI o tokens.',
        },
      ],
    },
  },
  {
    files: ['src/features/service-payments/ServicesWebView.tsx'],
    rules: {
      // El WebView es un componente nativo de plataforma, no del Design System; su único estilo usa tokens.
      'no-restricted-syntax': ['error', HEX_COLOR],
    },
  },
]);
