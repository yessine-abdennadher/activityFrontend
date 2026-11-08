/**
 * AiChatbotTeaserCard.tsx
 * Carte d'accès direct et promotionnelle pour l'Assistant IA KharjaBot sur l'écran d'accueil.
 *
 * Fonctionnalités :
 * - Design premium avec dégradé subtil et effet glassmorphism
 * - Badge "IA Active" avec pulsation subtile
 * - Bouton interactif "Discuter avec KharjaBot"
 * - Navigation fluide vers l'onglet chatbot
 * - Support complet Thème Sombre & Thème Clair, Palettes de couleurs
 * - Support multilingue (FR, AR, EN) avec compatibilité RTL (Arabe)
 * - Conforme au Brand Book (100% Vectoriel, Zéro Emoji dans le code)
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreferences } from '../../context/AppPreferencesContext';
import { useTranslation } from '../../hooks/useTranslation';

interface AiChatbotTeaserCardProps {
  onOpenChatbot?: () => void;
}

export const AiChatbotTeaserCard: React.FC<AiChatbotTeaserCardProps> = ({
  onOpenChatbot,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation de pulsation subtile sur l'icône IA
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const gradientColors: [string, string, ...string[]] = isDark
    ? ['#1E1B4B', '#0F172A', '#111827']
    : ['#EEF2FF', '#F5F3FF', '#FAF5FF'];

  const borderColor = isDark
    ? 'rgba(129, 140, 248, 0.28)'
    : 'rgba(99, 102, 241, 0.2)';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onOpenChatbot}
      style={styles.outerContainer}
      accessibilityRole="button"
      accessibilityLabel={t('aiAssistantTeaserTitle')}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor,
          },
        ]}
      >
        {/* Ligne d'en-tête : Badge IA Active + Icône Robot */}
        <View style={[styles.topRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.badgePill, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.12)' }]}>
            <Ionicons name="flash" size={13} color="#818CF8" />
            <Text style={styles.badgeText}>{t('aiAssistantTeaserBadge')}</Text>
          </View>

          <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name="chatbubbles" size={18} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Titre & Description */}
        <View style={styles.contentCol}>
          <Text
            style={[
              styles.title,
              {
                color: theme.textMain,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {t('aiAssistantTeaserTitle')}
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: isDark ? '#CBD5E1' : '#475569',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {t('aiAssistantTeaserDesc')}
          </Text>
        </View>

        {/* Bouton d'action direct */}
        <View style={[styles.actionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            onPress={onOpenChatbot}
            activeOpacity={0.85}
            style={styles.ctaButtonWrapper}
            accessibilityRole="button"
            accessibilityLabel={t('aiAssistantTeaserCta')}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.ctaButton,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Ionicons name="chatbubble-ellipses" size={15} color="#FFFFFF" />
              <Text style={styles.ctaButtonText}>{t('aiAssistantTeaserCta')}</Text>
              <Ionicons
                name={isRTL ? 'arrow-back' : 'arrow-forward'}
                size={14}
                color="#FFFFFF"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 6,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 18,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818CF8',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCol: {
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  actionRow: {
    alignItems: 'center',
    width: '100%',
  },
  ctaButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  ctaButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default AiChatbotTeaserCard;
