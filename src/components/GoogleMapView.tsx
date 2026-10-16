import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { usePreferences } from '../context/AppPreferencesContext';
import { useLocation } from '../context/LocationContext';
import { useTranslation } from '../hooks/useTranslation';
import { Activity, User } from '../types';
import {
  calculateDistanceKm,
  formatDistance,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
} from '../services/googleMapsService';
import { getActivityLocalizedText } from '../services/activityService';
import { MapActivityCard, getCategoryIconInfo } from './MapActivityCard';

interface GoogleMapViewProps {
  activities: Activity[];
  users?: User[];
  onSelectActivity?: (activity: Activity) => void;
  onSelectUser?: (user: User) => void;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  activities,
  users = [],
  onSelectActivity,
  onSelectUser,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { location, isLocating, requestGpsLocation } = useLocation();
  const { t } = useTranslation();

  const isRTL = language === 'ar';
  const [filterType, setFilterType] = useState<'all' | 'activities' | 'users'>('all');

  // Localized user city display (without decimal coordinates)
  const userCityLabel =
    language === 'ar'
      ? location.cityAr || 'صفاقس'
      : language === 'en'
      ? location.cityEn || location.city || 'Sfax'
      : location.cityFr || location.city || 'Sfax';

  // Selected Pin state
  const [selectedPin, setSelectedPin] = useState<{
    id: string;
    type: 'my_location' | 'activity' | 'user';
    title: string;
    subtitle: string;
    latitude: number;
    longitude: number;
    category?: string;
    image?: string;
  }>({
    id: 'user-current-gps',
    type: 'my_location',
    title: t('myCurrentLocationGps'),
    subtitle: userCityLabel,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  });

  // Sync GPS pin when location coordinates or language change
  useEffect(() => {
    if (selectedPin?.id === 'user-current-gps') {
      setSelectedPin({
        id: 'user-current-gps',
        type: 'my_location',
        title: t('myCurrentLocationGps'),
        subtitle: userCityLabel,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  }, [location.coords.latitude, location.coords.longitude, userCityLabel, language]);

  const handleOpenGoogleMaps = (lat: number, lng: number, title?: string) => {
    const url = getGoogleMapsDirectionsUrl(lat, lng, title);
    Linking.openURL(url).catch((err) => console.error('Could not open Google Maps', err));
  };

  const centerLat = selectedPin ? selectedPin.latitude : location.coords.latitude;
  const centerLng = selectedPin ? selectedPin.longitude : location.coords.longitude;
  const embedUrl = getGoogleMapsEmbedUrl(centerLat, centerLng, 14, selectedPin?.title, language);

  // Dynamic distance calculation from user live GPS to selected pin
  const selectedDistanceKm =
    selectedPin && selectedPin.latitude && selectedPin.longitude
      ? calculateDistanceKm(
          location.coords.latitude,
          location.coords.longitude,
          selectedPin.latitude,
          selectedPin.longitude
        )
      : null;

  return (
    <View style={styles.container}>
      {/* Live GPS Action Pill Banner */}
      <View
        style={[
          styles.gpsBanner,
          {
            flexDirection: isRTL ? 'row-reverse' : 'row',
            backgroundColor: isDark ? 'rgba(56,189,248,0.12)' : '#E0F2FE',
            borderColor: isDark ? 'rgba(56,189,248,0.25)' : '#BAE6FD',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.gpsLocateBtn,
            {
              flexDirection: isRTL ? 'row-reverse' : 'row',
              backgroundColor: theme.primary,
            },
          ]}
          onPress={async () => {
            const ok = await requestGpsLocation();
            if (ok) {
              setSelectedPin({
                id: 'user-current-gps',
                type: 'my_location',
                title: t('myCurrentLocationGps'),
                subtitle: userCityLabel,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              });
            }
          }}
          activeOpacity={0.8}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="locate" size={17} color="#FFFFFF" />
          )}
          <Text style={styles.gpsLocateBtnText}>{t('updateMyLocation')}</Text>
        </TouchableOpacity>

        <View style={[styles.gpsBannerInfo, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
          <View style={[styles.gpsStatusRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons
              name={location.source === 'gps' ? 'shield-checkmark' : 'location'}
              size={14}
              color={location.source === 'gps' ? '#10B981' : theme.primary}
            />
            <Text style={[styles.gpsCoordText, { color: theme.textMain }]}>
              {location.source === 'gps' ? t('gpsActiveAccurate') : t('gpsEstimatedLocation')}
            </Text>
          </View>
          <Text style={[styles.gpsSubText, { color: theme.textMuted }]}>
            {userCityLabel}
          </Text>
        </View>
      </View>

      {/* Quick Landmarks Shortcuts with Vector Icons */}
      <View style={styles.quickShortcutsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.quickShortcutsList,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          {activities
            .filter((a) => a.latitude && a.longitude)
            .map((act) => {
              const isSelected = selectedPin?.id === act.id;
              const actName = getActivityLocalizedText(act, 'name', language);
              const actLoc = getActivityLocalizedText(act, 'location', language);
              const iconInfo = getCategoryIconInfo(act.category);

              return (
                <TouchableOpacity
                  key={`quick-${act.id}`}
                  style={[
                    styles.quickPill,
                    {
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      backgroundColor: isSelected ? theme.primary : theme.cardBg,
                      borderColor: isSelected ? theme.primary : theme.cardBorder,
                    },
                  ]}
                  onPress={() => {
                    setSelectedPin({
                      id: act.id,
                      type: 'activity',
                      title: actName,
                      subtitle: `${act.city} · ${actLoc}`,
                      latitude: act.latitude || 34.74056,
                      longitude: act.longitude || 10.76028,
                      category: act.category,
                      image: act.image,
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={iconInfo.name}
                    size={14}
                    color={isSelected ? '#FFFFFF' : iconInfo.color}
                  />
                  <Text
                    style={[
                      styles.quickPillText,
                      { color: isSelected ? '#FFFFFF' : theme.textMain },
                    ]}
                  >
                    {actName}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>

      {/* Filter Chips */}
      <View style={[styles.filterRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={[
            styles.chip,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
            filterType === 'all' && { backgroundColor: theme.primary },
            filterType !== 'all' && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
          ]}
          onPress={() => setFilterType('all')}
        >
          <Ionicons
            name="layers-outline"
            size={16}
            color={filterType === 'all' ? '#FFFFFF' : theme.textMain}
          />
          <Text
            style={[
              styles.chipText,
              { color: filterType === 'all' ? '#FFFFFF' : theme.textMain },
            ]}
          >
            {t('allFilter')} ({activities.length + users.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
            filterType === 'activities' && { backgroundColor: theme.primary },
            filterType !== 'activities' && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
          ]}
          onPress={() => setFilterType('activities')}
        >
          <Ionicons
            name="compass-outline"
            size={16}
            color={filterType === 'activities' ? '#FFFFFF' : theme.textMain}
          />
          <Text
            style={[
              styles.chipText,
              { color: filterType === 'activities' ? '#FFFFFF' : theme.textMain },
            ]}
          >
            {t('activitiesFilter')} ({activities.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
            filterType === 'users' && { backgroundColor: theme.primary },
            filterType !== 'users' && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
          ]}
          onPress={() => setFilterType('users')}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color={filterType === 'users' ? '#FFFFFF' : theme.textMain}
          />
          <Text
            style={[
              styles.chipText,
              { color: filterType === 'users' ? '#FFFFFF' : theme.textMain },
            ]}
          >
            {t('usersFilter')} ({users.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Map View Container (Both Mobile via react-native-webview & Web via iframe) */}
      <View style={[styles.mapContainer, { borderColor: theme.cardBorder }]}>
        {Platform.OS === 'web' ? (
          <iframe
            title="Google Maps Location View"
            width="100%"
            height="270"
            style={{ border: 0, borderRadius: 18 }}
            loading="lazy"
            allowFullScreen
            src={embedUrl}
          />
        ) : (
          <View style={styles.mobileMapWrapper}>
            <WebView
              source={{ uri: embedUrl }}
              style={styles.mobileWebView}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={[styles.mapLoadingOverlay, { backgroundColor: theme.bgSecondary }]}>
                  <ActivityIndicator size="small" color={theme.primary} />
                </View>
              )}
            />
          </View>
        )}

        {/* Selected Marker Floating Card */}
        {selectedPin && (
          <View
            style={[
              styles.selectedInfoOverlay,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <View style={styles.selectedHeader}>
              <View
                style={[
                  styles.selectedBadgeRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                {selectedPin.type === 'my_location' ? (
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: '#10B98120',
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <Ionicons name="navigate-circle" size={14} color="#10B981" />
                    <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800' }}>
                      {t('actualLocationBadge')}
                    </Text>
                  </View>
                ) : selectedPin.type === 'activity' ? (
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: '#3B82F620',
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <Ionicons name="location" size={14} color="#3B82F6" />
                    <Text style={{ color: '#3B82F6', fontSize: 11, fontWeight: '700' }}>
                      {t('activityBadge')}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: '#A855F720',
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <Ionicons name="person" size={14} color="#A855F7" />
                    <Text style={{ color: '#A855F7', fontSize: 11, fontWeight: '700' }}>
                      {t('nearbyUserBadge')}
                    </Text>
                  </View>
                )}

                {/* Show clean city / area label without decimal floats */}
                <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '600' }}>
                  {userCityLabel}
                </Text>
              </View>

              <Text
                style={[
                  styles.selectedTitle,
                  {
                    color: theme.textMain,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {selectedPin.title}
              </Text>
              <Text
                style={[
                  styles.selectedSub,
                  {
                    color: theme.textMuted,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                numberOfLines={1}
              >
                {selectedPin.subtitle}
              </Text>

              {selectedDistanceKm !== null && selectedPin.type !== 'my_location' && (
                <View
                  style={[
                    styles.distanceBadgeRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Ionicons name="speedometer-outline" size={13} color={theme.primary} />
                  <Text style={[styles.distanceBadgeText, { color: theme.primary }]}>
                    {t('distanceAwayFromYou').replace('{{distance}}', formatDistance(selectedDistanceKm))}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={[
                styles.actionButtonsRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.gmapsButton,
                  {
                    flex: 1,
                    backgroundColor: theme.primary,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
                onPress={() =>
                  handleOpenGoogleMaps(
                    selectedPin.latitude,
                    selectedPin.longitude,
                    selectedPin.title
                  )
                }
              >
                <Ionicons name="navigate-outline" size={16} color="#FFFFFF" />
                <Text style={styles.gmapsButtonText}>
                  {selectedPin.type === 'my_location'
                    ? t('openInGoogleMaps')
                    : t('getDirections')}
                </Text>
              </TouchableOpacity>

              {selectedPin.type === 'activity' && onSelectActivity && (
                <TouchableOpacity
                  style={[
                    styles.detailsBtn,
                    {
                      borderColor: theme.cardBorder,
                      backgroundColor: theme.bgSecondary,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                  onPress={() => {
                    const act = activities.find((a) => a.id === selectedPin.id);
                    if (act) onSelectActivity(act);
                  }}
                >
                  <Ionicons name="information-circle-outline" size={16} color={theme.textMain} />
                  <Text style={[styles.detailsBtnText, { color: theme.textMain }]}>
                    {t('detailsButton')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      {/* List of nearby markers (My GPS + Activities + Users) */}
      <View
        style={[
          styles.sectionHeader,
          { alignItems: isRTL ? 'flex-end' : 'flex-start' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
          {filterType === 'users'
            ? t('mapUsersTitle')
            : filterType === 'activities'
            ? t('mapActivitiesTitle')
            : t('mapAllTitle')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.markersList,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {/* User's own Live GPS pin card */}
        <TouchableOpacity
          style={[
            styles.markerCard,
            {
              backgroundColor: theme.cardBg,
              borderColor: selectedPin?.type === 'my_location' ? '#10B981' : theme.cardBorder,
              borderWidth: selectedPin?.type === 'my_location' ? 2 : 1,
            },
          ]}
          onPress={() =>
            setSelectedPin({
              id: 'user-current-gps',
              type: 'my_location',
              title: t('myCurrentLocationGps'),
              subtitle: userCityLabel,
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            })
          }
          activeOpacity={0.8}
        >
          <View style={[styles.myLocationIconWrap, { backgroundColor: '#10B98115' }]}>
            <Ionicons name="navigate-circle" size={32} color="#10B981" />
          </View>
          <Text style={[styles.markerTitle, { color: theme.textMain }]}>
            {t('myCurrentLocationGps')}
          </Text>
          <Text style={[styles.markerCategory, { color: '#10B981', fontWeight: '800' }]}>
            {t('youAreHere')}
          </Text>
        </TouchableOpacity>

        {/* Dedicated MapActivityCards with dynamically calculated distances */}
        {(filterType === 'all' || filterType === 'activities') &&
          activities.map((act) => {
            const isSelected = selectedPin?.id === act.id;
            const distanceKm =
              act.latitude && act.longitude
                ? calculateDistanceKm(
                    location.coords.latitude,
                    location.coords.longitude,
                    act.latitude,
                    act.longitude
                  )
                : act.distanceKm ?? 2.5;

            return (
              <MapActivityCard
                key={act.id}
                activity={act}
                isSelected={isSelected}
                distanceKm={distanceKm}
                onPress={() => {
                  const actName = getActivityLocalizedText(act, 'name', language);
                  const actLoc = getActivityLocalizedText(act, 'location', language);
                  setSelectedPin({
                    id: act.id,
                    type: 'activity',
                    title: actName,
                    subtitle: `${act.city} · ${actLoc}`,
                    latitude: act.latitude || 34.74056,
                    longitude: act.longitude || 10.76028,
                    category: act.category,
                    image: act.image,
                  });
                  onSelectActivity?.(act);
                }}
              />
            );
          })}

        {/* Community Users */}
        {(filterType === 'all' || filterType === 'users') &&
          users.map((usr) => {
            const isSelected = selectedPin?.id === usr.id;
            return (
              <TouchableOpacity
                key={usr.id}
                style={[
                  styles.markerUserCard,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: isSelected ? '#10B981' : theme.cardBorder,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  setSelectedPin({
                    id: usr.id,
                    type: 'user',
                    title: usr.name,
                    subtitle: usr.bio || usr.status,
                    latitude: usr.latitude,
                    longitude: usr.longitude,
                    image: usr.avatar,
                  });
                  onSelectUser?.(usr);
                }}
                activeOpacity={0.8}
              >
                <Image source={{ uri: usr.avatar }} style={styles.markerUserAvatar} />
                <Text style={[styles.markerTitle, { color: theme.textMain }]} numberOfLines={1}>
                  {usr.name}
                </Text>
                <Text style={[styles.markerCategory, { color: theme.textMuted }]} numberOfLines={1}>
                  {usr.city}
                </Text>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  gpsBanner: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    marginTop: 4,
  },
  gpsLocateBtn: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  gpsLocateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  gpsBannerInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  gpsStatusRow: {
    alignItems: 'center',
    gap: 5,
  },
  gpsCoordText: {
    fontSize: 12,
    fontWeight: '800',
  },
  gpsSubText: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  filterRow: {
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mapContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    marginBottom: 16,
    height: 280,
  },
  mobileMapWrapper: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  mobileWebView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedInfoOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedHeader: {
    marginBottom: 8,
  },
  selectedBadgeRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeBadge: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  selectedSub: {
    fontSize: 12,
    marginTop: 2,
  },
  gmapsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 9,
    borderRadius: 12,
  },
  gmapsButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  markersList: {
    paddingBottom: 8,
  },
  markerCard: {
    width: 140,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    marginRight: 12,
  },
  myLocationIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  markerUserCard: {
    width: 130,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    marginRight: 12,
  },
  markerUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  markerTitle: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
  },
  markerCategory: {
    fontSize: 11,
    textAlign: 'center',
  },
  quickShortcutsRow: {
    marginBottom: 12,
  },
  quickShortcutsList: {
    gap: 8,
    paddingHorizontal: 2,
  },
  quickPill: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  distanceBadgeRow: {
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionButtonsRow: {
    gap: 8,
    marginTop: 6,
  },
  detailsBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
