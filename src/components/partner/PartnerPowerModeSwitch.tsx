import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { ThemeColors } from '../../theme/theme';

interface PartnerPowerModeSwitchProps {
  powerBackupMode: boolean;
  isDark: boolean;
  theme: ThemeColors;
  onToggle: () => void;
}

export const PartnerPowerModeSwitch: React.FC<PartnerPowerModeSwitchProps> = ({
  powerBackupMode,
  isDark,
  theme,
  onToggle,
}) => {
  const isActive = powerBackupMode !== false;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isActive
            ? isDark
              ? '#451A03'
              : '#FEF3C7'
            : isDark
            ? '#1E293B'
            : '#F8FAFC',
          borderColor: isActive ? '#F59E0B' : theme.cardBorder,
        },
      ]}
    >
      <View style={styles.contentLeft}>
        <Text style={styles.lampEmoji}>💡</Text>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.statusTitle,
              { color: isActive ? '#B45309' : theme.textMain },
            ]}
          >
            {isActive ? 'Lumière & Électricité Active 💡' : 'Mode Lumière Éteint'}
          </Text>
          <Text style={[styles.statusSubtitle, { color: theme.textMuted }]}>
            {isActive
              ? 'Lampe dorée allumée visible sur la carte pour les visiteurs'
              : 'Activez pour rassurer les clients sur la disponibilité électrique'}
          </Text>
        </View>
      </View>
      <Switch
        value={isActive}
        onValueChange={onToggle}
        trackColor={{ false: '#94A3B8', true: '#F59E0B' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 14,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  lampEmoji: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
});
