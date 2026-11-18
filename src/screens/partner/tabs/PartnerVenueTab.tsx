import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '../../../theme/theme';
import type { PartnerActivityItem } from '../../../types';

interface PartnerVenueTabProps {
  activities: PartnerActivityItem[];
  currentUserEstablishmentName?: string;
  electricityAlertActive: boolean;
  isProPartner: boolean;
  isPremiumPartner: boolean;
  refreshing: boolean;
  theme: ThemeColors;
  isDark: boolean;
  onRefresh: () => Promise<void>;
  onCreatePress: () => void;
  onEditPress: (activity: PartnerActivityItem) => void;
  onMenuPress: (activity: PartnerActivityItem) => void;
  onDeletePress: (activity: PartnerActivityItem) => void;
  onPromoPress: (activity: PartnerActivityItem) => void;
  onEventPress: (activity: PartnerActivityItem) => void;
  onTogglePowerMode: (activity: PartnerActivityItem) => void;
}

export const PartnerVenueTab: React.FC<PartnerVenueTabProps> = ({
  activities,
  currentUserEstablishmentName,
  electricityAlertActive,
  isProPartner,
  isPremiumPartner,
  refreshing,
  theme,
  isDark,
  onRefresh,
  onCreatePress,
  onEditPress,
  onMenuPress,
  onDeletePress,
  onPromoPress,
  onEventPress,
  onTogglePowerMode,
}) => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.primary]}
          tintColor={theme.primary}
        />
      }
    >
      {/* 1. En-tête de section avec bouton d'ajout rapide */}
      <View style={styles.topSectionRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
            Vos Établissements ({activities.length})
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
            Gérez vos informations, photos, horaires et menu
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerAddBtn}
          onPress={onCreatePress}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.headerAddBtnText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Liste des Établissements ou état vide */}
      {activities.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
            <Ionicons name="restaurant-outline" size={32} color={theme.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.textMain }]}>
            Aucun établissement enregistré
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
            Ajoutez votre restaurant, salon de thé ou espace loisirs pour commencer à attirer des visiteurs.
          </Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={onCreatePress} activeOpacity={0.8}>
            <Ionicons name="add-circle" size={18} color="#FFFFFF" />
            <Text style={styles.emptyAddBtnText}>Ajouter mon établissement</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.activityList}>
          {activities.map((item) => {
            const imgUri = item.imageUrl || item.image;
            const isOnline = Boolean(item.isApproved);
            const hasMenu = Boolean(item.menuUrl || (item.menu && item.menu.images && item.menu.images.length > 0));

            return (
              <View
                key={item._id}
                style={[
                  styles.venueCard,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                {/* Zone 1 : Identité & Photo + Bouton Options discret */}
                <View style={styles.venueTop}>
                  {imgUri ? (
                    <Image source={{ uri: imgUri }} style={styles.venuePhoto} />
                  ) : (
                    <View style={[styles.venuePhotoPlaceholder, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                      <Ionicons name="restaurant" size={26} color={theme.textMuted} />
                    </View>
                  )}

                  <View style={styles.venueHeaderInfo}>
                    <View style={styles.venueNameRow}>
                      <Text style={[styles.venueNameText, { color: theme.textMain }]} numberOfLines={1}>
                        {item.name}
                      </Text>

                      {/* Bouton de suppression discret pour éviter les erreurs */}
                      <TouchableOpacity
                        style={styles.moreOptionsBtn}
                        onPress={() => onDeletePress(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.venueLocationText, { color: theme.textMuted }]} numberOfLines={1}>
                      {item.city} · {item.category}
                    </Text>

                    {/* Statut En ligne / Modération */}
                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: isOnline ? '#10B981' : '#F59E0B' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusLabel,
                          { color: isOnline ? '#059669' : '#D97706' },
                        ]}
                      >
                        {isOnline ? 'En ligne et visible' : 'En attente de modération'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Zone 2 : Résumé des 3 métriques clés en pilules douces */}
                <View style={[styles.metaPillsRow, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                  {/* Horaires */}
                  <View style={styles.metaPill}>
                    <Ionicons name="time-outline" size={13} color="#10B981" />
                    <Text style={[styles.metaPillText, { color: theme.textMain }]}>
                      {item.openingTime || '09:00'} - {item.closingTime || '23:00'}
                    </Text>
                  </View>

                  <Text style={[styles.metaDivider, { color: theme.cardBorder }]}>|</Text>

                  {/* Menu statut */}
                  <View style={styles.metaPill}>
                    <Ionicons
                      name="book-outline"
                      size={13}
                      color={hasMenu ? '#6366F1' : theme.textMuted}
                    />
                    <Text style={[styles.metaPillText, { color: hasMenu ? '#4F46E5' : theme.textMuted }]}>
                      {hasMenu ? 'Menu à jour' : 'Sans menu'}
                    </Text>
                  </View>

                  <Text style={[styles.metaDivider, { color: theme.cardBorder }]}>|</Text>

                  {/* Note / Avis */}
                  <View style={styles.metaPill}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={[styles.metaPillText, { color: theme.textMain }]}>
                      {item.reviewsCount && item.reviewsCount > 0 ? item.rating || 0 : 0} ({item.reviewsCount || 0})
                    </Text>
                  </View>
                </View>

                {/* Zone 3 : 2 Grands Boutons d'Action Clairs et Ergonomiques */}
                <View style={[styles.venueActionsRow, { borderTopColor: theme.cardBorder }]}>
                  {/* Bouton 1 : Modifier la Fiche Générale */}
                  <TouchableOpacity
                    style={[styles.primaryActionBtn, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF', borderColor: isDark ? '#334155' : '#C7D2FE' }]}
                    onPress={() => onEditPress(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={16} color="#4F46E5" />
                    <Text style={[styles.primaryActionBtnText, { color: '#4F46E5' }]}>
                      Modifier fiche
                    </Text>
                  </TouchableOpacity>

                  {/* Bouton 2 : Gérer le Menu & Prix */}
                  <TouchableOpacity
                    style={[styles.secondaryActionBtn, { backgroundColor: isDark ? '#1E1B4B' : '#FAF5FF', borderColor: isDark ? '#4338CA' : '#E9D5FF' }]}
                    onPress={() => onMenuPress(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="restaurant-outline" size={16} color="#7C3AED" />
                    <Text style={[styles.secondaryActionBtnText, { color: '#7C3AED' }]}>
                      Menu & Plats
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  topSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  headerAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  activityList: {
    gap: 14,
  },
  venueCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  venueTop: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
    alignItems: 'center',
  },
  venuePhoto: {
    width: 68,
    height: 68,
    borderRadius: 14,
  },
  venuePhotoPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueHeaderInfo: {
    flex: 1,
    gap: 3,
  },
  venueNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  venueNameText: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    paddingRight: 6,
  },
  moreOptionsBtn: {
    padding: 4,
    borderRadius: 6,
  },
  venueLocationText: {
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginHorizontal: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaDivider: {
    fontSize: 12,
    opacity: 0.5,
  },
  venueActionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  primaryActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  emptyAddBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
