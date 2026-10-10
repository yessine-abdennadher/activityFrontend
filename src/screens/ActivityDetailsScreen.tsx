import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Activity, AuthUser } from '../types';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { useTranslation } from '../hooks/useTranslation';
import { LikeButton } from '../components/ui/LikeButton';
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
import { getLocalizedCategories } from '../constants/categories';

interface Props {
  activity: Activity;
  isFavorite: boolean;
  currentUser?: AuthUser | null;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
}

// ── Facebook Reaction Definitions ──────────────────────────────────────────
const FB_REACTIONS: {
  type: FacebookReactionType;
  emoji: string;
  labelFr: string;
  labelAr: string;
  color: string;
}[] = [
  { type: 'like', emoji: '👍', labelFr: "J'aime", labelAr: 'أعجبني', color: '#0D7CF2' },
  { type: 'love', emoji: '❤️', labelFr: "J'adore", labelAr: 'أحببته', color: '#E11D48' },
  { type: 'haha', emoji: '😂', labelFr: 'Haha', labelAr: 'هاها', color: '#F59E0B' },
  { type: 'wow', emoji: '😮', labelFr: 'Wouah', labelAr: 'واو', color: '#F59E0B' },
  { type: 'sad', emoji: '😢', labelFr: 'Triste', labelAr: 'أحزنني', color: '#F59E0B' },
  { type: 'angry', emoji: '😡', labelFr: 'Grr', labelAr: 'أغضبني', color: '#EF4444' },
];

// Helper to format dynamic relative dates in ar/fr/en
function formatRelativeDate(dateString?: string, language: string = 'ar'): string {
  if (!dateString) return language === 'ar' ? 'مؤخراً' : 'Récemment';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return language === 'ar' ? 'مؤخراً' : 'Récemment';

  const now = new Date();
  const diffInSeconds = Math.max(1, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (language === 'ar') {
    if (diffInSeconds < 60) return 'الآن';
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) {
      if (minutes === 1) return 'منذ دقيقة';
      if (minutes === 2) return 'منذ دقيقتين';
      if (minutes <= 10) return `منذ ${minutes} دقائق`;
      return `منذ ${minutes} دقيقة`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      if (hours === 1) return 'منذ ساعة';
      if (hours === 2) return 'منذ ساعتين';
      if (hours <= 10) return `منذ ${hours} ساعات`;
      return `منذ ${hours} ساعة`;
    }
    const days = Math.floor(hours / 24);
    if (days < 30) {
      if (days === 1) return 'أمس';
      if (days === 2) return 'منذ يومين';
      if (days <= 10) return `منذ ${days} أيام`;
      return `منذ ${days} يوماً`;
    }
    const months = Math.floor(days / 30);
    if (months < 12) {
      if (months === 1) return 'منذ شهر';
      if (months === 2) return 'منذ شهرين';
      return `منذ ${months} أشهر`;
    }
    return `منذ أكثر من سنة`;
  }

  // French default / fallback
  if (diffInSeconds < 60) return "À l'instant";
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hier';
  if (days < 30) return `Il y a ${days} j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Il y a ${months} mois`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ActivityDetailsScreen({
  activity,
  isFavorite,
  currentUser,
  onBack,
  onToggleFavorite,
}: Props) {
  const { isDark, language } = useAppPreferences();
  const { t } = useTranslation();

  // ── Localized Activity Content ───────────────────────────────────────────
  const localizedName = getActivityLocalizedText(activity, 'name', language as any);
  const localizedDescription = getActivityLocalizedText(activity, 'description', language as any);
  const localizedLocation = getActivityLocalizedText(activity, 'location', language as any);
  const localizedCity = getActivityLocalizedText(activity, 'city', language as any);

  const localizedCategoryName = useMemo(() => {
    if (!activity.category) return '';
    const list = getLocalizedCategories(language);
    const match = list.find(
      (c) =>
        c.id.toLowerCase() === activity.category.toLowerCase() ||
        c.nameAr === activity.category ||
        c.nameFr === activity.category ||
        c.nameEn === activity.category
    );
    return match ? match.name : activity.category;
  }, [activity.category, language]);

  // ── Dynamic State from MongoDB ───────────────────────────────────────────
  const [reviews, setReviews] = useState<ActivityReview[]>([]);
  const [currentRating, setCurrentRating] = useState<number>(activity.rating || 4.5);
  const [reviewsCount, setReviewsCount] = useState<number>(activity.reviewsCount || 0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Form State (New or Edit)
  const [showForm, setShowForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [draftRating, setDraftRating] = useState(5);
  const [draftComment, setDraftComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Reaction Picker popup ID (which review card is opening the picker)
  const [activePickerReviewId, setActivePickerReviewId] = useState<string | null>(null);

  // Load reviews from MongoDB
  const fetchReviews = useCallback(async () => {
    setIsLoadingReviews(true);
    try {
      const data = await getActivityReviews(activity.id);
      setReviews(data);
      if (data.length > 0) {
        const sum = data.reduce((acc, r) => acc + (r.rating || 0), 0);
        setCurrentRating(Number((sum / data.length).toFixed(1)));
        setReviewsCount(data.length);
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

  // Handle Create or Edit Submit
  const handleSubmitReview = async () => {
    if (!currentUser) {
      Alert.alert(
        language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Connexion requise',
        language === 'ar'
          ? 'يجب عليك تسجيل الدخول لإضافة أو تعديل تقييمك.'
          : 'Vous devez être connecté pour laisser ou modifier un avis.'
      );
      return;
    }

    if (draftRating === 0) {
      Alert.alert(
        language === 'ar' ? 'التقييم بالنجوم مطلوب' : 'Note requise',
        language === 'ar' ? 'يرجى اختيار عدد النجوم.' : 'Veuillez sélectionner une note.'
      );
      return;
    }

    if (draftComment.trim().length < 5) {
      Alert.alert(
        language === 'ar' ? 'التعليق قصير جداً' : 'Commentaire trop court',
        language === 'ar' ? 'يرجى كتابة 5 أحرف على الأقل.' : 'Écrivez au moins 5 caractères.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingReviewId) {
        // Update existing review
        const result = await updateActivityReview(
          activity.id,
          editingReviewId,
          draftRating,
          draftComment.trim()
        );
        setReviews(result.reviews);
        if (result.averageRating !== undefined) setCurrentRating(result.averageRating);
        if (result.reviewsCount !== undefined) setReviewsCount(result.reviewsCount);
        Alert.alert(
          language === 'ar' ? 'تم التعديل بنجاح ✅' : 'Succès ✅',
          language === 'ar' ? 'تم تحديث تعليقك بنجاح.' : 'Votre avis a été modifié avec succès.'
        );
      } else {
        // Create new review
        const result = await addActivityReview(
          activity.id,
          draftRating,
          draftComment.trim()
        );
        setReviews(result.reviews);
        if (result.averageRating !== undefined) setCurrentRating(result.averageRating);
        if (result.reviewsCount !== undefined) setReviewsCount(result.reviewsCount);
        Alert.alert(
          language === 'ar' ? 'تم النشر بنجاح 🎉' : 'Succès 🎉',
          language === 'ar' ? 'شكراً لمشاركتك رأيك معنا!' : 'Merci d\'avoir partagé votre avis !'
        );
      }

      // Reset form
      setShowForm(false);
      setEditingReviewId(null);
      setDraftComment('');
      setDraftRating(5);
    } catch (err: any) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Erreur',
        err.message || (language === 'ar' ? 'حدث خطأ أثناء حفظ التقييم.' : 'Impossible d\'enregistrer l\'avis.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing a review
  const handleStartEdit = (review: ActivityReview) => {
    setEditingReviewId(review._id);
    setDraftRating(review.rating);
    setDraftComment(review.comment);
    setShowForm(true);
  };

  // Delete a review
  const handleDeleteReview = (reviewId: string) => {
    Alert.alert(
      language === 'ar' ? 'حذف التعليق' : 'Supprimer le commentaire',
      language === 'ar'
        ? 'هل أنت متأكد من رغبتك في حذف هذا التعليق نهائياً؟'
        : 'Êtes-vous sûr de vouloir supprimer définitivement cet avis ?',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Annuler', style: 'cancel' },
        {
          text: language === 'ar' ? 'حذف' : 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteActivityReview(activity.id, reviewId);
              setReviews(res.reviews);
              if (res.averageRating !== undefined) setCurrentRating(res.averageRating);
              if (res.reviewsCount !== undefined) setReviewsCount(res.reviewsCount);
            } catch (err: any) {
              Alert.alert(
                language === 'ar' ? 'خطأ' : 'Erreur',
                err.message || 'Impossible de supprimer l\'avis.'
              );
            }
          },
        },
      ]
    );
  };

  // Handle Facebook reaction toggle
  const handleReaction = async (reviewId: string, type: FacebookReactionType) => {
    setActivePickerReviewId(null);
    if (!currentUser) {
      Alert.alert(
        language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Connexion requise',
        language === 'ar'
          ? 'يجب عليك تسجيل الدخول للتفاعل مع التعليقات.'
          : 'Connectez-vous pour réagir aux commentaires.'
      );
      return;
    }

    try {
      const res = await reactToActivityReview(activity.id, reviewId, type);
      setReviews(res.reviews);
    } catch (err: any) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Erreur',
        err.message || 'Impossible d\'enregistrer votre réaction.'
      );
    }
  };

  // Social Share Handler
  const handleShare = async () => {
    try {
      await Share.share({
        title: activity.name,
        message:
          language === 'ar'
            ? `🌟 اكتشف نشاط "${activity.name}" في ${activity.city}!\nالسعر: ${
                activity.price === 0 ? 'مجاني' : `${activity.price} د.ت`
              }\nالتقييم: ⭐ ${currentRating}/5 (${reviewsCount} تقييم)\nحمل تطبيق ActivityTN لاكتشاف أفضل الأنشطة في تونس 🇹🇳`
            : `🌟 Découvrez l'activité "${activity.name}" à ${activity.city} !\nPrix: ${
                activity.price === 0 ? 'Gratuit' : `${activity.price} DT`
              }\nNote: ⭐ ${currentRating}/5 (${reviewsCount} avis)\nDécouvrez plus sur ActivityTN 🇹🇳`,
      });
    } catch (err) {
      console.warn('[Share] Error sharing activity:', err);
    }
  };

  // Direct Phone Call Handler
  const handleCall = () => {
    const rawPhone = activity.phone || '+216 74 200 100';
    const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
    const url = `tel:${cleanPhone}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert(
            language === 'ar' ? 'تنبيه' : 'Information',
            language === 'ar'
              ? `رقم الهاتف للتواصل: ${rawPhone}`
              : `Numéro de téléphone : ${rawPhone}`
          );
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => {
        console.warn('[ActivityDetails] Erreur appel:', err);
        Alert.alert(
          language === 'ar' ? 'رقم الهاتف' : 'Contact Téléphone',
          `${rawPhone}`
        );
      });
  };

  // Direct WhatsApp Booking Handler
  const handleWhatsApp = () => {
    const rawWa = activity.whatsapp || activity.phone || '+216 98 200 100';
    const cleanWa = rawWa.replace(/[^\d]/g, '');
    const defaultMsg =
      language === 'ar'
        ? `السلام عليكم، أود الاستفسار والحجز لنشاط "${activity.name}" عبر تطبيق ActivityTN 🇹🇳.`
        : `Bonjour, je souhaite avoir des informations et réserver pour l'activité "${activity.name}" via l'application ActivityTN 🇹🇳.`;
    const url = `https://wa.me/${cleanWa}?text=${encodeURIComponent(defaultMsg)}`;

    Linking.openURL(url).catch((err) => {
      console.warn('[ActivityDetails] Erreur WhatsApp:', err);
      Alert.alert(
        'WhatsApp',
        language === 'ar'
          ? `رقم الواتساب للحجز: ${rawWa}`
          : `Numéro WhatsApp pour réserver : ${rawWa}`
      );
    });
  };

  // Direct GPS Map Direction Handler
  const handleOpenMapDirection = () => {
    const lat = activity.latitude || 34.7406;
    const lng = activity.longitude || 10.7603;
    const label = encodeURIComponent(activity.name || 'ActivityTN');

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const nativeMapUrl = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      default: googleMapsUrl,
    }) || googleMapsUrl;

    Linking.canOpenURL(nativeMapUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(nativeMapUrl);
        }
        return Linking.openURL(googleMapsUrl);
      })
      .catch(() => {
        Linking.openURL(googleMapsUrl);
      });
  };

  // Check if current user is the owner of a review
  const isReviewAuthor = (review: ActivityReview) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (review.user && String(review.user) === String(currentUser.id)) return true;
    if (review.userName && review.userName === currentUser.name) return true;
    return false;
  };

  // Get current user's reaction for a review
  const getUserReaction = (review: ActivityReview): FacebookReactionType | null => {
    if (!currentUser || !review.reactions) return null;
    const found = review.reactions.find(
      (r) => String(r.user) === String(currentUser.id) || r.userName === currentUser.name
    );
    return found ? found.type : null;
  };

  return (
    <View style={[styles.screen, isDark && styles.darkScreen]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* ── Hero image ─────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <Image source={{ uri: activity.image }} style={styles.heroImage} />
          <View style={styles.heroShade} />
          <View style={styles.topActions}>
            <TouchableOpacity
              accessibilityLabel={t('back')}
              accessibilityRole="button"
              onPress={onBack}
              style={styles.actionButton}
            >
              <Ionicons name="arrow-back" size={22} color="#1E1B4B" />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                accessibilityLabel={t('share')}
                accessibilityRole="button"
                onPress={handleShare}
                style={styles.actionButton}
              >
                <Ionicons name="share-social-outline" size={20} color="#C026D3" />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                accessibilityRole="button"
                onPress={() => onToggleFavorite(activity.id)}
                style={styles.actionButton}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFavorite ? '#E11D48' : '#1E1B4B'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroText}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#FCE7F3" />
              <Text style={styles.location}>
                {localizedCity} · {activity.distance}
              </Text>
            </View>
            <Text style={styles.heroTitle}>{localizedName}</Text>
          </View>
        </View>

        {/* ── Content sheet ───────────────────────────────────────────────── */}
        <View style={[styles.sheet, isDark && styles.darkSurface]}>
          {/* Heading */}
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}>
              {Boolean(localizedCategoryName) && (
                <View style={styles.category}>
                  <Ionicons name="sparkles-outline" size={16} color="#A21CAF" />
                  <Text style={styles.categoryText}>{localizedCategoryName}</Text>
                </View>
              )}
              <Text style={[styles.title, isDark && styles.darkText]}>{localizedName}</Text>
            </View>
            <Text style={styles.price}>
              {activity.price === 0
                ? language === 'ar'
                  ? 'مجاني'
                  : language === 'fr'
                  ? 'Gratuit'
                  : 'Free'
                : `${activity.price} DT`}
            </Text>
          </View>

          {/* Interactive Likes Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginVertical: 14, flexWrap: 'wrap' }}>
            <LikeButton variant="heart" initialCount={reviewsCount > 0 ? reviewsCount * 7 : 128} />
            <LikeButton variant="thumbs-up" initialCount={reviewsCount > 0 ? reviewsCount * 5 : 85} />
          </View>

          {/* Info grid */}
          <View style={[styles.infoGrid, isDark && { borderColor: '#374151' }]}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, isDark && { backgroundColor: '#374151' }]}>
                <Ionicons name="time-outline" size={20} color="#C026D3" />
              </View>
              <Text style={[styles.infoLabel, isDark && styles.darkMuted]}>
                {language === 'ar' ? 'المدة' : language === 'fr' ? 'Durée' : 'Duration'}
              </Text>
              <Text style={[styles.infoValue, isDark && styles.darkText]}>{activity.duration}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, isDark && { backgroundColor: '#374151' }]}>
                <Ionicons name="star" size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.infoLabel, isDark && styles.darkMuted]}>
                {language === 'ar' ? 'التقييم' : language === 'fr' ? 'Note' : 'Rating'}
              </Text>
              <Text style={[styles.infoValue, isDark && styles.darkText]}>{currentRating} / 5</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, isDark && { backgroundColor: '#374151' }]}>
                <Ionicons name="location-outline" size={20} color="#C026D3" />
              </View>
              <Text style={[styles.infoLabel, isDark && styles.darkMuted]}>
                {language === 'ar' ? 'المسافة' : 'Distance'}
              </Text>
              <Text style={[styles.infoValue, isDark && styles.darkText]}>{activity.distance}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>{t('about')}</Text>
          <Text style={[styles.description, isDark && styles.darkMuted]}>
            {localizedDescription ||
              (language === 'ar'
                ? 'نشاط مثالي للاستمتاع بوقت مميز في صفاقس وتونس.'
                : 'Une activité idéale pour profiter d’un bon moment à Sfax et en Tunisie.')}
          </Text>

          {/* Why this activity */}
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>{t('whyActivity')}</Text>
          <View style={styles.reasonList}>
            <View style={styles.reasonRow}>
              <Ionicons name="people-outline" size={19} color="#C026D3" />
              <Text style={[styles.reasonText, isDark && styles.darkMuted]}>
                {t('suitableFor')} {activity.peopleMin ?? 1}–{activity.peopleMax ?? 8} {t('people')}
              </Text>
            </View>
            <View style={styles.reasonRow}>
              <Ionicons name="wallet-outline" size={19} color="#C026D3" />
              <Text style={[styles.reasonText, isDark && styles.darkMuted]}>{t('budgetSuitable')}</Text>
            </View>
            <View style={styles.reasonRow}>
              <Ionicons name="navigate-outline" size={19} color="#C026D3" />
              <Text style={[styles.reasonText, isDark && styles.darkMuted]}>
                {activity.distance} · {t('nearbyDistance')}
              </Text>
            </View>
          </View>

          {/* ── User Reviews Section (Dynamic MongoDB) ─────────────────────────── */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText, { marginTop: 24, marginBottom: 0 }]}>
              {language === 'ar' ? '⭐ التقييمات والتعليقات' : '⭐ Avis & Commentaires'}
            </Text>
            <Text style={[styles.reviewsCountBadge, { backgroundColor: isDark ? '#374151' : '#FDF4FF', color: '#C026D3' }]}>
              {reviews.length} {language === 'ar' ? 'تعليق' : 'avis'}
            </Text>
          </View>

          {/* Rating Summary Bar */}
          <View style={[styles.ratingBar, isDark && styles.darkRatingBar]}>
            <View style={styles.ratingScore}>
              <Text style={styles.ratingBig}>{currentRating}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={s <= Math.round(currentRating) ? 'star' : 'star-outline'}
                    size={16}
                    color="#F59E0B"
                  />
                ))}
              </View>
              <Text style={styles.ratingCount}>
                ({reviews.length} {language === 'ar' ? 'تقييم حقيقي' : 'avis réels'})
              </Text>
            </View>

            <View style={styles.ratingBarsCol}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <View key={star} style={styles.ratingBarRow}>
                    <Text style={[styles.ratingBarLabel, isDark && styles.darkMuted]}>{star}</Text>
                    <Ionicons name="star" size={11} color="#F59E0B" />
                    <View style={[styles.ratingBarTrack, isDark && { backgroundColor: '#374151' }]}>
                      <View style={[styles.ratingBarFill, { width: `${pct}%` as any }]} />
                    </View>
                    <Text style={styles.ratingBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Loading Indicator */}
          {isLoadingReviews && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#C026D3" />
              <Text style={{ color: isDark ? '#9CA3AF' : '#64748B', fontSize: 12, marginTop: 8 }}>
                {language === 'ar' ? 'جاري تحميل التعليقات...' : 'Chargement des avis...'}
              </Text>
            </View>
          )}

          {/* No Reviews Empty State */}
          {!isLoadingReviews && reviews.length === 0 && (
            <View style={[styles.emptyReviewBox, isDark && { backgroundColor: '#111827', borderColor: '#374151' }]}>
              <Ionicons name="chatbubbles-outline" size={36} color="#C026D3" />
              <Text style={[styles.emptyReviewTitle, isDark && styles.darkText]}>
                {language === 'ar' ? 'لا توجد تعليقات بعد' : 'Aucun avis pour le moment'}
              </Text>
              <Text style={[styles.emptyReviewSubtitle, isDark && styles.darkMuted]}>
                {language === 'ar'
                  ? 'كن أول من يشارك تجربته ويقيّم هذا النشاط بالنجوم والتفاعلات!'
                  : 'Soyez le premier à donner votre note et laisser un commentaire !'}
              </Text>
            </View>
          )}

          {/* Dynamic Review Cards */}
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
                  isDark && styles.darkReviewCard,
                  isAuthor && { borderColor: '#C026D3', borderWidth: 1.5 },
                ]}
              >
                {/* Header: Avatar, Name, Relative Date, Stars, Edit/Delete */}
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
                      <Text style={[styles.reviewName, isDark && styles.darkText]}>
                        {review.userName || 'Utilisateur'}
                      </Text>
                      {isAuthor && (
                        <View style={styles.authorBadge}>
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
                      <Text style={[styles.reviewDate, isDark && styles.darkMuted]}>
                        · {formatRelativeDate(review.createdAt, language)}
                      </Text>
                    </View>
                  </View>

                  {/* Edit / Delete Buttons for Author */}
                  {isAuthor && (
                    <View style={styles.authorActions}>
                      <TouchableOpacity
                        onPress={() => handleStartEdit(review)}
                        style={styles.iconActionBtn}
                        accessibilityLabel="Modifier"
                      >
                        <Ionicons name="pencil" size={16} color="#0D7CF2" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteReview(review._id)}
                        style={styles.iconActionBtn}
                        accessibilityLabel="Supprimer"
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Comment Content */}
                <Text style={[styles.reviewText, isDark && styles.darkMuted]}>{review.comment}</Text>

                {/* Reaction Summary & Counts */}
                {totalReactions > 0 && (
                  <View style={styles.reactionSummaryRow}>
                    <View style={styles.reactionEmojiStack}>
                      <Text style={{ fontSize: 13 }}>{uniqueReactionEmojis.join('')}</Text>
                    </View>
                    <Text style={[styles.reactionCountText, isDark && styles.darkMuted]}>
                      {totalReactions} {totalReactions === 1 ? (language === 'ar' ? 'تفاعل' : 'réaction') : (language === 'ar' ? 'تفاعلات' : 'réactions')}
                    </Text>
                  </View>
                )}

                {/* Facebook Reaction Bar / Floating Picker */}
                {activePickerReviewId === review._id && (
                  <View style={[styles.fbPickerContainer, isDark && styles.darkFbPicker]}>
                    {FB_REACTIONS.map((fb) => (
                      <TouchableOpacity
                        key={fb.type}
                        onPress={() => handleReaction(review._id, fb.type)}
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

                {/* Card Footer: Facebook React Button & Share */}
                <View style={[styles.reviewFooter, isDark && { borderTopColor: '#374151' }]}>
                  <TouchableOpacity
                    style={[
                      styles.reactButton,
                      userReaction && {
                        backgroundColor: isDark ? 'rgba(192, 38, 211, 0.2)' : '#FDF4FF',
                      },
                    ]}
                    onPress={() => {
                      if (activePickerReviewId === review._id) {
                        setActivePickerReviewId(null);
                      } else {
                        setActivePickerReviewId(review._id);
                      }
                    }}
                    onLongPress={() => setActivePickerReviewId(review._id)}
                  >
                    <Text style={{ fontSize: 16 }}>
                      {activeFbDef ? activeFbDef.emoji : '👍'}
                    </Text>
                    <Text
                      style={[
                        styles.reactButtonText,
                        { color: activeFbDef ? activeFbDef.color : isDark ? '#9CA3AF' : '#64748B' },
                      ]}
                    >
                      {activeFbDef
                        ? language === 'ar'
                          ? activeFbDef.labelAr
                          : activeFbDef.labelFr
                        : language === 'ar'
                        ? 'تفاعل'
                        : "J'aime"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.reactButton}
                    onPress={() => {
                      Share.share({
                        message: `"${review.comment}" - Avis de ${review.userName} sur ${activity.name} ⭐ ${review.rating}/5 (via ActivityTN)`,
                      });
                    }}
                  >
                    <Ionicons name="arrow-redo-outline" size={16} color={isDark ? '#9CA3AF' : '#64748B'} />
                    <Text style={[styles.reactButtonText, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
                      {language === 'ar' ? 'مشاركة' : 'Partager'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* ── Write / Edit a Review Button or Form ─────────────────────────── */}
          {!showForm ? (
            <TouchableOpacity
              style={[styles.writeReviewBtn, isDark && { borderColor: '#C026D3', backgroundColor: '#1F2937' }]}
              onPress={() => {
                setEditingReviewId(null);
                setDraftRating(5);
                setDraftComment('');
                setShowForm(true);
              }}
            >
              <Ionicons name="create-outline" size={19} color="#C026D3" />
              <Text style={styles.writeReviewText}>
                {language === 'ar' ? '✍️ أضف تعليقك وتقييمك بالنجوم' : '✍️ Écrire un avis & Noter'}
              </Text>
            </TouchableOpacity>
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[styles.reviewForm, isDark && styles.darkReviewForm]}
            >
              {/* Form Header */}
              <View style={styles.reviewFormHeader}>
                <Ionicons name={editingReviewId ? 'pencil' : 'create-outline'} size={22} color="#C026D3" />
                <Text style={[styles.reviewFormTitle, isDark && styles.darkText]}>
                  {editingReviewId
                    ? language === 'ar'
                      ? 'تعديل تعليقك'
                      : 'Modifier votre avis'
                    : language === 'ar'
                    ? 'أضف تقييمك ورأيك'
                    : 'Votre avis sur l\'activité'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowForm(false);
                    setEditingReviewId(null);
                    setDraftRating(5);
                    setDraftComment('');
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Star Rating Picker */}
              <Text style={[styles.reviewFormLabel, isDark && styles.darkMuted]}>
                {language === 'ar' ? 'اختر التقييم بالنجوم ⭐ (من 1 إلى 5):' : 'Notez cette activité (1 à 5 étoiles) *'}
              </Text>
              <View style={styles.starPicker}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setDraftRating(s)}
                    style={styles.starBtn}
                    accessibilityLabel={`${s} étoiles`}
                  >
                    <Ionicons
                      name={s <= draftRating ? 'star' : 'star-outline'}
                      size={36}
                      color={s <= draftRating ? '#F59E0B' : '#CBD5E1'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {draftRating > 0 && (
                <Text style={styles.ratingLabel}>
                  {
                    [
                      '',
                      language === 'ar' ? '⭐ سيء جداً 😞' : '⭐ Très mauvais 😞',
                      language === 'ar' ? '⭐⭐ ضعيف 😕' : '⭐⭐ Mauvais 😕',
                      language === 'ar' ? '⭐⭐⭐ مقبول 😐' : '⭐⭐⭐ Moyen 😐',
                      language === 'ar' ? '⭐⭐⭐⭐ جيد جداً 😊' : '⭐⭐⭐⭐ Très bien 😊',
                      language === 'ar' ? '⭐⭐⭐⭐⭐ رائع وممتاز 🌟' : '⭐⭐⭐⭐⭐ Excellent 🌟',
                    ][draftRating]
                  }
                </Text>
              )}

              {/* Text Input */}
              <Text style={[styles.reviewFormLabel, isDark && styles.darkMuted]}>
                {language === 'ar' ? 'اكتب تعليقك وتجربتك:' : 'Votre commentaire *'}
              </Text>
              <TextInput
                style={[styles.reviewTextInput, isDark && styles.darkReviewInput]}
                placeholder={
                  language === 'ar'
                    ? 'شاركنا رأيك وتجربتك مع هذا النشاط...'
                    : 'Partagez votre expérience avec cette activité...'
                }
                placeholderTextColor={isDark ? '#6B7280' : '#94A3B8'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={draftComment}
                onChangeText={setDraftComment}
                maxLength={600}
              />
              <Text style={styles.charCount}>{draftComment.length}/600</Text>

              {/* Form Action Buttons */}
              <View style={styles.reviewFormActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, isDark && { borderColor: '#4B5563' }]}
                  onPress={() => {
                    setShowForm(false);
                    setEditingReviewId(null);
                    setDraftRating(5);
                    setDraftComment('');
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.cancelBtnText, isDark && styles.darkMuted]}>
                    {language === 'ar' ? 'إلغاء' : 'Annuler'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                  onPress={handleSubmitReview}
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
                        {editingReviewId
                          ? language === 'ar'
                            ? 'حفظ التعديل'
                            : 'Mettre à jour'
                          : language === 'ar'
                          ? 'نشر التقييم'
                          : 'Publier mon avis'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}

          {/* ── Hub d'Actions Directes & Réservation (Call, WhatsApp, GPS) ── */}
          <View style={[styles.bookingHubContainer, isDark && styles.darkBookingHub]}>
            <Text style={[styles.bookingHubTitle, isDark && styles.darkText]}>
              {language === 'ar' ? 'الحجز والتواصل المباشر' : language === 'en' ? 'Direct Booking & Contact' : 'Réservation & Contact Direct'}
            </Text>

            {/* Rangée des boutons d'action rapide : Appel direct + WhatsApp direct */}
            <View style={styles.contactRow}>
              {/* Bouton Appel Direct */}
              <TouchableOpacity
                accessibilityRole="button"
                onPress={handleCall}
                activeOpacity={0.85}
                style={[styles.contactBtn, styles.callBtn]}
              >
                <View style={styles.contactIconCircle}>
                  <Ionicons name="call" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactBtnTitle}>
                    {language === 'ar' ? 'اتصال مباشر' : language === 'en' ? 'Call Venue' : 'Appeler'}
                  </Text>
                  <Text style={styles.contactBtnSub} numberOfLines={1}>
                    {activity.phone || '+216 74 200 100'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Bouton WhatsApp Réservation */}
              <TouchableOpacity
                accessibilityRole="button"
                onPress={handleWhatsApp}
                activeOpacity={0.85}
                style={[styles.contactBtn, styles.whatsappBtn]}
              >
                <View style={[styles.contactIconCircle, { backgroundColor: '#16A34A' }]}>
                  <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactBtnTitle}>
                    {language === 'ar' ? 'واتساب للحجز' : language === 'en' ? 'WhatsApp' : 'WhatsApp'}
                  </Text>
                  <Text style={styles.contactBtnSub} numberOfLines={1}>
                    {language === 'ar' ? 'استفسار فوري' : language === 'en' ? 'Instant Chat' : 'Discussion directe'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Bouton Itinéraire GPS Réel (Google Maps / Apple Maps) */}
            <TouchableOpacity
              accessibilityRole="button"
              onPress={handleOpenMapDirection}
              activeOpacity={0.88}
              style={styles.gpsRouteButton}
            >
              <View style={styles.gpsIconCircle}>
                <Ionicons name="navigate" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.gpsRouteText}>
                {language === 'ar' ? 'فتح المسار في الخريطة (GPS)' : language === 'en' ? 'Open GPS Directions' : 'Ouvrir l\'itinéraire GPS'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            {/* Actions secondaires : Partager & Favoris */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={handleShare}
                style={[styles.secondaryAction, isDark && { borderColor: '#4B5563', backgroundColor: '#1E293B' }]}
              >
                <Ionicons name="share-social-outline" size={19} color="#C026D3" />
                <Text style={styles.secondaryActionText}>{t('share')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => onToggleFavorite(activity.id)}
                style={[styles.secondaryAction, isDark && { borderColor: '#4B5563', backgroundColor: '#1E293B' }]}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={19}
                  color={isFavorite ? '#E11D48' : '#C026D3'}
                />
                <Text style={styles.secondaryActionText}>{t('favorites')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F3F8' },
  darkScreen: { backgroundColor: '#111827' },
  content: { paddingBottom: 40 },
  // Hero
  hero: { height: 340, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(30,27,75,0.34)',
  },
  topActions: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  heroText: { position: 'absolute', bottom: 42, left: 20, right: 20 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  location: { color: '#FCE7F3', fontSize: 13, fontWeight: '700' },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  // Sheet
  sheet: {
    marginTop: -26,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: '#FFFFFF',
    padding: 22,
    minHeight: 430,
  },
  darkSurface: { backgroundColor: '#1F2937' },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headingCopy: { flex: 1, paddingRight: 12 },
  category: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FDF4FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: { color: '#A21CAF', fontSize: 12, fontWeight: '800' },
  title: {
    color: '#1E1B4B',
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    marginTop: 10,
  },
  price: { color: '#C026D3', fontSize: 20, fontWeight: '900' },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 22,
    paddingVertical: 16,
  },
  infoItem: { flex: 1, alignItems: 'center' },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  infoLabel: { color: '#94A3B8', fontSize: 11 },
  infoValue: { color: '#334155', fontSize: 13, fontWeight: '800', marginTop: 2 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#1E1B4B',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 24,
    marginBottom: 8,
  },
  reviewsCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 24,
  },
  description: { color: '#64748B', fontSize: 14, lineHeight: 22 },
  reasonList: { gap: 10 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  reasonText: { color: '#64748B', fontSize: 14 },

  // Rating summary
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF4FF',
    borderRadius: 18,
    padding: 16,
    gap: 16,
    marginBottom: 16,
  },
  darkRatingBar: { backgroundColor: '#111827' },
  ratingScore: { alignItems: 'center', minWidth: 68 },
  ratingBig: { fontSize: 36, fontWeight: '900', color: '#C026D3', lineHeight: 40 },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 4 },
  ratingCount: { color: '#94A3B8', fontSize: 11, marginTop: 4, textAlign: 'center' },
  ratingBarsCol: { flex: 1, gap: 5 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingBarLabel: { color: '#64748B', fontSize: 11, width: 10, textAlign: 'center' },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E9D5FF',
    borderRadius: 99,
    overflow: 'hidden',
  },
  ratingBarFill: { height: '100%', backgroundColor: '#C026D3', borderRadius: 99 },
  ratingBarCount: { color: '#94A3B8', fontSize: 11, width: 16, textAlign: 'right' },

  // Empty review box
  emptyReviewBox: {
    backgroundColor: '#FDF4FF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    gap: 8,
  },
  emptyReviewTitle: { fontSize: 16, fontWeight: '800', color: '#1E1B4B', textAlign: 'center' },
  emptyReviewSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 },

  // Review card
  reviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  darkReviewCard: { backgroundColor: '#111827', borderColor: '#374151' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E9D5FF',
  },
  reviewMeta: { flex: 1 },
  reviewName: { color: '#1E1B4B', fontSize: 14, fontWeight: '800' },
  authorBadge: {
    backgroundColor: '#FDF4FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C026D3',
  },
  authorBadgeText: { color: '#C026D3', fontSize: 10, fontWeight: '800' },
  reviewStarsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewDate: { color: '#94A3B8', fontSize: 11 },
  authorActions: { flexDirection: 'row', gap: 6 },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewText: { color: '#475569', fontSize: 14, lineHeight: 21, marginBottom: 8 },

  // Reaction Summary
  reactionSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  reactionEmojiStack: {
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  reactionCountText: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  // Facebook Picker Floating row
  fbPickerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
    marginVertical: 6,
    gap: 4,
  },
  darkFbPicker: { backgroundColor: '#1F2937', borderColor: '#4B5563' },
  fbPickerItem: {
    padding: 6,
    borderRadius: 18,
  },
  fbPickerItemActive: {
    backgroundColor: '#FDF4FF',
    transform: [{ scale: 1.2 }],
  },
  fbPickerEmoji: { fontSize: 24 },

  // Review Footer (Like button & Share)
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 4,
  },
  reactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reactButtonText: { fontSize: 13, fontWeight: '700' },

  // Write review button
  writeReviewBtn: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: '#C026D3',
    borderRadius: 24,
    backgroundColor: '#FDF4FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  writeReviewText: { color: '#C026D3', fontSize: 14, fontWeight: '800' },

  // Write review form
  reviewForm: {
    backgroundColor: '#FEFEFE',
    borderRadius: 20,
    padding: 18,
    marginTop: 6,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#C026D3',
  },
  darkReviewForm: { backgroundColor: '#1F2937', borderColor: '#C026D3' },
  reviewFormHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  reviewFormTitle: { flex: 1, color: '#1E1B4B', fontSize: 15, fontWeight: '800' },
  reviewFormLabel: { color: '#64748B', fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 4 },
  starPicker: { flexDirection: 'row', gap: 8, marginBottom: 6, justifyContent: 'center' },
  starBtn: { padding: 4 },
  ratingLabel: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  reviewTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 14,
    color: '#334155',
    minHeight: 90,
    marginBottom: 4,
  },
  darkReviewInput: { backgroundColor: '#111827', borderColor: '#374151', color: '#F8FAFC' },
  charCount: { color: '#94A3B8', fontSize: 11, textAlign: 'right', marginBottom: 14 },
  reviewFormActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { color: '#64748B', fontSize: 13, fontWeight: '700' },
  submitBtn: {
    flex: 2,
    minHeight: 44,
    backgroundColor: '#C026D3',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    elevation: 3,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  // Direct Booking & Contact Actions Hub
  bookingHubContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkBookingHub: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  bookingHubTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  contactBtn: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  callBtn: {
    backgroundColor: '#0284C7',
  },
  whatsappBtn: {
    backgroundColor: '#15803D',
  },
  contactIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTextContainer: {
    flex: 1,
  },
  contactBtnTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  contactBtnSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  gpsRouteButton: {
    minHeight: 52,
    backgroundColor: '#7C3AED',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 4,
    elevation: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  gpsIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsRouteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  secondaryActionText: {
    color: '#A21CAF',
    fontSize: 13,
    fontWeight: '800',
  },
  darkText: { color: '#F8FAFC' },
  darkMuted: { color: '#CBD5E1' },
});
