import type { PartnerActivityItem, PartnerStats } from '../../../types';

type Metric30dKey = 'viewsCount30d' | 'whatsappClicks30d' | 'phoneClicks30d' | 'mapsClicks30d';
type MetricAllKey = 'viewsCount' | 'whatsappClicks' | 'phoneClicks' | 'mapsClicks';

export interface ComputedPerformanceMetrics {
  viewsCount: number;
  whatsappCount: number;
  phoneCount: number;
  mapsCount: number;
  directContacts: number;
  conversionRate: number;
  hasReviews: boolean;
  formattedRating: string;
  activePromoActivity: PartnerActivityItem | null;
  activeLoyaltyCount: number;
  totalEventsCount: number;
  hasFeaturedVenue: boolean;
}

export function sumMetric(
  activities: PartnerActivityItem[],
  field30d: Metric30dKey,
  fieldAll: MetricAllKey,
  period: '30d' | 'all'
): number {
  return activities.reduce((acc, item) => {
    const analytics = item.analytics;
    if (!analytics) return acc;
    if (period === 'all') {
      return acc + (typeof analytics[fieldAll] === 'number' ? analytics[fieldAll]! : 0);
    }
    if (typeof analytics[field30d] === 'number') {
      return acc + analytics[field30d]!;
    }
    return acc + (typeof analytics[fieldAll] === 'number' ? analytics[fieldAll]! : 0);
  }, 0);
}

export function computePerformanceMetrics(
  stats: PartnerStats,
  activities: PartnerActivityItem[],
  activePeriod: '30d' | 'all'
): ComputedPerformanceMetrics {
  const viewsCount = sumMetric(activities, 'viewsCount30d', 'viewsCount', activePeriod);
  const whatsappCount = sumMetric(activities, 'whatsappClicks30d', 'whatsappClicks', activePeriod);
  const phoneCount = sumMetric(activities, 'phoneClicks30d', 'phoneClicks', activePeriod);
  const mapsCount = sumMetric(activities, 'mapsClicks30d', 'mapsClicks', activePeriod);

  const directContacts = whatsappCount + phoneCount;
  const conversionRate =
    viewsCount > 0 ? Math.min(100, Number(((directContacts / viewsCount) * 100).toFixed(1))) : 0;

  const hasReviews = stats.totalReviews > 0;
  const formattedRating = hasReviews ? stats.averageRating.toFixed(1) : '0.0';

  const activePromoActivity = activities.find((a) => a.promotion?.isPromo) || null;
  const activeLoyaltyCount = activities.filter((a) => a.loyaltyProgram?.isActive).length;
  const totalEventsCount = activities.reduce((sum, a) => sum + (a.events?.length || 0), 0);
  const hasFeaturedVenue = activities.some((a) => Boolean(a.isFeatured));

  return {
    viewsCount,
    whatsappCount,
    phoneCount,
    mapsCount,
    directContacts,
    conversionRate,
    hasReviews,
    formattedRating,
    activePromoActivity,
    activeLoyaltyCount,
    totalEventsCount,
    hasFeaturedVenue,
  };
}

export function buildDynamicOptimizationTip({
  metrics,
  isPro,
  isPremium,
}: {
  metrics: ComputedPerformanceMetrics;
  isPro: boolean;
  isPremium: boolean;
}): { title: string; body: string } {
  if (!metrics.hasReviews) {
    return {
      title: 'Obtenez vos premiers avis clients',
      body: 'Invitez vos clients fidèles à laisser une note sur Hamla : les fiches avec 5+ avis génèrent jusqu’à 3 fois plus de clics WhatsApp.',
    };
  }
  if (isPro && !metrics.activePromoActivity) {
    return {
      title: 'Activez votre privilège Promotion PRO',
      body: 'Publiez une offre (-20%, 1+1 Offert ou Formule Duo) pour apparaître dans les Bons Plans de Hamla.',
    };
  }
  if (isPremium && metrics.totalEventsCount === 0) {
    return {
      title: 'Publiez votre prochaine Soirée Live',
      body: 'Votre statut PREMIUM inclut la mise en avant de vos soirées et événements auprès des utilisateurs à proximité.',
    };
  }
  if (isPro && metrics.viewsCount >= 20 && metrics.conversionRate < 5) {
    return {
      title: 'Optimisez votre taux de conversion',
      body: 'Votre fiche attire des visiteurs, mais peu cliquent sur WhatsApp : ajoutez de belles photos et un menu avec tarifs en DT.',
    };
  }
  return {
    title: 'Boostez vos réservations directes',
    body: 'Les établissements avec carte de fidélité active et horaires à jour doublent la fidélisation de leurs visiteurs.',
  };
}
