import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { Activity, AuthUser } from '../types';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { ActivityDetailHero } from '../components/activity/ActivityDetailHero';
import { ActivityBookingHub } from '../components/activity/ActivityBookingHub';
import { ActivityDetailInfo } from '../components/activity/ActivityDetailInfo';
import { ActivityPowerCommunityReport } from '../components/activity/ActivityPowerCommunityReport';
import { ActivityProEventCard } from '../components/activity/ActivityProEventCard';
import { ActivityReviewsSection } from '../components/activity/ActivityReviewsSection';
import { ActivityScheduleBadge } from '../components/activity/ActivityScheduleBadge';
import {
  getActivityReviews,
  addActivityReview,
  updateActivityReview,
  deleteActivityReview,
  reactToActivityReview,
  getActivityLocalizedText,
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
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
}

export default function ActivityDetailsScreen({
  activity,
  isFavorite,
  currentUser,
  onBack,
  onToggleFavorite,
}: Props) {
  const { isDark, theme, language, electricityAlertActive } = useAppPreferences();
  const { t } = useTranslation();

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

  // Charger les avis depuis MongoDB
  const fetchReviews = useCallback(async () => {
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
    activityActionService.callVenue(activity.phone, t('phoneContact'));
  };

  // WhatsApp direct via activityActionService
  const handleWhatsApp = () => {
    activityActionService.openWhatsAppBooking({
      phone: activity.phone,
      whatsapp: activity.whatsapp,
      activityName: localizedName,
      fallbackLabel: t('whatsAppContact'),
    });
  };

  // Itinéraire GPS direct via activityActionService
  const handleOpenMapDirection = () => {
    activityActionService.openMapNavigation({
      latitude: activity.latitude,
      longitude: activity.longitude,
      label: localizedName || activity.name,
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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

        {/* ── 2. Fiche de contenu principale ────────────────────────────── */}
        <View style={[styles.sheet, { backgroundColor: theme.cardBg }]}>
          {/* Signalement communautaire du courant électrique (si activé par admin) */}
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

          {/* Horaires d'ouverture / fermeture */}
          <ActivityScheduleBadge
            openingTime={activity.openingTime}
            closingTime={activity.closingTime}
            openDays={activity.openDays}
            isDark={isDark}
            language={language}
          />

          {/* Promotions & Événements Partenaire Pro */}
          <ActivityProEventCard
            events={activity.events}
            promotion={activity.promotion}
            language={language}
          />

          {/* Infos principales : Catégorie, Titre, Prix, Note réelle, Durée, Description */}
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
          />

          {/* ── 3. Section Avis & Commentaires Dynamiques ──────────────────── */}
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

          {/* ── 4. Hub de réservation et contact direct (Appel, WhatsApp, GPS) ─ */}
          <ActivityBookingHub
            phone={activity.phone}
            whatsapp={activity.whatsapp}
            isFavorite={isFavorite}
            isDark={isDark}
            theme={theme}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
            onOpenMapDirection={handleOpenMapDirection}
            onShare={handleShare}
            onToggleFavorite={() => onToggleFavorite(activity.id)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  sheet: {
    marginTop: -26,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    minHeight: 430,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
});
