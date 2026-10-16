import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Activity } from '../types';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { GoogleMapView } from '../components/GoogleMapView';

interface MapScreenProps {
  activities: Activity[];
  onNavigate: (screen: string) => void;
  onSelectActivity: (activity: Activity) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({ activities, onNavigate, onSelectActivity }) => {
  const { theme, language } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.headerBg,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => onNavigate('home')}
          style={styles.headerButton}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('nearbyMap')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <GoogleMapView
          activities={activities}
          onSelectActivity={(act) => onSelectActivity(act)}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
});
