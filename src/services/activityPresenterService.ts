import { getLocalizedCategories } from '../constants/categories';

export interface RatingDisplayInfo {
  hasReviews: boolean;
  displayRating: number;
  ratingText: string;
}

/**
 * Service de présentation et formatage pour les détails des activités
 */
export const activityPresenterService = {
  /**
   * Formate le prix d'une activité (avec libellé gratuit multilingue)
   */
  formatPrice(price?: number, language = 'fr'): string {
    if (price === 0) {
      return language === 'ar' ? 'مجاني' : language === 'fr' ? 'Gratuit' : 'Free';
    }
    if (price === undefined || price === null) {
      return language === 'ar' ? 'مجاني' : language === 'fr' ? 'Gratuit' : 'Free';
    }
    return `${price} DT`;
  },

  /**
   * Calcule et formate l'affichage de la note (règle stricte : 0 avis = 0)
   */
  formatRating(rating = 0, reviewsCount = 0, language = 'fr'): RatingDisplayInfo {
    const hasReviews = reviewsCount > 0;
    const displayRating = hasReviews ? rating : 0;
    const ratingText = hasReviews
      ? `${displayRating} / 5`
      : language === 'ar'
      ? 'لا يوجد تقييم'
      : language === 'fr'
      ? '0 (Non noté)'
      : '0 (Not rated)';

    return {
      hasReviews,
      displayRating,
      ratingText,
    };
  },

  /**
   * Récupère le libellé traduit de la catégorie de l'activité
   */
  getLocalizedCategoryName(category?: string, language = 'fr'): string {
    if (!category) return '';
    const list = getLocalizedCategories(language);
    const match = list.find(
      (c) =>
        c.id.toLowerCase() === category.toLowerCase() ||
        c.nameAr === category ||
        c.nameFr === category ||
        c.nameEn === category
    );
    return match ? match.name : category;
  },

  /**
   * Formate la fourchette de personnes recommandées
   */
  formatPeopleRange(min = 1, max = 8, language = 'fr'): string {
    const peopleWord = language === 'ar' ? 'أشخاص' : language === 'fr' ? 'personnes' : 'people';
    const forWord = language === 'ar' ? 'مناسب لـ' : language === 'fr' ? 'Idéal pour' : 'Ideal for';
    return `${forWord} ${min}–${max} ${peopleWord}`;
  },
};
