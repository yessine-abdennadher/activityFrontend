import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WIN_GRADIENTS } from '../../theme';

interface AuthBackgroundProps {
  isDark?: boolean;
  children?: React.ReactNode;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({ isDark = false, children }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? WIN_GRADIENTS.headerDark : WIN_GRADIENTS.pastelWave}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Subtle Decorative Wave / Contour Arches */}
        <View pointerEvents="none" style={styles.waveContainer}>
          <View style={[styles.waveCircle, styles.wave1, isDark && styles.darkWave]} />
          <View style={[styles.waveCircle, styles.wave2, isDark && styles.darkWave]} />
          <View style={[styles.waveCircle, styles.wave3, isDark && styles.darkWave]} />
          <View style={[styles.waveCircle, styles.wave4, isDark && styles.darkWave]} />
          <View style={[styles.waveCircle, styles.wave5, isDark && styles.darkWave]} />
        </View>

        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  gradient: {
    flex: 1,
  },
  waveContainer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    alignItems: 'center',
  },
  waveCircle: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  darkWave: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  wave1: {
    top: -120,
    width: 320,
    height: 320,
  },
  wave2: {
    top: -160,
    width: 440,
    height: 440,
  },
  wave3: {
    top: -200,
    width: 560,
    height: 560,
  },
  wave4: {
    top: -240,
    width: 680,
    height: 680,
  },
  wave5: {
    top: -280,
    width: 800,
    height: 800,
  },
});
