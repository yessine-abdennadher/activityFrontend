import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../../context/AppPreferencesContext';
import {
  fetchAdminStats,
  updateUserRole,
  updatePartnerTier,
} from '../../services/adminService';
import {
  AdminPlatformStats,
  AdminUser,
  AdminActivityItem,
  AuthUser,
  UserRole,
  PartnerTier,
} from '../../types';
import { AdminDiagnosticsTab } from '../../components/admin/AdminDiagnosticsTab';
import { AdminPartnersTab } from '../../components/admin/AdminPartnersTab';
import { PartnerTierModal } from '../../components/admin/PartnerTierModal';
import { ReviewModerationTab } from '../../components/admin/ReviewModerationTab';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdminActivities } from '../../hooks/admin/useAdminActivities';
import { useAdminUsers } from '../../hooks/admin/useAdminUsers';
import { useAdminDiagnostics } from '../../hooks/admin/useAdminDiagnostics';
import { AdminDashboardHeader } from '../../components/admin/AdminDashboardHeader';
import { AdminDashboardTabs, AdminDashboardTab } from '../../components/admin/AdminDashboardTabs';
import { ActivityModerationCard } from '../../components/admin/ActivityModerationCard';
import { ScrollableModal } from '../../components/ui/ScrollableModal';
import { getUserRoleBadge, getPartnerTierBadge, getStatusBadge } from '../../components/admin/adminBadges';

interface AdminDashboardScreenProps {
  currentUser: AuthUser | null;
  onBack: () => void;
  onUpdateUser?: (updated: AuthUser) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  currentUser,
  onBack,
  onUpdateUser,
}) => {
  const { theme, isDark, language, setElectricityAlertActive } = usePreferences();
  const { t } = useTranslation();

  // Navigation tab inside Admin Dashboard
  const [activeTab, setActiveTab] = useState<AdminDashboardTab>('kpi');

  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const activityAdmin = useAdminActivities();
  const userAdmin = useAdminUsers();
  const diagnosticsAdmin = useAdminDiagnostics();
  const { activities } = activityAdmin;
  const { users } = userAdmin;
  const diagnosticsData = diagnosticsAdmin.diagnostics;

  // Liste enrichie des partenaires avec repli instantané sur les utilisateurs de rôle 'partner'
  const effectivePartnersStatus = useMemo(() => {
    if (diagnosticsData?.partnersStatus && diagnosticsData.partnersStatus.length > 0) {
      return diagnosticsData.partnersStatus;
    }
    const partnerUsers = users.filter((u) => u.role === 'partner');
    return partnerUsers.map((u) => {
      const partnerActs = activities.filter(
        (a) => a.createdBy?._id === u._id || (a.createdBy?._id && a.createdBy._id === u.id)
      );
      const partnerOffers = partnerActs
        .filter((a) => (a as any).promotion?.isPromo)
        .map((a) => ({
          activityId: a._id,
          activityName: a.name,
          promoLabel: (a as any).promotion?.promoLabel || 'Offre promotionnelle',
          discountPercent: (a as any).promotion?.discountPercent || 0,
          targetItem: (a as any).promotion?.targetItem || '',
          promoType: (a as any).promotion?.promoType || 'all',
          validUntil: (a as any).promotion?.validUntil || '',
        }));

      return {
        id: u._id,
        name: u.name,
        email: u.email,
        establishmentName: u.establishmentName || u.name,
        partnerTier: u.partnerTier || 'standard',
        activityCount: partnerActs.length,
        isInactive: !u.isActive,
        hasStaleData: false,
        city: u.city,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        lastActivityUpdate: u.lastActivityUpdate,
        activities: partnerActs.map((a) => ({
          id: a._id,
          name: a.name,
          category: a.category,
          price: a.price,
          isApproved: a.isApproved,
          isFeatured: a.isFeatured,
          isPopular: a.isPopular,
          promotion: (a as any).promotion,
        })),
        offers: partnerOffers,
      };
    });
  }, [diagnosticsData?.partnersStatus, users, activities]);

  // Filters for Activities
  const [activityStatusFilter, setActivityStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // Filters for Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Utilisateurs grand public et administrateurs uniquement (les partenaires sont gérés dans l'onglet Partenaires)
  const regularUsers = useMemo(() => {
    const nonPartners = users.filter((u) => u.role !== 'partner');
    if (userRoleFilter === 'all') return nonPartners;
    return nonPartners.filter((u) => u.role === userRoleFilter);
  }, [users, userRoleFilter]);

  // Role selection modal for users
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUser | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  // Partner tier assignment modal
  const [selectedPartnerForTier, setSelectedPartnerForTier] = useState<AdminUser | null>(null);
  const [partnerTierModalVisible, setPartnerTierModalVisible] = useState(false);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try { setStats(await fetchAdminStats()); }
    catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Erreur lors du chargement des statistiques.';
      setStatsError(t('adminSectionLoadError'));
      console.error('[AdminDashboard] Erreur chargement stats:', message);
    } finally { setStatsLoading(false); }
  }, [t]);

  const loadActivities = useCallback(() => activityAdmin.load(activityStatusFilter), [activityAdmin.load, activityStatusFilter]);
  const loadUsers = useCallback(() => userAdmin.load(userRoleFilter, userSearch), [userAdmin.load, userRoleFilter, userSearch]);
  const loadDiagnostics = diagnosticsAdmin.load;

  // Enregistrer le nouveau statut Partenaire (Standard / Pro / Premium) via le modal développé
  const handleSavePartnerTier = async (partnerId: string, newTier: PartnerTier) => {
    try {
      await updatePartnerTier(partnerId, newTier);
      diagnosticsAdmin.setPartnerTier(partnerId, newTier);
      userAdmin.updatePartnerTierLocally(partnerId, newTier);
      if (partnerId === currentUser?.id && onUpdateUser) {
        onUpdateUser({ ...currentUser, partnerTier: newTier });
      }
      const tierTitle = t(
        newTier === 'premium'
          ? 'adminTierPremium'
          : newTier === 'pro'
          ? 'adminTierPro'
          : 'adminTierStandard'
      );
      Alert.alert(t('adminPartnerTierUpdated'), `${t('adminPartnerTierAssigned')} : ${tierTitle}`);
    } catch (err) {
      Alert.alert(t('error'), t('adminPartnerTierUpdateError'));
      throw err;
    }
  };

  // Ouvrir le modal d'attribution de palier depuis l'onglet Diagnostics
  const handleTogglePartnerTier = (partnerId: string, currentTier?: string) => {
    const partnerFromDiag = diagnosticsData?.partnersStatus.find((p) => p.id === partnerId);
    const partnerFromUsers = users.find((u) => u._id === partnerId);
    const partnerObj: AdminUser = partnerFromUsers || {
      _id: partnerId,
      name: partnerFromDiag?.name || 'Partenaire',
      email: partnerFromDiag?.email || '',
      role: 'partner' as const,
      isActive: true,
      establishmentName: partnerFromDiag?.establishmentName,
      partnerTier: (partnerFromDiag?.partnerTier || currentTier || 'standard') as PartnerTier,
    };
    setSelectedPartnerForTier(partnerObj);
    setPartnerTierModalVisible(true);
  };

  // Activer ou désactiver le mode alerte coupure d'électricité (Plateforme globale)
  const handleToggleGlobalElectricity = async (nextVal: boolean) => {
    try {
      const res = await diagnosticsAdmin.setElectricityMode(nextVal);
      setElectricityAlertActive(res.electricityAlertActive);
      Alert.alert(
        t(res.electricityAlertActive ? 'adminElectricityEnabled' : 'adminElectricityDisabled'),
        res.electricityAlertActive
          ? t('adminElectricityEnabledAlert')
          : t('adminElectricityDisabledAlert')
      );
    } catch {
      Alert.alert(t('error'), t('adminElectricityUpdateError'));
    }
  };

  // Initial and reactive data fetching
  const refreshCurrentTab = useCallback(async () => {
    if (activeTab === 'kpi') {
      await loadStats();
    } else if (activeTab === 'activities') {
      await loadActivities();
    } else if (activeTab === 'users') {
      await loadUsers();
    } else if (activeTab === 'partners' || activeTab === 'diagnostics') {
      await loadDiagnostics();
    }
  }, [activeTab, loadStats, loadActivities, loadUsers, loadDiagnostics]);

  useEffect(() => {
    refreshCurrentTab();
  }, [refreshCurrentTab]);

  const onPullRefresh = async () => {
    if (activeTab === 'kpi') await loadStats();
    else if (activeTab === 'activities') await activityAdmin.refresh(activityStatusFilter);
    else if (activeTab === 'users') await userAdmin.refresh(userRoleFilter, userSearch);
    else if (activeTab === 'partners' || activeTab === 'diagnostics') await diagnosticsAdmin.refresh();
  };

  // Activity Moderation Handlers
  const handleToggleApproval = async (item: AdminActivityItem) => {
    try {
      await activityAdmin.toggleApproval(item);
    } catch {
      Alert.alert(t('adminModerationError'));
    }
  };

  const handleToggleHighlight = async (
    item: AdminActivityItem,
    field: 'isFeatured' | 'isPopular'
  ) => {
    try {
      await activityAdmin.toggleHighlight(item, field);
    } catch {
      Alert.alert(t('error'), t('adminHighlightError'));
    }
  };

  const handleDeleteActivity = (item: AdminActivityItem) => {
    Alert.alert(
      t('adminDeleteActivityConfirm'),
      `${t('adminDeleteActivityPrompt')}\n${item.name}`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await activityAdmin.remove(item);
              Alert.alert(t('success'), t('adminActivityDeleted'));
            } catch {
              Alert.alert(t('error'), t('adminActivityDeleteError'));
            }
          },
        },
      ]
    );
  };

  // User Management Handlers
  const handleToggleUserStatus = async (user: AdminUser) => {
    if (user._id === currentUser?.id) {
      Alert.alert(t('error'), t('adminCannotSuspendSelf'));
      return;
    }

    try {
      await userAdmin.setStatus(user);
    } catch {
      Alert.alert(t('error'), t('adminStatusError'));
    }
  };

  const handleConfirmRoleChange = async (newRole: UserRole) => {
    if (!selectedUserForRole) return;
    if (selectedUserForRole._id === currentUser?.id) {
      Alert.alert(t('error'), t('adminCannotChangeRoleSelf'));
      setRoleModalVisible(false);
      return;
    }

    try {
      await userAdmin.setRole(selectedUserForRole._id, newRole);
      setRoleModalVisible(false);
      setSelectedUserForRole(null);
      const roleLabel = t(newRole === 'admin' ? 'adminRoleAdministrator' : newRole === 'partner' ? 'adminRolePartner' : 'adminRoleUser');
      Alert.alert(t('adminRoleUpdated'), roleLabel);
    } catch {
      Alert.alert(t('error'), t('adminRoleError'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AdminDashboardHeader
        administratorName={currentUser?.name || ''}
        theme={theme}
        isRTL={language === 'ar'}
        title={t('adminDashboardTitle')}
        administratorLabel={t('adminAdministrator')}
        backLabel={t('adminGoBack')}
        refreshLabel={t('adminRefreshSection')}
        onBack={onBack}
        onRefresh={onPullRefresh}
      />
      <AdminDashboardTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        isRTL={language === 'ar'}
        labels={{
          kpi: t('adminTabOverview'),
          activities: t('adminTabActivityModeration'),
          reviews: t('adminTabReviews'),
          partners: t('adminTabPartners'),
          users: t('adminTabUsers'),
          diagnostics: t('adminTabDiagnostics'),
        }}
      />

      {/* Main Body */}
      <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={
                activeTab === 'activities'
                  ? activityAdmin.refreshing
                  : activeTab === 'users'
                  ? userAdmin.refreshing
                  : activeTab === 'partners' || activeTab === 'diagnostics'
                  ? diagnosticsAdmin.refreshing
                  : false
              }
              onRefresh={onPullRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        >
          {activeTab === 'reviews' && <ReviewModerationTab />}
          {activeTab !== 'reviews' && (() => {
            const loading =
              activeTab === 'kpi'
                ? statsLoading
                : activeTab === 'activities'
                ? activityAdmin.loading
                : activeTab === 'users'
                ? userAdmin.loading
                : activeTab === 'partners' || activeTab === 'diagnostics'
                ? diagnosticsAdmin.loading
                : false;
            const error =
              activeTab === 'kpi'
                ? statsError
                : activeTab === 'activities'
                ? activityAdmin.error
                : activeTab === 'users'
                ? userAdmin.error
                : activeTab === 'partners' || activeTab === 'diagnostics'
                ? diagnosticsAdmin.error
                : null;
            if (loading || error) return (
              <View style={[styles.centerContainer, { minHeight: 180 }]}>
                {loading ? (
                  <View accessible accessibilityRole="progressbar" accessibilityLabel={t('adminSectionLoading')}>
                    <ActivityIndicator size="large" color={theme.primary} />
                  </View>
                ) : <Ionicons name="alert-circle-outline" size={40} color={theme.primary} />}
                <Text accessibilityRole={error ? 'alert' : undefined} style={[styles.errorMessage, { color: theme.textMuted }]}>
                  {loading ? t('adminSectionLoading') : t('adminSectionLoadError')}
                </Text>
                {error && (
                  <TouchableOpacity
                    style={[styles.retryBtn, { backgroundColor: theme.primary }]}
                    onPress={refreshCurrentTab}
                    accessibilityRole="button"
                    accessibilityLabel={t('adminRetry')}
                  >
                    <Text style={[styles.retryBtnText, { color: theme.cardBg }]}>{t('adminRetry')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
            return null;
          })()}
          {/* TAB 1 : VUE D'ENSEMBLE (KPI & STATS) */}
          {activeTab === 'kpi' && !statsLoading && !statsError && stats && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
                {t('adminKpiTitle')}
              </Text>

              {/* Grid des Cartes KPI avec palettes sémantiques distinctes */}
              <View style={styles.kpiGrid}>
                {/* Utilisateurs totaux - Indigo / Bleu Royal */}
                <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={[styles.kpiIconBox, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.22)' : '#EEF2FF' }]}>
                    <Ionicons name="people" size={22} color={isDark ? '#A5B4FC' : '#4F46E5'} />
                  </View>
                  <Text style={[styles.kpiValue, { color: theme.textMain }]}>
                    {stats.users.total}
                  </Text>
                  <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>
                    {t('adminKpiUsers')}
                  </Text>
                  <View style={styles.kpiSubRow}>
                    <Text style={[styles.kpiSubText, { color: theme.textMuted }]}>
                      {stats.users.regularUsers} {t('adminKpiStandardUsers')}
                    </Text>
                    <Text style={[styles.kpiSubText, { color: isDark ? '#38BDF8' : '#0284C7', fontWeight: '700' }]}>
                      · {stats.users.partners} {t('adminKpiPartners')}
                    </Text>
                  </View>
                </View>

                {/* Activités - Cyan / Émeraude Méditerranée */}
                <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={[styles.kpiIconBox, { backgroundColor: isDark ? 'rgba(2, 132, 199, 0.22)' : '#E0F2FE' }]}>
                    <Ionicons name="compass" size={22} color={isDark ? '#38BDF8' : '#0284C7'} />
                  </View>
                  <Text style={[styles.kpiValue, { color: theme.textMain }]}>
                    {stats.activities.total}
                  </Text>
                  <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>
                    {t('adminKpiActivities')}
                  </Text>
                  <View style={styles.kpiSubRow}>
                    <Text style={[styles.kpiSubText, { color: isDark ? '#FBBF24' : '#D97706', fontWeight: '700' }]}>
                      {stats.activities.pendingApproval} {t('adminKpiPendingApproval')}
                    </Text>
                  </View>
                </View>

                {/* Partenaires Pro & Premium - Or & Ambre */}
                <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={[styles.kpiIconBox, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.22)' : '#FEF3C7' }]}>
                    <Ionicons name="briefcase" size={22} color={isDark ? '#FBBF24' : '#D97706'} />
                  </View>
                  <Text style={[styles.kpiValue, { color: theme.textMain }]}>
                    {stats.users.partners}
                  </Text>
                  <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>
                    {t('adminKpiProPartners')}
                  </Text>
                  <View style={styles.kpiSubRow}>
                    <Text style={[styles.kpiSubText, { color: isDark ? '#C084FC' : '#7C3AED', fontWeight: '700' }]}>
                      {stats.users.admins} {t('adminKpiAdmins')}
                    </Text>
                  </View>
                </View>

                {/* Avis & Notes - Rose Corail / Étoile */}
                <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={[styles.kpiIconBox, { backgroundColor: isDark ? 'rgba(251, 113, 133, 0.22)' : '#FFE4E6' }]}>
                    <Ionicons name="star" size={22} color={isDark ? '#FB7185' : '#E11D48'} />
                  </View>
                  <Text style={[styles.kpiValue, { color: theme.textMain }]}>
                    {stats.reviews.total}
                  </Text>
                  <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>
                    {t('adminKpiReviews')}
                  </Text>
                  <View style={styles.kpiSubRow}>
                    <Text style={[styles.kpiSubText, { color: isDark ? '#34D399' : '#059669', fontWeight: '700' }]}>
                      {t('adminKpiVerified')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Répartition par ville */}
              <View style={[styles.cardSection, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <View style={styles.cardSectionHeader}>
                  <Ionicons name="map-outline" size={18} color={theme.primary} />
                  <Text style={[styles.cardSectionTitle, { color: theme.textMain }]}>
                    {t('adminKpiActivitiesByCity')}
                  </Text>
                </View>
                <View style={styles.cityList}>
                  {stats.activities.byCity.map((item, index) => (
                    <View key={item.city || index} style={styles.cityRow}>
                      <View style={styles.cityNameContainer}>
                        <Text style={[styles.cityRank, { color: theme.textMuted }]}>#{index + 1}</Text>
                        <Text style={[styles.cityName, { color: theme.textMain }]}>{item.city}</Text>
                      </View>
                      <View style={[styles.cityCountBadge, { backgroundColor: theme.pillBg }]}>
                        <Text style={[styles.cityCountText, { color: theme.primary }]}>{item.count} {t('adminKpiActivityCount')}</Text>
                      </View>
                    </View>
                  ))}
                  {stats.activities.byCity.length === 0 && (
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                      {t('adminKpiNoLocation')}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* TAB 2 : MODÉRATION DES ACTIVITÉS */}
          {activeTab === 'activities' && !activityAdmin.loading && !activityAdmin.error && (
            <View style={styles.tabContent}>
              {/* Filtres de statut */}
              <View style={[styles.filterPillsRow, { flexDirection: language === 'ar' ? 'row-reverse' : 'row' }]}>
                {(['all', 'pending', 'approved'] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterPill,
                      activityStatusFilter === filter
                        ? { backgroundColor: theme.primary }
                        : { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: 1 },
                    ]}
                    onPress={() => setActivityStatusFilter(filter)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activityStatusFilter === filter }}
                    accessibilityLabel={filter === 'all' ? t('adminActivityFilterAll') : filter === 'pending' ? t('adminActivityFilterPending') : t('adminActivityFilterApproved')}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: activityStatusFilter === filter ? '#FFFFFF' : theme.textMuted },
                      ]}
                    >
                      {filter === 'all'
                        ? t('adminActivityFilterAll')
                        : filter === 'pending'
                        ? t('adminActivityFilterPending')
                        : t('adminActivityFilterApproved')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.resultsCount, { color: theme.textMuted }]}>
                {activities.length} {t('adminActivityResults')}
              </Text>

              {activities.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="folder-open-outline" size={42} color={theme.textMuted} />
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                    {t('adminActivityEmpty')}
                  </Text>
                </View>
              ) : (
                <View style={styles.activitiesList}>
                  {activities.map((item) => (
                    <ActivityModerationCard
                      key={item._id}
                      activity={item}
                      theme={theme}
                      isRTL={language === 'ar'}
                      labels={{
                        approved: t('adminActivityApproved'),
                        pending: t('adminActivityPending'),
                        suspend: t('adminActivitySuspend'),
                        validate: t('adminActivityValidate'),
                        featured: t('adminActivityFeatured'),
                        popular: t('adminActivityPopular'),
                        delete: t('adminActivityDelete'),
                        createdBy: t('adminActivityCreatedBy'),
                      }}
                      onToggleApproval={handleToggleApproval}
                      onToggleFeatured={(activity) => handleToggleHighlight(activity, 'isFeatured')}
                      onTogglePopular={(activity) => handleToggleHighlight(activity, 'isPopular')}
                      onDelete={handleDeleteActivity}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB 3 : GESTION DES UTILISATEURS */}
          {activeTab === 'users' && !userAdmin.loading && !userAdmin.error && (
            <View style={styles.tabContent}>
              {/* Barre de recherche */}
              <View style={[styles.searchBox, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <Ionicons name="search" size={18} color={theme.textMuted} />
                <TextInput
                  style={[styles.searchInput, { color: theme.textMain }]}
                  placeholder={t('adminUsersSearch')}
                  placeholderTextColor={theme.textMuted}
                  accessibilityLabel={t('adminUsersSearch')}
                  value={userSearch}
                  onChangeText={setUserSearch}
                  onSubmitEditing={loadUsers}
                  returnKeyType="search"
                />
                {userSearch.length > 0 && (
                  <TouchableOpacity
                    onPress={() => { setUserSearch(''); loadUsers(); }}
                    style={styles.clearSearchButton}
                    accessibilityRole="button"
                    accessibilityLabel={t('adminClearSearch')}
                  >
                    <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filtre par rôle (Membres & Admins uniquement, Partenaires ayant leur onglet dédié) */}
              <View style={[styles.filterPillsRow, { flexDirection: language === 'ar' ? 'row-reverse' : 'row' }]}>
                {[
                  { key: 'all', label: t('adminUserFilterAll') },
                  { key: 'user', label: t('adminUserFilterStandard') },
                  { key: 'admin', label: t('adminUserFilterAdmin') },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.filterPill,
                      userRoleFilter === item.key
                        ? { backgroundColor: theme.primary, borderColor: theme.primary }
                        : { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: 1 },
                    ]}
                    onPress={() => setUserRoleFilter(item.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: userRoleFilter === item.key }}
                    accessibilityLabel={item.label}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: userRoleFilter === item.key ? theme.cardBg : theme.textMuted },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.resultsCount, { color: theme.textMuted }]}>
                {regularUsers.length} {t('adminUsersResults')}
              </Text>

              {regularUsers.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="people-outline" size={42} color={theme.textMuted} />
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                    {t('adminUsersEmpty')}
                  </Text>
                </View>
              ) : (
                <View style={styles.usersList}>
                  {regularUsers.map((user) => {
                    const isSelf = user._id === currentUser?.id;
                    const roleCfg = getUserRoleBadge(user.role, isDark);
                    const statusCfg = getStatusBadge(user.isActive ? 'active' : 'suspended', isDark);

                    return (
                      <View
                        key={user._id}
                        style={[styles.userAdminCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
                      >
                        <View style={[styles.userCardMain, { flexDirection: language === 'ar' ? 'row-reverse' : 'row' }]}>
                          <View style={[styles.userAvatarBox, { backgroundColor: roleCfg.backgroundColor }]}>
                            <Ionicons
                              name={roleCfg.icon}
                              size={20}
                              color={roleCfg.color}
                            />
                          </View>
                          <View style={styles.userInfoCol}>
                            <View style={styles.userNameRow}>
                              <Text style={[styles.userName, { color: theme.textMain }]} numberOfLines={1}>
                                {user.name}
                              </Text>
                              {isSelf && (
                                <View style={[styles.selfBadge, { borderColor: theme.cardBorder }]}>
                                  <Text style={[styles.selfBadgeText, { color: theme.textMuted }]}>{t('adminCurrentUser')}</Text>
                                </View>
                              )}
                            </View>
                            <Text style={[styles.userEmail, { color: theme.textMuted }]} numberOfLines={1}>
                              {user.email}
                            </Text>
                          </View>

                          {/* Role Badge button avec couleur & icône vectorielle distinctes */}
                          <TouchableOpacity
                            style={[
                              styles.roleBadgeBtn,
                              {
                                backgroundColor: roleCfg.backgroundColor,
                                borderColor: roleCfg.borderColor,
                                borderWidth: 1,
                              },
                            ]}
                            disabled={isSelf}
                            onPress={() => {
                              setSelectedUserForRole(user);
                              setRoleModalVisible(true);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`${t('adminChangeRole')}: ${user.name}, ${user.role === 'admin' ? t('adminRoleAdministrator') : t('adminRoleUser')}`}
                            accessibilityState={{ disabled: isSelf }}
                          >
                            <Ionicons name={roleCfg.icon} size={13} color={roleCfg.color} style={{ marginRight: language === 'ar' ? 0 : 4, marginLeft: language === 'ar' ? 4 : 0 }} />
                            <Text
                              style={[
                                styles.roleBadgeText,
                                { color: roleCfg.color },
                              ]}
                            >
                              {user.role === 'admin' ? t('adminRoleAdministrator') : t('adminRoleUser')}
                            </Text>
                            {!isSelf && <Ionicons name="pencil" size={12} color={roleCfg.color} style={{ marginLeft: 4 }} />}
                          </TouchableOpacity>
                        </View>

                        {/* Status Switch bar (Vert Émeraude = Actif, Rouge = Suspendu) */}
                        <View style={[styles.userStatusBar, { borderTopColor: theme.cardBorder, flexDirection: language === 'ar' ? 'row-reverse' : 'row' }]}>
                          <View style={[styles.statusLabelRow, { flexDirection: language === 'ar' ? 'row-reverse' : 'row' }]}>
                            <View
                              style={[
                                styles.statusDot,
                                { backgroundColor: statusCfg.color },
                              ]}
                            />
                            <Text style={[styles.statusText, { color: statusCfg.color }]}>
                              {user.isActive ? t('adminAccountActive') : t('adminAccountSuspended')}
                            </Text>
                          </View>

                          <View style={styles.switchContainer}>
                            <Switch
                              value={user.isActive}
                              disabled={isSelf}
                              onValueChange={() => handleToggleUserStatus(user)}
                              accessibilityLabel={`${user.name}: ${user.isActive ? t('adminAccountActive') : t('adminAccountSuspended')}`}
                              accessibilityHint={t('adminToggleAccountStatusHint')}
                              trackColor={{ false: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5', true: isDark ? 'rgba(16, 185, 129, 0.4)' : '#86EFAC' }}
                              thumbColor={user.isActive ? '#10B981' : theme.cardBg}
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* TAB 4 : ESPACE PARTENAIRES & ÉTABLISSEMENTS */}
          {activeTab === 'partners' && !diagnosticsAdmin.loading && !diagnosticsAdmin.error && (
            <AdminPartnersTab
              partnersStatus={effectivePartnersStatus}
              theme={theme}
              onOpenTierModal={handleTogglePartnerTier}
            />
          )}

          {/* TAB 5 : DIAGNOSTICS & SANTÉ SYSTÈME */}
          {activeTab === 'diagnostics' && !diagnosticsAdmin.loading && !diagnosticsAdmin.error && (
            <AdminDiagnosticsTab
              diagnosticsData={diagnosticsData}
              theme={theme}
              onToggleGlobalElectricity={handleToggleGlobalElectricity}
            />
          )}
        </ScrollView>
      {/* MODAL CHANGEMENT DE RÔLE (SCROLLABLE BOTTOMSHEET) */}
      <ScrollableModal
        visible={roleModalVisible}
        onClose={() => setRoleModalVisible(false)}
        title={t('adminRoleModalTitle')}
        subtitle={`${t('adminRoleModalPrompt')} ${selectedUserForRole?.name || ''}`}
        height="64%"
      >
        <View style={styles.roleModalContent}>
          <View style={styles.roleOptionsList}>
            {(['user', 'partner', 'admin'] as const).map((r) => {
              const rCfg = getUserRoleBadge(r, isDark);
              const isSelected = selectedUserForRole?.role === r;

              return (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleOptionItem,
                    {
                      backgroundColor: isSelected ? rCfg.backgroundColor : isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                      borderColor: isSelected ? rCfg.borderColor : theme.cardBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleConfirmRoleChange(r)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View
                    style={[
                      styles.roleOptionIconCircle,
                      { backgroundColor: rCfg.backgroundColor, borderColor: rCfg.borderColor, borderWidth: 1 },
                    ]}
                  >
                    <Ionicons
                      name={rCfg.icon}
                      size={20}
                      color={rCfg.color}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.roleOptionTitle, { color: theme.textMain }]}>
                        {r === 'admin' ? t('adminRoleAdministrator') : r === 'partner' ? t('adminRolePartner') : t('adminRoleUser')}
                      </Text>
                      {rCfg.tag && (
                        <View style={[styles.badgeTag, { backgroundColor: rCfg.backgroundColor, borderColor: rCfg.borderColor }]}>
                          <Text style={[styles.badgeTagText, { color: rCfg.color }]}>{rCfg.tag}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.roleOptionDesc, { color: theme.textMuted }]}>
                      {r === 'admin'
                        ? t('adminRoleAdministratorDescription')
                        : r === 'partner'
                        ? t('adminRolePartnerDescription')
                        : t('adminRoleUserDescription')}
                    </Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={rCfg.color} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.modalCancelBtn, { borderColor: theme.cardBorder }]}
            onPress={() => setRoleModalVisible(false)}
          >
            <Text style={[styles.modalCancelBtnText, { color: theme.textMain }]}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollableModal>

      {/* MODAL PALIER PARTENAIRE DÉVELOPPÉ (STANDARD / PRO / PREMIUM) */}
      <PartnerTierModal
        visible={partnerTierModalVisible}
        partner={selectedPartnerForTier}
        onClose={() => {
          setPartnerTierModalVisible(false);
          setSelectedPartnerForTier(null);
        }}
        onSaveTier={handleSavePartnerTier}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  tabContent: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  kpiIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  kpiSubRow: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  kpiSubText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardSection: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cityList: {
    gap: 10,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  cityNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityRank: {
    fontSize: 12,
    fontWeight: '700',
    width: 24,
  },
  cityName: {
    fontSize: 14,
    fontWeight: '700',
  },
  cityCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cityCountText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  activitiesList: {
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
    paddingVertical: 4,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    padding: 0,
  },
  clearSearchButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usersList: {
    gap: 10,
  },
  userAdminCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  userCardMain: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  userAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoCol: {
    flex: 1,
    flexBasis: 150,
    minWidth: 140,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
  },
  selfBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#64748B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  selfBadgeText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 1,
  },
  userEstablishment: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  establishmentRow: {
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  roleBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  userStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  statusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  switchContainer: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  roleOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  roleOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    gap: 12,
    padding: 12,
    borderRadius: 14,
  },
  roleOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  roleOptionDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  roleModalContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  roleOptionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeTagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
