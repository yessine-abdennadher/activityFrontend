/**
 * ChatbotRecommendationCard.tsx
 * Carte enrichie et premium pour afficher une sortie / activité recommandée par l'IA.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreferences } from '../../../context/AppPreferencesContext';
import type { ChatCardItem } from '../types/chatbot.types';

interface ChatbotRecommendationCardProps {
  card: ChatCardItem;
  onPress?: (id: string) => void;
}

export const ChatbotRecommendationCard: React.FC<ChatbotRecommendationCardProps> = ({
  card,
  onPress,
}) => {
  const { theme, isDark, language } = usePreferences();
  const [imageError, setImageError] = React.useState(false);
  const isRTL = language === 'ar';

  const ctaLabel = language === 'ar' ? 'عرض التفاصيل' : language === 'en' ? 'View details' : 'Voir détails';
  const hasValidImage = Boolean(!imageError && card.imageUrl && typeof card.imageUrl === 'string' && card.imageUrl.trim().startsWith('http'));
  const isTitleArabic = /[\u0600-\u06FF]/.test(card.name || '');

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
        },
      ]}
      activeOpacity={0.88}
      onPress={() => onPress?.(card.id)}
      accessibilityRole="button"
      accessibilityLabel={card.name}
    >
      {/* ── Image de couverture avec fallback dégradé ── */}
      <View style={styles.imageContainer}>
        {hasValidImage ? (
          <Image
            source={{ uri: card.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <LinearGradient
            colors={['#4F46E5', '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.imagePlaceholder}
          >
            <Ionicons name="compass-outline" size={26} color="#FFFFFF" />
          </LinearGradient>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.45)']}
          style={styles.imageGradientOverlay}
        />

        {/* Badge Catégorie */}
        {card.category ? (
          <View style={[styles.categoryBadge, isRTL ? { right: 8 } : { left: 8 }]}>
            <Text style={styles.categoryBadgeText}>{card.category}</Text>
          </View>
        ) : null}

        {/* Badge Prix / Budget */}
        {card.priceLevel ? (
          <View style={[styles.priceBadge, isRTL ? { left: 8 } : { right: 8 }]}>
            <Text style={styles.priceBadgeText}>{card.priceLevel}</Text>
          </View>
        ) : null}
      </View>

      {/* ── Corps des informations ── */}
      <View style={styles.body}>
        <Text
          style={[
            styles.title,
            {
              color: theme.textMain,
              textAlign: isRTL ? 'right' : 'left',
              writingDirection: isTitleArabic ? 'rtl' : 'ltr',
            },
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {card.name}
        </Text>

        {/* Ligne Ville & Évaluation */}
        <View style={[styles.metaRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.metaItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="location-outline" size={13} color={theme.primary} />
            <Text
              style={[styles.metaText, { color: theme.textMuted }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {card.address || card.city || 'Sfax'}
            </Text>
          </View>

          {card.rating !== undefined ? (
            <View style={[styles.ratingBadge, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={[styles.ratingText, { color: theme.textMain }]}>
                {Number(card.rating).toFixed(1)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Tags d'équipements / caractéristiques */}
        {Array.isArray(card.amenities) && card.amenities.length > 0 && (
          <View style={[styles.amenitiesRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {card.amenities.slice(0, 2).map((amenity, idx) => (
              <View
                key={`amenity-${idx}`}
                style={[
                  styles.amenityPill,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
                ]}
              >
                <Text style={[styles.amenityText, { color: theme.textMuted }]}>
                  {amenity}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Bouton d'action CTA enrichi */}
        <View
          style={[
            styles.ctaButton,
            {
              flexDirection: isRTL ? 'row-reverse' : 'row',
              backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.08)',
              borderColor: isDark ? 'rgba(14, 165, 233, 0.3)' : 'rgba(14, 165, 233, 0.2)',
            },
          ]}
        >
          <Text style={[styles.ctaText, { color: theme.primary }]}>{ctaLabel}</Text>
          <Ionicons
            name={isRTL ? 'arrow-back' : 'arrow-forward'}
            size={12}
            color={theme.primary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 230,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 116,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  priceBadge: {
    position: 'absolute',
    top: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priceBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    padding: 12,
    gap: 7,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    minHeight: 36,
    letterSpacing: -0.2,
  },
  metaRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  ratingBadge: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  amenitiesRow: {
    flexWrap: 'wrap',
    gap: 4,
  },
  amenityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 10,
    fontWeight: '500',
  },
  ctaButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

