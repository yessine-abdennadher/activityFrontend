import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../theme/theme';

interface MapHeaderProps {
  title: string;
  count: number;
  topInset: number;
  theme: ThemeColors;
  language: string;
  isRTL: boolean;
  onBack: () => void;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  title,
  count,
  topInset,
  theme,
  language,
  isRTL,
  onBack,
}) => {
  const subtitle =
    language === 'ar'
      ? `${count} أماكن قريبة`
      : count > 1
      ? `${count} lieux à proximité`
      : `${count} lieu à proximité`;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.headerBg,
          paddingTop: Math.max(topInset, 12) + 8,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <TouchableOpacity
        onPress={onBack}
        style={styles.headerButton}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Retour"
      >
        <Ionicons
          name={isRTL ? 'arrow-forward' : 'arrow-back'}
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.headerSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11.5,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 38,
  },
});
