import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';

interface SplashScreenProps {
  onNavigate: (screen: string) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onNavigate }) => {
  const { theme } = usePreferences();
  const { t } = useTranslation();

  return (
    <View style={[styles.splash, { backgroundColor: theme.primary }]}>
      <View style={styles.splashLogoWrap}>
        <Ionicons name="sparkles" size={56} color="#FFFFFF" />
      </View>
      <Text style={styles.splashTitle}>MCHINA</Text>
      <Text style={styles.splashTagline}>شنوّة نعمل توّا؟</Text>
      <Text style={styles.splashSub}>{t('subtitle')}</Text>
      <TouchableOpacity
        style={styles.splashButton}
        onPress={() => onNavigate('onboarding')}
        accessibilityRole="button"
      >
        <Text style={[styles.splashButtonText, { color: theme.primary }]}>{t('next')}</Text>
        <Ionicons name="arrow-forward" size={18} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  splashLogoWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  splashTitle: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 3,
  },
  splashTagline: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  splashSub: {
    color: '#E0F2FE',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  splashButton: {
    backgroundColor: '#FFFFFF',
    minHeight: 54,
    minWidth: 200,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 36,
  },
  splashButtonText: {
    fontSize: 16,
    fontWeight: '900',
  },
});
