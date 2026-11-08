/**
 * FloatingTabBar.tsx
 * Barre de navigation flottante ultra-fine style iPhone / iOS (Slim 42px).
 *
 * 3 corrections majeures :
 * 1. Hauteur minimisée (42px) : ultra-fine, profil épuré et compact.
 * 2. Suppression totale du border blanc autour de la sphère (orbe 3D pur sans anneau).
 * 3. Suppression des points sous les icônes (Icon-only pur, seule la couleur change).
 */

import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors } from '../theme/theme';
import { useTranslation } from '../hooks/useTranslation';
import { usePreferences } from '../context/AppPreferencesContext';
import { KharjaBotOrb } from './chatbot/ui/KharjaBotOrb';

export type TabKey = 'home' | 'explore' | 'chat' | 'favorites' | 'notifications' | 'profile';

interface FloatingTabBarProps {
  activeTab: TabKey;
  theme: ThemeColors;
  onTabChange: (tab: TabKey) => void;
  notificationsCount?: number;
}

interface TabConfig {
  key: TabKey;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const TabButton: React.FC<{
  tab: TabConfig;
  isActive: boolean;
  theme: ThemeColors;
  badgeCount?: number;
  onPress: () => void;
}> = ({ tab, isActive, theme, badgeCount, onPress }) => {
  const { isDark } = usePreferences();
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const isChat = tab.key === 'chat';

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isActive ? (isChat ? -12 : -1) : (isChat ? -8 : 0),
      tension: 320,
      friction: 22,
      useNativeDriver: true,
    }).start();
  }, [isActive, isChat]);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 50 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 12 }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.88}
      hitSlop={isChat ? { top: 16, bottom: 8, left: 8, right: 8 } : { top: 8, bottom: 8, left: 6, right: 6 }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
      style={[styles.tabWrapper, isChat && styles.chatTabWrapper]}
    >
      <Animated.View
        style={[
          styles.tabContentCenter,
          isChat && styles.chatContentCenter,
          {
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        {isChat ? (
          /* ── Onglet Central KharjaBot : Orbe 3D pur SANS aucun border blanc ── */
          <View style={styles.protrudingOrbContainer}>
            <KharjaBotOrb
              size={isActive ? 44 : 38}
              animated={isActive}
            />
          </View>
        ) : (
          /* ── Onglets Standards : Icônes épurées (couleur seule, SANS point en dessous) ── */
          <View style={styles.iconWrapper}>
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={21}
              color={isActive ? (isDark ? '#38BDF8' : theme.primary) : theme.textMuted}
            />

            {!!badgeCount && badgeCount > 0 && (
              <View style={[styles.badge, { borderColor: theme.tabBarBg }]}>
                <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  activeTab,
  theme,
  onTabChange,
  notificationsCount,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const tabs: TabConfig[] = [
    { key: 'home', icon: 'home-outline', activeIcon: 'home', label: t('tabHome') },
    { key: 'explore', icon: 'compass-outline', activeIcon: 'compass', label: t('tabExplore') },
    { key: 'chat', icon: 'sparkles-outline', activeIcon: 'sparkles', label: t('tabChat') },
    { key: 'favorites', icon: 'heart-outline', activeIcon: 'heart', label: t('tabFavorites') },
    { key: 'profile', icon: 'person-outline', activeIcon: 'person', label: t('tabProfile') },
  ];

  return (
    <View
      style={[styles.bottomBarContainer, { bottom: Math.max(insets.bottom, 16) + 14 }]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.floatingTabBar,
          {
            backgroundColor: theme.tabBarBg,
            borderColor: theme.cardBorder,
            shadowColor: theme.shadowColor,
          },
        ]}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            theme={theme}
            badgeCount={tab.key === 'notifications' ? notificationsCount : undefined}
            onPress={() => onTabChange(tab.key)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 25,
    overflow: 'visible',
  },
  floatingTabBar: {
    width: '78%',
    maxWidth: 295,
    height: 42,
    borderRadius: 21,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
    overflow: 'visible',
  },
  tabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    flex: 1,
    overflow: 'visible',
  },
  chatTabWrapper: {
    zIndex: 10,
  },
  tabContentCenter: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  chatContentCenter: {
    width: 44,
    height: 44,
  },
  protrudingOrbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2.5,
    borderWidth: 1.2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
});
