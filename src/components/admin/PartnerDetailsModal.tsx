import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';
import { useTranslation } from '../../hooks/useTranslation';
import type { AdminPartnerStatus } from '../../types';
import { ScrollableModal } from '../ui/ScrollableModal';
import { getPartnerTierBadge, getStatusBadge } from './adminBadges';

export interface PartnerDetailsModalProps {
  visible: boolean;
  partner: AdminPartnerStatus | null;
  onClose: () => void;
  onOpenTierModal: (partnerId: string, currentTier?: string) => void;
}

export const PartnerDetailsModal: React.FC<PartnerDetailsModalProps> = ({
  visible,
  partner,
  onClose,
  onOpenTierModal,
}) => {
  const { theme, isDark } = usePreferences();
  const { language, t } = useTranslation();
  const isRTL = language === 'ar';

  // Calcul du temps d'expiration de l'abonnement
  const subscriptionExpiry = useMemo(() => {
    if (!partner) return null;
    const { subscriptionExpiresAt, partnerTier, subscriptionStatus } = partner;

    if (subscriptionExpiresAt) {
      const expDate = new Date(subscriptionExpiresAt);
      const now = new Date();
      const diffMs = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return {
        hasDate: true,
        dateFormatted: expDate.toLocaleDateString(language, {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        daysRemaining: diffDays,
        isExpired: diffDays <= 0,
        label:
          diffDays > 0
            ? `Expire dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`
            : diffDays === 0
            ? "Expire aujourd'hui"
            : `Expiré depuis ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`,
      };
    }

    if (partnerTier === 'standard') {
      return {
        hasDate: false,
        label: 'Accès Standard Gratuit (Permanent)',
        isExpired: false,
      };
    }

    return {
      hasDate: false,
      label:
        subscriptionStatus === 'active'
          ? 'Abonnement Actif (Renouvellement tacite)'
          : 'Abonnement en cours de validation',
      isExpired: false,
    };
  }, [partner, language]);

  // Calcul d'expiration d'une offre promotionnelle
  const getOfferExpiry = (validUntil?: string) => {
    if (!validUntil || !validUntil.trim()) {
      return {
        label: 'Offre continue (sans date limite)',
        isExpired: false,
        badgeBg: isDark ? 'rgba(56, 189, 248, 0.15)' : '#F0F9FF',
        badgeColor: isDark ? '#38BDF8' : '#0284C7',
      };
    }

    const parsedDate = new Date(validUntil);
    if (!isNaN(parsedDate.getTime())) {
      const now = new Date();
      const diffDays = Math.ceil((parsedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const formatted = parsedDate.toLocaleDateString(language, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      if (diffDays <= 0) {
        return {
          label: `Expirée le ${formatted}`,
          isExpired: true,
          badgeBg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
          badgeColor: isDark ? '#F87171' : '#DC2626',
        };
      }

      return {
        label: `Valide jusqu'au ${formatted} (${diffDays}j restants)`,
        isExpired: false,
        badgeBg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#DCFCE7',
        badgeColor: isDark ? '#34D399' : '#059669',
      };
    }

    return {
      label: `Validité : ${validUntil}`,
      isExpired: false,
      badgeBg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
      badgeColor: isDark ? '#FBBF24' : '#D97706',
    };
  };

  if (!partner) return null;

  const tierCfg = getPartnerTierBadge(partner.partnerTier, isDark);
  const statusCfg = getStatusBadge(partner.isInactive ? 'suspended' : 'active', isDark);
  const staleCfg = getStatusBadge(partner.hasStaleData ? 'stale' : 'fresh', isDark);

  const offers = partner.offers || [];
  const activities = partner.activities || [];

  return (
    <ScrollableModal
      visible={visible}
      onClose={onClose}
      height="90%"
      title={partner.establishmentName || partner.name}
      subtitle="Fiche complète Partenaire & Suivi des Offres"
      theme={theme}
    >
      <View style={styles.content}>
        {/* CARTE D'IDENTITÉ PARTENAIRE */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.cardBg,
              borderColor: tierCfg.borderColor,
            },
          ]}
        >
          <View style={[styles.profileHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.avatarBox, { backgroundColor: tierCfg.backgroundColor }]}>
              <Ionicons name={tierCfg.icon} size={28} color={tierCfg.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.establishmentTitle, { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                {partner.establishmentName || partner.name}
              </Text>
              <Text style={[styles.contactName, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                Responsable : {partner.name}
              </Text>
              <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons name="mail-outline" size={13} color={theme.textMuted} />
                <Text style={[styles.infoText, { color: theme.textMuted }]}>{partner.email}</Text>
              </View>
              {Boolean(partner.phone) && (
                <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Ionicons name="call-outline" size={13} color={theme.textMuted} />
                  <Text style={[styles.infoText, { color: theme.textMuted }]}>{partner.phone}</Text>
                </View>
              )}
              {Boolean(partner.city) && (
                <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Ionicons name="location-outline" size={13} color={theme.textMuted} />
                  <Text style={[styles.infoText, { color: theme.textMuted }]}>{partner.city}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Badges de statut rapides */}
          <View style={[styles.badgesRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {/* Palier Badge */}
            <View
              style={[
                styles.badgePill,
                { backgroundColor: tierCfg.backgroundColor, borderColor: tierCfg.borderColor, borderWidth: 1 },
              ]}
            >
              <Ionicons name={tierCfg.icon} size={12} color={tierCfg.color} />
              <Text style={[styles.badgePillText, { color: tierCfg.color }]}>
                {partner.partnerTier === 'premium'
                  ? 'Palier VIP'
                  : partner.partnerTier === 'pro'
                  ? 'Palier Pro'
                  : 'Palier Standard'}
              </Text>
            </View>

            {/* Compte Actif / Inactif */}
            <View
              style={[
                styles.badgePill,
                { backgroundColor: statusCfg.backgroundColor, borderColor: statusCfg.borderColor, borderWidth: 1 },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
              <Text style={[styles.badgePillText, { color: statusCfg.color }]}>
                {partner.isInactive ? 'Inactif > 7j' : 'Compte Actif'}
              </Text>
            </View>

            {/* Fraîcheur des données */}
            <View
              style={[
                styles.badgePill,
                { backgroundColor: staleCfg.backgroundColor, borderColor: staleCfg.borderColor, borderWidth: 1 },
              ]}
            >
              <Ionicons
                name={partner.hasStaleData ? 'warning-outline' : 'checkmark-circle-outline'}
                size={12}
                color={staleCfg.color}
              />
              <Text style={[styles.badgePillText, { color: staleCfg.color }]}>
                {partner.hasStaleData ? 'Offres à renouveler' : 'Offres à jour'}
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION 2 : ABONNEMENT & EXPIRATION DU PALIER */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.sectionTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.sectionIconCircle, { backgroundColor: tierCfg.backgroundColor }]}>
              <Ionicons name="card-outline" size={16} color={tierCfg.color} />
            </View>
            <Text style={[styles.sectionHeading, { color: theme.textMain }]}>Abonnement & Expiration du Palier</Text>
          </View>

          <View style={styles.detailTable}>
            {/* Palier souscrit */}
            <View style={[styles.tableRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.tableLabel, { color: theme.textMuted }]}>Palier actuel</Text>
              <View style={[styles.tableValueRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons name={tierCfg.icon} size={14} color={tierCfg.color} />
                <Text style={[styles.tableValue, { color: tierCfg.color, fontWeight: '700' }]}>
                  {partner.partnerTier === 'premium'
                    ? 'Premium VIP'
                    : partner.partnerTier === 'pro'
                    ? 'Professionnel (Pro)'
                    : 'Standard Gratuit'}
                </Text>
              </View>
            </View>

            {/* Cycle de facturation */}
            <View style={[styles.tableRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.tableLabel, { color: theme.textMuted }]}>Cycle de facturation</Text>
              <Text style={[styles.tableValue, { color: theme.textMain }]}>
                {partner.requestedBillingCycle === 'yearly'
                  ? 'Annuel (Engagement 12 mois)'
                  : partner.requestedBillingCycle === 'monthly'
                  ? 'Mensuel sans engagement'
                  : 'Standard (Gratuit)'}
              </Text>
            </View>

            {/* Date d'expiration & statut de validité */}
            <View style={[styles.tableRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.tableLabel, { color: theme.textMuted }]}>Validité / Expiration</Text>
              <View
                style={[
                  styles.expiryPill,
                  {
                    backgroundColor: subscriptionExpiry?.isExpired
                      ? isDark
                        ? 'rgba(239, 68, 68, 0.2)'
                        : '#FEE2E2'
                      : isDark
                      ? 'rgba(16, 185, 129, 0.2)'
                      : '#DCFCE7',
                    borderColor: subscriptionExpiry?.isExpired
                      ? isDark
                        ? '#F87171'
                        : '#DC2626'
                      : isDark
                      ? '#34D399'
                      : '#059669',
                  },
                ]}
              >
                <Ionicons
                  name={subscriptionExpiry?.isExpired ? 'alert-circle-outline' : 'time-outline'}
                  size={13}
                  color={
                    subscriptionExpiry?.isExpired
                      ? isDark
                        ? '#F87171'
                        : '#DC2626'
                      : isDark
                      ? '#34D399'
                      : '#059669'
                  }
                />
                <Text
                  style={[
                    styles.expiryPillText,
                    {
                      color: subscriptionExpiry?.isExpired
                        ? isDark
                          ? '#F87171'
                          : '#DC2626'
                        : isDark
                        ? '#34D399'
                        : '#059669',
                    },
                  ]}
                >
                  {subscriptionExpiry?.label}
                </Text>
              </View>
            </View>

            {/* Date précise d'échéance si disponible */}
            {subscriptionExpiry?.hasDate && (
              <View style={[styles.tableRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.tableLabel, { color: theme.textMuted }]}>Date limite exacte</Text>
                <Text style={[styles.tableValue, { color: theme.textMain }]}>
                  {subscriptionExpiry.dateFormatted}
                </Text>
              </View>
            )}

            {/* Date de souscription */}
            {Boolean(partner.subscriptionStartedAt || partner.createdAt) && (
              <View style={[styles.tableRow, { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomWidth: 0 }]}>
                <Text style={[styles.tableLabel, { color: theme.textMuted }]}>Date de début</Text>
                <Text style={[styles.tableValue, { color: theme.textMain }]}>
                  {new Date(partner.subscriptionStartedAt || partner.createdAt || '').toLocaleDateString(language)}
                </Text>
              </View>
            )}
          </View>

          {/* Bouton pour changer de palier */}
          <TouchableOpacity
            style={[styles.tierActionButton, { backgroundColor: tierCfg.backgroundColor, borderColor: tierCfg.borderColor }]}
            onPress={() => {
              onClose();
              onOpenTierModal(partner.id, partner.partnerTier);
            }}
            accessibilityRole="button"
            accessibilityLabel="Modifier le palier partenaire"
          >
            <Ionicons name="sparkles-outline" size={15} color={tierCfg.color} />
            <Text style={[styles.tierActionButtonText, { color: tierCfg.color }]}>
              Modifier le palier VIP / Pro / Standard
            </Text>
            <Ionicons name="chevron-forward" size={15} color={tierCfg.color} />
          </TouchableOpacity>
        </View>

        {/* SECTION 3 : OFFRES PROMOTIONNELLES EN COURS */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.sectionTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.sectionIconCircle, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7' }]}>
              <Ionicons name="pricetags-outline" size={16} color={isDark ? '#FBBF24' : '#D97706'} />
            </View>
            <Text style={[styles.sectionHeading, { color: theme.textMain }]}>
              Offres & Promotions Actives ({offers.length})
            </Text>
          </View>

          {offers.length === 0 ? (
            <View style={[styles.emptyBox, { borderColor: theme.cardBorder }]}>
              <Ionicons name="pricetag-outline" size={28} color={theme.textMuted} />
              <Text style={[styles.emptyBoxText, { color: theme.textMuted }]}>
                Aucune promotion en cours pour ce partenaire.
              </Text>
              <Text style={[styles.emptyBoxSub, { color: theme.textMuted }]}>
                Les partenaires Pro et VIP peuvent publier des offres exclusives et réductions en pourcentage.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {offers.map((offer, index) => {
                const expiry = getOfferExpiry(offer.validUntil);
                return (
                  <View
                    key={`${offer.activityId}-${index}`}
                    style={[
                      styles.offerCard,
                      {
                        backgroundColor: theme.cardBg,
                        borderColor: expiry.isExpired ? (isDark ? '#7F1D1D' : '#FCA5A5') : theme.cardBorder,
                      },
                    ]}
                  >
                    <View style={[styles.offerCardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      {/* Badge Réduction */}
                      {Boolean(offer.discountPercent && offer.discountPercent > 0) && (
                        <View style={[styles.discountBadge, { backgroundColor: isDark ? '#7C3AED' : '#6D28D9' }]}>
                          <Text style={styles.discountBadgeText}>-{offer.discountPercent}%</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.offerTitle, { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                          {offer.promoLabel}
                        </Text>
                        <Text style={[styles.offerActivity, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                          Établissement lié : {offer.activityName}
                        </Text>
                      </View>
                    </View>

                    {Boolean(offer.targetItem) && (
                      <View style={[styles.offerTargetRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Ionicons name="basket-outline" size={13} color={theme.textMuted} />
                        <Text style={[styles.offerTargetText, { color: theme.textMuted }]}>
                          Cible : {offer.targetItem}
                        </Text>
                      </View>
                    )}

                    {/* Badge d'expiration de l'offre */}
                    <View
                      style={[
                        styles.offerExpiryBanner,
                        {
                          backgroundColor: expiry.badgeBg,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                        },
                      ]}
                    >
                      <Ionicons
                        name={expiry.isExpired ? 'close-circle-outline' : 'hourglass-outline'}
                        size={14}
                        color={expiry.badgeColor}
                      />
                      <Text style={[styles.offerExpiryBannerText, { color: expiry.badgeColor }]}>
                        {expiry.label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* SECTION 4 : ÉTABLISSEMENTS & ACTIVITÉS PUBLIÉS */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.sectionTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.sectionIconCircle, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.2)' : '#E0F2FE' }]}>
              <Ionicons name="compass-outline" size={16} color={isDark ? '#38BDF8' : '#0284C7'} />
            </View>
            <Text style={[styles.sectionHeading, { color: theme.textMain }]}>
              Activités & Établissements ({activities.length})
            </Text>
          </View>

          {activities.length === 0 ? (
            <View style={[styles.emptyBox, { borderColor: theme.cardBorder }]}>
              <Ionicons name="folder-open-outline" size={28} color={theme.textMuted} />
              <Text style={[styles.emptyBoxText, { color: theme.textMuted }]}>
                Aucune activité enregistrée par ce partenaire.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {activities.map((act) => (
                <View
                  key={act.id}
                  style={[
                    styles.activityItemCard,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <View style={[styles.activityItemMain, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.activityItemName, { color: theme.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                        {act.name}
                      </Text>
                      <Text style={[styles.activityItemMeta, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                        {act.category} · {act.price} DT
                        {act.rating ? ` · ${act.rating} ★` : ''}
                      </Text>
                    </View>

                    {/* Badges d'état de l'activité */}
                    <View style={styles.activityBadgesCol}>
                      <View
                        style={[
                          styles.microBadge,
                          {
                            backgroundColor: act.isApproved
                              ? isDark
                                ? 'rgba(16,185,129,0.2)'
                                : '#DCFCE7'
                              : isDark
                              ? 'rgba(245,158,11,0.2)'
                              : '#FEF3C7',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.microBadgeText,
                            {
                              color: act.isApproved
                                ? isDark
                                  ? '#34D399'
                                  : '#059669'
                                : isDark
                                ? '#FBBF24'
                                : '#D97706',
                            },
                          ]}
                        >
                          {act.isApproved ? 'Validé' : 'En attente'}
                        </Text>
                      </View>
                      {act.isFeatured && (
                        <View style={[styles.microBadge, { backgroundColor: isDark ? 'rgba(234,179,8,0.2)' : '#FEF9C3' }]}>
                          <Text style={[styles.microBadgeText, { color: isDark ? '#FACC15' : '#CA8A04' }]}>
                            À la une
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* SECTION 5 : TÉLÉMÉTRIE & DATES OPÉRATIONNELLES */}
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.sectionTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.sectionIconCircle, { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.2)' : '#F1F5F9' }]}>
              <Ionicons name="pulse-outline" size={16} color={theme.textMuted} />
            </View>
            <Text style={[styles.sectionHeading, { color: theme.textMain }]}>Historique & Télémétrie</Text>
          </View>

          <View style={styles.detailTable}>
            <View style={[styles.tableRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.tableLabel, { color: theme.textMuted }]}>Dernière connexion</Text>
              <Text style={[styles.tableValue, { color: theme.textMain }]}>
                {partner.lastLogin
                  ? new Date(partner.lastLogin).toLocaleString(language, { dateStyle: 'short', timeStyle: 'short' })
                  : 'Jamais'}
              </Text>
            </View>

            <View style={[styles.tableRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.tableLabel, { color: theme.textMuted }]}>Dernière mise à jour d'offre</Text>
              <Text style={[styles.tableValue, { color: theme.textMain }]}>
                {partner.lastActivityUpdate
                  ? new Date(partner.lastActivityUpdate).toLocaleString(language, { dateStyle: 'short', timeStyle: 'short' })
                  : 'Aucune'}
              </Text>
            </View>

            <View style={[styles.tableRow, { flexDirection: isRTL ? 'row-reverse' : 'row', borderBottomWidth: 0 }]}>
              <Text style={[styles.tableLabel, { color: theme.textMuted }]}>Compte créé le</Text>
              <Text style={[styles.tableValue, { color: theme.textMain }]}>
                {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString(language) : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* BOUTON FERMER */}
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: theme.pillBg, borderColor: theme.cardBorder }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fermer la vue détaillée"
        >
          <Text style={[styles.closeButtonText, { color: theme.textMain }]}>Fermer les détails</Text>
        </TouchableOpacity>
      </View>
    </ScrollableModal>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    gap: 14,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 14,
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  establishmentTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  contactName: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 6,
  },
  infoRow: {
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
  },
  badgesRow: {
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitleRow: {
    alignItems: 'center',
    gap: 8,
  },
  sectionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailTable: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  tableLabel: {
    fontSize: 13,
  },
  tableValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  tableValueRow: {
    alignItems: 'center',
    gap: 5,
  },
  expiryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  expiryPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tierActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  tierActionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 6,
  },
  emptyBoxText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyBoxSub: {
    fontSize: 11,
    textAlign: 'center',
  },
  offerCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  offerCardHeader: {
    alignItems: 'flex-start',
    gap: 10,
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  offerActivity: {
    fontSize: 12,
    marginTop: 2,
  },
  offerTargetRow: {
    alignItems: 'center',
    gap: 5,
  },
  offerTargetText: {
    fontSize: 12,
  },
  offerExpiryBanner: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  offerExpiryBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activityItemCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  activityItemMain: {
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  activityItemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  activityItemMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  activityBadgesCol: {
    flexDirection: 'row',
    gap: 4,
  },
  microBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  microBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

