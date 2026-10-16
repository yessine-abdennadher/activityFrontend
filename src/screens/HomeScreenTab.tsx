import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/AppPreferencesContext';
import { useLocation } from '../context/LocationContext';
import { useTranslation } from '../hooks/useTranslation';
import { CompactActivityCard } from '../components/home/CompactActivityCard';
import { PartnerEventsSection } from '../components/home/PartnerEventsSection';
import { PartnerPromosSection } from '../components/home/PartnerPromosSection';
import { AnimatedGlowButton } from '../components/ui/AnimatedGlowButton';
import { calculateDistanceKm, formatDistance } from '../services/googleMapsService';
import { getActivityLocalizedText } from '../services/activityService';
import { getLocalizedCityName, getLocalizedCityBadge } from '../services/locationService';
import type { Activity, AuthUser } from '../types';

interface HomeScreenTabProps {
  activities: Activity[];
  selectedCat?: string;
  onSelectCategory?: (catId: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectActivity: (activity: Activity) => void;
  onOpenRecommendations: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  currentUser?: AuthUser | null;
  onOpenProfile?: () => void;
}

export const HomeScreenTab: React.FC<HomeScreenTabProps> = ({
  activities,
  selectedCat,
  onSelectCategory,
  favorites,
  onToggleFavorite,
  onSelectActivity,
  onOpenRecommendations,
  onOpenNotifications,
  unreadCount,
  currentUser,
  onOpenProfile,
}) => {
  const { isDark, theme, toggleDarkMode, language } = usePreferences();
  const { t } = useTranslation();
  const {
    location,
    isLocating,
    requestGpsLocation,
    selectCity,
    allCities,
  } = useLocation();

  const [cityModalVisible, setCityModalVisible] = useState(false);

  // Dynamically compute real distance and active language (FR, AR, EN) for each activity
  const localizedActivities = activities.map((act) => {
    let distanceStr = act.distance;
    let distanceKmVal = act.distanceKm ?? 5.0;

    if (act.latitude && act.longitude && location.coords) {
      const calculatedKm = calculateDistanceKm(
        location.coords.latitude,
        location.coords.longitude,
        act.latitude,
        act.longitude
      );
      distanceKmVal = calculatedKm;
      distanceStr = formatDistance(calculatedKm);
    }

    const localizedName = getActivityLocalizedText(act, 'name', language as any);
    const localizedDesc = getActivityLocalizedText(act, 'description', language as any);
    const localizedLoc = getActivityLocalizedText(act, 'location', language as any);
    const localizedBadge = getActivityLocalizedText(act, 'badge', language as any);

    return {
      ...act,
      name: localizedName,
      description: localizedDesc,
      location: localizedLoc,
      priceTag: localizedBadge || act.priceTag,
      distance: distanceStr,
      distanceKm: distanceKmVal,
    };
  });

  // Activités triées par distance réelle croissante (les plus proches de l'utilisateur en premier)
  const nearbyActivities = useMemo(() => {
    return [...localizedActivities].sort((a, b) => {
      const distA = a.distanceKm ?? 9999;
      const distB = b.distanceKm ?? 9999;
      return distA - distB;
    });
  }, [localizedActivities]);

  // Activités « À la une » triées par compte : Premium d'abord, puis Pro, puis standard (et par note)
  const trendingActivities = useMemo(() => {
    const getTierWeight = (act: Activity): number => {
      const tier = act.partnerTier || (act.events && act.events.length > 0 ? 'premium' : act.promotion ? 'pro' : 'standard');
      if (tier === 'premium') return 3;
      if (tier === 'pro') return 2;
      return 1;
    };

    return [...localizedActivities].sort((a, b) => {
      const weightDiff = getTierWeight(b) - getTierWeight(a);
      if (weightDiff !== 0) return weightDiff;
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  }, [localizedActivities]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header card with WIN logo gradient from central theme */}
      <LinearGradient
        colors={theme.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={onOpenProfile}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Mon profil"
          >
            <Image
              source={{
                uri:
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              }}
              style={styles.avatar}
            />
            <View style={styles.onlineBadge} />
          </TouchableOpacity>

          {/* Interactive Scalable Location Badge */}
          <TouchableOpacity
            style={styles.locationBadge}
            onPress={() => setCityModalVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sélectionner la ville"
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 4 }} />
            ) : (
              <Ionicons
                name={location.source === 'gps' ? 'navigate-circle' : 'location-sharp'}
                size={17}
                color="#FDE047"
              />
            )}
            <Text style={styles.locationBadgeText}>
              {getLocalizedCityName(location.city, language)}
            </Text>
            <Ionicons name="chevron-down" size={13} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={toggleDarkMode}
              accessibilityRole="button"
              accessibilityLabel={t('darkMode')}
            >
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={19} color={isDark ? '#FDE047' : '#FFFFFF'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconCircle, { position: 'relative' }]}
              onPress={onOpenNotifications}
              accessibilityRole="button"
              accessibilityLabel={t('notifications')}
            >
              <Ionicons name="notifications-outline" size={19} color="#FFFFFF" />
              {unreadCount > 0 && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          </View>
        </View>


        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{t('heroQuestion')}</Text>
          <Text style={styles.headerSub}>
            {location.city === 'Sfax' ? t('sfaxHeroSub') : t('heroSub')}
          </Text>
        </View>

        {/* Animated Glow Recommendation Button with 3D Rotating Iridescent Orb */}
        <View style={{ marginTop: 14 }}>
          <AnimatedGlowButton
            title={t('recommendations')}
            subtitle={t('recommendationIntro')}
            onPress={onOpenRecommendations}
          />
        </View>
      </LinearGradient>



      {/* 🏷️ Section Bons Plans & Promos (Partenaires Pro) */}
      <PartnerPromosSection
        activities={localizedActivities}
        onSelectActivity={(act) => onSelectActivity(act as any)}
      />
      {/* 🎤 Section Événements & Soirées (Partenaires Premium) */}
      <PartnerEventsSection
        activities={localizedActivities}
        onSelectActivity={(act) => onSelectActivity(act as any)}
      />

      {/* ── Section À la une / Tendances (Priorité Premium > Pro > Standard, sans distance) ── */}
      <View style={styles.sectionContainer}>
        <View style={styles.headerRow}>
          <View style={styles.titleWithIcon}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
              <Ionicons name="flame" size={16} color="#F97316" />
            </View>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
                {language === 'ar' ? 'أفضل الأنشطة' : language === 'fr' ? 'À la une' : 'Trending'}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                {language === 'ar' ? 'أبرز التجارب المميزة' : language === 'fr' ? 'Sélection coup de cœur' : 'Top featured picks'}
              </Text>
            </View>
          </View>

          <Text style={[styles.seeAll, { color: theme.primary }]}>
            {trendingActivities.length} {language === 'ar' ? 'نشاط' : 'sorties'}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCardList}
        >
          {trendingActivities.map((act) => (
            <CompactActivityCard
              key={`trending-${act.id}`}
              activity={act as any}
              theme={theme}
              showDistance={false}
              isFavorite={favorites.includes(act.id)}
              onPress={() => onSelectActivity(act as any)}
              onToggleFavorite={() => onToggleFavorite(act.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Nearby Activities with Live Dynamic Distance (Triées par proximité, avec distance) ── */}
      <View style={styles.sectionContainer}>
        <View style={styles.headerRow}>
          <View style={styles.titleWithIcon}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
              <Ionicons name="compass" size={16} color="#0284C7" />
            </View>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
                {t('nearbyActivities')}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                {location.city === 'Sfax' ? t('sfaxNearby') : getLocalizedCityName(location.city, language)}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCardList}
        >
          {nearbyActivities.map((act) => (
            <CompactActivityCard
              key={`nearby-${act.id}`}
              activity={act as any}
              theme={theme}
              showDistance={true}
              isFavorite={favorites.includes(act.id)}
              onPress={() => onSelectActivity(act as any)}
              onToggleFavorite={() => onToggleFavorite(act.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* City Switcher & GPS Permission Modal */}
      <Modal
        visible={cityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCityModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.cityModalCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setCityModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={theme.textMain} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.textMain }]}>
                {t('chooseCity')}
              </Text>
            </View>

            {/* GPS Auto Detect CTA */}
            <TouchableOpacity
              style={[styles.gpsActionBtn, { backgroundColor: isDark ? 'rgba(56,189,248,0.15)' : '#E0F2FE' }]}
              onPress={async () => {
                const ok = await requestGpsLocation();
                if (ok) {
                  setCityModalVisible(false);
                }
              }}
              activeOpacity={0.8}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Ionicons name="locate" size={20} color={theme.primary} />
              )}
              <Text style={[styles.gpsActionText, { color: theme.primary }]}>
                {t('locateGps')}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              {t('launchPhaseSfax')}
            </Text>

            {/* City Selection List */}
            <View style={styles.cityList}>
              {allCities.map((c) => {
                const isCurrent = location.city === c.name;
                const badgeLabel = getLocalizedCityBadge(c, language);
                const cityName = getLocalizedCityName(c.name, language);
                return (
                  <TouchableOpacity
                    key={c.id}
                    disabled={!c.isActive}
                    onPress={() => {
                      selectCity(c.name);
                      setCityModalVisible(false);
                    }}
                    style={[
                      styles.cityItem,
                      {
                        backgroundColor: isCurrent ? theme.primary + '18' : 'transparent',
                        opacity: c.isActive ? 1 : 0.55,
                      },
                    ]}
                  >
                    <View style={styles.cityBadgeWrap}>
                      {Boolean(badgeLabel) && (
                        <View
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor: c.isActive ? '#10B981' : '#64748B',
                            },
                          ]}
                        >
                          <Text style={styles.statusPillText}>{badgeLabel}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.cityNameRow}>
                      <Text
                        style={[
                          styles.cityNameText,
                          {
                            color: isCurrent ? theme.primary : theme.textMain,
                            fontWeight: isCurrent ? '800' : '600',
                          },
                        ]}
                      >
                        {cityName}
                      </Text>
                      <Ionicons
                        name={isCurrent ? 'checkmark-circle' : 'location-outline'}
                        size={18}
                        color={isCurrent ? theme.primary : theme.textMuted}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
  headerCard: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    gap: 6,
  },
  locationBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 14,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 18,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    color: '#FFFFFF',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '800',
  },
  horizontalCardList: {
    paddingRight: 16,
    gap: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cityModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  gpsActionBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
    marginBottom: 12,
  },
  gpsActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 12,
  },
  cityList: {
    gap: 6,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  cityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityNameText: {
    fontSize: 15,
  },
  cityBadgeWrap: {
    flexDirection: 'row',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
