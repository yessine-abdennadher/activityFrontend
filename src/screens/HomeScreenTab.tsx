import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/AppPreferencesContext';
import { useLocation } from '../context/LocationContext';
import { useTranslation } from '../hooks/useTranslation';
import { ActivityCard } from '../components/ActivityCard';
import { AnimatedGlowButton } from '../components/ui/AnimatedGlowButton';
import { CATEGORIES, getLocalizedCategories } from '../constants/categories';
import { calculateDistanceKm, formatDistance } from '../services/googleMapsService';
import { getActivityLocalizedText } from '../services/activityService';
import { getLocalizedCityName, getLocalizedCityBadge } from '../services/locationService';
import type { Activity } from '../types';

interface HomeScreenTabProps {
  activities: Activity[];
  selectedCat: string;
  onSelectCategory: (catId: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectActivity: (activity: Activity) => void;
  onOpenRecommendations: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header card with rich ambient Mediterranean Blue gradient backdrop */}
      <View style={[styles.headerCard, { backgroundColor: isDark ? '#081730' : '#0284C7' }]}>
        {/* Ambient background glow orbs */}
        <View style={styles.ambientOrb1} />
        <View style={styles.ambientOrb2} />
        <View style={styles.ambientOrb3} />

        <View style={styles.headerTop}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }}
              style={styles.avatar}
            />
            <View style={styles.onlineBadge} />
          </View>

          {/* Interactive Scalable Location Badge (Sfax Launch Priority) */}
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
            {location.city === 'Sfax'
              ? (language === 'fr'
                  ? 'Découvrez les meilleures activités et sorties à Sfax et ses environs 📍'
                  : language === 'en'
                  ? 'Discover the best activities and outings in Sfax and nearby 📍'
                  : 'اكتشف أفضل أنشطة وخروجات صفاقس والمناطق القريبة 📍')
              : t('heroSub')}
          </Text>
        </View>

        {/* Glassmorphic Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.75)" style={{ marginRight: 8 }} />
          <TextInput
            placeholder={t('searchPlaceholder')}
            placeholderTextColor="rgba(255,255,255,0.65)"
            style={styles.searchInput}
          />
        </View>

        {/* Animated Glow Recommendation Button */}
        <View style={{ marginTop: 16 }}>
          <AnimatedGlowButton
            title={t('recommendations')}
            subtitle={t('recommendationIntro')}
            icon={<Ionicons name="sparkles" size={24} color="#FFFFFF" />}
            onPress={onOpenRecommendations}
          />
        </View>
      </View>

      {/* Categories Horizontal Slider */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMain }]}>{t('whatToDo')}</Text>
          <Text style={[styles.seeAll, { color: theme.primary }]}>{t('seeAll')}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
          {getLocalizedCategories(language).map((cat) => {
            const isSelected = selectedCat === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => onSelectCategory(cat.id)}
                style={[
                  styles.catChip,
                  { backgroundColor: isSelected ? theme.primary : theme.cardBg, borderColor: theme.cardBorder },
                ]}
              >
                <Ionicons name={cat.icon as any} size={18} color={isSelected ? '#FFFFFF' : theme.textMain} />
                <Text style={[styles.catText, { color: isSelected ? '#FFFFFF' : theme.textMain }]}>{cat.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Nearby Activities with Live Dynamic Distance */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMain }]}>{t('nearbyActivities')}</Text>
          <Text style={[styles.locationSub, { color: theme.textMuted }]}>
            {location.city === 'Sfax'
              ? (language === 'fr'
                  ? 'Sfax et ses environs'
                  : language === 'en'
                  ? 'Sfax & Nearby'
                  : 'صفاقس وما جاورها')
              : getLocalizedCityName(location.city, language)}
          </Text>
        </View>

        <View style={{ gap: 20 }}>
          {localizedActivities.map((act) => (
            <ActivityCard
              key={act.id}
              activity={act as any}
              theme={theme}
              isFavorite={favorites.includes(act.id)}
              onPress={() => onSelectActivity(act as any)}
              onToggleFavorite={() => onToggleFavorite(act.id)}
            />
          ))}
        </View>
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
                {language === 'fr' ? 'Choisissez votre ville 📍' : language === 'en' ? 'Select your city 📍' : 'اختر مدينتك 📍'}
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
                {language === 'fr'
                  ? 'Me localiser précisément via GPS'
                  : language === 'en'
                  ? 'Locate me precisely via GPS'
                  : 'تحديد موقعي بدقة عبر الـ GPS'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              {language === 'fr'
                ? 'Phase de lancement : Sfax est la ville active principale'
                : language === 'en'
                ? 'Launch phase: Sfax is the primary active city'
                : 'مرحلة الإطلاق: صفاقس هي المدينة النشطة الرئيسية'}
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
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  ambientOrb1: {
    position: 'absolute',
    top: -50,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  ambientOrb2: {
    position: 'absolute',
    top: 40,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(3, 105, 161, 0.4)',
  },
  ambientOrb3: {
    position: 'absolute',
    bottom: -80,
    left: '25%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    alignItems: 'flex-end',
    marginBottom: 18,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '800',
  },
  locationSub: {
    fontSize: 13,
    fontWeight: '600',
  },
  catList: {
    gap: 10,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  catText: {
    fontSize: 14,
    fontWeight: '800',
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
