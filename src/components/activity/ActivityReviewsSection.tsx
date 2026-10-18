import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthUser } from '../../types';
import { ActivityReview, FacebookReactionType } from '../../services/activityService';
import { ThemeColors } from '../../theme/theme';
import { useTranslation } from '../../hooks/useTranslation';

export const FB_REACTIONS: {
  type: FacebookReactionType;
  emoji: string;
  labelFr: string;
  labelAr: string;
  color: string;
}[] = [
  { type: 'like', emoji: '👍', labelFr: "J'aime", labelAr: 'أعجبني', color: '#0D7CF2' },
  { type: 'love', emoji: '❤️', labelFr: "J'adore", labelAr: 'أحببته', color: '#FA383E' },
  { type: 'haha', emoji: '😆', labelFr: 'Haha', labelAr: 'هاها', color: '#F7B125' },
  { type: 'wow', emoji: '😮', labelFr: 'Wouah', labelAr: 'واو', color: '#F7B125' },
  { type: 'sad', emoji: '😢', labelFr: 'Triste', labelAr: 'حزين', color: '#F7B125' },
  { type: 'angry', emoji: '😡', labelFr: 'Grrr', labelAr: 'غاضب', color: '#E95F2B' },
];

function formatRelativeDate(isoDateString?: string, lang: string = 'fr'): string {
  if (!isoDateString) return '';
  const now = new Date();
  const date = new Date(isoDateString);
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return lang === 'ar' ? 'الآن' : "À l'instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return lang === 'ar' ? `منذ ${diffMin} د` : `Il y a ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return lang === 'ar' ? `منذ ${diffHours} س` : `Il y a ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return lang === 'ar' ? `منذ ${diffDays} ي` : `Il y a ${diffDays} j`;
  return date.toLocaleDateString();
}

interface ActivityReviewsSectionProps {
  activityName: string;
  reviews: ActivityReview[];
  currentRating: number;
  isLoadingReviews: boolean;
  currentUser?: AuthUser | null;
  theme: ThemeColors;
  isDark: boolean;
  language: string;
  showForm: boolean;
  editingReviewId: string | null;
  draftRating: number;
  draftComment: string;
  isSubmitting: boolean;
  activePickerReviewId: string | null;
  onOpenForm: () => void;
  onCloseForm: () => void;
  onDraftRatingChange: (val: number) => void;
  onDraftCommentChange: (val: string) => void;
  onSubmitReview: () => void;
  onStartEdit: (review: ActivityReview) => void;
  onDeleteReview: (reviewId: string) => void;
  onToggleReaction: (reviewId: string, reactionType: FacebookReactionType) => void;
  onTogglePicker: (reviewId: string | null) => void;
}

export const ActivityReviewsSection: React.FC<ActivityReviewsSectionProps> = ({
  activityName,
  reviews,
  currentRating,
  isLoadingReviews,
  currentUser,
  theme,
  isDark,
  language,
  showForm,
  editingReviewId,
  draftRating,
  draftComment,
  isSubmitting,
  activePickerReviewId,
  onOpenForm,
  onCloseForm,
  onDraftRatingChange,
  onDraftCommentChange,
  onSubmitReview,
  onStartEdit,
  onDeleteReview,
  onToggleReaction,
  onTogglePicker,
}) => {
  const { t } = useTranslation();
  const reviewsCount = reviews.length;
  const hasReviews = reviewsCount > 0;
  // Si 0 avis -> afficher 0 (pas 4.5 !)
  const displayRating = hasReviews ? currentRating : 0;

  // État de la modale "Qui a réagi"
  const [reactionsModalReview, setReactionsModalReview] = useState<ActivityReview | null>(null);
  const [reactionFilterTab, setReactionFilterTab] = useState<string>('all');

  const isReviewAuthor = (r: ActivityReview) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (r.user && String(r.user) === String(currentUser.id)) return true;
    if (r.userName && r.userName === currentUser.name) return true;
    return false;
  };

  const getUserReaction = (r: ActivityReview): FacebookReactionType | null => {
    if (!currentUser || !r.reactions) return null;
    const found = r.reactions.find(
      (re) => String(re.user) === String(currentUser.id) || re.userName === currentUser.name
    );
    return found ? found.type : null;
  };

  return (
    <View style={styles.container}>
      {/* ── En-tête de la section ────────────────────────────────────────── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
          ⭐ {t('reviewsTitle')}
        </Text>
        <Text
          style={[
            styles.reviewsCountBadge,
            {
              backgroundColor: isDark ? '#1E293B' : '#EEF2FF',
              color: theme.primary,
              borderColor: isDark ? '#334155' : '#C7D2FE',
            },
          ]}
        >
          {reviewsCount} {t('reviewsBadge')}
        </Text>
      </View>

      {/* ── Barre récapitulative des notes ────────────────────────────────── */}
      <View style={[styles.ratingBar, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.ratingScore}>
          <Text style={[styles.ratingBig, { color: theme.textMain }]}>
            {hasReviews ? displayRating : '0'}
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name={hasReviews && s <= Math.round(displayRating) ? 'star' : 'star-outline'}
                size={16}
                color={hasReviews ? '#F59E0B' : '#94A3B8'}
              />
            ))}
          </View>
          <Text style={[styles.ratingCount, { color: theme.textMuted }]}>
            {hasReviews
              ? `(${reviewsCount} ${t('reviewsBadge')})`
              : `(0 ${t('reviewsBadge')})`}
          </Text>
        </View>

        {/* Répartition des étoiles */}
        <View style={styles.ratingBarsCol}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => Math.round(r.rating) === star).length;
            const pct = reviewsCount > 0 ? (count / reviewsCount) * 100 : 0;
            return (
              <View key={star} style={styles.ratingBarRow}>
                <Text style={[styles.ratingBarLabel, { color: theme.textMuted }]}>{star}</Text>
                <Ionicons name="star" size={11} color="#F59E0B" />
                <View style={[styles.ratingBarTrack, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                  <View style={[styles.ratingBarFill, { width: `${pct}%`, backgroundColor: theme.primary }]} />
                </View>
                <Text style={[styles.ratingBarCount, { color: theme.textMuted }]}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Chargement */}
      {isLoadingReviews && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            {t('loadingReviews')}
          </Text>
        </View>
      )}

      {/* État vide si 0 avis */}
      {!isLoadingReviews && reviewsCount === 0 && (
        <View style={[styles.emptyReviewBox, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <Ionicons name="chatbubbles-outline" size={36} color={theme.primary} />
          <Text style={[styles.emptyReviewTitle, { color: theme.textMain }]}>
            {t('noReviewsYet')}
          </Text>
          <Text style={[styles.emptyReviewSubtitle, { color: theme.textMuted }]}>
            {t('noReviewsYetSubtitle')}
          </Text>
        </View>
      )}

      {/* ── Liste des cartes avis ─────────────────────────────────────────── */}
      {reviews.map((review) => {
        const isAuthor = isReviewAuthor(review);
        const userReaction = getUserReaction(review);
        const totalReactions = review.reactions?.length || 0;
        const uniqueReactionEmojis = Array.from(
          new Set(
            (review.reactions || []).map(
              (r) => FB_REACTIONS.find((f) => f.type === r.type)?.emoji || '👍'
            )
          )
        ).slice(0, 3);
        const activeFbDef = FB_REACTIONS.find((f) => f.type === userReaction);

        return (
          <View
            key={review._id}
            style={[
              styles.reviewCard,
              {
                backgroundColor: theme.cardBg,
                borderColor: isAuthor ? theme.primary : theme.cardBorder,
                borderWidth: isAuthor ? 1.5 : 1,
              },
            ]}
          >
            {/* Header: Avatar, Auteur, Date, Etoiles */}
            <View style={styles.reviewHeader}>
              <Image
                source={{
                  uri:
                    review.userAvatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
                }}
                style={styles.reviewAvatar}
              />
              <View style={styles.reviewMeta}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.reviewName, { color: theme.textMain }]}>
                    {review.userName || 'Utilisateur'}
                  </Text>
                  {isAuthor && (
                    <View style={[styles.authorBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.authorBadgeText}>
                        {language === 'ar' ? 'أنت' : 'Vous'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.reviewStarsRow}>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name={s <= review.rating ? 'star' : 'star-outline'}
                        size={13}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                  <Text style={[styles.reviewDate, { color: theme.textMuted }]}>
                    · {formatRelativeDate(review.createdAt, language)}
                  </Text>
                </View>
              </View>

              {/* Actions Auteur : Modifier / Supprimer */}
              {isAuthor && (
                <View style={styles.authorActions}>
                  <TouchableOpacity
                    onPress={() => onStartEdit(review)}
                    style={styles.iconActionBtn}
                  >
                    <Ionicons name="pencil" size={16} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDeleteReview(review._id)}
                    style={styles.iconActionBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Commentaire */}
            <Text style={[styles.reviewText, { color: theme.textMain }]}>{review.comment}</Text>

            {/* Synthèse des réactions & Qui a réagi */}
            {totalReactions > 0 && (
              <TouchableOpacity
                style={[
                  styles.reactionSummaryRow,
                  {
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(240, 247, 255, 0.9)',
                    borderColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                  },
                ]}
                onPress={() => {
                  setReactionsModalReview(review);
                  setReactionFilterTab('all');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.reactionEmojiStack}>
                  <Text style={{ fontSize: 13 }}>{uniqueReactionEmojis.join('')}</Text>
                </View>
                <Text style={[styles.reactionCountText, { color: theme.textMain }]}>
                  {totalReactions}{' '}
                  {totalReactions === 1
                    ? language === 'ar' ? 'تفاعل' : 'réaction'
                    : language === 'ar' ? 'تفاعلات' : 'réactions'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
                  <Text style={{ fontSize: 11, color: theme.primary, fontWeight: '700' }}>
                    {language === 'ar' ? 'من تفاعل؟' : 'Qui a réagi ?'}
                  </Text>
                  <Ionicons
                    name={language === 'ar' ? 'chevron-back' : 'chevron-forward'}
                    size={12}
                    color={theme.primary}
                  />
                </View>
              </TouchableOpacity>
            )}

            {/* Popup Réactions Facebook */}
            {activePickerReviewId === review._id && (
              <View style={[styles.fbPickerContainer, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                {FB_REACTIONS.map((fb) => (
                  <TouchableOpacity
                    key={fb.type}
                    onPress={() => {
                      onToggleReaction(review._id, fb.type);
                      onTogglePicker(null);
                    }}
                    style={[
                      styles.fbPickerItem,
                      userReaction === fb.type && styles.fbPickerItemActive,
                    ]}
                  >
                    <Text style={styles.fbPickerEmoji}>{fb.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Footer Carte : Bouton Réaction & Partager */}
            <View style={[styles.reviewFooter, { borderTopColor: isDark ? '#334155' : '#F1F5F9' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={[
                    styles.reactButton,
                    userReaction && {
                      backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.12)',
                      borderColor: theme.primary,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => {
                    // Clic direct : si déjà réagi -> retire la réaction, sinon like direct
                    if (userReaction) {
                      onToggleReaction(review._id, userReaction);
                    } else {
                      onToggleReaction(review._id, 'like');
                    }
                  }}
                  onLongPress={() => onTogglePicker(activePickerReviewId === review._id ? null : review._id)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 16 }}>{activeFbDef ? activeFbDef.emoji : '👍'}</Text>
                  <Text
                    style={[
                      styles.reactButtonText,
                      { color: activeFbDef ? activeFbDef.color : theme.textMuted },
                    ]}
                  >
                    {activeFbDef
                      ? language === 'ar' ? activeFbDef.labelAr : activeFbDef.labelFr
                      : language === 'ar' ? 'أعجبني' : "J'aime"}
                  </Text>
                </TouchableOpacity>

                {/* Petite flèche pour ouvrir le sélecteur complet */}
                <TouchableOpacity
                  style={{ paddingHorizontal: 6, paddingVertical: 6 }}
                  onPress={() => onTogglePicker(activePickerReviewId === review._id ? null : review._id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={activePickerReviewId === review._id ? 'chevron-up' : 'chevron-down'}
                    size={13}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.reactButton}
                onPress={() => {
                  Share.share({
                    message: `"${review.comment}" - Avis de ${review.userName} sur ${activityName} ⭐ ${review.rating}/5 (via Win)`,
                  });
                }}
              >
                <Ionicons name="arrow-redo-outline" size={16} color={theme.textMuted} />
                <Text style={[styles.reactButtonText, { color: theme.textMuted }]}>
                  {language === 'ar' ? 'مشاركة' : 'Partager'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* ── Formulaire d'ajout / modification d'avis ──────────────────────── */}
      {!showForm ? (
        <TouchableOpacity
          style={[styles.writeReviewBtn, { borderColor: theme.primary, backgroundColor: isDark ? '#1E293B' : '#EEF2FF' }]}
          onPress={onOpenForm}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={18} color={theme.primary} />
          <Text style={[styles.writeReviewBtnText, { color: theme.primary }]}>
            {t('writeReview')}
          </Text>
        </TouchableOpacity>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.reviewFormBox, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
        >
          <Text style={[styles.formTitle, { color: theme.textMain }]}>
            {editingReviewId ? `✏️ ${t('updateReview')}` : `✍️ ${t('writeReview')}`}
          </Text>

          {/* Choix des étoiles */}
          <Text style={[styles.formLabel, { color: theme.textMuted }]}>
            {t('yourRating')}
          </Text>
          <View style={styles.interactiveStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => onDraftRatingChange(star)}
                style={styles.starTouch}
              >
                <Ionicons
                  name={star <= draftRating ? 'star' : 'star-outline'}
                  size={32}
                  color={star <= draftRating ? '#F59E0B' : '#CBD5E1'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Champ commentaire */}
          <Text style={[styles.formLabel, { color: theme.textMuted }]}>
            {t('yourComment')}
          </Text>
          <TextInput
            style={[
              styles.commentInput,
              {
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                borderColor: theme.cardBorder,
                color: theme.textMain,
              },
            ]}
            placeholder={t('writeCommentPlaceholder')}
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={4}
            value={draftComment}
            onChangeText={onDraftCommentChange}
          />

          {/* Boutons d'action */}
          <View style={styles.formActionsRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.cardBorder }]}
              onPress={onCloseForm}
              disabled={isSubmitting}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }, isSubmitting && { opacity: 0.7 }]}
              onPress={onSubmitReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={editingReviewId ? 'checkmark-circle' : 'send'}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.submitBtnText}>
                    {editingReviewId ? t('updateReview') : t('submitReview')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ── Modal "Qui a réagi" (Détail complet des utilisateurs) ──────────── */}
      <Modal
        visible={!!reactionsModalReview}
        transparent
        animationType="slide"
        onRequestClose={() => setReactionsModalReview(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalBackdropTouch}
            activeOpacity={1}
            onPress={() => setReactionsModalReview(null)}
          />
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            {/* Barre de drag */}
            <View style={[styles.sheetHandle, { backgroundColor: isDark ? '#334155' : '#CBD5E1' }]} />

            {/* En-tête Modal */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 18 }}>❤️👍</Text>
                <Text style={[styles.modalTitle, { color: theme.textMain }]}>
                  {language === 'ar' ? 'من تفاعل مع هذا التعليق؟' : 'Qui a réagi à ce commentaire ?'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                ]}
                onPress={() => setReactionsModalReview(null)}
              >
                <Ionicons name="close" size={18} color={theme.textMain} />
              </TouchableOpacity>
            </View>

            {/* Onglets Filtres par réaction */}
            {reactionsModalReview && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterTabsContainer}
              >
                {/* Onglet "Tous" */}
                <TouchableOpacity
                  style={[
                    styles.filterTab,
                    {
                      backgroundColor:
                        reactionFilterTab === 'all'
                          ? theme.primary
                          : isDark
                          ? '#1E293B'
                          : '#F1F5F9',
                    },
                  ]}
                  onPress={() => setReactionFilterTab('all')}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      { color: reactionFilterTab === 'all' ? '#FFFFFF' : theme.textMuted },
                    ]}
                  >
                    {language === 'ar' ? 'الكل' : 'Tous'} ({reactionsModalReview.reactions?.length || 0})
                  </Text>
                </TouchableOpacity>

                {/* Onglets par type de réaction présente */}
                {FB_REACTIONS.filter((fb) =>
                  reactionsModalReview.reactions?.some((r) => r.type === fb.type)
                ).map((fb) => {
                  const count =
                    reactionsModalReview.reactions?.filter((r) => r.type === fb.type).length || 0;
                  const isActive = reactionFilterTab === fb.type;
                  return (
                    <TouchableOpacity
                      key={fb.type}
                      style={[
                        styles.filterTab,
                        {
                          backgroundColor: isActive
                            ? theme.primary
                            : isDark
                            ? '#1E293B'
                            : '#F1F5F9',
                        },
                      ]}
                      onPress={() => setReactionFilterTab(fb.type)}
                    >
                      <Text style={{ fontSize: 13, marginRight: 4 }}>{fb.emoji}</Text>
                      <Text
                        style={[
                          styles.filterTabText,
                          { color: isActive ? '#FFFFFF' : theme.textMuted },
                        ]}
                      >
                        {count}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Liste des utilisateurs ayant réagi */}
            <ScrollView
              style={{ maxHeight: 380 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            >
              {(() => {
                if (!reactionsModalReview) return null;
                const filteredReactions = (reactionsModalReview.reactions || []).filter((r) => {
                  if (reactionFilterTab === 'all') return true;
                  return r.type === reactionFilterTab;
                });

                if (filteredReactions.length === 0) {
                  return (
                    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                      <Text style={{ fontSize: 24, marginBottom: 8 }}>🔍</Text>
                      <Text style={{ color: theme.textMuted, fontSize: 13 }}>
                        {language === 'ar'
                          ? 'لا توجد تفاعلات في هذا القسم'
                          : 'Aucune réaction dans cette catégorie'}
                      </Text>
                    </View>
                  );
                }

                return filteredReactions.map((reactionItem, idx) => {
                  const fbDef = FB_REACTIONS.find((f) => f.type === reactionItem.type);
                  const isCurrent =
                    currentUser &&
                    (String(reactionItem.user) === String(currentUser.id) ||
                      reactionItem.userName === currentUser.name);

                  return (
                    <View
                      key={`${reactionItem.user || reactionItem.userName}-${idx}`}
                      style={[
                        styles.reactionUserRow,
                        {
                          borderBottomColor: isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.05)',
                        },
                      ]}
                    >
                      {/* Avatar avec Badge Emoji en superposition */}
                      <View style={styles.userAvatarContainer}>
                        {reactionItem.userAvatar ? (
                          <Image
                            source={{ uri: reactionItem.userAvatar }}
                            style={styles.userAvatarImg}
                          />
                        ) : (
                          <View
                            style={[
                              styles.userAvatarFallback,
                              { backgroundColor: isDark ? '#1E293B' : '#E0F2FE' },
                            ]}
                          >
                            <Text
                              style={{
                                color: theme.primary,
                                fontWeight: '800',
                                fontSize: 14,
                              }}
                            >
                              {(reactionItem.userName || 'U').charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <View style={styles.reactionBadgeMini}>
                          <Text style={{ fontSize: 12 }}>{fbDef ? fbDef.emoji : '👍'}</Text>
                        </View>
                      </View>

                      {/* Nom de l'utilisateur & Type de réaction */}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text
                            style={[
                              styles.reactionUserName,
                              { color: theme.textMain },
                            ]}
                          >
                            {reactionItem.userName || 'Utilisateur'}
                          </Text>
                          {isCurrent && (
                            <View
                              style={[
                                styles.authorBadge,
                                { backgroundColor: theme.primary },
                              ]}
                            >
                              <Text style={styles.authorBadgeText}>
                                {language === 'ar' ? 'أنت' : 'Vous'}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: fbDef ? fbDef.color : theme.textMuted,
                            marginTop: 2,
                          }}
                        >
                          {fbDef
                            ? language === 'ar'
                              ? fbDef.labelAr
                              : fbDef.labelFr
                            : "J'aime"}
                        </Text>
                      </View>
                    </View>
                  );
                });
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  reviewsCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
    borderWidth: 1,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 16,
  },
  ratingScore: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  ratingBig: {
    fontSize: 34,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  ratingCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  ratingBarsCol: {
    flex: 1,
    gap: 4,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    width: 10,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  ratingBarCount: {
    fontSize: 10,
    fontWeight: '600',
    width: 16,
    textAlign: 'right',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    marginTop: 8,
  },
  emptyReviewBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  emptyReviewTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyReviewSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  reviewCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewMeta: {
    flex: 1,
    gap: 2,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '800',
  },
  authorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  authorBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
  },
  authorActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconActionBtn: {
    padding: 6,
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 20,
  },
  reactionSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionEmojiStack: {
    flexDirection: 'row',
  },
  reactionCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fbPickerContainer: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  fbPickerItem: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  fbPickerItemActive: {
    transform: [{ scale: 1.2 }],
  },
  fbPickerEmoji: {
    fontSize: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  reactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  reactButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  writeReviewBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  reviewFormBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    gap: 10,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  interactiveStars: {
    flexDirection: 'row',
    gap: 8,
  },
  starTouch: {
    padding: 2,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '80%',
    paddingTop: 12,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  filterTabActive: {
    elevation: 2,
    shadowColor: '#0284C7',
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reactionUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userAvatarContainer: {
    width: 42,
    height: 42,
    position: 'relative',
  },
  userAvatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  userAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionBadgeMini: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  reactionUserName: {
    fontSize: 14,
    fontWeight: '700',
  },
});
