import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { usePreferences } from '../../context/AppPreferencesContext';
import { WIN_COLORS } from '../../theme/colors';

export function OfflineBanner() {
  const { isOffline, isOnline } = useNetworkStatus();
  const { language } = usePreferences();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-60));

  useEffect(() => {
    if (isOffline) {
      setWasOffline(true);
      setShowReconnected(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    } else if (wasOffline && isOnline) {
      // Just reconnected
      setShowReconnected(true);
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowReconnected(false);
          setWasOffline(false);
        });
      }, 2400);

      return () => clearTimeout(timer);
    }
  }, [isOffline, isOnline, wasOffline, slideAnim]);

  if (!isOffline && !showReconnected) {
    return null;
  }

  const getLabel = () => {
    if (showReconnected) {
      if (language === 'ar') return 'تمت استعادة الاتصال • جاري المزامنة...';
      if (language === 'en') return 'Online • Syncing data...';
      return 'Connexion rétablie • Synchronisation...';
    }
    if (language === 'ar') return 'وضع غير متصل • البيانات محفوظة محلياً';
    if (language === 'en') return 'Offline Mode • Viewing cached data';
    return 'Mode hors-ligne • Données locales en cache';
  };

  const isRTL = language === 'ar';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.pill,
          showReconnected ? styles.pillOnline : styles.pillOffline,
          isRTL && styles.pillRtl,
        ]}
      >
        <Ionicons
          name={showReconnected ? 'checkmark-circle' : 'cloud-offline'}
          size={16}
          color={showReconnected ? '#047857' : '#92400E'}
          style={isRTL ? styles.iconRtl : styles.iconLtr}
        />
        <Text
          style={[
            styles.text,
            showReconnected ? styles.textOnline : styles.textOffline,
          ]}
        >
          {getLabel()}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 99999,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
  },
  pillRtl: {
    flexDirection: 'row-reverse',
  },
  pillOffline: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  pillOnline: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  iconLtr: {
    marginRight: 6,
  },
  iconRtl: {
    marginLeft: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  textOffline: {
    color: '#92400E',
  },
  textOnline: {
    color: '#047857',
  },
});
