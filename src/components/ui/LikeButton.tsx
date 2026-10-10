import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface LikeButtonProps {
  initialCount?: number;
  initialLiked?: boolean;
  onLikeChange?: (isLiked: boolean, count: number) => void;
  variant?: 'heart' | 'thumbs-up';
  activeColor?: string;
  countColor?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  initialCount = 2050,
  initialLiked = false,
  onLikeChange,
  variant = 'heart',
  activeColor,
  countColor = '#EF4444',
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const scale = useRef(new Animated.Value(1)).current;

  // Custom colors per variant if activeColor not explicitly passed
  const primaryColor = activeColor || (variant === 'thumbs-up' ? '#0060FF' : '#EE0000');
  const badgeTextColor = countColor || primaryColor;

  const handlePress = () => {
    // Heart pulse effect on press
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.25, speed: 50, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 30, bounciness: 8, useNativeDriver: true }),
    ]).start();

    const nextLiked = !isLiked;
    const nextCount = nextLiked ? count + 1 : count - 1;
    setIsLiked(nextLiked);
    setCount(nextCount);

    if (onLikeChange) {
      onLikeChange(nextLiked, nextCount);
    }
  };

  const iconName: keyof typeof Ionicons.glyphMap =
    variant === 'thumbs-up'
      ? (isLiked ? 'thumbs-up' : 'thumbs-up-outline')
      : (isLiked ? 'heart' : 'heart-outline');

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[styles.buttonContainer, { borderColor: primaryColor }]}
    >
      {/* Left container with solid primary background */}
      <View style={[styles.leftContainer, { backgroundColor: primaryColor }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name={iconName} size={16} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.likeText}>Like</Text>
      </View>

      {/* Right container with count & speech bubble notch arrow */}
      <View style={styles.rightContainer}>
        {/* Diamond notch simulating CSS ::before triangle */}
        <View style={styles.diamondNotch} />
        <Text style={[styles.countText, { color: badgeTextColor }]}>
          {count.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: 140,
    height: 36,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 2, height: 4 },
    elevation: 3,
  },
  leftContainer: {
    width: '60%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  likeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  rightContainer: {
    width: '40%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  diamondNotch: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: -4,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
    zIndex: 2,
  },
});
