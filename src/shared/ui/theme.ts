import { useColorScheme } from 'react-native';

const light = {
  bg: '#F4F6FA',
  surface: '#FFFFFF',
  text: '#0F1B2D',
  muted: '#5B6B80',
  primary: '#0B5FFF',
  onPrimary: '#FFFFFF',
  danger: '#C62828',
  success: '#1B7F4B',
  border: '#E2E7EF',
};
const dark: typeof light = {
  bg: '#0B1220',
  surface: '#141D2E',
  text: '#E8EEF8',
  muted: '#9AA9BF',
  primary: '#5B8CFF',
  onPrimary: '#FFFFFF',
  danger: '#EF5350',
  success: '#4CAF80',
  border: '#24324A',
};

export type Theme = typeof light;
export const useTheme = (): Theme => (useColorScheme() === 'dark' ? dark : light);
export const spacing = (n: number) => n * 4;
export const radius = 14;
