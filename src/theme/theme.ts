import { WIN_COLORS, WIN_GRADIENTS, WIN_GLASS } from './colors';

export type GradientTuple = readonly [string, string, ...string[]];

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  cardBg: string;
  cardBorder: string;
  textMain: string;
  textMuted: string;
  textSub: string;
  headerBg: string;
  primary: string;
  secondary: string;
  primaryGradient: GradientTuple;
  headerGradient: GradientTuple;
  buttonGradient: GradientTuple;
  accentGradient: GradientTuple;
  tabBarBg: string;
  iconBg: string;
  iconColor: string;
  shadowColor: string;
  pillBg: string;
  pillBorder: string;
}

// 🌈 Thème Clair Unifié WIN (Inspiré du logo et des dégradés doux)
export const lightTheme: ThemeColors = {
  bg: '#F8FAFC',
  bgSecondary: '#EEF2FF',
  cardBg: WIN_COLORS.white,
  cardBorder: '#E2E8F0',
  textMain: WIN_COLORS.slate900,
  textMuted: WIN_COLORS.slate500,
  textSub: WIN_COLORS.slate400,
  headerBg: WIN_COLORS.blue,
  primary: WIN_COLORS.violet,
  secondary: WIN_COLORS.cyan,
  primaryGradient: WIN_GRADIENTS.headerLight,
  headerGradient: WIN_GRADIENTS.headerLight,
  buttonGradient: WIN_GRADIENTS.buttonPrimary,
  accentGradient: WIN_GRADIENTS.buttonAccent,
  tabBarBg: 'rgba(255, 255, 255, 0.92)',
  iconBg: WIN_COLORS.white,
  iconColor: WIN_COLORS.slate900,
  shadowColor: WIN_COLORS.violet,
  pillBg: WIN_GLASS.pillBgLight,
  pillBorder: WIN_GLASS.pillBorderLight,
};

// 🌌 Thème Sombre Unifié WIN (Cosmic Midnight Indigo & Neon Accents)
export const darkTheme: ThemeColors = {
  bg: WIN_COLORS.darkBg,
  bgSecondary: '#0B132B',
  cardBg: WIN_COLORS.darkCard,
  cardBorder: WIN_COLORS.darkBorder,
  textMain: '#F8FAFC',
  textMuted: WIN_COLORS.slate400,
  textSub: WIN_COLORS.slate500,
  headerBg: '#081730',
  primary: WIN_COLORS.violetLight,
  secondary: WIN_COLORS.cyanLight,
  primaryGradient: WIN_GRADIENTS.headerDark,
  headerGradient: WIN_GRADIENTS.headerDark,
  buttonGradient: WIN_GRADIENTS.buttonPrimary,
  accentGradient: WIN_GRADIENTS.buttonAccent,
  tabBarBg: 'rgba(15, 23, 42, 0.92)',
  iconBg: 'rgba(255, 255, 255, 0.08)',
  iconColor: WIN_COLORS.white,
  shadowColor: '#000000',
  pillBg: WIN_GLASS.pillBgDark,
  pillBorder: WIN_GLASS.pillBorderDark,
};
