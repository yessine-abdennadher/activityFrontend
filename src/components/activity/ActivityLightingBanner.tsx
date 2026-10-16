import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';

interface ActivityLightingBannerProps {
  isDark: boolean;
  language?: string;
}

export const ActivityLightingBanner: React.FC<ActivityLightingBannerProps> = ({
  isDark,
}) => {
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isDark ? '#451A03' : '#FEF3C7',
        },
      ]}
    >
      <Text style={styles.lampIcon}>💡</Text>
      <View style={styles.textCol}>
        <Text style={styles.bannerTitle}>
          {t('lightingBannerTitle')}
        </Text>
        <Text style={styles.bannerSubtitle}>
          {t('lightingBannerDesc')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  lampIcon: {
    fontSize: 24,
  },
  textCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
  },
});
