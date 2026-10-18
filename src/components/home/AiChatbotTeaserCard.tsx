/**
 * AiChatbotTeaserCard.tsx
 * Carte de teasing moderne pour l'Assistant IA KharjaTN sur l'écran d'accueil.
 *
 * Fonctionnalités :
 * - Design premium avec dégradé subtil et effet glassmorphism
 * - Badge "Bientôt disponible 🚀"
 * - Bouton interactif "M'avertir à la sortie 🔔"
 * - Mémorisation de l'état d'inscription (Storage) avec confirmation visuelle
 * - Support complet Thème Sombre & Thème Clair, Palettes de couleurs
 * - Support multilingue (FR, AR, EN) avec compatibilité RTL (Arabe)
 */

import React, { useState, useEffect } from 'react';
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
import { Storage } from '../../services/storage';

const NOTIFY_STORAGE_KEY = 'activitytn_ai_teaser_notified';

interface AiChatbotTeaserCardProps {
  onOpenChatbot?: () => void;
}

export const AiChatbotTeaserCard: React.FC<AiChatbotTeaserCardProps> = ({
  onOpenChatbot,
}) => {
  const { theme, isDark, language } = usePreferences();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const [isNotified, setIsNotified] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Restauration de l'état d'inscription au démarrage
  useEffect(() => {
    Storage.getItem(NOTIFY_STORAGE_KEY).then((val) => {
      if (val === 'true') {
        setIsNotified(true);
      }
    });

    // Animation de pulsation subtile sur l'icône IA
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

  const handleNotifyPress = async () => {
    if (isNotified) return;
    setIsNotified(true);
    await Storage.setItem(NOTIFY_STORAGE_KEY, 'true');
  };

  const gradientColors: [string, string, ...string[]] = isDark
    ? ['#1E1B4B', '#0F172A', '#111827']
    : ['#EEF2FF', '#F5F3FF', '#FAF5FF'];

  const borderColor = isDark
    ? 'rgba(129, 140, 248, 0.28)'
    : 'rgba(99, 102, 241, 0.2)';

  return (
    <TouchableOpacity
      activeOpacity={onOpenChatbot ? 0.88 : 1}
      onPress={onOpenChatbot}
      style={styles.outerContainer}
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
        {/* Ligne d'en-tête : Badge Bientôt Disponible + Icône Robot */}
        <View style={[styles.topRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.badgePill, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.12)' }]}>
            <Ionicons name="sparkles" size={13} color="#818CF8" />
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
            🤖 {t('aiAssistantTeaserTitle')}
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

        {/* Bouton d'action / Confirmation */}
        <View style={[styles.actionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {isNotified ? (
            <View
              style={[
                styles.successBox,
                {
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.18)' : '#ECFDF5',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.4)' : '#A7F3D0',
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={[styles.successText, { color: isDark ? '#34D399' : '#047857' }]}>
                {t('aiAssistantTeaserSuccess')}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleNotifyPress}
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
                <Ionicons name="notifications" size={15} color="#FFFFFF" />
                <Text style={styles.ctaButtonText}>{t('aiAssistantTeaserCta')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
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
  successBox: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default AiChatbotTeaserCard;
