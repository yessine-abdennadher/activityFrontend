import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';

interface OnboardingScreenProps {
  onNavigate: (screen: string) => void;
}

const ONBOARDING_SLIDES: Array<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
}> = [
  { icon: 'restaurant-outline', title: 'Restaurant, café, plage…', desc: 'Trouve la sortie parfaite selon ton envie du moment · لقى الخرجة اللي تحبها.' },
  { icon: 'people-outline', title: 'Seul, en couple, entre amis', desc: 'Adapte chaque sortie à ton profil et ton budget · كيّف كل خرجة مع بجتك.' },
  { icon: 'location-outline', title: 'Près de chez toi', desc: 'Les meilleures activités de Tunisie à portée de main · أحسن الأنشطة قريبة منك.' },
];

const StepProgress: React.FC<{ current: number; total: number; color: string }> = ({ current, total, color }) => (
  <View style={styles.stepProgress}>
    {Array.from({ length: total }).map((_, index) => (
      <View
        key={index}
        style={[
          styles.stepDot,
          {
            width: index === current ? 24 : 8,
            backgroundColor: index === current ? color : 'rgba(148, 163, 184, 0.3)',
          },
        ]}
      />
    ))}
  </View>
);

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNavigate }) => {
  const { theme } = usePreferences();
  const { t } = useTranslation();
  const [slide, setSlide] = useState(0);
  const current = ONBOARDING_SLIDES[slide];

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <View style={styles.onboarding}>
        <View style={[styles.bigIcon, { backgroundColor: theme.bgSecondary }]}>
          <Ionicons name={current.icon} size={52} color={theme.primary} />
        </View>
        <Text style={[styles.bigTitle, { color: theme.textMain }]}>{current.title}</Text>
        <Text style={[styles.bigDesc, { color: theme.textMuted }]}>{current.desc}</Text>

        <StepProgress current={slide} total={ONBOARDING_SLIDES.length} color={theme.primary} />

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          onPress={() => (slide < ONBOARDING_SLIDES.length - 1 ? setSlide(slide + 1) : onNavigate('home'))}
        >
          <Ionicons
            name={slide < ONBOARDING_SLIDES.length - 1 ? 'arrow-forward' : 'checkmark-circle-outline'}
            size={18}
            color="#FFF"
          />
          <Text style={styles.primaryText}>{slide < ONBOARDING_SLIDES.length - 1 ? t('next') : t('finish')}</Text>
        </TouchableOpacity>

        {slide < ONBOARDING_SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => onNavigate('home')} style={{ marginTop: 14 }}>
            <Text style={[styles.skipText, { color: theme.textMuted }]}>Passer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  onboarding: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  bigIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  bigTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  bigDesc: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepProgress: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginVertical: 12,
  },
  stepDot: {
    height: 8,
    borderRadius: 4,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 26,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
