import { WIN_COLORS, WIN_GRADIENTS, WIN_GLASS } from './colors';
import type { GradientTuple, ThemeColors } from './theme';

export type PaletteId =
  | 'win_original'
  | 'sidi_bou_said'
  | 'sunset_carthage'
  | 'oasis_tozeur'
  | 'rose_flamingo';

export interface ColorPalette {
  id: PaletteId;
  name: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  taglineAr: string;
  taglineFr: string;
  taglineEn: string;
  previewColors: [string, string, string, string];
  light: {
    primary: string;
    secondary: string;
    headerBg: string;
    headerGradient: GradientTuple;
    buttonGradient: GradientTuple;
    accentGradient: GradientTuple;
    shadowColor: string;
  };
  dark: {
    primary: string;
    secondary: string;
    headerBg: string;
    headerGradient: GradientTuple;
    buttonGradient: GradientTuple;
    accentGradient: GradientTuple;
    shadowColor: string;
  };
}

export const APP_PALETTES: ColorPalette[] = [
  {
    id: 'win_original',
    name: 'WIN Signature',
    nameAr: 'وين الأصلية',
    nameFr: 'WIN Signature',
    nameEn: 'WIN Signature',
    taglineAr: 'تناغم الباستيل، السيان والبنفسجي الأيقوني',
    taglineFr: 'L\'élégance pastel, cyan & violette emblématique',
    taglineEn: 'Signature pastel, cyan & violet harmony',
    previewColors: ['#00D2FF', '#9865F0', '#FDA4AF', '#38BDF8'],
    light: {
      primary: '#8B5CF6',
      secondary: '#00D2FF',
      headerBg: '#2563EB',
      headerGradient: WIN_GRADIENTS.headerLight,
      buttonGradient: WIN_GRADIENTS.buttonPrimary,
      accentGradient: WIN_GRADIENTS.buttonAccent,
      shadowColor: '#8B5CF6',
    },
    dark: {
      primary: '#A78BFA',
      secondary: '#38BDF8',
      headerBg: '#081730',
      headerGradient: WIN_GRADIENTS.headerDark,
      buttonGradient: WIN_GRADIENTS.buttonPrimary,
      accentGradient: WIN_GRADIENTS.buttonAccent,
      shadowColor: '#000000',
    },
  },
  {
    id: 'sidi_bou_said',
    name: 'Sidi Bou Saïd',
    nameAr: 'سيدي بوسعيد',
    nameFr: 'Sidi Bou Saïd',
    nameEn: 'Sidi Bou Said',
    taglineAr: 'أزرق البحر الأبيض المتوسط وأبيض الجير الخالص',
    taglineFr: 'Bleu cobalt méditerranéen & blanc pur des falaises',
    taglineEn: 'Mediterranean cobalt blue & pure whitewashed cliff vibes',
    previewColors: ['#0284C7', '#38BDF8', '#BAE6FD', '#0369A1'],
    light: {
      primary: '#0284C7',
      secondary: '#38BDF8',
      headerBg: '#0369A1',
      headerGradient: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#0284C7'] as const,
      buttonGradient: ['#0284C7', '#0369A1', '#075985'] as const,
      accentGradient: ['#38BDF8', '#0284C7'] as const,
      shadowColor: '#0284C7',
    },
    dark: {
      primary: '#38BDF8',
      secondary: '#7DD3FC',
      headerBg: '#082F49',
      headerGradient: ['#082F49', '#0C4A6E', '#075985', '#0369A1'] as const,
      buttonGradient: ['#0284C7', '#0369A1', '#075985'] as const,
      accentGradient: ['#38BDF8', '#0284C7'] as const,
      shadowColor: '#000000',
    },
  },
  {
    id: 'sunset_carthage',
    name: 'Carthage Sunset',
    nameAr: 'غروب قرطاج',
    nameFr: 'Carthage Sunset',
    nameEn: 'Carthage Sunset',
    taglineAr: 'دفء شمس المغارب، العنبر والمرجان التونسي',
    taglineFr: 'Chaleur crépusculaire, ambre doré & corail vibrant',
    taglineEn: 'Golden amber dusk, warm coral & terracotta glow',
    previewColors: ['#EA580C', '#F59E0B', '#FED7AA', '#FB923C'],
    light: {
      primary: '#EA580C',
      secondary: '#F59E0B',
      headerBg: '#C2410C',
      headerGradient: ['#FFF7ED', '#FFEDD5', '#FED7AA', '#FB923C'] as const,
      buttonGradient: ['#EA580C', '#F97316', '#F59E0B'] as const,
      accentGradient: ['#FB923C', '#EA580C'] as const,
      shadowColor: '#EA580C',
    },
    dark: {
      primary: '#FB923C',
      secondary: '#FBBF24',
      headerBg: '#431407',
      headerGradient: ['#431407', '#7C2D12', '#9A3412', '#C2410C'] as const,
      buttonGradient: ['#EA580C', '#F97316', '#F59E0B'] as const,
      accentGradient: ['#FB923C', '#EA580C'] as const,
      shadowColor: '#000000',
    },
  },
  {
    id: 'oasis_tozeur',
    name: 'Oasis de Tozeur',
    nameAr: 'واحة توزر',
    nameFr: 'Oasis de Tozeur',
    nameEn: 'Tozeur Oasis',
    taglineAr: 'زمرد بساتين النخيل وسحر الجنوب الصحراوي',
    taglineFr: 'Émeraude luxuriant des palmeraies & fraîcheur du désert',
    taglineEn: 'Lush emerald palm groves & desert oasis freshness',
    previewColors: ['#059669', '#10B981', '#34D399', '#A7F3D0'],
    light: {
      primary: '#059669',
      secondary: '#10B981',
      headerBg: '#047857',
      headerGradient: ['#ECFDF5', '#D1FAE5', '#A7F3D0', '#34D399'] as const,
      buttonGradient: ['#059669', '#10B981', '#34D399'] as const,
      accentGradient: ['#34D399', '#059669'] as const,
      shadowColor: '#059669',
    },
    dark: {
      primary: '#34D399',
      secondary: '#6EE7B7',
      headerBg: '#064E3B',
      headerGradient: ['#064E3B', '#065F46', '#047857', '#059669'] as const,
      buttonGradient: ['#059669', '#10B981', '#34D399'] as const,
      accentGradient: ['#34D399', '#059669'] as const,
      shadowColor: '#000000',
    },
  },
  {
    id: 'rose_flamingo',
    name: 'Flamant Rose',
    nameAr: 'النحام الوردي',
    nameFr: 'Flamant Rose',
    nameEn: 'Pink Flamingo',
    taglineAr: 'سحر بحيرات شط الجريد والوردي الحالم',
    taglineFr: 'Poésie féerique des lacs salés de Chott El Jerid',
    taglineEn: 'Enchanted pink salt lake horizons & soft magenta',
    previewColors: ['#DB2777', '#EC4899', '#F472B6', '#FBCFE8'],
    light: {
      primary: '#DB2777',
      secondary: '#EC4899',
      headerBg: '#BE185D',
      headerGradient: ['#FDF2F8', '#FCE7F3', '#FBCFE8', '#F472B6'] as const,
      buttonGradient: ['#DB2777', '#EC4899', '#F472B6'] as const,
      accentGradient: ['#F472B6', '#DB2777'] as const,
      shadowColor: '#DB2777',
    },
    dark: {
      primary: '#F472B6',
      secondary: '#F9A8D4',
      headerBg: '#500724',
      headerGradient: ['#500724', '#831843', '#9D174D', '#BE185D'] as const,
      buttonGradient: ['#DB2777', '#EC4899', '#F472B6'] as const,
      accentGradient: ['#F472B6', '#DB2777'] as const,
      shadowColor: '#000000',
    },
  },
];
