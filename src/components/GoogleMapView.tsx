import React, { useState } from 'react';
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
import { usePreferences } from '../context/AppPreferencesContext';
import { useLocation } from '../context/LocationContext';
import { Activity, User } from '../types';
import {
  calculateDistanceKm,
  formatDistance,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
} from '../services/googleMapsService';
import { getActivityLocalizedText } from '../services/activityService';

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

  const [filterType, setFilterType] = useState<'all' | 'activities' | 'users'>('all');

  // Prioritize showing user's live position pin or first nearby activity
  const [selectedPin, setSelectedPin] = useState<{
    id: string;
    type: 'my_location' | 'activity' | 'user';
    title: string;
    subtitle: string;
    latitude: number;
    longitude: number;
    image?: string;
  }>({
    id: 'user-current-gps',
    type: 'my_location',
    title: 'موقعي الحالي (GPS)',
    subtitle: location.cityAr || location.city || 'صفاقس',
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  });

  // Sync GPS pin when location coords update
  React.useEffect(() => {
    if (selectedPin?.id === 'user-current-gps') {
      setSelectedPin({
        id: 'user-current-gps',
        type: 'my_location',
        title: 'موقعي الحالي (GPS)',
        subtitle: location.cityAr || location.city || 'صفاقس',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  }, [location.coords.latitude, location.coords.longitude, location.cityAr]);

  const handleOpenGoogleMaps = (lat: number, lng: number, title?: string) => {
    const url = getGoogleMapsDirectionsUrl(lat, lng, title);
    Linking.openURL(url).catch((err) => console.error('Could not open Google Maps', err));
  };

  const centerLat = selectedPin ? selectedPin.latitude : location.coords.latitude;
  const centerLng = selectedPin ? selectedPin.longitude : location.coords.longitude;
  const embedUrl = getGoogleMapsEmbedUrl(centerLat, centerLng, 14, selectedPin?.title);

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
      <View style={[styles.gpsBanner, { backgroundColor: isDark ? 'rgba(56,189,248,0.12)' : '#E0F2FE', borderColor: isDark ? 'rgba(56,189,248,0.25)' : '#BAE6FD' }]}>
        <View style={styles.gpsBannerLeft}>
          <TouchableOpacity
            style={[styles.gpsLocateBtn, { backgroundColor: theme.primary }]}
            onPress={async () => {
              const ok = await requestGpsLocation();
              if (ok) {
                setSelectedPin({
                  id: 'user-current-gps',
                  type: 'my_location',
                  title: 'موقعي الحالي (GPS)',
                  subtitle: location.cityAr || location.city,
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
            <Text style={styles.gpsLocateBtnText}>تحديث موقعي</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gpsBannerRight}>
          <Text style={[styles.gpsCoordText, { color: theme.textMain }]}>
            {location.source === 'gps' ? '📍 GPS نشط ومحدد بدقة' : '📍 الموقع التقديري'}
          </Text>
          <Text style={[styles.gpsSubText, { color: theme.textMuted }]}>
            {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)} ({location.cityAr})
          </Text>
        </View>
      </View>

      {/* Quick Landmarks Shortcuts (Dar Zmen, Mall of Sfax, etc.) */}
      <View style={styles.quickShortcutsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickShortcutsList}>
          {activities
            .filter((a) => a.latitude && a.longitude)
            .map((act) => {
              const isSelected = selectedPin?.id === act.id;
              const actName = getActivityLocalizedText(act, 'name', language as any);
              const actLoc = getActivityLocalizedText(act, 'location', language as any);
              return (
                <TouchableOpacity
                  key={`quick-${act.id}`}
                  style={[
                    styles.quickPill,
                    {
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
                      image: act.image,
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.quickPillText, { color: isSelected ? '#FFFFFF' : theme.textMain }]}>
                    {act.categoryIcon} {actName}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.chip,
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
            الكل ({activities.length + users.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
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
            الأنشطة ({activities.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
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
            المستخدمين ({users.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Map View Container */}
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
          <View style={[styles.mapMockBg, { backgroundColor: theme.bgSecondary }]}>
            <Ionicons name="map-outline" size={48} color={theme.primary} />
            <Text style={[styles.mapMockText, { color: theme.textMain }]}>
              {selectedPin ? selectedPin.title : 'خريطة الأنشطة التفاعلية'}
            </Text>
            <Text style={[styles.mapMockSub, { color: theme.textMuted }]}>
              {selectedPin ? `${selectedPin.latitude.toFixed(4)}, ${selectedPin.longitude.toFixed(4)}` : `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`}
            </Text>
          </View>
        )}

        {/* Selected Marker Floating Card */}
        {selectedPin && (
          <View style={[styles.selectedInfoOverlay, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={styles.selectedHeader}>
              <View style={styles.selectedBadgeRow}>
                {selectedPin.type === 'my_location' ? (
                  <View style={[styles.typeBadge, { backgroundColor: '#10B98120' }]}>
                    <Ionicons name="navigate-circle" size={14} color="#10B981" />
                    <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800', marginLeft: 4 }}>
                      موقعي الفعلي
                    </Text>
                  </View>
                ) : selectedPin.type === 'activity' ? (
                  <View style={[styles.typeBadge, { backgroundColor: '#3B82F620' }]}>
                    <Ionicons name="location" size={14} color="#3B82F6" />
                    <Text style={{ color: '#3B82F6', fontSize: 11, fontWeight: '700', marginLeft: 4 }}>
                      نشاط
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.typeBadge, { backgroundColor: '#A855F720' }]}>
                    <Ionicons name="person" size={14} color="#A855F7" />
                    <Text style={{ color: '#A855F7', fontSize: 11, fontWeight: '700', marginLeft: 4 }}>
                      مستخدم بالقرب منك
                    </Text>
                  </View>
                )}

                <Text style={{ color: theme.textMuted, fontSize: 11 }}>
                  📍 {selectedPin.latitude.toFixed(4)}, {selectedPin.longitude.toFixed(4)}
                </Text>
              </View>

              <Text style={[styles.selectedTitle, { color: theme.textMain }]}>
                {selectedPin.title}
              </Text>
              <Text style={[styles.selectedSub, { color: theme.textMuted }]} numberOfLines={1}>
                {selectedPin.subtitle}
              </Text>

              {selectedDistanceKm !== null && selectedPin.type !== 'my_location' && (
                <View style={styles.distanceBadgeRow}>
                  <Ionicons name="speedometer-outline" size={13} color={theme.primary} />
                  <Text style={[styles.distanceBadgeText, { color: theme.primary }]}>
                    يبعد {formatDistance(selectedDistanceKm)} عن موقعك الحالي
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.gmapsButton, { flex: 1, backgroundColor: theme.primary }]}
                onPress={() => handleOpenGoogleMaps(selectedPin.latitude, selectedPin.longitude, selectedPin.title)}
              >
                <Ionicons name="navigate-outline" size={16} color="#FFFFFF" />
                <Text style={styles.gmapsButtonText}>
                  {selectedPin.type === 'my_location' ? 'عرض موقعي في خرائط جوجل' : 'الاتجاهات (Maps)'}
                </Text>
              </TouchableOpacity>

              {selectedPin.type === 'activity' && onSelectActivity && (
                <TouchableOpacity
                  style={[styles.detailsBtn, { borderColor: theme.cardBorder, backgroundColor: theme.bgSecondary }]}
                  onPress={() => {
                    const act = activities.find((a) => a.id === selectedPin.id);
                    if (act) onSelectActivity(act);
                  }}
                >
                  <Ionicons name="information-circle-outline" size={16} color={theme.textMain} />
                  <Text style={[styles.detailsBtnText, { color: theme.textMain }]}>تفاصيل</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      {/* List of nearby markers (My GPS + Activities + Users) */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
          {filterType === 'users'
            ? '👥 مستخدمين بالقرب منك'
            : filterType === 'activities'
            ? '🎯 أنشطة في الخريطة'
            : '📍 الأنشطة وموقعك على الخريطة'}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.markersList}>
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
              title: 'موقعي الحالي (GPS)',
              subtitle: location.cityAr || location.city,
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            })
          }
          activeOpacity={0.8}
        >
          <View style={[styles.myLocationIconWrap, { backgroundColor: '#10B98115' }]}>
            <Ionicons name="navigate-circle" size={32} color="#10B981" />
          </View>
          <Text style={[styles.markerTitle, { color: theme.textMain }]}>موقعي الحالي</Text>
          <Text style={[styles.markerCategory, { color: '#10B981', fontWeight: '800' }]}>أنت هنا 📍</Text>
        </TouchableOpacity>

        {/* Activities with dynamically calculated distance from user */}
        {(filterType === 'all' || filterType === 'activities') &&
          activities.map((act) => {
            const isSelected = selectedPin?.id === act.id;
            const actName = getActivityLocalizedText(act, 'name', language as any);
            const actLoc = getActivityLocalizedText(act, 'location', language as any);
            const distanceKm =
              act.latitude && act.longitude
                ? calculateDistanceKm(
                    location.coords.latitude,
                    location.coords.longitude,
                    act.latitude,
                    act.longitude
                  )
                : act.distanceKm ?? 5.0;

            return (
              <TouchableOpacity
                key={act.id}
                style={[
                  styles.markerCard,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: isSelected ? theme.primary : theme.cardBorder,
                    borderWidth: isSelected ? 2 : 1,
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
                    image: act.image,
                  });
                  onSelectActivity?.(act);
                }}
                activeOpacity={0.8}
              >
                <Image source={{ uri: act.image }} style={styles.markerImage} />
                <Text style={[styles.markerTitle, { color: theme.textMain }]} numberOfLines={1}>
                  {actName}
                </Text>
                <View style={styles.markerMeta}>
                  <Text style={[styles.markerDistance, { color: theme.primary }]}>
                    {formatDistance(distanceKm)}
                  </Text>
                  <Text style={[styles.markerPrice, { color: theme.textMuted }]}>
                    {act.price === 0 ? 'مجاني' : `${act.price} DT`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

        {/* Users */}
        {(filterType === 'all' || filterType === 'users') &&
          users.map((usr) => {
            const isSelected = selectedPin?.id === usr.id;
            return (
              <TouchableOpacity
                key={usr.id}
                style={[
                  styles.markerCard,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    marginTop: 4,
  },
  gpsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsBannerRight: {
    alignItems: 'flex-end',
  },
  gpsLocateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  gpsLocateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  gpsCoordText: {
    fontSize: 13,
    fontWeight: '800',
  },
  gpsSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    flexDirection: 'row-reverse',
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
  },
  mapMockBg: {
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMockText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  mapMockSub: {
    fontSize: 12,
    marginTop: 2,
  },
  selectedInfoOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  selectedHeader: {
    marginBottom: 8,
  },
  selectedBadgeRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  selectedSub: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  gmapsButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 9,
    borderRadius: 12,
  },
  gmapsButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeader: {
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  markersList: {
    gap: 12,
    paddingBottom: 8,
  },
  markerCard: {
    width: 140,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
  },
  myLocationIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  markerImage: {
    width: 120,
    height: 75,
    borderRadius: 12,
    marginBottom: 6,
  },
  markerUserAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginBottom: 8,
  },
  markerTitle: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
  },
  markerCategory: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  markerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  markerDistance: {
    fontSize: 11,
    fontWeight: '800',
  },
  markerPrice: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickShortcutsRow: {
    marginBottom: 12,
  },
  quickShortcutsList: {
    flexDirection: 'row-reverse',
    gap: 8,
    paddingHorizontal: 2,
  },
  quickPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  distanceBadgeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionButtonsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: 6,
  },
  detailsBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

