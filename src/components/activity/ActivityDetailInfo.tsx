import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  mode?: 'full' | 'headerOnly' | 'bodyOnly';
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
  mode = 'full',
}) => {
  const priceDisplay = activityPresenterService.formatPrice(activity.price, language);
  const { hasReviews, ratingText } = activityPresenterService.formatRating(
    rating,
    reviewsCount,
    language
  );

  const showHeader = mode === 'full' || mode === 'headerOnly';
  const showBody = mode === 'full' || mode === 'bodyOnly';

  const handleOpenInstagram = () => {
    if (!activity.instagram) return;
    const cleanInsta = activity.instagram.replace(/^@/, '').split('/')[0];
    const instaUrl = activity.instagram.startsWith('http')
      ? activity.instagram
      : `https://instagram.com/${cleanInsta}`;
    Linking.openURL(instaUrl).catch(() => {});
  };

  const handleOpenFacebook = () => {
    if (!activity.facebook) return;
    const fbUrl = activity.facebook.startsWith('http')
      ? activity.facebook
      : `https://facebook.com/${activity.facebook.replace(/^@/, '')}`;
    Linking.openURL(fbUrl).catch(() => {});
  };

  return (
    <View style={[styles.container, mode === 'headerOnly' && styles.headerOnlyContainer]}>
      {showHeader && (
        <>
          {/* ── En-tête : Catégorie, Réseaux sociaux, Nom et Prix ─────────── */}
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}>
              {(Boolean(localizedCategoryName) || Boolean(activity.instagram) || Boolean(activity.facebook)) && (
                <View style={styles.topMetaRow}>
                  {Boolean(localizedCategoryName) && (
                    <View
                      style={[
                        styles.categoryBadge,
                        {
                          backgroundColor: isDark ? '#1E293B' : '#EEF2FF',
                          borderColor: isDark ? '#334155' : '#C7D2FE',
                        },
                      ]}
                    >
                      <Ionicons name="sparkles" size={13} color={theme.primary} />
                      <Text style={[styles.categoryText, { color: theme.primary }]}>
                        {localizedCategoryName}
                      </Text>
                    </View>
                  )}

                  {Boolean(activity.instagram) && (
                    <TouchableOpacity
                      accessibilityLabel="Instagram"
                      accessibilityRole="button"
                      onPress={handleOpenInstagram}
                      activeOpacity={0.75}
                      style={[
                        styles.socialIconPill,
                        {
                          backgroundColor: isDark ? '#1E293B' : '#FDF2F8',
                          borderColor: isDark ? '#831843' : '#FBCFE8',
                        },
                      ]}
                    >
                      <Ionicons name="logo-instagram" size={14} color="#E1306C" />
                    </TouchableOpacity>
                  )}

                  {Boolean(activity.facebook) && (
                    <TouchableOpacity
                      accessibilityLabel="Facebook"
                      accessibilityRole="button"
                      onPress={handleOpenFacebook}
                      activeOpacity={0.75}
                      style={[
                        styles.socialIconPill,
                        {
                          backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
                          borderColor: isDark ? '#1E3A8A' : '#BFDBFE',
                        },
                      ]}
                    >
                      <Ionicons name="logo-facebook" size={14} color="#1877F2" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <Text style={[styles.title, { color: theme.textMain }]}>{localizedName}</Text>
            </View>

            <View style={[styles.priceBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.priceText}>{priceDisplay}</Text>
            </View>
          </View>

          {/* ── Grille d'informations : Durée, Note réelle, Distance ─────── */}
          <View
            style={[
              styles.infoGrid,
              mode === 'headerOnly' && styles.infoGridCompact,
              { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
            ]}
          >
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
              <View
                style={[
                  styles.infoIcon,
                  {
                    backgroundColor: hasReviews
                      ? isDark
                        ? '#422006'
                        : '#FEF3C7'
                      : isDark
                        ? '#334155'
                        : '#F1F5F9',
                  },
                ]}
              >
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
        </>
      )}

      {showBody && (
        <>
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  headerOnlyContainer: {
    marginBottom: 0,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  headingCopy: {
    flex: 1,
    gap: 6,
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  socialIconPill: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  infoGridCompact: {
    marginBottom: 0,
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
