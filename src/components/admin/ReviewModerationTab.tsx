import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { usePreferences } from '../../context/AppPreferencesContext';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchReviewsForModeration, moderateReview, type AdminReviewItem } from '../../services/adminService';

export function ReviewModerationTab() {
  const { theme } = usePreferences();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchReviewsForModeration(page);
      if (page > result.totalPages) { setPage(result.totalPages); return; }
      setReviews(result.reviews);
      setTotalPages(result.totalPages);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('adminReviewError'));
    } finally {
      setLoading(false);
    }
  }, [page, t]);

  useEffect(() => { void load(); }, [load]);

  const decide = async (reviewId: string, status: 'approved' | 'rejected') => {
    setBusyId(reviewId);
    setError(null);
    try {
      await moderateReview(reviewId, status);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('adminReviewError'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text accessibilityRole="header" style={{ color: theme.textMain, fontSize: 20, fontWeight: '700' }}>{t('adminReviews')}</Text>
      {loading && <ActivityIndicator color={theme.primary} accessibilityLabel={t('loadingReviews')} />}
      {error && <Text accessibilityRole="alert" style={{ color: theme.textMain }}>{error}</Text>}
      {error && <TouchableOpacity accessibilityRole="button" onPress={() => void load()} style={{ padding: 12 }}><Text style={{ color: theme.primary }}>{t('adminReviewRetry')}</Text></TouchableOpacity>}
      {!loading && !error && reviews.length === 0 && <Text style={{ color: theme.textMuted }}>{t('adminReviewEmpty')}</Text>}
      {!loading && !error && reviews.map((review) => (
        <View key={review._id} style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: 1, borderRadius: 12, padding: 16, gap: 8 }}>
          <Text style={{ color: theme.textMain, fontWeight: '700' }}>{review.activity?.name || '—'} · {review.rating}/5</Text>
          <Text style={{ color: theme.textMuted }}>{review.userName}</Text>
          <Text style={{ color: theme.textMain }}>{review.comment}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['approved', 'rejected'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                accessibilityRole="button"
                accessibilityLabel={`${status === 'approved' ? t('adminReviewApprove') : t('adminReviewReject')} : ${review.activity?.name || ''}`}
                disabled={busyId !== null}
                onPress={() => void decide(review._id, status)}
                style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: theme.primary, opacity: busyId ? 0.6 : 1 }}
              >
                <Text style={{ color: theme.primary }}>{status === 'approved' ? t('adminReviewApprove') : t('adminReviewReject')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {page > 1 && <TouchableOpacity accessibilityRole="button" onPress={() => setPage(page - 1)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: theme.primary }}>{t('adminReviewPrevious')}</Text></TouchableOpacity>}
        {page < totalPages && <TouchableOpacity accessibilityRole="button" onPress={() => setPage(page + 1)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: theme.primary }}>{t('adminReviewNext')}</Text></TouchableOpacity>}
      </View>
    </View>
  );
}
