import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';
import { useTranslation } from '../../hooks/useTranslation';
import { APP_PALETTES } from '../../theme/palettes';

interface AnimatedGlowButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: React.ReactNode;
}

export const AnimatedGlowButton: React.FC<AnimatedGlowButtonProps> = ({
  title,
  subtitle,
  onPress,
  icon,
}) => {
  const { theme, isDark, language, palette: activePaletteId } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  // Récupérer la palette active et ses couleurs lumière / sombre
  const activePalette = APP_PALETTES.find((p) => p.id === activePaletteId) || APP_PALETTES[0];
  const paletteColors = isDark ? activePalette.dark : activePalette.light;
  const primaryColor = paletteColors.primary;
  const secondaryColor = paletteColors.secondary;
  const shadowColor = isDark ? primaryColor : paletteColors.shadowColor;

  const pressScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const orbRotate = useRef(new Animated.Value(0)).current;
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Neon pulse breathing
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Smooth 360-degree rotating 3D iridescent orb
    const rotateLoop = Animated.loop(
      Animated.timing(orbRotate, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 3. Smooth cyber shimmer beam sweep
    const sweepLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweepAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(sweepAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    glowLoop.start();
    rotateLoop.start();
    sweepLoop.start();

    return () => {
      glowLoop.stop();
      rotateLoop.stop();
      sweepLoop.stop();
    };
  }, [glowAnim, orbRotate, sweepAnim]);

  const spin = orbRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sweepTranslateX = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isRTL ? [350, -150] : [-150, 350],
  });

  const handlePressIn = () => {
    Animated.spring(pressScale, { toValue: 0.95, speed: 50, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, { toValue: 1, speed: 30, bounciness: 8, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Animated.View
        style={[
          styles.glowWrapper,
          {
            shadowColor: shadowColor,
            shadowOpacity: isDark ? 0.45 : 0.22,
            transform: [{ scale: pressScale }],
          },
        ]}
      >
        <View
          style={[
            styles.cyberContainer,
            {
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : `${primaryColor}35`,
            },
          ]}
        >
          {/* Pulsing neon border overlay adapté à la couleur secondaire de la palette */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.borderGlowOverlay,
              {
                borderColor: secondaryColor,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 0.95],
                }),
              },
            ]}
          />

          {/* Luminous Light/Dark Glass Backdrop */}
          <View
            style={[
              styles.deepBackdrop,
              {
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.3)',
              },
            ]}
          />

          {/* Soft Luminous corner accents harmonisés avec la palette active */}
          <View
            style={[
              styles.cornerGlow,
              isRTL ? styles.cornerTopLeft : styles.cornerTopRight,
              { backgroundColor: `${secondaryColor}25` },
            ]}
          />
          <View
            style={[
              styles.cornerGlow,
              isRTL ? styles.cornerBottomRight : styles.cornerBottomLeft,
              { backgroundColor: `${primaryColor}20` },
            ]}
          />

          {/* Shimmer light beam sweep */}
          <Animated.View
            style={[
              styles.shimmerBeam,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.5)',
                transform: [{ translateX: sweepTranslateX }, { skewX: isRTL ? '20deg' : '-20deg' }],
              },
            ]}
          />

          {/* Content Row avec support RTL */}
          <View style={[styles.contentRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {/* 3D Iridescent Rotating Holographic Orb */}
            <View
              style={[
                styles.badgeWrapper,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: `${primaryColor}50`,
                  shadowColor: primaryColor,
                },
              ]}
            >
              <Animated.View style={[styles.orbRotateWrapper, { transform: [{ rotate: spin }] }]}>
                {icon ? (
                  icon
                ) : (
                  <Image
                    source={require('../../assets/win_iridescent_orb.jpg')}
                    style={styles.orbImage}
                    resizeMode="cover"
                  />
                )}
              </Animated.View>
              {/* Iridescent glass rim reflection */}
              <View
                style={[
                  styles.orbGlassRing,
                  { borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.7)' },
                ]}
              />
            </View>

            {/* Text details avec couleurs mode sombre et typographie dynamique */}
            <View style={styles.textContainer}>
              <View style={[styles.titleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.title, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  {title}
                </Text>
           
              </View>
              {!!subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: isDark ? '#94A3B8' : '#475569',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                  numberOfLines={2}
                >
                  {subtitle}
                </Text>
              )}
            </View>

            {/* Arrow chevron adapté à la palette et à la direction RTL */}
            <View
              style={[
                styles.arrowBox,
                {
                  backgroundColor: isDark ? `${primaryColor}25` : `${primaryColor}14`,
                },
              ]}
            >
              <Ionicons
                name={isRTL ? 'arrow-back' : 'arrow-forward'}
                size={18}
                color={isDark ? secondaryColor : primaryColor}
              />
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  glowWrapper: {
    borderRadius: 24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  borderGlowOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    borderWidth: 2,
    zIndex: 5,
  },
  cyberContainer: {
    minHeight: 76,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: 'relative',
  },
  deepBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  cornerGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  cornerTopRight: {
    top: -50,
    right: -30,
  },
  cornerTopLeft: {
    top: -50,
    left: -30,
  },
  cornerBottomLeft: {
    bottom: -60,
    left: -30,
  },
  cornerBottomRight: {
    bottom: -60,
    right: -30,
  },
  shimmerBeam: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 75,
  },
  contentRow: {
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  badgeWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  orbRotateWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  orbGlassRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    borderWidth: 1.5,
    pointerEvents: 'none',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  magicPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  magicText: {
    fontSize: 10,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 16,
  },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});