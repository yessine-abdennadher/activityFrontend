import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors } from '../theme/theme';

type TabKey = 'home' | 'explore' | 'favorites' | 'notifications' | 'profile';

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

const TABS: TabConfig[] = [
  { key: 'home', icon: 'home-outline', activeIcon: 'home', label: 'الرئيسية' },
  { key: 'explore', icon: 'compass-outline', activeIcon: 'compass', label: 'اكتشف' },
  { key: 'favorites', icon: 'heart-outline', activeIcon: 'heart', label: 'المفضلة' },
  { key: 'notifications', icon: 'notifications-outline', activeIcon: 'notifications', label: 'الإشعارات' },
  { key: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'حسابي' },
];

const TabButton: React.FC<{
  tab: TabConfig;
  isActive: boolean;
  theme: ThemeColors;
  badgeCount?: number;
  onPress: () => void;
}> = ({ tab, isActive, theme, badgeCount, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const activeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const iconTranslateY = useRef(new Animated.Value(isActive ? -2 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(activeAnim, {
        toValue: isActive ? 1 : 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(iconTranslateY, {
        toValue: isActive ? -2 : 0,
        tension: 300,
        friction: 20,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isActive]);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: false, speed: 50 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: false, speed: 30, bounciness: 10 }).start();
  };

  const pillWidth = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [42, 98],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.88}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
      style={styles.tabWrapper}
    >
      <Animated.View style={[{ transform: [{ scale }] }, styles.tabContentCenter]}>
        <Animated.View
          style={[
            styles.activePill,
            {
              width: pillWidth,
              backgroundColor: theme.primary,
              opacity: activeAnim,
              shadowColor: theme.primary,
            },
          ]}
        />
        <View style={styles.tabInner}>
          <Animated.View style={{ transform: [{ translateY: iconTranslateY }] }}>
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={22}
              color={isActive ? '#FFFFFF' : theme.textMuted}
            />
            {!!badgeCount && badgeCount > 0 && (
              <View style={[styles.badge, { borderColor: theme.tabBarBg }]}>
                <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
              </View>
            )}
          </Animated.View>

          {isActive && (
            <Animated.Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                {
                  opacity: activeAnim,
                },
              ]}
            >
              {tab.label}
            </Animated.Text>
          )}
        </View>
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

  return (
    <View
      style={[styles.bottomBarContainer, { bottom: Math.max(insets.bottom, 14) + 10 }]}
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
        {TABS.map((tab) => (
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
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 25,
  },
  floatingTabBar: {
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 1.5,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  tabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabContentCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 44,
  },
  activePill: {
    position: 'absolute',
    height: 44,
    borderRadius: 22,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    zIndex: 2,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 2,
  },
});