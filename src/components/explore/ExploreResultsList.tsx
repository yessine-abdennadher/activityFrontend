import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../theme/theme';
import type { TranslationKey } from '../../constants/translations';
import type { Activity } from '../../types';
import { ExploreActivityCard } from '../ExploreActivityCard';
import { ExploreActivityCardSkeleton } from '../ExploreActivityCardSkeleton';

interface ExploreResultsListProps {
  activities: Activity[];
  favorites: string[];
  isLoading: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  theme: ThemeColors;
  language: string;
  isRTL: boolean;
  t: (key: TranslationKey) => string;
  onSelectActivity: (activity: Activity) => void;
  onToggleFavorite: (id: string) => void;
  onLoadMore?: () => void;
}

export const ExploreResultsList: React.FC<ExploreResultsListProps> = ({
  activities,
  favorites,
  isLoading,
  hasMore,
  isLoadingMore,
  theme,
  language,
  isRTL,
  t,
  onSelectActivity,
  onToggleFavorite,
  onLoadMore,
}) => {
  if (isLoading && activities.length === 0) {
    return (
      <View style={styles.resultsContainer}>
        <ExploreActivityCardSkeleton />
        <ExploreActivityCardSkeleton />
        <ExploreActivityCardSkeleton />
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color={theme.textMuted} />
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          {t('noResults')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.resultsContainer}>
      {activities.map((act) => (
        <ExploreActivityCard
          key={act.id}
          activity={act}
          isFavorite={favorites.includes(act.id)}
          onPress={() => onSelectActivity(act)}
          onToggleFavorite={() => onToggleFavorite(act.id)}
        />
      ))}

      {hasMore && onLoadMore && activities.length > 0 && (
        <TouchableOpacity
          style={[
            styles.loadMoreBtn,
            {
              backgroundColor: `${theme.primary}12`,
              borderColor: `${theme.primary}30`,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
          onPress={onLoadMore}
          disabled={isLoadingMore}
          activeOpacity={0.8}
        >
          {isLoadingMore ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <>
              <Ionicons
                name="arrow-down-circle-outline"
                size={18}
                color={theme.primary}
              />
              <Text
                style={[
                  styles.loadMoreText,
                  { color: theme.primary },
                ]}
              >
                {language === 'ar'
                  ? 'عرض المزيد من الأنشطة (+20)'
                  : language === 'en'
                  ? 'Load more activities (+20)'
                  : "Charger plus d'activités (+20)"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  resultsContainer: {
    marginTop: 20,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadMoreBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  loadMoreText: {
    fontWeight: '800',
    fontSize: 14,
  },
});
