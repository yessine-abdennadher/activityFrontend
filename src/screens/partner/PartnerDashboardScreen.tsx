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
import { PartnerLoyaltyModal } from '../../components/partner/PartnerLoyaltyModal';
import { PartnerProEventModal, type EventCategoryKey } from '../../components/partner/PartnerProEventModal';
import { PartnerUpgradeModal } from '../../components/partner/PartnerUpgradeModal';
import { PartnerActivityModal, strip216 } from '../../components/partner/PartnerActivityModal';
import { PartnerMenuModal } from '../../components/partner/PartnerMenuModal';
import { PartnerOverviewTab } from './tabs/PartnerOverviewTab';
import { PartnerVenueTab } from './tabs/PartnerVenueTab';
import { PartnerPerformanceTab } from './tabs/PartnerPerformanceTab';
import ActivityDetailsScreen from '../ActivityDetailsScreen';
import { mapPartnerItemToActivity } from '../../utils/partnerPreviewMapper';
import { calculateDiscountedPrice } from '../../utils/promoHelpers';
import { updatePartnerLoyaltyProgram } from '../../services/loyaltyService';
import { fetchCurrentUserProfile } from '../../services/authService';
import { queryClient } from '../../lib/queryClient';
import type { PartnerTier, Activity, PromoOfferType, LoyaltyProgramConfig } from '../../types';

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

  // Modal Menu dédié
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [menuTargetActivity, setMenuTargetActivity] = useState<PartnerActivityItem | null>(null);

  // Modal Promo Pro & Premium
  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [promoTarget, setPromoTarget] = useState<PartnerActivityItem | null>(null);
  const [promoOfferType, setPromoOfferType] = useState<PromoOfferType>('percentage');
  const [promoDiscount, setPromoDiscount] = useState('20');
  const [promoLabel, setPromoLabel] = useState('');
  const [promoType, setPromoType] = useState<'all' | 'item'>('all');
  const [promoTargetItem, setPromoTargetItem] = useState('');
  const [promoOriginalPrice, setPromoOriginalPrice] = useState<number | undefined>(undefined);
  const [promoValidUntil, setPromoValidUntil] = useState('Ce week-end uniquement');

  // Modal Carte de Fidélité (5+1)
  const [loyaltyModalVisible, setLoyaltyModalVisible] = useState(false);
  const [loyaltyTarget, setLoyaltyTarget] = useState<PartnerActivityItem | null>(null);

  // Modal Événement Pro & Premium
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventTarget, setEventTarget] = useState<PartnerActivityItem | null>(null);
  const [eventCategory, setEventCategory] = useState<EventCategoryKey>('music');
  const [eventTitle, setEventTitle] = useState('Soirée Musique Live');
  const [eventImage, setEventImage] = useState('');
  const [eventDate, setEventDate] = useState('Ce samedi soir');
  const [eventTime, setEventTime] = useState('21:00');
  const [eventPrice, setEventPrice] = useState('20');
  const [eventDesc, setEventDesc] = useState('Ambiance acoustique guitare & violon');

  // Modal Upgrade & Détails Forfait Partenaire
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [targetUpgradeTier, setTargetUpgradeTier] = useState<'pro' | 'premium'>('pro');

  // Onglet actif : 'overview' (Aperçu) | 'venue' (Fiche & Menu) | 'stats' (Performance)
  const [activeTab, setActiveTab] = useState<'overview' | 'venue' | 'stats'>('overview');

  // Palier temps réel dynamique (initialisé depuis le cache utilisateur puis synchronisé via l'API)
  const [livePartnerTier, setLivePartnerTier] = useState<PartnerTier>(
    currentUser?.partnerTier || 'standard'
  );

  // Mode Aperçu Visiteur (« Voir comme un client »)
  const [previewingActivity, setPreviewingActivity] = useState<Activity | null>(null);

  const handlePreviewActivity = (item: PartnerActivityItem) => {
    const mapped = mapPartnerItemToActivity(item, effectiveTier);
    setPreviewingActivity(mapped);
  };

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
        nextVal ? 'Mode Électricité & Lumière ACTIVÉ' : 'Mode Lumière désactivé',
        nextVal
          ? 'Votre offre affiche maintenant le badge lumière garantie sur la carte pour tous les visiteurs !'
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
    setPromoOfferType(item.promotion?.offerType || 'percentage');
    setPromoDiscount(String(item.promotion?.discountPercent || '20'));
    setPromoLabel(item.promotion?.promoLabel || '');
    setPromoType((item.promotion as any)?.promoType || 'all');
    setPromoTargetItem((item.promotion as any)?.targetItem || '');
    setPromoOriginalPrice(item.promotion?.originalPrice);
    setPromoValidUntil(item.promotion?.validUntil || 'Ce week-end uniquement');
    setPromoModalVisible(true);
  };

  const handleSavePromo = async () => {
    if (!promoTarget) return;
    try {
      const discount = parseInt(promoDiscount, 10) || 0;
      const calcPromoPrice =
        promoOriginalPrice && promoOfferType === 'percentage'
          ? calculateDiscountedPrice(promoOriginalPrice, discount)
          : undefined;

      const fallbackLabel =
        promoOfferType === 'bogo'
          ? promoTargetItem
            ? `1 ${promoTargetItem} acheté = le 2ème offert`
            : '1 article acheté = 1 offert'
          : promoOfferType === 'bundle'
            ? promoTargetItem
              ? `Formule Spéciale ${promoTargetItem}`
              : 'Formule Pack Spécial'
            : promoOfferType === 'gift'
              ? promoTargetItem
                ? `${promoTargetItem} offert avec votre commande`
                : 'Cadeau offert avec votre addition'
              : promoType === 'item' && promoTargetItem
                ? calcPromoPrice && promoOriginalPrice
                  ? `${promoTargetItem} à ${calcPromoPrice} DT au lieu de ${promoOriginalPrice} DT`
                  : `-${discount}% sur ${promoTargetItem}`
                : `-${discount}% sur toute l'addition`;

      const updated = await updatePartnerPromotion(promoTarget._id, {
        isPromo: true,
        offerType: promoOfferType,
        promoType: promoOfferType === 'percentage' ? promoType : 'item',
        discountPercent: promoOfferType === 'percentage' ? discount : 0,
        targetItem: promoTargetItem.trim() || undefined,
        originalPrice: promoOriginalPrice,
        promoPrice: calcPromoPrice,
        promoLabel: promoLabel.trim() || fallbackLabel,
        validUntil: promoValidUntil.trim() || undefined,
      });
      setActivities((prev) =>
        prev.map((a) => (a._id === promoTarget._id ? { ...a, promotion: updated.promotion } : a))
      );
      await invalidateAppQueries();
      setPromoModalVisible(false);
      Alert.alert('Succès', 'Votre promotion a été enregistrée avec succès et diffusée aux utilisateurs !');
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  const handleOpenLoyalty = (item: PartnerActivityItem) => {
    setLoyaltyTarget(item);
    setLoyaltyModalVisible(true);
  };

  const handleSaveLoyalty = async (activityId: string, config: LoyaltyProgramConfig) => {
    try {
      const updatedProgram = await updatePartnerLoyaltyProgram(activityId, config);
      setActivities((prev) =>
        prev.map((a) => (a._id === activityId ? { ...a, loyaltyProgram: updatedProgram } : a))
      );
      await invalidateAppQueries();
      setLoyaltyModalVisible(false);
      Alert.alert(
        updatedProgram.isActive ? 'Carte Fidélité Activée' : 'Carte Fidélité Désactivée',
        updatedProgram.isActive
          ? `Vos clients peuvent désormais cumuler ${updatedProgram.requiredStamps} passages pour débloquer : ${updatedProgram.rewardLabel}`
          : 'Le programme de fidélité a été mis en pause.'
      );
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d’enregistrer la carte fidélité.');
    }
  };

  const handleDisablePromo = async () => {
    if (!promoTarget) return;
    try {
      const updated = await updatePartnerPromotion(promoTarget._id, {
        isPromo: false,
        discountPercent: 0,
        promoLabel: '',
        validUntil: undefined,
        targetItem: undefined,
      });
      setActivities((prev) =>
        prev.map((a) => (a._id === promoTarget._id ? { ...a, promotion: updated.promotion } : a))
      );
      await invalidateAppQueries();
      setPromoModalVisible(false);
      Alert.alert('Promotion désactivée', 'Votre offre a été retirée avec succès de votre fiche.');
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
    setEventCategory('music');
    setEventTitle('Soirée Acoustique & Guitare');
    setEventImage(item.imageUrl || '');
    setEventDate('Samedi soir');
    setEventTime('21:00');
    setEventPrice('0');
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
        category: eventCategory,
      });
      setActivities((prev) =>
        prev.map((a) => (a._id === eventTarget._id ? { ...a, events: updated.events } : a))
      );
      await invalidateAppQueries();
      setEventModalVisible(false);
      Alert.alert('Soirée Live publiée ', 'Votre événement a été ajouté à votre fiche établissement !');
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  const handleOpenMenuModal = (item: PartnerActivityItem) => {
    setMenuTargetActivity(item);
    setMenuModalVisible(true);
  };

  const handleSaveMenu = async (
    activityId: string,
    menuImageUrl?: string,
    menuUrl?: string,
    sections?: any[]
  ) => {
    const updated = await updatePartnerActivity(activityId, {
      menuImageUrl,
      menuUrl,
      menu: sections ? { sections } : undefined,
    });
    setActivities((prev) =>
      prev.map((a) =>
        a._id === activityId
          ? {
            ...a,
            menuImageUrl: updated.menuImageUrl,
            menuUrl: updated.menuUrl,
            menu: updated.menu || (sections ? { sections } : a.menu),
          }
          : a
      )
    );
    await invalidateAppQueries();
  };

  const handleSaveActivity = async (payload: PartnerActivityInput) => {
    try {
      if (editingActivity) {
        const updated = await updatePartnerActivity(editingActivity._id, payload);
        setActivities((prev) =>
          prev.map((a) => (a._id === editingActivity._id ? { ...a, ...updated } : a))
        );
        Alert.alert('Succès ', 'Votre établissement a été mis à jour.');
      } else {
        const created = await createPartnerActivity(payload);
        setActivities((prev) => [created, ...prev]);
        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          pending: prev.pending + 1,
        }));
        Alert.alert(
          'Établissement enregistré ',
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

  const mainActivity = activities[0] || null;
  const mainActivityImg = mainActivity?.imageUrl || mainActivity?.image || null;
  const isVenueOnline = Boolean(mainActivity?.isApproved);

  if (previewingActivity) {
    return (
      <ActivityDetailsScreen
        activity={previewingActivity}
        isFavorite={false}
        currentUser={currentUser}
        isPartnerPreview={true}
        onBack={() => setPreviewingActivity(null)}
        onToggleFavorite={() => { }}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header Professionnel Haute Fidélité */}
      <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.cardBorder }]}>
        {/* Ligne Principale : Retour + Identité Établissement + Refresh */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={20} color={theme.textMain} />
          </TouchableOpacity>

          {/* Avatar / Vignette avec indicateur En ligne */}
          <View style={styles.avatarWrapper}>
            {mainActivityImg ? (
              <Image source={{ uri: mainActivityImg }} style={styles.venueAvatar} />
            ) : (
              <View style={[styles.venueAvatarPlaceholder, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
                <Ionicons name="restaurant" size={20} color={theme.primary} />
              </View>
            )}
            <View
              style={[
                styles.liveStatusDot,
                { backgroundColor: isVenueOnline ? '#10B981' : '#F59E0B' },
              ]}
            />
          </View>

          {/* Titre & Localisation & Statut */}
          <View style={styles.headerTitleCol}>
            <Text style={[styles.headerTitle, { color: theme.textMain }]} numberOfLines={1}>
              {currentUser?.establishmentName || mainActivity?.name || 'Mon Établissement'}
            </Text>
            <View style={styles.headerMetaRow}>
              <View style={styles.statusPill}>
                <View
                  style={[
                    styles.statusPillDot,
                    { backgroundColor: isVenueOnline ? '#10B981' : '#F59E0B' },
                  ]}
                />
                <Text
                  style={[
                    styles.statusPillText,
                    { color: isVenueOnline ? '#059669' : '#D97706' },
                  ]}
                >
                  {isVenueOnline ? 'En ligne' : 'En modération'}
                </Text>
              </View>
              <Text style={[styles.metaSeparator, { color: theme.textMuted }]}>·</Text>
              <Ionicons name="location-outline" size={12} color={theme.textMuted} />
              <Text style={[styles.headerSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                {mainActivity?.city || currentUser?.city || 'Tunisie'}
              </Text>
            </View>
          </View>
        </View>

        {/* Bandeau Statut Forfait & Upgrade Direct */}
        <TouchableOpacity
          style={[
            styles.tierStrip,
            {
              backgroundColor: isPremiumPartner
                ? isDark ? '#3B076440' : '#FAF5FF'
                : isProPartner
                  ? isDark ? '#43140740' : '#FFF7ED'
                  : isDark ? '#0F172A' : '#F8FAFC',
              borderColor: isPremiumPartner
                ? '#C084FC'
                : isProPartner
                  ? '#FDBA74'
                  : theme.cardBorder,
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
        >
          <View style={styles.tierStripLeft}>
            <Ionicons
              name={
                effectiveTier === 'premium'
                  ? 'ribbon'
                  : effectiveTier === 'pro'
                    ? 'star'
                    : 'shield-checkmark'
              }
              size={14}
              color={
                effectiveTier === 'premium'
                  ? '#9333EA'
                  : effectiveTier === 'pro'
                    ? '#EA580C'
                    : '#64748B'
              }
            />
            <Text
              style={[
                styles.tierStripName,
                {
                  color:
                    effectiveTier === 'premium'
                      ? '#9333EA'
                      : effectiveTier === 'pro'
                        ? '#EA580C'
                        : theme.textMain,
                },
              ]}
            >
              Pack {effectiveTier.toUpperCase()}
            </Text>
          </View>

          <View style={styles.tierStripCta}>
            <Text
              style={[
                styles.tierStripCtaText,
                {
                  color:
                    effectiveTier === 'premium'
                      ? '#9333EA'
                      : '#4F46E5',
                },
              ]}
            >
              {effectiveTier === 'premium' ? 'Privilèges VIP' : 'Booster ma fiche'}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={13}
              color={effectiveTier === 'premium' ? '#9333EA' : '#4F46E5'}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Barre d'onglets épurée : 1. Aperçu | 2. Fiche & Menu | 3. Performance */}
      <View style={[styles.tabBar, { backgroundColor: theme.cardBg, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
          onPress={() => setActiveTab('overview')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'overview' ? 'home' : 'home-outline'}
            size={18}
            color={activeTab === 'overview' ? theme.primary : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'overview' ? theme.primary : theme.textMuted },
              activeTab === 'overview' && styles.tabTextActive,
            ]}
          >
            Aperçu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'venue' && styles.tabItemActive]}
          onPress={() => setActiveTab('venue')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'venue' ? 'restaurant' : 'restaurant-outline'}
            size={18}
            color={activeTab === 'venue' ? theme.primary : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'venue' ? theme.primary : theme.textMuted },
              activeTab === 'venue' && styles.tabTextActive,
            ]}
          >
            Fiche & Menu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'stats' && styles.tabItemActive]}
          onPress={() => setActiveTab('stats')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'stats' ? 'stats-chart' : 'stats-chart-outline'}
            size={18}
            color={activeTab === 'stats' ? theme.primary : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'stats' ? theme.primary : theme.textMuted },
              activeTab === 'stats' && styles.tabTextActive,
            ]}
          >
            Performance
          </Text>
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
      ) : activeTab === 'overview' ? (
        <PartnerOverviewTab
          activity={mainActivity}
          effectiveTier={effectiveTier}
          isProPartner={isProPartner}
          isPremiumPartner={isPremiumPartner}
          refreshing={refreshing}
          theme={theme}
          isDark={isDark}
          onRefresh={onPullRefresh}
          onEditPress={() => {
            if (mainActivity) openEditModal(mainActivity);
            else openCreateModal();
          }}
          onPreviewPress={handlePreviewActivity}
          onPromoPress={() => {
            if (mainActivity) handleOpenPromo(mainActivity);
          }}
          onEventPress={() => {
            if (mainActivity) handleOpenEvent(mainActivity);
          }}
          onLoyaltyPress={() => {
            if (mainActivity) handleOpenLoyalty(mainActivity);
          }}
          onSharePress={() => {
            if (mainActivity) {
              Alert.alert('Lien Partenaire', 'Partagez votre fiche Hamla : https://hamla.tn/activite/' + mainActivity._id);
            }
          }}
          onUpgradePress={(target) => {
            setTargetUpgradeTier(target);
            setUpgradeModalVisible(true);
          }}
          onUpgradeInfoPress={() => {
            setTargetUpgradeTier(
              effectiveTier === 'premium'
                ? 'premium'
                : isProPartner
                  ? 'premium'
                  : 'pro'
            );
            setUpgradeModalVisible(true);
          }}
          onSwitchToVenueTab={() => setActiveTab('venue')}
        />
      ) : activeTab === 'venue' ? (
        <PartnerVenueTab
          activities={activities}
          currentUserEstablishmentName={currentUser?.establishmentName}
          electricityAlertActive={electricityAlertActive}
          isProPartner={isProPartner}
          isPremiumPartner={isPremiumPartner}
          refreshing={refreshing}
          theme={theme}
          isDark={isDark}
          onRefresh={onPullRefresh}
          onCreatePress={openCreateModal}
          onEditPress={openEditModal}
          onPreviewPress={handlePreviewActivity}
          onMenuPress={handleOpenMenuModal}
          onDeletePress={handleDeleteActivity}
          onPromoPress={handleOpenPromo}
          onEventPress={handleOpenEvent}
          onTogglePowerMode={handleTogglePowerMode}
        />
      ) : (
        <PartnerPerformanceTab
          stats={stats}
          activities={activities}
          effectiveTier={effectiveTier}
          isProPartner={isProPartner}
          isPremiumPartner={isPremiumPartner}
          refreshing={refreshing}
          theme={theme}
          isDark={isDark}
          onRefresh={onPullRefresh}
          onUpgradePress={(target) => {
            setTargetUpgradeTier(target);
            setUpgradeModalVisible(true);
          }}
          onPromoPress={handleOpenPromo}
          onEventPress={handleOpenEvent}
        />
      )}

      {/* MODAL MODULAIRE ÉTABLISSEMENT / LIEU PARTENAIRE */}
      <PartnerActivityModal
        visible={modalVisible}
        editingActivity={editingActivity}
        currentUserCity={currentUser?.city}
        electricityAlertActive={electricityAlertActive}
        partnerTier={effectiveTier}
        theme={theme}
        isDark={isDark}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveActivity}
        onRequestUpgrade={(target) => {
          setModalVisible(false);
          setTargetUpgradeTier(target);
          setUpgradeModalVisible(true);
        }}
      />

      {/* MODAL PROMOTION PRO & PREMIUM */}
      <PartnerProPromoModal
        visible={promoModalVisible}
        activities={activities}
        targetActivity={promoTarget}
        offerType={promoOfferType}
        discount={promoDiscount}
        label={promoLabel}
        promoType={promoType}
        targetItem={promoTargetItem}
        originalPrice={promoOriginalPrice}
        validUntil={promoValidUntil}
        theme={theme}
        isDark={isDark}
        hasActivePromo={Boolean(promoTarget?.promotion?.isPromo)}
        onSelectActivity={(act) => handleOpenPromo(act)}
        onOfferTypeChange={setPromoOfferType}
        onDiscountChange={setPromoDiscount}
        onLabelChange={setPromoLabel}
        onPromoTypeChange={setPromoType}
        onTargetItemChange={(itemName, itemPrice) => {
          setPromoTargetItem(itemName);
          setPromoOriginalPrice(itemPrice);
        }}
        onValidUntilChange={setPromoValidUntil}
        onClose={() => setPromoModalVisible(false)}
        onSave={handleSavePromo}
        onDisablePromo={handleDisablePromo}
      />

      {/* MODAL CARTE DE FIDÉLITÉ DIGITALE (5+1) */}
      <PartnerLoyaltyModal
        visible={loyaltyModalVisible}
        activities={activities}
        targetActivity={loyaltyTarget}
        theme={theme}
        isDark={isDark}
        onSelectActivity={(act) => setLoyaltyTarget(act)}
        onClose={() => setLoyaltyModalVisible(false)}
        onSave={handleSaveLoyalty}
      />

      {/* MODAL ÉVÉNEMENT / SOIRÉE PRO */}
      <PartnerProEventModal
        visible={eventModalVisible}
        activities={activities}
        targetActivity={eventTarget}
        category={eventCategory}
        title={eventTitle}
        image={eventImage}
        date={eventDate}
        time={eventTime}
        price={eventPrice}
        desc={eventDesc}
        theme={theme}
        isDark={isDark}
        onSelectActivity={(act) => handleOpenEvent(act)}
        onCategoryChange={setEventCategory}
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

      {/* MODAL MENU DÉDIÉ & QR CODE OFFICIEL HAMLA */}
      <PartnerMenuModal
        visible={menuModalVisible}
        activity={menuTargetActivity}
        theme={theme}
        isDark={isDark}
        onClose={() => setMenuModalVisible(false)}
        onSaveMenu={handleSaveMenu}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 25,
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  venueAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  venueAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveStatusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerTitleCol: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaSeparator: {
    fontSize: 11,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  refreshIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  tierStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierStripName: {
    fontSize: 11,
    fontWeight: '800',
  },
  tierStripCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  tierStripCtaText: {
    fontSize: 11,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '800',
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
