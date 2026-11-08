import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShimmerSkeleton } from '../ui/ShimmerSkeleton';
import { DEFAULT_COMPACT_CARD_WIDTH } from './CompactActivityCard';
import { usePreferences } from '../../context/AppPreferencesContext';

interface CompactCardSkeletonProps {
  width?: number;
}

export const CompactCardSkeleton: React.FC<CompactCardSkeletonProps> = ({
  width = DEFAULT_COMPACT_CARD_WIDTH,
}) => {
  const { isDark } = usePreferences();

  const gradientColors: [string, string, string] = isDark
    ? ['transparent', 'rgba(7, 13, 24, 0.75)', 'rgba(7, 13, 24, 0.95)']
    : ['transparent', 'rgba(15, 23, 42, 0.55)', 'rgba(15, 23, 42, 0.85)'];

  return (
    <View
      style={[
        styles.cardContainer,
        {
          width,
          backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(2, 132, 199, 0.12)',
        },
      ]}
    >
      {/* Background Pulse Base */}
      <ShimmerSkeleton width="100%" height="100%" borderRadius={20} />

      {/* Top-Right Heart Button Skeleton */}
      <View style={styles.topRightWrap}>
        <ShimmerSkeleton width={32} height={32} borderRadius={16} />
      </View>

      {/* Top-Left Category Badge Skeleton */}
      <View style={styles.topLeftWrap}>
        <ShimmerSkeleton width={60} height={20} borderRadius={6} />
      </View>

      {/* Bottom Content Gradient Overlay */}
      <LinearGradient
        colors={gradientColors}
        style={styles.bottomOverlay}
      >
        {/* Pills row (Price + Distance) */}
        <View style={styles.pillRow}>
          <ShimmerSkeleton width={48} height={18} borderRadius={6} />
          <ShimmerSkeleton width={40} height={18} borderRadius={6} />
        </View>

        {/* Title line skeleton */}
        <ShimmerSkeleton width="85%" height={15} borderRadius={4} style={{ marginBottom: 6 }} />

        {/* Subtitle / location line skeleton */}
        <ShimmerSkeleton width="55%" height={11} borderRadius={4} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 205,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  topRightWrap: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  topLeftWrap: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 11,
    paddingBottom: 11,
    paddingTop: 16,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
});

export default CompactCardSkeleton;
