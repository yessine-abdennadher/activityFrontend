import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '../../types';
import { ThemeColors } from '../../theme/theme';
import { activityPresenterService } from '../../services/activityPresenterService';

interface ActivityDetailInfoProps {
  activity: Activity;
  localizedName: string;
  localizedCategoryName?: string;
  localizedDescription?: string;
  rating: number;
  reviewsCount: number;
  theme: ThemeColors;
  isDark: boolean;
  language: string;
}

export const ActivityDetailInfo: React.FC<ActivityDetailInfoProps> = ({
  activity,
  localizedName,
  localizedCategoryName,
  localizedDescription,
  rating,
  reviewsCount,
  theme,
  isDark,
  language,
}) => {
  const priceDisplay = activityPresenterService.formatPrice(activity.price, language);
  const { hasReviews, ratingText } = activityPresenterService.formatRating(
    rating,
    reviewsCount,
    language
  );

  return (
    <View style={styles.container}>
      {/* ── En-tête : Catégorie, Nom et Prix ─────────────────────────── */}
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          {Boolean(localizedCategoryName) && (
            <View style={[styles.categoryBadge, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF', borderColor: isDark ? '#334155' : '#C7D2FE' }]}>
              <Ionicons name="sparkles" size={13} color={theme.primary} />
              <Text style={[styles.categoryText, { color: theme.primary }]}>
                {localizedCategoryName}
              </Text>
            </View>
          )}
          <Text style={[styles.title, { color: theme.textMain }]}>{localizedName}</Text>
        </View>

        <View style={[styles.priceBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.priceText}>{priceDisplay}</Text>
        </View>
      </View>

      {/* ── Grille d'informations : Durée, Note réelle, Distance ─────── */}
      <View style={[styles.infoGrid, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        {/* Durée */}
        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
            <Ionicons name="time-outline" size={18} color={theme.primary} />
          </View>
          <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
            {language === 'ar' ? 'المدة' : 'Durée'}
          </Text>
          <Text style={[styles.infoValue, { color: theme.textMain }]}>
            {activity.duration || '1h 30'}
          </Text>
        </View>

        {/* Note réelle (Affiche 0 si 0 avis !) */}
        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: hasReviews ? (isDark ? '#422006' : '#FEF3C7') : (isDark ? '#334155' : '#F1F5F9') }]}>
            <Ionicons name="star" size={18} color={hasReviews ? '#F59E0B' : '#94A3B8'} />
          </View>
          <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
            {language === 'ar' ? 'التقييم' : 'Note'}
          </Text>
          <Text style={[styles.infoValue, { color: hasReviews ? '#D97706' : theme.textMuted }]}>
            {ratingText}
          </Text>
        </View>

        {/* Distance */}
        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
            <Ionicons name="location-outline" size={18} color={theme.primary} />
          </View>
          <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
            {language === 'ar' ? 'المسافة' : 'Distance'}
          </Text>
          <Text style={[styles.infoValue, { color: theme.textMain }]}>
            {activity.distance || 'Sfax'}
          </Text>
        </View>
      </View>

      {/* ── Description ──────────────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
        {language === 'ar' ? 'حول النشاط' : 'À propos'}
      </Text>
      <Text style={[styles.description, { color: theme.textMuted }]}>
        {localizedDescription ||
          (language === 'ar'
            ? 'نشاط مثالي للاستمتاع بوقت مميز في صفاقس وتونس.'
            : 'Une activité idéale pour profiter d’un bon moment à Sfax et en Tunisie.')}
      </Text>

      {/* ── Pourquoi cette activité ───────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: theme.textMain, marginTop: 18 }]}>
        {language === 'ar' ? 'لماذا تختار هذا النشاط ؟' : 'Pourquoi cette activité ?'}
      </Text>
      <View style={styles.reasonList}>
        <View style={styles.reasonRow}>
          <Ionicons name="people-outline" size={18} color={theme.primary} />
          <Text style={[styles.reasonText, { color: theme.textMuted }]}>
            {activityPresenterService.formatPeopleRange(activity.peopleMin, activity.peopleMax, language)}
          </Text>
        </View>
        <View style={styles.reasonRow}>
          <Ionicons name="wallet-outline" size={18} color={theme.primary} />
          <Text style={[styles.reasonText, { color: theme.textMuted }]}>
            {language === 'ar' ? 'أسعار مناسبة وعروض حصرية' : 'Tarifs adaptés et sans commission'}
          </Text>
        </View>
        <View style={styles.reasonRow}>
          <Ionicons name="navigate-outline" size={18} color={theme.primary} />
          <Text style={[styles.reasonText, { color: theme.textMuted }]}>
            {activity.distance} · {language === 'ar' ? 'موقع سهل الوصول' : 'Facilement accessible'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  headingCopy: {
    flex: 1,
    gap: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  infoGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  reasonList: {
    gap: 8,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
