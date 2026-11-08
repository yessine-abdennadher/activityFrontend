/**
 * ✍️ Typography Tokens & Fonts — Tfarhida (تفرهيدة) & WIN
 * Harmonisation 100% avec le Web (Outfit, Inter, Noto Kufi Arabic)
 */

export const FONTS = {
  // Titres & Brand Signature (Outfit — géométrique, chaleureux et moderne)
  outfitRegular: 'Outfit_400Regular',
  outfitMedium: 'Outfit_500Medium',
  outfitSemiBold: 'Outfit_600SemiBold',
  outfitBold: 'Outfit_700Bold',
  outfitExtraBold: 'Outfit_800ExtraBold',
  outfitBlack: 'Outfit_900Black',

  // Textes, Prix & Corps d'Interface (Inter — lisibilité maximale sur mobile)
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',

  // Arabe / RTL Moderne (Noto Kufi Arabic — calligraphie Kufi épurée et contemporaine)
  arabicRegular: 'NotoKufiArabic_400Regular',
  arabicMedium: 'NotoKufiArabic_500Medium',
  arabicSemiBold: 'NotoKufiArabic_600SemiBold',
  arabicBold: 'NotoKufiArabic_700Bold',
  arabicExtraBold: 'NotoKufiArabic_800ExtraBold',
} as const;

export type FontWeightToken = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

/**
 * Retourne le nom de la police adaptée selon le rôle (titre vs texte) et la langue
 */
export function getAppFont(
  weight: FontWeightToken = 'regular',
  isTitle = false,
  isArabic = false
): string {
  if (isArabic) {
    switch (weight) {
      case 'black':
      case 'extrabold':
        return FONTS.arabicExtraBold;
      case 'bold':
        return FONTS.arabicBold;
      case 'semibold':
        return FONTS.arabicSemiBold;
      case 'medium':
        return FONTS.arabicMedium;
      default:
        return FONTS.arabicRegular;
    }
  }

  if (isTitle) {
    switch (weight) {
      case 'black':
        return FONTS.outfitBlack;
      case 'extrabold':
        return FONTS.outfitExtraBold;
      case 'bold':
        return FONTS.outfitBold;
      case 'semibold':
        return FONTS.outfitSemiBold;
      case 'medium':
        return FONTS.outfitMedium;
      default:
        return FONTS.outfitRegular;
    }
  }

  switch (weight) {
    case 'black':
    case 'extrabold':
    case 'bold':
      return FONTS.interBold;
    case 'semibold':
      return FONTS.interSemiBold;
    case 'medium':
      return FONTS.interMedium;
    default:
      return FONTS.interRegular;
  }
}

