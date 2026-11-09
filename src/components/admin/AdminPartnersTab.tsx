import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/theme';
import { AdminPartnerStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { usePreferences } from '../../context/AppPreferencesContext';
import { getPartnerTierBadge, getStatusBadge } from './adminBadges';
import { PartnerDetailsModal } from './PartnerDetailsModal';

export interface AdminPartnersTabProps {
  partnersStatus: AdminPartnerStatus[] | undefined;
  theme: ThemeColors;
  onOpenTierModal: (partnerId: string, currentTier?: string) => void;
}

type PartnerFilter = 'all' | 'premium' | 'pro' | 'standard' | 'stale';

export const AdminPartnersTab: React.FC<AdminPartnersTabProps> = ({
  partnersStatus = [],
  theme,
  onOpenTierModal,
}) => {
  const { t, language } = useTranslation();
  const { isDark } = usePreferences();
  const isRTL = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<PartnerFilter>('all');

  // Modal d'affichage détaillé du partenaire et de ses offres
  const [selectedPartnerForDetails, setSelectedPartnerForDetails] = useState<AdminPartnerStatus | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Sécurisation de la liste
  const list = useMemo(() => partnersStatus || [], [partnersStatus]);

  // Synchronisation dynamique avec le partenaire sélectionné
  const currentSelectedPartner = useMemo(() => {
    if (!selectedPartnerForDetails) return null;
    return list.find((p) => p.id === selectedPartnerForDetails.id) || selectedPartnerForDetails;
  }, [list, selectedPartnerForDetails]);

  // Métriques globales partenaires
  const metrics = useMemo(() => {
    const total = list.length;
    const premiumCount = list.filter((p) => p.partnerTier === 'premium').length;
    const proCount = list.filter((p) => p.partnerTier === 'pro').length;
    const standardCount = list.filter((p) => !p.partnerTier || p.partnerTier === 'standard').length;
    const staleCount = list.filter((p) => Boolean(p.hasStaleData)).length;
    return { total, premiumCount, proCount, standardCount, staleCount };
  }, [list]);

  // Filtrage combiné par palier/statut et recherche textuelle
  const filteredPartners = useMemo(() => {
    return list.filter((p) => {
      // Filtre par palier / état
      if (activeFilter === 'premium' && p.partnerTier !== 'premium') return false;
      if (activeFilter === 'pro' && p.partnerTier !== 'pro') return false;
      if (activeFilter === 'standard' && p.partnerTier && p.partnerTier !== 'standard') return false;
      if (activeFilter === 'stale' && !p.hasStaleData) return false;

      // Filtre de recherche textuelle
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const est = (p.establishmentName || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        const email = (p.email || '').toLowerCase();
        if (!est.includes(query) && !name.includes(query) && !email.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [list, activeFilter, searchQuery]);

  return (
    <View style={styles.tabContent}>
      {/* Titre & Description de la section B2B */}
      <View style={styles.headerBox}>
        <Text style={[styles.sectionTitle, { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
          Espace Partenaires & Établissements
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
          Supervision des comptes professionnels, attribution des paliers VIP & Pro, et suivi de la fraîcheur des offres.
        </Text>
      </View>

      {/* Cartes KPI Partenaires */}
      <View style={styles.metricsGrid}>
        {/* Total Partenaires */}
        <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.metricIconCircle, { backgroundColor: isDark ? 'rgba(2, 132, 199, 0.22)' : '#E0F2FE' }]}>
            <Ionicons name="business" size={18} color={isDark ? '#38BDF8' : '#0284C7'} />
          </View>
          <Text style={[styles.metricValue, { color: theme.textMain }]}>{metrics.total}</Text>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Partenaires</Text>
        </View>

        {/* Partenaires VIP */}
        <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.metricIconCircle, { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.25)' : '#EDE9FE' }]}>
            <Ionicons name="diamond" size={18} color={isDark ? '#C084FC' : '#7C3AED'} />
          </View>
          <Text style={[styles.metricValue, { color: isDark ? '#C084FC' : '#7C3AED' }]}>{metrics.premiumCount}</Text>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>VIP</Text>
        </View>

        {/* Partenaires Pro */}
        <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.metricIconCircle, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.24)' : '#FEF3C7' }]}>
            <Ionicons name="star" size={18} color={isDark ? '#FBBF24' : '#D97706'} />
          </View>
          <Text style={[styles.metricValue, { color: isDark ? '#FBBF24' : '#D97706' }]}>{metrics.proCount}</Text>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Pro</Text>
        </View>

        {/* Offres à réviser */}
        <View style={[styles.metricCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.metricIconCircle, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }]}>
            <Ionicons name="warning-outline" size={18} color={isDark ? '#F87171' : '#DC2626'} />
          </View>
          <Text style={[styles.metricValue, { color: metrics.staleCount > 0 ? (isDark ? '#F87171' : '#DC2626') : theme.textMain }]}>
            {metrics.staleCount}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Offres périmées</Text>
        </View>
      </View>

      {/* Barre de Recherche Partenaires */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' }]}
          placeholder="Rechercher par établissement, nom ou email…"
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres par Palier */}
      <View style={[styles.filtersRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {(
          [
            { id: 'all', label: 'Tous', count: metrics.total },
            { id: 'premium', label: 'VIP', count: metrics.premiumCount },
            { id: 'pro', label: 'Pro', count: metrics.proCount },
            { id: 'standard', label: 'Standard', count: metrics.standardCount },
            { id: 'stale', label: 'Périmées', count: metrics.staleCount },
          ] as const
        ).map((f) => {
          const isSelected = activeFilter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isSelected ? theme.primary : theme.cardBg,
                  borderColor: isSelected ? theme.primary : theme.cardBorder,
                },
              ]}
              onPress={() => setActiveFilter(f.id)}
            >
              <Text style={[styles.filterPillText, { color: isSelected ? '#FFFFFF' : theme.textMuted }]}>
                {f.label}
              </Text>
              <View
                style={[
                  styles.filterCountBadge,
                  {
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : theme.pillBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterCountBadgeText,
                    { color: isSelected ? '#FFFFFF' : theme.textMain },
                  ]}
                >
                  {f.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Liste des Partenaires */}
      {filteredPartners.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={42} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Aucun partenaire trouvé pour ce critère.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {filteredPartners.map((p) => {
            const tierConfig = getPartnerTierBadge(p.partnerTier, isDark);
            const activeStatusConfig = getStatusBadge(p.isInactive ? 'suspended' : 'active', isDark);
            const staleStatusConfig = getStatusBadge(p.hasStaleData ? 'stale' : 'fresh', isDark);

            return (
              <TouchableOpacity
                key={p.id}
                activeOpacity={0.78}
                onPress={() => {
                  setSelectedPartnerForDetails(p);
                  setDetailsModalVisible(true);
                }}
                style={[
                  styles.partnerCard,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor:
                      p.partnerTier === 'premium'
                        ? tierConfig.borderColor
                        : p.partnerTier === 'pro'
                        ? tierConfig.borderColor
                        : theme.cardBorder,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Consulter les détails et offres de ${p.establishmentName || p.name}`}
              >
                {/* En-tête Partenaire */}
                <View style={[styles.partnerCardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.partnerAvatarCircle, { backgroundColor: tierConfig.backgroundColor }]}>
                    <Ionicons name={tierConfig.icon} size={18} color={tierConfig.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.partnerName, { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                      {p.establishmentName || p.name}
                    </Text>
                    <Text style={[styles.partnerSub, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                      {p.name} · {p.email}
                    </Text>
                  </View>

                  {/* Bouton Palier Interactif cliquable */}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      onOpenTierModal(p.id, p.partnerTier);
                    }}
                    style={[
                      styles.tierBadgeButton,
                      {
                        backgroundColor: tierConfig.backgroundColor,
                        borderColor: tierConfig.borderColor,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('adminChangePartnerTier')}: ${p.establishmentName || p.name}, ${p.partnerTier === 'premium' ? t('adminTierPremium') : p.partnerTier === 'pro' ? t('adminTierPro') : t('adminTierStandard')}`}
                  >
                    <Ionicons name={tierConfig.icon} size={13} color={tierConfig.color} />
                    <Text style={[styles.tierBadgeButtonText, { color: tierConfig.color }]}>
                      {p.partnerTier === 'premium'
                        ? t('adminTierPremium')
                        : p.partnerTier === 'pro'
                        ? t('adminTierPro')
                        : t('adminTierStandard')}
                    </Text>
                    <Ionicons name="pencil" size={11} color={tierConfig.color} style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>

                {/* Statuts opérationnels */}
                <View style={[styles.statusChipsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {/* Fraîcheur des offres */}
                  <View
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: staleStatusConfig.backgroundColor,
                        borderColor: staleStatusConfig.borderColor,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name={p.hasStaleData ? 'warning-outline' : 'checkmark-circle-outline'}
                      size={12}
                      color={staleStatusConfig.color}
                    />
                    <Text style={[styles.chipText, { color: staleStatusConfig.color }]}>
                      {p.hasStaleData ? t('adminOffersStale') : t('adminOffersFresh')}
                    </Text>
                  </View>

                  {/* Activité récente du compte */}
                  <View
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: activeStatusConfig.backgroundColor,
                        borderColor: activeStatusConfig.borderColor,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <View style={[styles.dot, { backgroundColor: activeStatusConfig.color }]} />
                    <Text style={[styles.chipText, { color: activeStatusConfig.color }]}>
                      {p.isInactive ? t('adminPartnerInactive') : t('adminPartnerRecent')}
                    </Text>
                  </View>

                  {/* Nombre d'activités */}
                  <View style={[styles.statusChip, { backgroundColor: theme.pillBg, borderColor: theme.cardBorder, borderWidth: 1 }]}>
                    <Ionicons name="compass-outline" size={12} color={theme.textMuted} />
                    <Text style={[styles.chipText, { color: theme.textMain }]}>
                      {p.activityCount} {t('adminPartnerActivityCount')}
                    </Text>
                  </View>
                </View>

                {/* Dates de dernière activité */}
                <View style={[styles.datesRow, { borderTopColor: theme.cardBorder, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.dateText, { color: theme.textMuted }]}>
                    {t('adminLastLogin')}: {p.lastLogin ? new Date(p.lastLogin).toLocaleDateString(language) : t('adminNever')}
                  </Text>
                  <Text style={[styles.dateText, { color: theme.textMuted }]}>
                    {t('adminOfferUpdated')}: {p.lastActivityUpdate ? new Date(p.lastActivityUpdate).toLocaleDateString(language) : t('adminNone')}
                  </Text>
                </View>

                {/* Pied de carte : Indication d'ouverture détaillée */}
                <View
                  style={[
                    styles.cardActionRow,
                    { borderTopColor: theme.cardBorder, flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <View style={[styles.cardActionHint, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Ionicons name="information-circle-outline" size={13} color={theme.textMuted} />
                    <Text style={[styles.cardActionText, { color: theme.textMuted }]}>
                      Toucher pour voir l'expiration, offres & activités
                    </Text>
                  </View>
                  <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={14} color={theme.textMuted} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Modal Détails Complets Partenaire, Expirations & Offres */}
      <PartnerDetailsModal
        visible={detailsModalVisible}
        partner={currentSelectedPartner}
        onClose={() => setDetailsModalVisible(false)}
        onOpenTierModal={onOpenTierModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    gap: 14,
  },
  headerBox: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  filterCountBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  filterCountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  partnerCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  partnerCardHeader: {
    alignItems: 'center',
    gap: 10,
  },
  partnerAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '800',
  },
  partnerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  tierBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  datesRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '500',
  },
  cardActionRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardActionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

