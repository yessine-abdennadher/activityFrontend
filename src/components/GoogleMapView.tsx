import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
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
} from '../services/googleMapsService';
import { getActivityLocalizedText } from '../services/activityService';
import { MapActivityCard } from './MapActivityCard';
import { generateLeafletMapHtml } from './map/leafletMapTemplate';

interface GoogleMapViewProps {
  activities: Activity[];
  users?: User[];
  onSelectActivity?: (activity: Activity) => void;
  onSelectUser?: (user: User) => void;
  embedded?: boolean;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  activities,
  onSelectActivity,
  embedded = false,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { location, isLocating, requestGpsLocation } = useLocation();
  const { t } = useTranslation();
  const isRTL = language === 'ar';
  const webViewRef = useRef<any>(null);

  const userCityLabel =
    language === 'ar'
      ? location.cityAr || 'صفاقس'
      : language === 'en'
        ? location.cityEn || location.city || 'Sfax'
        : location.cityFr || location.city || 'Sfax';

  // Selected Pin state
  const [selectedPinId, setSelectedPinId] = useState<string>('user-current-gps');

  const selectedActivity = useMemo(() => {
    if (selectedPinId === 'user-current-gps') return null;
    return activities.find((a) => a.id === selectedPinId) || null;
  }, [activities, selectedPinId]);

  // Sync if current selection was filtered out
  useEffect(() => {
    if (selectedPinId !== 'user-current-gps' && !activities.some((a) => a.id === selectedPinId)) {
      if (activities.length > 0) {
        setSelectedPinId(activities[0].id);
      } else {
        setSelectedPinId('user-current-gps');
      }
    }
  }, [activities, selectedPinId]);

  const handleOpenGoogleMaps = (lat: number, lng: number, title?: string) => {
    const url = getGoogleMapsDirectionsUrl(lat, lng, title);
    Linking.openURL(url).catch((err) => console.error('Could not open Google Maps', err));
  };

  const handleWebMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_PIN' && data.id) {
        setSelectedPinId(data.id);
        const act = activities.find((a) => a.id === data.id);
        if (act && onSelectActivity) {
          onSelectActivity(act);
        }
      }
    } catch {
      // Ignore
    }
  };

  const mapHtml = useMemo(() => {
    return generateLeafletMapHtml({
      userLat: location.coords.latitude,
      userLng: location.coords.longitude,
      userCity: userCityLabel,
      activities,
      selectedId: selectedPinId,
      isDark,
      language,
    });
  }, [
    location.coords.latitude,
    location.coords.longitude,
    userCityLabel,
    activities,
    selectedPinId,
    isDark,
    language,
  ]);

  const selectedDistanceKm = useMemo(() => {
    if (!selectedActivity || !selectedActivity.latitude || !selectedActivity.longitude) {
      return null;
    }
    return calculateDistanceKm(
      location.coords.latitude,
      location.coords.longitude,
      selectedActivity.latitude,
      selectedActivity.longitude
    );
  }, [selectedActivity, location.coords.latitude, location.coords.longitude]);

  return (
    <View style={[styles.container, embedded && styles.containerEmbedded]}>
      {/* Interactive Map View */}
      <View style={[styles.mapContainer, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}>
        {Platform.OS === 'web' ? (
          <iframe
            title="Interactive Map View"
            width="100%"
            height="340"
            style={{ border: 0, borderRadius: 20 }}
            srcDoc={mapHtml}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            style={styles.mobileWebView}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleWebMessage}
            startInLoadingState
            renderLoading={() => (
              <View style={[styles.mapLoadingOverlay, { backgroundColor: theme.cardBg }]}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            )}
          />
        )}

        {/* Bouton GPS flottant élégant en haut à droite */}
        <TouchableOpacity
          style={[
            styles.floatingGpsBtn,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
          onPress={async () => {
            const ok = await requestGpsLocation();
            if (ok) {
              setSelectedPinId('user-current-gps');
            }
          }}
          activeOpacity={0.8}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Ionicons name="locate" size={20} color={theme.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Carte du lieu sélectionné (Aperçu direct sous la carte) */}
      {selectedActivity ? (
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: theme.cardBg,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.previewTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.previewTitle, { color: theme.textMain }]} numberOfLines={1}>
                {getActivityLocalizedText(selectedActivity, 'name', language)}
              </Text>
              <Text style={[styles.previewSub, { color: theme.textMuted }]} numberOfLines={1}>
                {selectedActivity.city} · {selectedActivity.category}
              </Text>
            </View>

            {selectedDistanceKm !== null && (
              <View style={[styles.distancePill, { backgroundColor: `${theme.primary}15` }]}>
                <Ionicons name="navigate" size={12} color={theme.primary} />
                <Text style={[styles.distancePillText, { color: theme.primary }]}>
                  {formatDistance(selectedDistanceKm)}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.previewActionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={[styles.actionItineraryBtn, { backgroundColor: theme.primary }]}
              onPress={() =>
                handleOpenGoogleMaps(
                  selectedActivity.latitude || 34.74,
                  selectedActivity.longitude || 10.76,
                  selectedActivity.name
                )
              }
              activeOpacity={0.8}
            >
              <Ionicons name="navigate-outline" size={15} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>{t('getDirections')}</Text>
            </TouchableOpacity>

            {onSelectActivity && (
              <TouchableOpacity
                style={[
                  styles.actionDetailsBtn,
                  {
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  },
                ]}
                onPress={() => onSelectActivity(selectedActivity)}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-forward-outline" size={15} color={theme.textMain} />
                <Text style={[styles.actionBtnTextDark, { color: theme.textMain }]}>
                  {t('detailsButton')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.gpsStatusCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#F0FDF4',
              borderColor: isDark ? '#065F46' : '#BBF7D0',
            },
          ]}
        >
          <Ionicons name="navigate-circle" size={24} color="#10B981" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.gpsStatusTitle, { color: isDark ? '#FFFFFF' : '#065F46' }]}>
              {t('myCurrentLocationGps')} ({userCityLabel})
            </Text>
            <Text style={[styles.gpsStatusSub, { color: isDark ? '#94A3B8' : '#15803D' }]}>
              {t('youAreHere')} · Touchez un marqueur pour explorer
            </Text>
          </View>
        </View>
      )}

      {/* Carrousel horizontal des lieux à proximité */}
      {activities.length > 0 && (
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('nearbyActivities')} ({activities.length})
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.markersList,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {activities.map((act) => {
              const isSelected = selectedPinId === act.id;
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
                    setSelectedPinId(act.id);
                    onSelectActivity?.(act);
                  }}
                />
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 14,
  },
  containerEmbedded: {
    paddingHorizontal: 0,
    paddingTop: 4,
  },
  mapContainer: {
    position: 'relative',
    height: 340,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  mobileWebView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingGpsBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  previewCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  previewSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distancePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  previewActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionItineraryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionDetailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  actionBtnTextDark: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  gpsStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  gpsStatusTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  gpsStatusSub: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionWrap: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  markersList: {
    paddingBottom: 6,
    gap: 8,
  },
});
