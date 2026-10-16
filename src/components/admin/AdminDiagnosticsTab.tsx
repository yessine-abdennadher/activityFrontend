import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';

interface AdminDiagnosticsTabProps {
  diagnosticsData: any;
  theme: ThemeColors;
  isDark: boolean;
  onTogglePartnerTier: (partnerId: string, currentTier?: string) => void;
  onToggleGlobalElectricity?: (active: boolean) => void;
}

export const AdminDiagnosticsTab: React.FC<AdminDiagnosticsTabProps> = ({
  diagnosticsData,
  theme,
  isDark,
  onTogglePartnerTier,
  onToggleGlobalElectricity,
}) => {
  if (!diagnosticsData) return null;

  const isGlobalElectricityOn = Boolean(diagnosticsData.electricityAlertActive);

  return (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
        Diagnostic & Télémétrie d'Usage
      </Text>

      {/* ── ALERTE COUPURE DE COURANT / MODE ÉLECTRICITÉ (Contrôle Admin Plateforme) ── */}
      <View
        style={[
          styles.cardSection,
          {
            backgroundColor: isGlobalElectricityOn
              ? isDark ? '#451A03' : '#FEF3C7'
              : theme.cardBg,
            borderColor: isGlobalElectricityOn ? '#F59E0B' : theme.cardBorder,
            borderWidth: 1.8,
            marginBottom: 14,
          },
        ]}
      >
        <View style={styles.cardSectionHeader}>
          <Text style={{ fontSize: 22 }}>⚡</Text>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[styles.cardSectionTitle, { color: isGlobalElectricityOn ? '#B45309' : theme.textMain }]}>
              Mode Alerte Électricité (Plateforme)
            </Text>
            <Text style={{ fontSize: 11, color: isGlobalElectricityOn ? '#92400E' : theme.textMuted }}>
              Contrôlé par l'administrateur
            </Text>
          </View>
          <Switch
            value={isGlobalElectricityOn}
            onValueChange={onToggleGlobalElectricity}
            trackColor={{ false: '#94A3B8', true: '#F59E0B' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={[styles.sectionHelpText, { color: isGlobalElectricityOn ? '#92400E' : theme.textMuted, marginTop: 8 }]}>
          {isGlobalElectricityOn
            ? '💡 Mode Électricité ACTIVÉ : Les partenaires peuvent maintenant choisir s’ils ont de la lumière / un générateur, et les cartes affichent la lampe dorée.'
            : '🔒 Mode Veille (Désactivé) : Les partenaires ne voient pas l’option électricité tant que l’admin n’active pas ce mode.'}
        </Text>
      </View>

      {/* Sessions Overview Card */}
      <View style={[styles.cardSection, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.cardSectionHeader}>
          <Ionicons name="phone-portrait-outline" size={20} color={theme.primary} />
          <Text style={[styles.cardSectionTitle, { color: theme.textMain }]}>
            Fréquence d'utilisation de l'application
          </Text>
        </View>
        <View style={styles.sessionCountRow}>
          <View>
            <Text style={[styles.sessionBigNumber, { color: theme.primary }]}>
              {diagnosticsData.telemetry?.totalSessions || 0}
            </Text>
            <Text style={[styles.sessionSubtitle, { color: theme.textMuted }]}>
              Ouvertures totales de l'application (Sessions)
            </Text>
          </View>
          <View style={[styles.sessionFlameIcon, { backgroundColor: theme.primary + '18' }]}>
            <Ionicons name="flame" size={32} color={theme.primary} />
          </View>
        </View>
      </View>

      {/* Top Sections / Ecrans les plus consultés */}
      <View style={[styles.cardSection, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, marginTop: 14 }]}>
        <View style={styles.cardSectionHeader}>
          <Ionicons name="pie-chart-outline" size={20} color="#8B5CF6" />
          <Text style={[styles.cardSectionTitle, { color: theme.textMain }]}>
            Parties de l'application les plus utilisées
          </Text>
        </View>
        <Text style={[styles.sectionHelpText, { color: theme.textMuted }]}>
          Comprenez comment les utilisateurs interagissent avec chaque section
        </Text>

        {!diagnosticsData.telemetry?.screenViews || diagnosticsData.telemetry.screenViews.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            En attente des premières données de navigation.
          </Text>
        ) : (
          <View style={{ gap: 10 }}>
            {diagnosticsData.telemetry.screenViews.map((item: any, idx: number) => {
              const totalViews = diagnosticsData.telemetry.screenViews.reduce(
                (acc: number, curr: any) => acc + curr.count,
                0
              );
              const percent = totalViews > 0 ? Math.round((item.count / totalViews) * 100) : 0;
              const screenLabel =
                item.screenName === 'tab_home'
                  ? '🏠 Accueil & Découverte'
                  : item.screenName === 'recommendation_flow'
                  ? '✨ Recommandations Intelligentes'
                  : item.screenName === 'recommendation_results'
                  ? '🎯 Résultats Recommandations'
                  : item.screenName === 'interactive_map'
                  ? '🗺️ Carte Interactive'
                  : item.screenName === 'activity_details'
                  ? '📄 Détails des Activités'
                  : item.screenName === 'tab_explore'
                  ? '🔍 Recherche & Filtres'
                  : item.screenName === 'tab_favorites'
                  ? '❤️ Favoris'
                  : item.screenName === 'tab_profile'
                  ? '👤 Profil Utilisateur'
                  : item.screenName === 'partner_dashboard'
                  ? '🏢 Espace Partenaire Pro'
                  : item.screenName === 'admin_dashboard'
                  ? '👑 Administration'
                  : item.screenName;

              return (
                <View key={item.screenName || idx} style={{ gap: 4 }}>
                  <View style={styles.screenRow}>
                    <Text style={[styles.screenLabelText, { color: theme.textMain }]}>
                      {screenLabel}
                    </Text>
                    <Text style={[styles.screenCountText, { color: theme.primary }]}>
                      {item.count} vues ({percent}%)
                    </Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.max(percent, 4)}%`,
                          backgroundColor: idx === 0 ? '#10B981' : idx === 1 ? theme.primary : '#8B5CF6',
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Surveillance Partenaires & Attribution Pro */}
      <View style={[styles.cardSection, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, marginTop: 14 }]}>
        <View style={styles.cardSectionHeader}>
          <Ionicons name="business-outline" size={20} color="#F59E0B" />
          <Text style={[styles.cardSectionTitle, { color: theme.textMain }]}>
            Activité des Partenaires & Données à jour
          </Text>
        </View>
        <Text style={[styles.sectionHelpText, { color: theme.textMuted }]}>
          Surveillez si les partenaires mettent à jour leurs offres et attribuez le statut Pro ⭐
        </Text>

        {!diagnosticsData.partnersStatus || diagnosticsData.partnersStatus.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Aucun partenaire enregistré pour l'instant.
          </Text>
        ) : (
          <View style={{ gap: 12 }}>
            {diagnosticsData.partnersStatus.map((p: any) => {
              const isPremium = p.partnerTier === 'premium';
              const isPro = p.partnerTier === 'pro';
              return (
                <View
                  key={p.id}
                  style={[
                    styles.partnerCard,
                    {
                      borderColor: isPremium ? '#A855F7' : isPro ? '#F59E0B' : theme.cardBorder,
                      backgroundColor: isPremium
                        ? isDark ? '#3B0764' : '#FAF5FF'
                        : isPro
                        ? isDark ? '#422006' : '#FFFBEB'
                        : isDark ? '#1E293B' : '#F8FAFC',
                    },
                  ]}
                >
                  {/* Header partenaire */}
                  <View style={styles.partnerCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.partnerName, { color: theme.textMain }]}>
                        {p.establishmentName || p.name}
                      </Text>
                      <Text style={[styles.partnerSub, { color: theme.textMuted }]}>
                        {p.name} · {p.email}
                      </Text>
                    </View>

                    {/* Badge Tier Standard / Pro / Premium */}
                    <TouchableOpacity
                      onPress={() => onTogglePartnerTier(p.id, p.partnerTier)}
                      style={[
                        styles.tierBadgeButton,
                        {
                          backgroundColor: isPremium ? '#9333EA' : isPro ? '#EA580C' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Ionicons
                        name={isPremium ? 'trophy' : isPro ? 'star' : 'shield-outline'}
                        size={14}
                        color={isPremium || isPro ? '#FFFFFF' : '#475569'}
                      />
                      <Text
                        style={[
                          styles.tierBadgeButtonText,
                          { color: isPremium || isPro ? '#FFFFFF' : '#334155' },
                        ]}
                      >
                        {isPremium ? 'PREMIUM 👑' : isPro ? 'PRO ⭐' : 'STANDARD'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Statuts activité & mise à jour */}
                  <View style={styles.statusChipsRow}>
                    <View
                      style={[
                        styles.statusChip,
                        { backgroundColor: p.isInactive ? '#FEE2E2' : '#DCFCE7' },
                      ]}
                    >
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: p.isInactive ? '#EF4444' : '#10B981' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          { color: p.isInactive ? '#991B1B' : '#166534' },
                        ]}
                      >
                        {p.isInactive ? 'Inactif (> 7j)' : 'Connecté récemment'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusChip,
                        { backgroundColor: p.hasStaleData ? '#FEF3C7' : '#EFF6FF' },
                      ]}
                    >
                      <Ionicons
                        name={p.hasStaleData ? 'warning-outline' : 'checkmark-circle-outline'}
                        size={12}
                        color={p.hasStaleData ? '#D97706' : '#2563EB'}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          { color: p.hasStaleData ? '#92400E' : '#1D4ED8' },
                        ]}
                      >
                        {p.hasStaleData ? 'Offres non actualisées (> 14j)' : 'Offres à jour'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusChip,
                        { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: theme.textMain }]}>
                        📦 {p.activityCount} activité(s)
                      </Text>
                    </View>
                  </View>

                  {/* Dates de dernière action */}
                  <View
                    style={[
                      styles.datesRow,
                      { borderTopColor: isDark ? '#334155' : '#E2E8F0' },
                    ]}
                  >
                    <Text style={[styles.dateText, { color: theme.textMuted }]}>
                      Connexion : {p.lastLogin ? new Date(p.lastLogin).toLocaleDateString() : 'Jamais'}
                    </Text>
                    <Text style={[styles.dateText, { color: theme.textMuted }]}>
                      Modif offre : {p.lastActivityUpdate ? new Date(p.lastActivityUpdate).toLocaleDateString() : 'Aucune'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  cardSection: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sessionCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sessionBigNumber: {
    fontSize: 32,
    fontWeight: '900',
  },
  sessionSubtitle: {
    fontSize: 13,
  },
  sessionFlameIcon: {
    padding: 12,
    borderRadius: 16,
  },
  sectionHelpText: {
    fontSize: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  screenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenLabelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  screenCountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  partnerCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  partnerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '800',
  },
  partnerSub: {
    fontSize: 12,
  },
  tierBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tierBadgeButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  datesRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 11,
  },
});
