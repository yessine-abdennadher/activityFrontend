import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Activity, AuthUser } from '../types';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { ActivityDetailHero } from '../components/activity/ActivityDetailHero';
import { ActivityDetailInfo } from '../components/activity/ActivityDetailInfo';
import { ActivityPowerCommunityReport } from '../components/activity/ActivityPowerCommunityReport';
import { ActivityProEventCard } from '../components/activity/ActivityProEventCard';
import { ActivityLoyaltyCard } from '../components/activity/ActivityLoyaltyCard';
import { ActivityReviewsSection } from '../components/activity/ActivityReviewsSection';
import { ActivityScheduleBadge } from '../components/activity/ActivityScheduleBadge';
import { ActivityMenuSection } from '../components/activity/ActivityMenuSection';
import {
  getActivityReviews,
  addActivityReview,
  updateActivityReview,
  deleteActivityReview,
  reactToActivityReview,
  getActivityLocalizedText,
  trackActivityInteraction,
  type ActivityReview,
  type FacebookReactionType,
} from '../services/activityService';
import { activityActionService } from '../services/activityActionService';
import { powerReportService } from '../services/powerReportService';
import { activityPresenterService } from '../services/activityPresenterService';

interface Props {
  activity: Activity;
  isFavorite: boolean;
  currentUser?: AuthUser | null;
  isPartnerPreview?: boolean;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
}

export default function ActivityDetailsScreen({
  activity,
  isFavorite,
  currentUser,
  isPartnerPreview = false,
  onBack,
  onToggleFavorite,
}: Props) {
  const { isDark, theme, language, electricityAlertActive } = useAppPreferences();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // ── Localisation du contenu ───────────────────────────────────────────────
  const localizedName = getActivityLocalizedText(activity, 'name', language as any);
  const localizedDescription = getActivityLocalizedText(activity, 'description', language as any);
  const localizedCity = getActivityLocalizedText(activity, 'city', language as any);

  const localizedCategoryName = useMemo(() => {
    return activityPresenterService.getLocalizedCategoryName(activity.category, language);
  }, [activity.category, language]);

  // ── Notes & Avis dynamiques (MongoDB) ────────────────────────────────────
  // RÈGLE STRICTE : Si 0 avis, la note DOIT être 0 (jamais de note par défaut 4.5 !)
  const initialRating =
    activity.reviewsCount && activity.reviewsCount > 0 ? activity.rating || 0 : 0;
  const [reviews, setReviews] = useState<ActivityReview[]>([]);
  const [currentRating, setCurrentRating] = useState<number>(initialRating);
  const [reviewsCount, setReviewsCount] = useState<number>(activity.reviewsCount || 0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // État du signalement communautaire de l'électricité
  const [powerReports, setPowerReports] = useState(
    activity.powerReports || { yesVotes: 0, noVotes: 0, reports: [] }
  );
  const [isVotingPower, setIsVotingPower] = useState(false);

  // Formulaire d'avis (Ajout / Modification)
  const [showForm, setShowForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [draftRating, setDraftRating] = useState(5);
  const [draftComment, setDraftComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reaction Picker popup ID
  const [activePickerReviewId, setActivePickerReviewId] = useState<string | null>(null);

  // Onglet actif de la fiche : 'info' | 'menu' | 'reviews'
  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'reviews'>('info');

  const hasMenu = useMemo(() => {
    return Boolean(
      activity.menuImageUrl ||
        activity.menuUrl ||
        activity.menu?.pdfUrl ||
        (activity.menu?.images && activity.menu.images.length > 0) ||
        (activity.menu?.sections && activity.menu.sections.length > 0)
    );
  }, [activity]);

  const hasPromo = Boolean(activity.promotion?.isPromo);
  const hasLoyalty = Boolean(activity.loyaltyProgram?.isActive);
  const hasEvents = Boolean(activity.events && activity.events.length > 0);

  // Charger les avis depuis MongoDB
  const fetchReviews = useCallback(async () => {
    if (!activity.id || isPartnerPreview) {
      setIsLoadingReviews(false);
      return;
    }
    setIsLoadingReviews(true);
    try {
      const data = await getActivityReviews(activity.id);
      setReviews(data);
      if (data.length > 0) {
        const sum = data.reduce((acc, r) => acc + (r.rating || 0), 0);
        setCurrentRating(Number((sum / data.length).toFixed(1)));
        setReviewsCount(data.length);
      } else {
        // Strictement 0 si aucun avis
        setCurrentRating(0);
        setReviewsCount(0);
      }
    } catch (err) {
      console.warn('[ActivityDetails] Erreur chargement reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [activity.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (activity.id) {
      void trackActivityInteraction(activity.id, 'view');
    }
  }, [activity.id]);

  // Envoi ou modification d'un avis
  const handleSubmitReview = async () => {
    if (!currentUser) {
      Alert.alert(t('loginRequired'), t('loginRequiredReview'));
      return;
    }

    if (draftRating === 0) {
      Alert.alert(t('ratingRequired'), t('ratingRequiredSub'));
      return;
    }

    if (draftComment.trim().length < 5) {
      Alert.alert(t('commentTooShort'), t('commentTooShortSub'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingReviewId) {
        const result = await updateActivityReview(
          activity.id,
          editingReviewId,
          draftRating,
          draftComment.trim()
        );
        setReviews(result.reviews);
        const count = result.reviewsCount ?? result.reviews.length;
        setReviewsCount(count);
        setCurrentRating(count === 0 ? 0 : (result.averageRating ?? 0));
        Alert.alert(t('success'), t('reviewPending'));
      } else {
        const result = await addActivityReview(
          activity.id,
          draftRating,
          draftComment.trim()
        );
        setReviews(result.reviews);
        const count = result.reviewsCount ?? result.reviews.length;
        setReviewsCount(count);
        setCurrentRating(count === 0 ? 0 : (result.averageRating ?? 0));
        Alert.alert(t('success'), t('reviewPending'));
      }

      setShowForm(false);
      setEditingReviewId(null);
      setDraftComment('');
      setDraftRating(5);
    } catch (err: any) {
      Alert.alert(t('error'), err.message || t('reviewSaveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Signalement communautaire de l'état du courant par l'utilisateur
  const handleVotePower = async (hasPower: boolean) => {
    if (isPartnerPreview) {
      Alert.alert('Mode Aperçu Partenaire', 'Le signalement électrique est en mode démonstration lors de l’aperçu.');
      return;
    }
    if (!currentUser) {
      Alert.alert(t('loginRequired'), t('loginRequiredVote'));
      return;
    }

    setIsVotingPower(true);
    try {
      const res = await powerReportService.submitPowerReport(activity.id, hasPower);
      setPowerReports({
        yesVotes: res.yesVotes,
        noVotes: res.noVotes,
        lastReportAt: res.lastReportAt,
        lastReportStatus: res.lastReportStatus,
        userVote: res.userVote,
      });
      if (res.message) {
        Alert.alert(
          hasPower ? t('powerActive') : t('powerCut'),
          res.message
        );
      }
    } catch (err: any) {
      Alert.alert(t('error'), err.message || t('error'));
    } finally {
      setIsVotingPower(false);
    }
  };

  // Modifier un avis
  const handleStartEdit = (review: ActivityReview) => {
    setEditingReviewId(review._id);
    setDraftRating(review.rating);
    setDraftComment(review.comment);
    setShowForm(true);
  };

  // Supprimer un avis
  const handleDeleteReview = (reviewId: string) => {
    Alert.alert(
      t('deleteReviewTitle'),
      t('deleteReviewConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteActivityReview(activity.id, reviewId);
              setReviews(res.reviews);
              const count = res.reviewsCount ?? res.reviews.length;
              setReviewsCount(count);
              setCurrentRating(count === 0 ? 0 : (res.averageRating ?? 0));
            } catch (err: any) {
              Alert.alert(t('error'), err.message || t('error'));
            }
          },
        },
      ]
    );
  };

  // Facebook Reactions avec mise à jour optimiste immédiate
  const handleReaction = async (reviewId: string, type: FacebookReactionType) => {
    setActivePickerReviewId(null);
    if (!currentUser) {
      Alert.alert(t('loginRequired'), t('loginRequiredReaction'));
      return;
    }

    // 1. Mise à jour optimiste immédiate dans l'état local
    const currentUserIdStr = currentUser.id ? String(currentUser.id) : '';
    setReviews((prevReviews) =>
      prevReviews.map((r) => {
        if (r._id !== reviewId) return r;
        const currentReactions = r.reactions || [];
        const existingIdx = currentReactions.findIndex(
          (rx) => (rx.user && String(rx.user) === currentUserIdStr) || rx.userName === currentUser.name
        );

        let newReactions = [...currentReactions];
        if (existingIdx > -1) {
          if (newReactions[existingIdx].type === type) {
            // Désactiver la réaction si clic sur la même
            newReactions.splice(existingIdx, 1);
          } else {
            // Changer le type de réaction
            newReactions[existingIdx] = {
              ...newReactions[existingIdx],
              type,
              userName: currentUser.name || newReactions[existingIdx].userName,
              userAvatar: currentUser.avatar || newReactions[existingIdx].userAvatar,
            };
          }
        } else {
          // Nouvelle réaction
          newReactions.push({
            user: currentUserIdStr,
            userName: currentUser.name || 'Utilisateur',
            userAvatar: currentUser.avatar || '',
            type,
          });
        }

        return {
          ...r,
          reactions: newReactions,
        };
      })
    );

    // 2. Synchronisation avec le serveur MongoDB
    try {
      const res = await reactToActivityReview(activity.id, reviewId, type);
      if (res && res.reviews) {
        setReviews(res.reviews);
      }
    } catch (err: any) {
      console.warn('[handleReaction] Erreur réseau/API réaction avis:', err);
    }
  };

  // Partager l'activité via activityActionService
  const handleShare = async () => {
    await activityActionService.shareActivity({
      name: localizedName,
      city: localizedCity,
      price: activity.price,
      rating: currentRating,
      reviewsCount,
      notRatedText: t('notRated'),
      freePriceText: t('freePrice'),
    });
  };

  // Appel téléphonique direct via activityActionService
  const handleCall = () => {
    if (activity.id) {
      void trackActivityInteraction(activity.id, 'phone_click');
    }
    activityActionService.callVenue(activity.phone, t('phoneContact'));
  };

  // WhatsApp direct via activityActionService
  const handleWhatsApp = () => {
    if (activity.id) {
      void trackActivityInteraction(activity.id, 'whatsapp_click');
    }
    activityActionService.openWhatsAppBooking({
      phone: activity.phone,
      whatsapp: activity.whatsapp,
      activityName: localizedName,
      fallbackLabel: t('whatsAppContact'),
    });
  };

  // Itinéraire GPS direct via activityActionService
  const handleOpenMapDirection = () => {
    if (activity.id) {
      void trackActivityInteraction(activity.id, 'maps_click');
    }
    activityActionService.openMapNavigation({
      latitude: activity.latitude,
      longitude: activity.longitude,
      label: localizedName || activity.name,
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      {isPartnerPreview && (
        <View
          style={[
            styles.previewTopBar,
            { paddingTop: Math.max(insets.top, 12) + 6 },
          ]}
        >
          <View style={styles.previewTopContent}>
            <View style={styles.previewIconPill}>
              <Ionicons name="eye-outline" size={16} color="#A855F7" />
            </View>
            <View style={styles.previewTextCol}>
              <Text style={styles.previewTitle}>Mode Aperçu Partenaire</Text>
              <Text style={styles.previewSubtitle}>Vue réelle visiteur sur Hamla</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.previewExitBtn}
            onPress={onBack}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.previewExitBtnText}>Quitter</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 96 + Math.max(insets.bottom, 12) },
        ]}
      >
        {/* ── 1. Image Hero & Top Actions (Retour, Partage, Favoris) ─────── */}
        <ActivityDetailHero
          activity={activity}
          localizedName={localizedName}
          localizedCity={localizedCity}
          isFavorite={isFavorite}
          isDark={isDark}
          theme={theme}
          onBack={onBack}
          onShare={handleShare}
          onToggleFavorite={onToggleFavorite}
        />

        {/* ── 2. Fiche de contenu principale (Hiérarchie naturelle) ─────── */}
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.cardBg,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)',
            },
          ]}
        >
          {/* 2.1 Identité immédiate : Catégorie, Réseaux, Titre, Prix, Note, Durée */}
          <ActivityDetailInfo
            activity={activity}
            localizedName={localizedName}
            localizedCategoryName={localizedCategoryName}
            localizedDescription={localizedDescription}
            rating={currentRating}
            reviewsCount={reviewsCount}
            theme={theme}
            isDark={isDark}
            language={language}
            mode="headerOnly"
          />

          {/* 2.2 Horaires d'ouverture / fermeture */}
          <ActivityScheduleBadge
            openingTime={activity.openingTime}
            closingTime={activity.closingTime}
            openDays={activity.openDays}
            isDark={isDark}
            language={language}
          />

          {/* 2.3 Bannière Offres & Privilèges (Promo, Fidélité, Événements) */}
          {(hasPromo || hasEvents) && (
            <ActivityProEventCard
              events={activity.events}
              promotion={activity.promotion}
              language={language}
              theme={theme}
              isDark={isDark}
              phone={activity.phone}
              whatsapp={activity.whatsapp}
              activityName={localizedName}
            />
          )}

          {hasLoyalty && (
            <ActivityLoyaltyCard
              activityId={activity.id}
              activityName={localizedName}
              loyaltyProgram={activity.loyaltyProgram}
              isLoggedIn={Boolean(currentUser)}
              currentUserId={currentUser?.id}
              isPartnerPreview={isPartnerPreview}
              theme={theme}
              isDark={isDark}
            />
          )}

          {/* 2.4 Barre d'onglets segmentée : Infos | La Carte (si dispo) | Avis */}
          <View
            style={[
              styles.tabBar,
              {
                backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'info' && [
                  styles.tabItemActive,
                  { backgroundColor: theme.cardBg },
                ],
              ]}
              onPress={() => setActiveTab('info')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="information-circle-outline"
                size={15}
                color={activeTab === 'info' ? theme.primary : theme.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'info' ? theme.textMain : theme.textMuted,
                    fontWeight: activeTab === 'info' ? '800' : '600',
                  },
                ]}
              >
                {language === 'ar' ? 'التفاصيل' : 'Infos'}
              </Text>
            </TouchableOpacity>

            {hasMenu && (
              <TouchableOpacity
                style={[
                  styles.tabItem,
                  activeTab === 'menu' && [
                    styles.tabItemActive,
                    { backgroundColor: theme.cardBg },
                  ],
                ]}
                onPress={() => setActiveTab('menu')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="restaurant-outline"
                  size={15}
                  color={activeTab === 'menu' ? theme.primary : theme.textMuted}
                />
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === 'menu' ? theme.textMain : theme.textMuted,
                      fontWeight: activeTab === 'menu' ? '800' : '600',
                    },
                  ]}
                >
                  {language === 'ar' ? 'قائمة الأسعار' : 'La Carte'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'reviews' && [
                  styles.tabItemActive,
                  { backgroundColor: theme.cardBg },
                ],
              ]}
              onPress={() => setActiveTab('reviews')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={15}
                color={activeTab === 'reviews' ? theme.primary : theme.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'reviews' ? theme.textMain : theme.textMuted,
                    fontWeight: activeTab === 'reviews' ? '800' : '600',
                  },
                ]}
              >
                {language === 'ar' ? `التقييمات (${reviewsCount})` : `Avis (${reviewsCount})`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 2.5 Contenu selon l'onglet sélectionné */}
          {activeTab === 'info' && (
            <View style={styles.tabPanel}>
              <ActivityDetailInfo
                activity={activity}
                localizedName={localizedName}
                localizedCategoryName={localizedCategoryName}
                localizedDescription={localizedDescription}
                rating={currentRating}
                reviewsCount={reviewsCount}
                theme={theme}
                isDark={isDark}
                language={language}
                mode="bodyOnly"
              />

              {electricityAlertActive && (
                <ActivityPowerCommunityReport
                  powerReports={powerReports}
                  partnerPowerBackupMode={activity.powerBackupMode}
                  isDark={isDark}
                  language={language}
                  isLoggedIn={Boolean(currentUser)}
                  onVote={handleVotePower}
                  votingLoading={isVotingPower}
                />
              )}
            </View>
          )}

          {activeTab === 'menu' && hasMenu && (
            <View style={styles.tabPanel}>
              <ActivityMenuSection
                menu={activity.menu}
                menuImageUrl={activity.menuImageUrl}
                menuUrl={activity.menuUrl}
                theme={theme}
                isDark={isDark}
                language={language}
              />
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.tabPanel}>
              <ActivityReviewsSection
                activityName={localizedName}
                reviews={reviews}
                currentRating={currentRating}
                isLoadingReviews={isLoadingReviews}
                currentUser={currentUser}
                theme={theme}
                isDark={isDark}
                language={language}
                showForm={showForm}
                editingReviewId={editingReviewId}
                draftRating={draftRating}
                draftComment={draftComment}
                isSubmitting={isSubmitting}
                activePickerReviewId={activePickerReviewId}
                onOpenForm={() => {
                  setEditingReviewId(null);
                  setDraftRating(5);
                  setDraftComment('');
                  setShowForm(true);
                }}
                onCloseForm={() => {
                  setShowForm(false);
                  setEditingReviewId(null);
                  setDraftRating(5);
                  setDraftComment('');
                }}
                onDraftRatingChange={setDraftRating}
                onDraftCommentChange={setDraftComment}
                onSubmitReview={handleSubmitReview}
                onStartEdit={handleStartEdit}
                onDeleteReview={handleDeleteReview}
                onToggleReaction={handleReaction}
                onTogglePicker={setActivePickerReviewId}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── 4. Barre d'action rapide fixe (GPS, Appeler, WhatsApp) ───────── */}
      <View
        style={[
          styles.stickyFooter,
          {
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.96)',
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.stickySecondaryBtn,
            {
              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
          onPress={handleOpenMapDirection}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate-outline" size={18} color={theme.primary} />
          <Text style={[styles.stickySecondaryText, { color: theme.textMain }]}>
            Itinéraire
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.stickySecondaryBtn,
            {
              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
          onPress={handleCall}
          activeOpacity={0.8}
        >
          <Ionicons name="call-outline" size={18} color={theme.textMain} />
          <Text style={[styles.stickySecondaryText, { color: theme.textMain }]}>
            Appeler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.stickyPrimaryBtn}
          onPress={handleWhatsApp}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
          <Text style={styles.stickyPrimaryText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 96,
  },
  sheet: {
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 24,
    gap: 12,
    minHeight: 430,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        }
      : {
          elevation: 0,
        }),
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    gap: 4,
    marginTop: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  tabItemActive: {
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 3,
        }
      : {
          elevation: 0,
        }),
  },
  tabText: {
    fontSize: 12,
  },
  tabPanel: {
    gap: 12,
  },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  stickySecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  stickySecondaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stickyPrimaryBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#16A34A',
  },
  stickyPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  previewTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#4338CA',
    zIndex: 99,
  },
  previewTopContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  previewIconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#312E81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTextCol: {
    flex: 1,
  },
  previewTitle: {
    color: '#F5F3FF',
    fontSize: 13,
    fontWeight: '800',
  },
  previewSubtitle: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '500',
  },
  previewExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  previewExitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
