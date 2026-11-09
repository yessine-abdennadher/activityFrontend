import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';
import {
  fetchPartnerMyActivities,
  createPartnerActivity,
  updatePartnerActivity,
  deletePartnerActivity,
  togglePartnerPowerMode,
  updatePartnerPromotion,
  addPartnerEvent,
} from '../../services/partnerService';
import type {
  PartnerStats,
  PartnerActivityItem,
  PartnerActivityInput,
  AuthUser,
} from '../../types';
import { PartnerPowerModeSwitch } from '../../components/partner/PartnerPowerModeSwitch';
import { PartnerProPromoModal } from '../../components/partner/PartnerProPromoModal';
import { PartnerProEventModal } from '../../components/partner/PartnerProEventModal';
import { PartnerTierStatusCard } from '../../components/partner/PartnerTierStatusCard';
import { PartnerUpgradeModal } from '../../components/partner/PartnerUpgradeModal';
import { PartnerActivityModal, strip216 } from '../../components/partner/PartnerActivityModal';
import { fetchCurrentUserProfile } from '../../services/authService';
import { queryClient } from '../../lib/queryClient';
import type { PartnerTier } from '../../types';

interface PartnerDashboardScreenProps {
  currentUser: AuthUser | null;
  onBack: () => void;
  onUpdateUser?: (updated: AuthUser) => void;
}

export const PartnerDashboardScreen: React.FC<PartnerDashboardScreenProps> = ({
  currentUser,
  onBack,
  onUpdateUser,
}) => {
  const { isDark, theme, electricityAlertActive } = usePreferences();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [stats, setStats] = useState<PartnerStats>({
    total: 0,
    approved: 0,
    pending: 0,
    totalReviews: 0,
    averageRating: 5.0,
  });
  const [activities, setActivities] = useState<PartnerActivityItem[]>([]);

  // Modal modulaire d'établissement (création / modification)
  const [modalVisible, setModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<PartnerActivityItem | null>(null);

  // Modal Promo Pro & Premium
  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [promoTarget, setPromoTarget] = useState<PartnerActivityItem | null>(null);
  const [promoDiscount, setPromoDiscount] = useState('20');
  const [promoLabel, setPromoLabel] = useState('Offre Spéciale Menu');
  const [promoType, setPromoType] = useState<'all' | 'item'>('all');
  const [promoTargetItem, setPromoTargetItem] = useState('');
  const [promoValidUntil, setPromoValidUntil] = useState('Jusqu\'au 31 Octobre');

  // Modal Événement Pro & Premium
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventTarget, setEventTarget] = useState<PartnerActivityItem | null>(null);
  const [eventTitle, setEventTitle] = useState('Soirée Musique Live');
  const [eventImage, setEventImage] = useState('');
  const [eventDate, setEventDate] = useState('Ce samedi soir');
  const [eventTime, setEventTime] = useState('21:00');
  const [eventPrice, setEventPrice] = useState('20');
  const [eventDesc, setEventDesc] = useState('Ambiance acoustique guitare & violon');

  // Modal Upgrade & Détails Forfait Partenaire
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [targetUpgradeTier, setTargetUpgradeTier] = useState<'pro' | 'premium'>('pro');

  // Palier temps réel dynamique (initialisé depuis le cache utilisateur puis synchronisé via l'API)
  const [livePartnerTier, setLivePartnerTier] = useState<PartnerTier>(
    currentUser?.partnerTier || 'standard'
  );

  useEffect(() => {
    if (currentUser?.partnerTier) {
      setLivePartnerTier(currentUser.partnerTier);
    }
  }, [currentUser?.partnerTier]);

  const effectiveTier: PartnerTier = livePartnerTier || currentUser?.partnerTier || 'standard';
  const isProPartner = effectiveTier === 'pro' || effectiveTier === 'premium';
  const isPremiumPartner = effectiveTier === 'premium';

  const loadData = useCallback(async () => {
    try {
      setErrorMessage(null);
      // 1. Récupérer les activités et le palier mis à jour par l'admin
      const res = await fetchPartnerMyActivities();
      setStats(res.stats);
      setActivities(res.activities);

      if (res.partnerTier) {
        setLivePartnerTier(res.partnerTier);
      }

      // 2. Synchroniser le profil complet (/auth/me) pour mettre à jour tout le contexte de l'application
      const freshUser = await fetchCurrentUserProfile();
      if (freshUser) {
        if (freshUser.partnerTier) {
          setLivePartnerTier(freshUser.partnerTier);
        }
        if (onUpdateUser) {
          onUpdateUser(freshUser);
        }
      }
    } catch (err: any) {
      console.error('[PartnerDashboard] Erreur chargement:', err.message);
      setErrorMessage(err.message || 'Impossible de charger vos données établissement.');
    }
  }, [onUpdateUser]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onPullRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setEditingActivity(null);
    setModalVisible(true);
  };

  const openEditModal = (item: PartnerActivityItem) => {
    setEditingActivity(item);
    setModalVisible(true);
  };

  const invalidateAppQueries = async () => {
    try {
      await Promise.all([
        queryClient.resetQueries({ queryKey: ['infinite-activities'] }),
        queryClient.refetchQueries({ queryKey: ['infinite-activities'] }),
        queryClient.resetQueries({ queryKey: ['activities'] }),
        queryClient.refetchQueries({ queryKey: ['activities'] }),
      ]);
    } catch (e) {
      console.warn('[PartnerDashboard] Erreur invalidation cache:', e);
    }
  };

  const handleTogglePowerMode = async (item: PartnerActivityItem) => {
    if (!electricityAlertActive) {
      Alert.alert(
        'Mode Électricité Non Déclenché',
        'Le mode alerte électricité n’a pas été activé par l’administrateur de l’application. Cette option sera accessible dès qu’une alerte coupure sera lancée.'
      );
      return;
    }
    const nextVal = item.powerBackupMode === false ? true : false;
    try {
      const updated = await togglePartnerPowerMode(item._id, nextVal);
      setActivities((prev) =>
        prev.map((a) => (a._id === item._id ? { ...a, powerBackupMode: updated.powerBackupMode } : a))
      );
      await invalidateAppQueries();
      Alert.alert(
        nextVal ? '💡 Mode Électricité & Lumière ACTIVÉ' : 'Mode Lumière désactivé',
        nextVal
          ? 'Votre offre affiche maintenant la lampe dorée allumée 💡 sur la carte pour tous les visiteurs !'
          : 'Le mode lumière garantie est désormais éteint sur votre fiche.'
      );
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  const handleOpenPromo = (item: PartnerActivityItem) => {
    if (!isProPartner) {
      setTargetUpgradeTier('pro');
      setUpgradeModalVisible(true);
      return;
    }
    setPromoTarget(item);
    setPromoDiscount(String(item.promotion?.discountPercent || '20'));
    setPromoLabel(item.promotion?.promoLabel || 'Offre Spéciale Menu');
    setPromoType((item.promotion as any)?.promoType || 'all');
    setPromoTargetItem((item.promotion as any)?.targetItem || '');
    setPromoValidUntil(item.promotion?.validUntil || 'Jusqu\'au 31 Octobre');
    setPromoModalVisible(true);
  };

  const handleSavePromo = async () => {
    if (!promoTarget) return;
    try {
      const discount = parseInt(promoDiscount, 10) || 0;
      const updated = await updatePartnerPromotion(promoTarget._id, {
        isPromo: true,
        promoType,
        discountPercent: discount,
        targetItem: promoType === 'item' ? promoTargetItem.trim() : undefined,
        promoLabel: promoLabel.trim() || (promoType === 'item' && promoTargetItem ? `Promo sur ${promoTargetItem} (-${discount}%)` : `-${discount}% sur toute l'addition`),
        validUntil: promoValidUntil.trim() || undefined,
      });
      setActivities((prev) =>
        prev.map((a) => (a._id === promoTarget._id ? { ...a, promotion: updated.promotion } : a))
      );
      await invalidateAppQueries();
      setPromoModalVisible(false);
      Alert.alert('Succès 🎉', 'Votre promotion a été enregistrée avec succès et diffusée aux utilisateurs !');
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  const handleOpenEvent = (item: PartnerActivityItem) => {
    if (!isPremiumPartner) {
      setTargetUpgradeTier('premium');
      setUpgradeModalVisible(true);
      return;
    }
    setEventTarget(item);
    setEventTitle('Soirée Acoustique & Guitare');
    setEventImage(item.imageUrl || '');
    setEventDate('Ce samedi soir');
    setEventTime('21:00');
    setEventPrice('20');
    setEventDesc('Ambiance live intimiste, réservation recommandée');
    setEventModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!eventTarget) return;
    if (!eventTitle.trim()) {
      Alert.alert('Champs requis', 'Veuillez renseigner le titre de la soirée.');
      return;
    }
    try {
      const updated = await addPartnerEvent(eventTarget._id, {
        title: eventTitle.trim(),
        image: eventImage.trim(),
        date: eventDate.trim(),
        time: eventTime.trim(),
        price: parseFloat(eventPrice) || 0,
        description: eventDesc.trim(),
        category: 'music',
      });
      setActivities((prev) =>
        prev.map((a) => (a._id === eventTarget._id ? { ...a, events: updated.events } : a))
      );
      await invalidateAppQueries();
      setEventModalVisible(false);
      Alert.alert('Soirée Live publiée 🎉', 'Votre événement a été ajouté à votre fiche établissement !');
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  const handleSaveActivity = async (payload: PartnerActivityInput) => {
    try {
      if (editingActivity) {
        const updated = await updatePartnerActivity(editingActivity._id, payload);
        setActivities((prev) =>
          prev.map((a) => (a._id === editingActivity._id ? { ...a, ...updated } : a))
        );
        Alert.alert('Succès 🎉', 'Votre établissement a été mis à jour.');
      } else {
        const created = await createPartnerActivity(payload);
        setActivities((prev) => [created, ...prev]);
        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          pending: prev.pending + 1,
        }));
        Alert.alert(
          'Établissement enregistré 🎉',
          'Votre établissement a été soumis avec succès. Il sera visible dès validation par la modération.'
        );
      }
      await invalidateAppQueries();
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || "Impossible d'enregistrer l'activité.");
    }
  };

  const handleDeleteActivity = (item: PartnerActivityItem) => {
    Alert.alert(
      'Confirmation de suppression',
      `Voulez-vous vraiment supprimer "${item.name}" de votre catalogue ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePartnerActivity(item._id);
              setActivities((prev) => prev.filter((a) => a._id !== item._id));
              setStats((prev) => ({
                ...prev,
                total: Math.max(0, prev.total - 1),
                approved: item.isApproved ? Math.max(0, prev.approved - 1) : prev.approved,
                pending: !item.isApproved ? Math.max(0, prev.pending - 1) : prev.pending,
              }));
              await invalidateAppQueries();
              Alert.alert('Succès', 'Offre supprimée avec succès.');
            } catch (err: any) {
              Alert.alert('Erreur', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header Pro */}
      <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.cardBorder }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={theme.textMain} />
          </TouchableOpacity>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: theme.textMain }]} numberOfLines={1}>
                {currentUser?.establishmentName || 'Espace Partenaire Pro'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.partnerBadge,
                  {
                    backgroundColor:
                      effectiveTier === 'premium'
                        ? '#7C3AED'
                        : effectiveTier === 'pro'
                        ? '#EA580C'
                        : '#475569',
                  },
                ]}
                onPress={() => {
                  setTargetUpgradeTier(
                    effectiveTier === 'premium'
                      ? 'premium'
                      : isProPartner
                      ? 'premium'
                      : 'pro'
                  );
                  setUpgradeModalVisible(true);
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Détails du forfait partenaire"
              >
                <Ionicons
                  name={
                    effectiveTier === 'premium'
                      ? 'ribbon'
                      : effectiveTier === 'pro'
                      ? 'star'
                      : 'business'
                  }
                  size={11}
                  color="#FFFFFF"
                />
                <Text style={styles.partnerBadgeText}>
                  {effectiveTier === 'premium'
                    ? 'PREMIUM 👑'
                    : effectiveTier === 'pro'
                    ? 'PRO ⭐'
                    : 'STANDARD'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
              {currentUser?.name} · {currentUser?.city || 'Tunisie'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.refreshIconButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
          onPress={onPullRefresh}
        >
          <Ionicons name="refresh" size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Chargement de vos offres & statistiques...
          </Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: theme.textMain }]}>Erreur</Text>
          <Text style={[styles.errorMessage, { color: theme.textMuted }]}>{errorMessage}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.primary }]}
            onPress={loadData}
          >
            <Text style={styles.retryBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onPullRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        >
          {/* Carte de Statut et Privilèges Partenaire */}
          <PartnerTierStatusCard
            tier={effectiveTier}
            onPressUpgrade={(target) => {
              setTargetUpgradeTier(target);
              setUpgradeModalVisible(true);
            }}
            onPressInfo={() => {
              setTargetUpgradeTier(
                effectiveTier === 'premium'
                  ? 'premium'
                  : isProPartner
                  ? 'premium'
                  : 'pro'
              );
              setUpgradeModalVisible(true);
            }}
          />

          {/* Banner Établissement (ex: Restaurant / Café / Loisir) */}
          <View
            style={[
              styles.establishmentHero,
              {
                backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
                borderColor: isDark ? '#4338CA' : '#C7D2FE',
              },
            ]}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroIconBox}>
                <Ionicons name="restaurant" size={26} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroEstablishmentName, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]}>
                  {currentUser?.establishmentName || 'Mon Restaurant / Établissement'}
                </Text>
                <Text style={[styles.heroSub, { color: isDark ? '#C7D2FE' : '#4F46E5' }]}>
                  Gérez vos menus, offres spéciales et réservations directes sans commission.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addCtaButton}
              onPress={openCreateModal}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.addCtaText}>+ Ajouter un établissement / lieu</Text>
            </TouchableOpacity>
          </View>

          {/* Grille de KPI de l'établissement */}
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Text style={[styles.kpiValue, { color: theme.textMain }]}>{stats.total}</Text>
              <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Établissements</Text>
              <Text style={[styles.kpiSub, { color: '#10B981' }]}>{stats.approved} en ligne</Text>
            </View>

            <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Text style={[styles.kpiValue, { color: stats.pending > 0 ? '#F59E0B' : '#10B981' }]}>
                {stats.pending}
              </Text>
              <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>En Modération</Text>
              <Text style={[styles.kpiSub, { color: theme.textMuted }]}>Validation admin</Text>
            </View>

            <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Text style={[styles.kpiValue, { color: '#F59E0B' }]}>★ {stats.averageRating}</Text>
              <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Note Moyenne</Text>
              <Text style={[styles.kpiSub, { color: theme.textMuted }]}>{stats.totalReviews} avis clients</Text>
            </View>
          </View>

          {/* Liste des Activités du Partenaire */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
              Vos Établissements & Lieux ({activities.length})
            </Text>
          </View>

          {activities.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Ionicons name="restaurant-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.textMain }]}>
                Aucun établissement enregistré pour le moment
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                Ajoutez dès maintenant votre restaurant, salon de thé ou formule loisir pour attirer de nouveaux clients !
              </Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openCreateModal}>
                <Text style={styles.emptyAddBtnText}>Ajouter mon premier établissement</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.activityList}>
              {activities.map((item) => {
                const imgUri = item.imageUrl || item.image;
                return (
                  <View
                    key={item._id}
                    style={[styles.activityCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
                  >
                    <View style={styles.activityCardTop}>
                      {imgUri ? (
                        <Image source={{ uri: imgUri }} style={styles.activityThumbnail as any} />
                      ) : (
                        <View style={[styles.thumbnailPlaceholder, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                          <Ionicons name="image-outline" size={24} color={theme.textMuted} />
                        </View>
                      )}

                      <View style={styles.activityCardInfo}>
                        <View style={styles.titleStatusRow}>
                          <Text style={[styles.activityName, { color: theme.textMain }]} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: item.isApproved ? '#DCFCE7' : '#FEF3C7' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                { color: item.isApproved ? '#15803D' : '#B45309' },
                              ]}
                            >
                              {item.isApproved ? 'En ligne' : 'En attente'}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.activitySubText, { color: theme.textMuted }]}>
                          {item.city} · {item.category} · <Text style={{ color: theme.primary, fontWeight: '800' }}>{item.price} DT</Text>
                        </Text>

                        {/* Aménagements */}
                        <View style={styles.amenitiesRow}>
                          {item.hasAirConditioning && (
                            <View style={styles.amenityChip}>
                              <Text style={styles.amenityText}>❄️ Clim</Text>
                            </View>
                          )}
                          {electricityAlertActive && item.hasPowerBackup && (
                            <View style={styles.amenityChip}>
                              <Text style={styles.amenityText}>⚡ Générateur</Text>
                            </View>
                          )}
                          <View style={styles.ratingChip}>
                            <Ionicons name="star" size={11} color="#F59E0B" />
                            <Text style={styles.ratingText}>
                              {(item.reviewsCount && item.reviewsCount > 0) ? (item.rating || 0) : 0} ({item.reviewsCount || 0})
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Mode Électricité / Lumière en direct (Uniquement si activé par l'Administrateur) */}
                    {electricityAlertActive && (
                      <PartnerPowerModeSwitch
                        powerBackupMode={item.powerBackupMode !== false}
                        isDark={isDark}
                        theme={theme}
                        onToggle={() => handleTogglePowerMode(item)}
                      />
                    )}

                    {/* Horaires et Options Partenaire Pro (Promotions & Soirées Live) */}
                    <View style={{ paddingHorizontal: 14, marginTop: 8, gap: 6 }}>
                      {/* Horaires */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="time-outline" size={13} color="#10B981" />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMain }}>
                          Horaires : {item.openingTime || '09:00'} - {item.closingTime || '23:00'} ({item.openDays && item.openDays.length > 0 ? item.openDays[0] : 'Tous les jours'})
                        </Text>
                      </View>

                      {/* Promo active */}
                      {item.promotion?.isPromo && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', padding: 6, borderRadius: 8 }}>
                          <Text style={{ fontSize: 12 }}>🏷️</Text>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#DC2626' }}>
                            Promo active : {item.promotion.promoLabel} (-{item.promotion.discountPercent}%)
                          </Text>
                        </View>
                      )}

                      {/* Événement actif */}
                      {Boolean(item.events && item.events.length > 0) && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FDF2F8', padding: 6, borderRadius: 8 }}>
                          <Text style={{ fontSize: 12 }}>🎵</Text>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#DB2777' }}>
                            Soirée : {item.events![0].title} ({item.events![0].date} {item.events![0].time})
                          </Text>
                        </View>
                      )}

                      {/* Boutons Pro Promo & Soirée */}
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                        <TouchableOpacity
                          onPress={() => handleOpenPromo(item)}
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            backgroundColor: isProPartner
                              ? item.promotion?.isPromo
                                ? '#FEF2F2'
                                : isDark
                                ? '#450A0A30'
                                : '#FFF1F2'
                              : isDark
                              ? '#1E293B'
                              : '#F1F5F9',
                            borderColor: isProPartner ? '#F87171' : theme.cardBorder,
                            borderWidth: 1,
                            paddingVertical: 8,
                            borderRadius: 10,
                          }}
                        >
                          <Ionicons
                            name={isProPartner ? 'pricetag' : 'lock-closed'}
                            size={13}
                            color={isProPartner ? '#DC2626' : theme.textMuted}
                          />
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '800',
                              color: isProPartner ? '#DC2626' : theme.textMuted,
                            }}
                          >
                            {isProPartner
                              ? item.promotion?.isPromo
                                ? `🏷️ Promo (-${item.promotion.discountPercent}%)`
                                : '🏷️ Gérer Promo'
                              : '🔒 Promo % (Pro)'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleOpenEvent(item)}
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            backgroundColor: isPremiumPartner
                              ? isDark
                                ? '#3B076430'
                                : '#FAF5FF'
                              : isDark
                              ? '#1E293B'
                              : '#F1F5F9',
                            borderColor: isPremiumPartner ? '#C084FC' : theme.cardBorder,
                            borderWidth: 1,
                            paddingVertical: 8,
                            borderRadius: 10,
                          }}
                        >
                          <Ionicons
                            name={isPremiumPartner ? 'musical-notes' : 'lock-closed'}
                            size={13}
                            color={isPremiumPartner ? '#9333EA' : theme.textMuted}
                          />
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '800',
                              color: isPremiumPartner ? '#9333EA' : theme.textMuted,
                            }}
                          >
                            {isPremiumPartner
                              ? item.events && item.events.length > 0
                                ? `🎵 Soirée (${item.events[0].title.slice(0, 10)}...)`
                                : '🎵 Soirée Live'
                              : '🔒 Soirée (VIP 👑)'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Actions de l'établissement */}
                    <View style={[styles.actionRow, { borderTopColor: theme.cardBorder }]}>
                      {item.phone && (
                        <View style={styles.contactPreview}>
                          <Ionicons name="call" size={13} color="#10B981" />
                          <Text style={[styles.contactText, { color: theme.textMuted }]}>{strip216(item.phone)}</Text>
                        </View>
                      )}

                      <View style={styles.actionButtonsCol}>
                        <TouchableOpacity
                          style={[styles.editBtn, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                          onPress={() => openEditModal(item)}
                        >
                          <Ionicons name="pencil" size={14} color={theme.textMain} />
                          <Text style={[styles.editBtnText, { color: theme.textMain }]}>Modifier</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.deleteBtn, { backgroundColor: '#FEF2F2' }]}
                          onPress={() => handleDeleteActivity(item)}
                        >
                          <Ionicons name="trash" size={14} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* MODAL MODULAIRE ÉTABLISSEMENT / LIEU PARTENAIRE */}
      <PartnerActivityModal
        visible={modalVisible}
        editingActivity={editingActivity}
        currentUserCity={currentUser?.city}
        electricityAlertActive={electricityAlertActive}
        theme={theme}
        isDark={isDark}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveActivity}
      />

      {/* MODAL PROMOTION PRO & PREMIUM */}
      <PartnerProPromoModal
        visible={promoModalVisible}
        targetActivity={promoTarget}
        discount={promoDiscount}
        label={promoLabel}
        promoType={promoType}
        targetItem={promoTargetItem}
        validUntil={promoValidUntil}
        theme={theme}
        isDark={isDark}
        onDiscountChange={setPromoDiscount}
        onLabelChange={setPromoLabel}
        onPromoTypeChange={setPromoType}
        onTargetItemChange={setPromoTargetItem}
        onValidUntilChange={setPromoValidUntil}
        onClose={() => setPromoModalVisible(false)}
        onSave={handleSavePromo}
      />

      {/* MODAL ÉVÉNEMENT / SOIRÉE PRO */}
      <PartnerProEventModal
        visible={eventModalVisible}
        targetActivity={eventTarget}
        title={eventTitle}
        image={eventImage}
        date={eventDate}
        time={eventTime}
        price={eventPrice}
        desc={eventDesc}
        theme={theme}
        isDark={isDark}
        onTitleChange={setEventTitle}
        onImageChange={setEventImage}
        onDateChange={setEventDate}
        onTimeChange={setEventTime}
        onPriceChange={setEventPrice}
        onDescChange={setEventDesc}
        onClose={() => setEventModalVisible(false)}
        onSave={handleSaveEvent}
      />

      {/* MODAL INFORMATION & UPGRADE PALIER PARTENAIRE */}
      <PartnerUpgradeModal
        visible={upgradeModalVisible}
        currentTier={effectiveTier}
        targetTier={targetUpgradeTier}
        onClose={() => setUpgradeModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    maxWidth: 200,
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  partnerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  refreshIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
  },
  establishmentHero: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEstablishmentName: {
    fontSize: 16,
    fontWeight: '900',
  },
  heroSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  addCtaButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  addCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyAddBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  activityList: {
    gap: 12,
  },
  activityCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityCardTop: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  activityThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  thumbnailPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  activitySubText: {
    fontSize: 12,
    marginTop: 2,
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  amenityChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  contactPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 11,
  },
  actionButtonsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 11,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  errorMessage: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
