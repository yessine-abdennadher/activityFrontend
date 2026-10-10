import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const sparkleRotate = useRef(new Animated.Value(0)).current;
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Neon border pulse breathing (glow intensity)
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );

    // 2. Slow subtle sparkle icon rotation
    const rotateLoop = Animated.loop(
      Animated.timing(sparkleRotate, {
        toValue: 1,
        duration: 4000,
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
  }, [glowAnim, sparkleRotate, sweepAnim]);

  // Interpolations matching bright Mediterranean theme
  const borderColor = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.95)', 'rgba(56, 189, 248, 0.7)'],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.55],
  });

  const spin = sparkleRotate.interpolate({
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
            shadowOpacity,
            transform: [{ scale: pressScale }],
          },
        ]}
      >
        <Animated.View style={[styles.cyberContainer, { borderColor }]}>
          {/* Luminous Light Glass Backdrop */}
          <View style={styles.deepBackdrop} />

          {/* Soft Luminous corner accents */}
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
            {/* Animated Sparkle Badge */}
            <View style={styles.badgeWrapper}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="sparkles" size={22} color="#0284C7" />
              </Animated.View>
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

            {/* Arrow chevron */}
            <View style={styles.arrowBox}>
              <Ionicons name="arrow-forward" size={18} color="#0284C7" />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  glowWrapper: {
    borderRadius: 24,
    shadowColor: '#000000',
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  cyberContainer: {
    minHeight: 76,
    borderRadius: 24,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    position: 'relative',
  },
  deepBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  cornerGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  cornerTopRight: {
    top: -50,
    right: -30,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  cornerBottomLeft: {
    bottom: -60,
    left: -30,
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
  },
  shimmerBeam: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  badgeWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(2, 132, 199, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.25)',
  },
  magicText: {
    color: '#0284C7',
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
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});