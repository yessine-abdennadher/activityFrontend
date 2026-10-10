import { lightTheme } from '../theme/theme';

export const COLORS = {
  primary: lightTheme.primary,
  primaryDark: '#7C3AED',
  primaryLight: '#F3E8FF',
  secondary: '#EC4899',
  accent: '#FFB800',
  bgDark: '#0B0C10',
  cardDark: '#161822',
  textMain: lightTheme.textMain,
  textMuted: lightTheme.textMuted,
  textSub: lightTheme.textSub,
} as const;

export const SPACING = { xs: 6, sm: 12, md: 20, lg: 28, xl: 36 } as const;
export const RADIUS = { sm: 12, md: 20, lg: 28, xl: 36, full: 9999 } as const;
export const theme = lightTheme;
