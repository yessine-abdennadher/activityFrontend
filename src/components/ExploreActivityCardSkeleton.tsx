import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ShimmerSkeleton } from './ui/ShimmerSkeleton';
import { usePreferences } from '../context/AppPreferencesContext';

export const ExploreActivityCardSkeleton: React.FC = () => {
  const { isDark } = usePreferences();

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(2, 132, 199, 0.1)',
        },
      ]}
    >
      {/* Top Image Placeholder */}
      <View style={styles.imageContainer}>
        <ShimmerSkeleton width="100%" height={175} borderRadius={0} />

        {/* Top Badges */}
        <View style={styles.topBar}>
          <ShimmerSkeleton width={75} height={24} borderRadius={8} />
          <ShimmerSkeleton width={36} height={36} borderRadius={18} />
        </View>
      </View>

      {/* Body Content */}
      <View style={styles.body}>
        {/* Title */}
        <ShimmerSkeleton width="80%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />

        {/* Location & category row */}
        <View style={styles.metaRow}>
          <ShimmerSkeleton width={90} height={14} borderRadius={4} />
          <ShimmerSkeleton width={60} height={14} borderRadius={4} />
        </View>

        {/* Bottom tags & price */}
        <View style={styles.footerRow}>
          <View style={styles.tagsRow}>
            <ShimmerSkeleton width={50} height={20} borderRadius={6} />
            <ShimmerSkeleton width={65} height={20} borderRadius={6} />
          </View>
          <ShimmerSkeleton width={55} height={22} borderRadius={8} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    height: 175,
    position: 'relative',
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  body: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export default ExploreActivityCardSkeleton;
