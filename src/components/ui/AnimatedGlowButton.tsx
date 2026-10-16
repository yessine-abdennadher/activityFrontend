import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WIN_COLORS } from '../../theme';

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
  const pressScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const orbRotate = useRef(new Animated.Value(0)).current;
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Neon cyan/violet border pulse breathing
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

    // 2. Smooth 360-degree rotating 3D iridescent orb (WIN Logo colors)
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
    outputRange: [-150, 350],
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
    >
      <Animated.View
        style={[
          styles.glowWrapper,
          {
            transform: [{ scale: pressScale }],
          },
        ]}
      >
        <View style={styles.cyberContainer}>
          {/* Pulsing neon border overlay (Electric Cyan -> Violet undertones) */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.borderGlowOverlay,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 0.95],
                }),
              },
            ]}
          />

          {/* Luminous Light Glass Backdrop */}
          <View style={styles.deepBackdrop} />

          {/* Soft Luminous corner accents matching WIN logo */}
          <View style={[styles.cornerGlow, styles.cornerTopRight]} />
          <View style={[styles.cornerGlow, styles.cornerBottomLeft]} />

          {/* Shimmer light beam sweep */}
          <Animated.View
            style={[
              styles.shimmerBeam,
              {
                transform: [{ translateX: sweepTranslateX }, { skewX: '-20deg' }],
              },
            ]}
          />

          {/* Content Row */}
          <View style={styles.contentRow}>
            {/* 3D Iridescent Rotating Holographic Orb */}
            <View style={styles.badgeWrapper}>
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
              <View style={styles.orbGlassRing} />
            </View>

            {/* Text details */}
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.magicPill}>
                  <Text style={styles.magicText}>AI · مخصص</Text>
                </View>
              </View>
              {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {/* Arrow chevron with WIN Violet accent */}
            <View style={styles.arrowBox}>
              <Ionicons name="arrow-forward" size={18} color="#7C3AED" />
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
    shadowColor: WIN_COLORS.violet,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  borderGlowOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 210, 255, 0.85)',
    zIndex: 5,
  },
  cyberContainer: {
    minHeight: 76,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: 'relative',
  },
  deepBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    backgroundColor: 'rgba(0, 210, 255, 0.25)', // WIN Electric Cyan
  },
  cornerBottomLeft: {
    bottom: -60,
    left: -30,
    backgroundColor: 'rgba(124, 58, 237, 0.2)', // WIN Neon Violet
  },
  shimmerBeam: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  badgeWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
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
    borderColor: 'rgba(255, 255, 255, 0.65)',
    pointerEvents: 'none',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  magicPill: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.28)',
  },
  magicText: {
    color: '#7C3AED',
    fontSize: 10,
    fontWeight: '800',
  },
  subtitle: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 16,
  },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});