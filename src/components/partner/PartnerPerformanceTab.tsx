import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../theme/theme';
import type { PartnerStats, PartnerActivityItem } from '../../types';

interface PartnerPerformanceTabProps {
  stats: PartnerStats;
  activities: PartnerActivityItem[];
  theme: ThemeColors;
  isDark: boolean;
  onRefresh: () => void;
}

export const PartnerPerformanceTab: React.FC<PartnerPerformanceTabProps> = ({
  stats,
  activities,
  theme,
  isDark,
  onRefresh,
}) => {
  // Agrégation des statistiques réelles sur 30 jours
  const totalViews30d = activities.reduce((acc, a) => acc + (a.analytics?.viewsCount30d || a.analytics?.viewsCount || 0), 0);
  const totalWhatsapp30d = activities.reduce((acc, a) => acc + (a.analytics?.whatsappClicks30d || a.analytics?.whatsappClicks || 0), 0);
  const totalPhone30d = activities.reduce((acc, a) => acc + (a.analytics?.phoneClicks || 0), 0);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Titre et fenêtre d'analyse */}
      <View style={styles.headerBox}>
        <View>
          <Text style={[styles.mainTitle, { color: theme.textMain }]}>Vos Résultats</Text>
          <Text style={[styles.subTitle, { color: theme.textMuted }]}>
            Fenêtre glissante des 30 derniers jours
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshPill, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={14} color={theme.primary} />
          <Text style={[styles.refreshPillText, { color: theme.primary }]}>Actualiser</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Cartes KPIs Principales */}
      <View style={styles.kpiGrid}>
        {/* Vues sur 30j */}
        <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="eye-outline" size={20} color="#4F46E5" />
          </View>
          <Text style={[styles.kpiNumber, { color: theme.textMain }]}>{totalViews30d}</Text>
          <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Vues de votre fiche</Text>
          <Text style={[styles.kpiBadge, { color: '#10B981' }]}>Visiteurs intéressés</Text>
        </View>

        {/* WhatsApp sur 30j */}
        <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="logo-whatsapp" size={20} color="#10B981" />
          </View>
          <Text style={[styles.kpiNumber, { color: '#10B981' }]}>{totalWhatsapp30d}</Text>
          <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Contacts WhatsApp</Text>
          <Text style={[styles.kpiBadge, { color: '#10B981' }]}>Réservations directes</Text>
        </View>

        {/* Appels tél */}
        <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="call-outline" size={20} color="#2563EB" />
          </View>
          <Text style={[styles.kpiNumber, { color: theme.textMain }]}>{totalPhone30d}</Text>
          <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Appels téléphoniques</Text>
          <Text style={[styles.kpiBadge, { color: theme.textMuted }]}>Prises de contact</Text>
        </View>

        {/* Avis & Note moyenne */}
        <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="star" size={20} color="#D97706" />
          </View>
          <Text style={[styles.kpiNumber, { color: '#D97706' }]}>
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '5.0'}
          </Text>
          <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Note moyenne</Text>
          <Text style={[styles.kpiBadge, { color: theme.textMuted }]}>
            {stats.totalReviews} avis clients
          </Text>
        </View>
      </View>

      {/* 3. Conseil d'optimisation */}
      <View
        style={[
          styles.tipCard,
          {
            backgroundColor: isDark ? '#1E1B4B40' : '#F5F3FF',
            borderColor: isDark ? '#4338CA' : '#DDD6FE',
          },
        ]}
      >
        <Ionicons name="bulb-outline" size={22} color="#7C3AED" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.tipTitle, { color: isDark ? '#FFFFFF' : '#4C1D95' }]}>
            Comment recevoir plus de réservations ?
          </Text>
          <Text style={[styles.tipBody, { color: isDark ? '#C7D2FE' : '#5B21B6' }]}>
            Les établissements qui publient une réduction de 15% à 20% sur un plat vedette ou le menu du jour voient leurs clics WhatsApp doubler en moins de 48h.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  refreshPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  refreshPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  kpiIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kpiNumber: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  kpiBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  tipBody: {
    fontSize: 12,
    lineHeight: 18,
  },
});
