import { Platform } from 'react-native';

const govPrimary = '#7A1F2B'; // Vino/Rojo oscuro
const govBackground = '#F7F4EF'; // Crema
const govForeground = '#3A3A3A'; // Gris oscuro
const govAccent = '#B08A57'; // Dorado/Café
const govSurface = '#E8DDD0'; // Beige
const govSuccess = '#3D6B4F'; // Verde oscuro

export const Colors = {
  light: {
    text: govForeground,
    background: govBackground,
    tint: govPrimary,
    icon: govForeground,
    tabIconDefault: '#999',
    tabIconSelected: govPrimary,
    primary: govPrimary,
    secondary: govSurface,
    accent: govAccent,
    success: govSuccess,
    border: 'rgba(58, 58, 58, 0.18)',
    surface: '#FFFFFF',
  },
  dark: {
    text: govForeground,
    background: govBackground,
    tint: govPrimary,
    icon: govForeground,
    tabIconDefault: '#999',
    tabIconSelected: govPrimary,
    primary: govPrimary,
    secondary: govSurface,
    accent: govAccent,
    success: govSuccess,
    border: 'rgba(58, 58, 58, 0.18)',
    surface: '#FFFFFF',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
