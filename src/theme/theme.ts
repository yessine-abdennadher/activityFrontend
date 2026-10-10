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
  primaryGradient: string[];
  tabBarBg: string;
  iconBg: string;
  iconColor: string;
  shadowColor: string;
}

// 🌊 Palette Bleu Méditerranéen & Cyan Saphir (Sidi Bou Saïd & Mer)
export const lightTheme: ThemeColors = {
  bg: '#F0F7FF',
  bgSecondary: '#E0F2FE',
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(224, 242, 254, 0.8)',
  textMain: '#0F172A',
  textMuted: '#475569',
  textSub: '#64748B',
  headerBg: '#0284C7',
  primary: '#0284C7',
  primaryGradient: ['#38BDF8', '#0284C7', '#0369A1'],
  tabBarBg: '#FFFFFF',
  iconBg: '#FFFFFF',
  iconColor: '#0F172A',
  shadowColor: '#0284C7',
};

export const darkTheme: ThemeColors = {
  bg: '#070D18',
  bgSecondary: '#0B1528',
  cardBg: '#0E1E38',
  cardBorder: 'rgba(56, 189, 248, 0.12)',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  textSub: '#64748B',
  headerBg: '#081730',
  primary: '#38BDF8',
  primaryGradient: ['#0C4A6E', '#0369A1', '#0284C7'],
  tabBarBg: 'rgba(11, 21, 40, 0.95)',
  iconBg: 'rgba(255, 255, 255, 0.08)',
  iconColor: '#FFFFFF',
  shadowColor: '#000000',
};
