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
import { usePreferences } from '../context/AppPreferencesContext';
import {
  fetchAdminStats,
  fetchAdminUsers,
  updateUserStatus,
  updateUserRole,
  fetchAdminActivities,
  toggleActivityApproval,
  toggleActivityHighlight,
  deleteActivityByAdmin,
  fetchAdminDiagnostics,
  updatePartnerTier,
  toggleGlobalElectricityMode,
} from '../services/adminService';
import {
  AdminPlatformStats,
  AdminUser,
  AdminActivityItem,
  AuthUser,
  UserRole,
  PartnerTier,
} from '../types';
import { AdminDiagnosticsTab } from '../components/admin/AdminDiagnosticsTab';

interface AdminDashboardScreenProps {
  currentUser: AuthUser | null;
  onBack: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  currentUser,
  onBack,
}) => {
  const { isDark, theme, language, setElectricityAlertActive } = usePreferences();

  // Navigation tab inside Admin Dashboard
  const [activeTab, setActiveTab] = useState<'kpi' | 'activities' | 'users' | 'diagnostics'>('kpi');

  // Loading & Refreshing states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);

  // Filters for Activities
  const [activityStatusFilter, setActivityStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // Filters for Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Role selection modal for users
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUser | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  // Load KPI Stats
  const loadStats = useCallback(async () => {
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err: any) {
      console.error('[AdminDashboard] Erreur chargement stats:', err.message);
      setErrorMessage(err.message || 'Erreur lors du chargement des statistiques.');
    }
  }, []);

  // Load Diagnostics & Partner Telemetry
  const loadDiagnostics = useCallback(async () => {
    try {
      const data = await fetchAdminDiagnostics();
      setDiagnosticsData(data);
    } catch (err: any) {
      console.error('[AdminDashboard] Erreur chargement diagnostics:', err.message);
      setErrorMessage(err.message || 'Erreur lors du chargement des diagnostics.');
    }
  }, []);

  // Load Activities for Moderation
  const loadActivities = useCallback(async () => {
    try {
      const statusParam =
        activityStatusFilter === 'all' ? undefined : activityStatusFilter;
      const data = await fetchAdminActivities({ status: statusParam, limit: 50 });
      setActivities(data.activities);
    } catch (err: any) {
      console.error('[AdminDashboard] Erreur chargement activités:', err.message);
      setErrorMessage(err.message || 'Erreur lors du chargement des activités.');
    }
  }, [activityStatusFilter]);

  // Load Users List
  const loadUsers = useCallback(async () => {
    try {
      const roleParam = userRoleFilter === 'all' ? undefined : userRoleFilter;
      const data = await fetchAdminUsers({
        role: roleParam,
        search: userSearch.trim() || undefined,
        limit: 50,
      });
      setUsers(data.users);
    } catch (err: any) {
      console.error('[AdminDashboard] Erreur chargement utilisateurs:', err.message);
      setErrorMessage(err.message || 'Erreur lors du chargement des utilisateurs.');
    }
  }, [userRoleFilter, userSearch]);

  // Basculer le statut Partenaire Standard / Pro / Premium
  const handleTogglePartnerTier = async (partnerId: string, currentTier?: string) => {
    const nextTier: PartnerTier =
      currentTier === 'standard' || !currentTier
        ? 'pro'
        : currentTier === 'pro'
        ? 'premium'
        : 'standard';

    try {
      await updatePartnerTier(partnerId, nextTier);
      if (diagnosticsData?.partnersStatus) {
        setDiagnosticsData({
          ...diagnosticsData,
          partnersStatus: diagnosticsData.partnersStatus.map((p: any) =>
            p.id === partnerId ? { ...p, partnerTier: nextTier } : p
          ),
        });
      }
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === partnerId ? { ...u, partnerTier: nextTier } : u))
      );
      const tierTitle =
        nextTier === 'premium'
          ? 'PREMIUM 👑 (Soirées & Promos)'
          : nextTier === 'pro'
          ? 'PRO ⭐ (Promos exclusives)'
          : 'STANDARD (Gratuit de base)';
      Alert.alert('Palier Partenaire Mis à Jour 🎉', `Le partenaire est désormais en compte : ${tierTitle}`);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de mettre à jour le niveau du partenaire.');
    }
  };

  // Activer ou désactiver le mode alerte coupure d'électricité (Plateforme globale)
  const handleToggleGlobalElectricity = async (nextVal: boolean) => {
    try {
      const res = await toggleGlobalElectricityMode(nextVal);
      setDiagnosticsData((prev: any) => ({
        ...prev,
        electricityAlertActive: res.electricityAlertActive,
      }));
      setElectricityAlertActive(res.electricityAlertActive);
      Alert.alert(
        res.electricityAlertActive ? 'Mode Électricité Activé ⚡💡' : 'Mode Électricité Désactivé',
        res.electricityAlertActive
          ? 'Tous les partenaires peuvent désormais déclarer s’ils ont de la lumière / un générateur, et les cartes affichent le badge doré !'
          : 'Le mode électricité est désormais désactivé et repassé en veille normale.'
      );
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de modifier le mode électricité.');
    }
  };

  // Initial and reactive data fetching
  const refreshCurrentTab = useCallback(async () => {
    setErrorMessage(null);
    if (activeTab === 'kpi') {
      await loadStats();
    } else if (activeTab === 'activities') {
      await loadActivities();
    } else if (activeTab === 'users') {
      await loadUsers();
    } else if (activeTab === 'diagnostics') {
      await loadDiagnostics();
    }
  }, [activeTab, loadStats, loadActivities, loadUsers, loadDiagnostics]);

  useEffect(() => {
    setLoading(true);
    refreshCurrentTab().finally(() => setLoading(false));
  }, [refreshCurrentTab]);

  const onPullRefresh = async () => {
    setRefreshing(true);
    await refreshCurrentTab();
    setRefreshing(false);
  };

  // Activity Moderation Handlers
  const handleToggleApproval = async (item: AdminActivityItem) => {
    try {
      const newApprovalStatus = !item.isApproved;
      const updated = await toggleActivityApproval(item._id, newApprovalStatus);
      setActivities((prev) =>
        prev.map((act) => (act._id === item._id ? { ...act, isApproved: updated.isApproved } : act))
      );
    } catch (err: any) {
      Alert.alert('Erreur de modération', err.message);
    }
  };

  const handleToggleHighlight = async (
    item: AdminActivityItem,
    field: 'isFeatured' | 'isPopular'
  ) => {
    try {
      const updated = await toggleActivityHighlight(item._id, field);
      setActivities((prev) =>
        prev.map((act) => (act._id === item._id ? { ...act, [field]: updated[field] } : act))
      );
    } catch (err: any) {
      Alert.alert('Erreur mise en avant', err.message);
    }
  };

  const handleDeleteActivity = (item: AdminActivityItem) => {
    Alert.alert(
      'Confirmation de suppression',
      `Êtes-vous sûr de vouloir supprimer définitivement l'activité "${item.name}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteActivityByAdmin(item._id);
              setActivities((prev) => prev.filter((act) => act._id !== item._id));
              Alert.alert('Succès', 'Activité supprimée de la plateforme.');
            } catch (err: any) {
              Alert.alert('Erreur', err.message);
            }
          },
        },
      ]
    );
  };

  // User Management Handlers
  const handleToggleUserStatus = async (user: AdminUser) => {
    if (user._id === currentUser?.id) {
      Alert.alert('Action interdite', 'Vous ne pouvez pas suspendre votre propre compte administrateur.');
      return;
    }

    try {
      const newStatus = !user.isActive;
      const updated = await updateUserStatus(user._id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: updated.isActive } : u))
      );
    } catch (err: any) {
      Alert.alert('Erreur statut', err.message);
    }
  };

  const handleConfirmRoleChange = async (newRole: UserRole) => {
    if (!selectedUserForRole) return;
    if (selectedUserForRole._id === currentUser?.id) {
      Alert.alert('Action interdite', 'Vous ne pouvez pas modifier votre propre rôle.');
      setRoleModalVisible(false);
      return;
    }

    try {
      const updated = await updateUserRole(selectedUserForRole._id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUserForRole._id ? { ...u, role: updated.role } : u))
      );
      setRoleModalVisible(false);
      setSelectedUserForRole(null);
      Alert.alert('Succès', `Le rôle a été changé en : ${newRole}`);
    } catch (err: any) {
      Alert.alert('Erreur rôle', err.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header Admin */}
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
              <Text style={[styles.headerTitle, { color: theme.textMain }]}>Admin Center</Text>
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                <Text style={styles.adminBadgeText}>RBAC</Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
              {currentUser?.name || 'Administrateur'} · ActivityTN
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

      {/* Segmented Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'kpi' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setActiveTab('kpi')}
        >
          <Ionicons
            name="bar-chart-outline"
            size={16}
            color={activeTab === 'kpi' ? '#FFFFFF' : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'kpi' ? '#FFFFFF' : theme.textMuted },
            ]}
          >
            Vue d'ensemble
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'activities' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setActiveTab('activities')}
        >
          <Ionicons
            name="checkmark-done-circle-outline"
            size={16}
            color={activeTab === 'activities' ? '#FFFFFF' : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'activities' ? '#FFFFFF' : theme.textMuted },
            ]}
          >
            Modération
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'users' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color={activeTab === 'users' ? '#FFFFFF' : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'users' ? '#FFFFFF' : theme.textMuted },
            ]}
          >
            Utilisateurs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'diagnostics' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setActiveTab('diagnostics')}
        >
          <Ionicons
            name="pulse-outline"
            size={16}
            color={activeTab === 'diagnostics' ? '#FFFFFF' : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'diagnostics' ? '#FFFFFF' : theme.textMuted },
            ]}
          >
            Diagnostics
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Body */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Chargement des données administrateur...
          </Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: theme.textMain }]}>Erreur</Text>
          <Text style={[styles.errorMessage, { color: theme.textMuted }]}>{errorMessage}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.primary }]}
            onPress={refreshCurrentTab}
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
          {/* TAB 1 : VUE D'ENSEMBLE (KPI & STATS) */}
          {activeTab === 'kpi' && stats && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
                Indicateurs Clés de Performance
              </Text>

              {/* Grid des Cartes KPI */}
              <View style={styles.kpiGrid}>
                {/* Utilisateurs totaux */}
                <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="people" size={22} color="#3B82F6" />
                  </View>
                  <Text style={[styles.kpiValue, { color: theme.textMain }]}>
                    {stats.users.total}
                  </Text>
                  <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>
                    Utilisateurs Inscrits
                  </Text>
                  <View style={styles.kpiSubRow}>
                    <Text style={[styles.kpiSubText, { color: '#10B981' }]}>
                      {stats.users.regularUsers} standard
                    </Text>
                    <Text style={[styles.kpiSubText, { color: '#8B5CF6' }]}>
                      · {stats.users.partners} partenaires
                    </Text>
                  </View>
                </View>

                {/* Activités */}
                <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name="compass" size={22} color="#10B981" />
                  </View>
                  <Text style={[styles.kpiValue, { color: theme.textMain }]}>
                    {stats.activities.total}
                  </Text>
                  <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>
                    Activités Publiées
                  </Text>
                  <View style={styles.kpiSubRow}>
                    <Text style={[styles.kpiSubText, { color: stats.activities.pendingApproval > 0 ? '#F59E0B' : '#10B981' }]}>
                      {stats.activities.pendingApproval} en attente
                    </Text>
                  </View>
                </View>

                {/* Partenaires */}
                <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#FAF5FF' }]}>
                    <Ionicons name="briefcase" size={22} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.kpiValue, { color: theme.textMain }]}>
                    {stats.users.partners}
                  </Text>
                  <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>
                    Partenaires Pros
                  </Text>
                  <View style={styles.kpiSubRow}>
                    <Text style={[styles.kpiSubText, { color: '#3B82F6' }]}>
                      {stats.users.admins} admin(s)
                    </Text>
                  </View>
                </View>

                {/* Avis */}
                <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#FFFBEB' }]}>
                    <Ionicons name="star" size={22} color="#F59E0B" />
                  </View>
                  <Text style={[styles.kpiValue, { color: theme.textMain }]}>
                    {stats.reviews.total}
                  </Text>
                  <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>
                    Avis & Notations
                  </Text>
                  <View style={styles.kpiSubRow}>
                    <Text style={[styles.kpiSubText, { color: '#10B981' }]}>
                      Vérifiés
                    </Text>
                  </View>
                </View>
              </View>

              {/* Répartition par ville */}
              <View style={[styles.cardSection, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <View style={styles.cardSectionHeader}>
                  <Ionicons name="map-outline" size={18} color={theme.primary} />
                  <Text style={[styles.cardSectionTitle, { color: theme.textMain }]}>
                    Répartition des Activités par Ville
                  </Text>
                </View>
                <View style={styles.cityList}>
                  {stats.activities.byCity.map((item, index) => (
                    <View key={item.city || index} style={styles.cityRow}>
                      <View style={styles.cityNameContainer}>
                        <Text style={[styles.cityRank, { color: theme.textMuted }]}>#{index + 1}</Text>
                        <Text style={[styles.cityName, { color: theme.textMain }]}>{item.city}</Text>
                      </View>
                      <View style={styles.cityCountBadge}>
                        <Text style={styles.cityCountText}>{item.count} activités</Text>
                      </View>
                    </View>
                  ))}
                  {stats.activities.byCity.length === 0 && (
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                      Aucune donnée de localisation disponible.
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* TAB 2 : MODÉRATION DES ACTIVITÉS */}
          {activeTab === 'activities' && (
            <View style={styles.tabContent}>
              {/* Filtres de statut */}
              <View style={styles.filterPillsRow}>
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
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: activityStatusFilter === filter ? '#FFFFFF' : theme.textMuted },
                      ]}
                    >
                      {filter === 'all'
                        ? 'Toutes'
                        : filter === 'pending'
                        ? 'En attente'
                        : 'Approuvées'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.resultsCount, { color: theme.textMuted }]}>
                {activities.length} activité(s) trouvée(s)
              </Text>

              {activities.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="folder-open-outline" size={42} color={theme.textMuted} />
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                    Aucune activité correspondant à ce filtre.
                  </Text>
                </View>
              ) : (
                <View style={styles.activitiesList}>
                  {activities.map((item) => (
                    <View
                      key={item._id}
                      style={[styles.activityAdminCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
                    >
                      <View style={styles.activityCardTop}>
                        {item.image ? (
                          <Image source={{ uri: item.image }} style={styles.activityThumbnail as any} />
                        ) : (
                          <View style={[styles.activityThumbnailPlaceholder, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                            <Ionicons name="image-outline" size={24} color={theme.textMuted} />
                          </View>
                        )}
                        <View style={styles.activityInfo}>
                          <View style={styles.activityTitleRow}>
                            <Text style={[styles.activityName, { color: theme.textMain }]} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <View
                              style={[
                                styles.approvalBadge,
                                { backgroundColor: item.isApproved ? '#DCFCE7' : '#FEF3C7' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.approvalBadgeText,
                                  { color: item.isApproved ? '#15803D' : '#B45309' },
                                ]}
                              >
                                {item.isApproved ? 'Approuvée' : 'En attente'}
                              </Text>
                            </View>
                          </View>

                          <Text style={[styles.activitySubText, { color: theme.textMuted }]}>
                            {item.city} · {item.category} · {item.price} DT
                          </Text>

                          {item.createdBy && (
                            <Text style={[styles.activityCreator, { color: theme.primary }]}>
                              Par : {item.createdBy.name} {item.createdBy.establishmentName ? `(${item.createdBy.establishmentName})` : ''}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Barre d'actions d'administration */}
                      <View style={[styles.activityActionRow, { borderTopColor: theme.cardBorder }]}>
                        {/* Toggle Approbation */}
                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            item.isApproved
                              ? { backgroundColor: '#FEE2E2' }
                              : { backgroundColor: '#DCFCE7' },
                          ]}
                          onPress={() => handleToggleApproval(item)}
                        >
                          <Ionicons
                            name={item.isApproved ? 'close-circle-outline' : 'checkmark-circle-outline'}
                            size={16}
                            color={item.isApproved ? '#DC2626' : '#15803D'}
                          />
                          <Text
                            style={[
                              styles.actionBtnText,
                              { color: item.isApproved ? '#DC2626' : '#15803D' },
                            ]}
                          >
                            {item.isApproved ? 'Suspendre' : 'Valider'}
                          </Text>
                        </TouchableOpacity>

                        {/* Toggle Featured */}
                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            item.isFeatured
                              ? { backgroundColor: '#FEF3C7' }
                              : { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                          ]}
                          onPress={() => handleToggleHighlight(item, 'isFeatured')}
                        >
                          <Ionicons
                            name={item.isFeatured ? 'star' : 'star-outline'}
                            size={15}
                            color={item.isFeatured ? '#D97706' : theme.textMuted}
                          />
                          <Text
                            style={[
                              styles.actionBtnText,
                              { color: item.isFeatured ? '#D97706' : theme.textMuted },
                            ]}
                          >
                            Featured
                          </Text>
                        </TouchableOpacity>

                        {/* Toggle Popular */}
                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            item.isPopular
                              ? { backgroundColor: '#FFE4E6' }
                              : { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                          ]}
                          onPress={() => handleToggleHighlight(item, 'isPopular')}
                        >
                          <Ionicons
                            name={item.isPopular ? 'flame' : 'flame-outline'}
                            size={15}
                            color={item.isPopular ? '#E11D48' : theme.textMuted}
                          />
                          <Text
                            style={[
                              styles.actionBtnText,
                              { color: item.isPopular ? '#E11D48' : theme.textMuted },
                            ]}
                          >
                            Populaire
                          </Text>
                        </TouchableOpacity>

                        {/* Supprimer */}
                        <TouchableOpacity
                          style={[styles.deleteIconButton, { backgroundColor: '#FEF2F2' }]}
                          onPress={() => handleDeleteActivity(item)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB 3 : GESTION DES UTILISATEURS */}
          {activeTab === 'users' && (
            <View style={styles.tabContent}>
              {/* Barre de recherche */}
              <View style={[styles.searchBox, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <Ionicons name="search" size={18} color={theme.textMuted} />
                <TextInput
                  style={[styles.searchInput, { color: theme.textMain }]}
                  placeholder="Rechercher par nom, email..."
                  placeholderTextColor={theme.textMuted}
                  value={userSearch}
                  onChangeText={setUserSearch}
                  onSubmitEditing={loadUsers}
                  returnKeyType="search"
                />
                {userSearch.length > 0 && (
                  <TouchableOpacity onPress={() => { setUserSearch(''); loadUsers(); }}>
                    <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filtre par rôle */}
              <View style={styles.filterPillsRow}>
                {[
                  { key: 'all', label: 'Tous' },
                  { key: 'user', label: 'Standard' },
                  { key: 'partner', label: 'Partenaire' },
                  { key: 'admin', label: 'Admin' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.filterPill,
                      userRoleFilter === item.key
                        ? { backgroundColor: theme.primary }
                        : { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: 1 },
                    ]}
                    onPress={() => setUserRoleFilter(item.key)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: userRoleFilter === item.key ? '#FFFFFF' : theme.textMuted },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.resultsCount, { color: theme.textMuted }]}>
                {users.length} compte(s) trouvé(s)
              </Text>

              {users.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="people-outline" size={42} color={theme.textMuted} />
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                    Aucun utilisateur trouvé avec ces critères.
                  </Text>
                </View>
              ) : (
                <View style={styles.usersList}>
                  {users.map((user) => {
                    const isSelf = user._id === currentUser?.id;
                    return (
                      <View
                        key={user._id}
                        style={[styles.userAdminCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
                      >
                        <View style={styles.userCardMain}>
                          <View style={styles.userAvatarBox}>
                            <Ionicons
                              name={user.role === 'admin' ? 'shield' : user.role === 'partner' ? 'briefcase' : 'person'}
                              size={20}
                              color={user.role === 'admin' ? '#DC2626' : user.role === 'partner' ? '#7C3AED' : '#2563EB'}
                            />
                          </View>
                          <View style={styles.userInfoCol}>
                            <View style={styles.userNameRow}>
                              <Text style={[styles.userName, { color: theme.textMain }]} numberOfLines={1}>
                                {user.name}
                              </Text>
                              {isSelf && (
                                <View style={styles.selfBadge}>
                                  <Text style={styles.selfBadgeText}>Vous</Text>
                                </View>
                              )}
                            </View>
                            <Text style={[styles.userEmail, { color: theme.textMuted }]} numberOfLines={1}>
                              {user.email}
                            </Text>
                            {user.establishmentName && (
                              <Text style={[styles.userEstablishment, { color: theme.primary }]}>
                                🏢 {user.establishmentName}
                              </Text>
                            )}
                          </View>

                          {/* Role Badge button */}
                          <TouchableOpacity
                            style={[
                              styles.roleBadgeBtn,
                              user.role === 'admin'
                                ? { backgroundColor: '#FEE2E2' }
                                : user.role === 'partner'
                                ? { backgroundColor: '#EDE9FE' }
                                : { backgroundColor: '#EFF6FF' },
                            ]}
                            disabled={isSelf}
                            onPress={() => {
                              setSelectedUserForRole(user);
                              setRoleModalVisible(true);
                            }}
                          >
                            <Text
                              style={[
                                styles.roleBadgeText,
                                user.role === 'admin'
                                  ? { color: '#B91C1C' }
                                  : user.role === 'partner'
                                  ? { color: '#6D28D9' }
                                  : { color: '#1D4ED8' },
                              ]}
                            >
                              {user.role.toUpperCase()}
                            </Text>
                            {!isSelf && <Ionicons name="pencil" size={10} color="#64748B" style={{ marginLeft: 4 }} />}
                          </TouchableOpacity>

                          {/* Palier Partenaire (Standard / Pro / Premium) */}
                          {user.role === 'partner' && (
                            <TouchableOpacity
                              style={[
                                styles.roleBadgeBtn,
                                {
                                  marginLeft: 6,
                                  backgroundColor:
                                    user.partnerTier === 'premium'
                                      ? '#F3E8FF'
                                      : user.partnerTier === 'pro'
                                      ? '#FFEDD5'
                                      : '#F1F5F9',
                                  borderColor:
                                    user.partnerTier === 'premium'
                                      ? '#A855F7'
                                      : user.partnerTier === 'pro'
                                      ? '#F97316'
                                      : '#94A3B8',
                                  borderWidth: 1,
                                },
                              ]}
                              onPress={() => handleTogglePartnerTier(user._id, user.partnerTier)}
                            >
                              <Text
                                style={[
                                  styles.roleBadgeText,
                                  {
                                    color:
                                      user.partnerTier === 'premium'
                                        ? '#9333EA'
                                        : user.partnerTier === 'pro'
                                        ? '#EA580C'
                                        : '#475569',
                                  },
                                ]}
                              >
                                {user.partnerTier === 'premium'
                                  ? '👑 PREMIUM'
                                  : user.partnerTier === 'pro'
                                  ? '⭐ PRO'
                                  : 'STANDARD'}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Status Switch bar */}
                        <View style={[styles.userStatusBar, { borderTopColor: theme.cardBorder }]}>
                          <View style={styles.statusLabelRow}>
                            <View
                              style={[
                                styles.statusDot,
                                { backgroundColor: user.isActive ? '#10B981' : '#EF4444' },
                              ]}
                            />
                            <Text style={[styles.statusText, { color: user.isActive ? '#10B981' : '#EF4444' }]}>
                              {user.isActive ? 'Compte Actif' : 'Compte Suspendu'}
                            </Text>
                          </View>

                          <View style={styles.switchContainer}>
                            <Switch
                              value={user.isActive}
                              disabled={isSelf}
                              onValueChange={() => handleToggleUserStatus(user)}
                              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                              thumbColor="#FFFFFF"
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

          {/* TAB 4 : DIAGNOSTICS, TÉLÉMÉTRIE & STATUT PARTENAIRES */}
          {activeTab === 'diagnostics' && (
            <AdminDiagnosticsTab
              diagnosticsData={diagnosticsData}
              theme={theme}
              isDark={isDark}
              onTogglePartnerTier={handleTogglePartnerTier}
              onToggleGlobalElectricity={handleToggleGlobalElectricity}
            />
          )}
        </ScrollView>
      )}

      {/* MODAL CHANGEMENT DE RÔLE */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: theme.textMain }]}>
              Changer le rôle
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              Sélectionnez le nouveau niveau d'accès pour {selectedUserForRole?.name} :
            </Text>

            <View style={styles.roleOptionsList}>
              {(['user', 'partner', 'admin'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleOptionItem,
                    selectedUserForRole?.role === r && { borderColor: theme.primary, borderWidth: 2 },
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' },
                  ]}
                  onPress={() => handleConfirmRoleChange(r)}
                >
                  <Ionicons
                    name={r === 'admin' ? 'shield-checkmark' : r === 'partner' ? 'briefcase' : 'person'}
                    size={20}
                    color={theme.primary}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleOptionTitle, { color: theme.textMain }]}>
                      {r === 'admin' ? 'Administrateur (admin)' : r === 'partner' ? 'Partenaire Pro (partner)' : 'Utilisateur Simple (user)'}
                    </Text>
                    <Text style={[styles.roleOptionDesc, { color: theme.textMuted }]}>
                      {r === 'admin'
                        ? 'Accès total à la modération et aux KPI'
                        : r === 'partner'
                        ? 'Peut publier et gérer ses activités'
                        : 'Accès consultation et avis standard'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalCancelBtn, { borderColor: theme.cardBorder }]}
              onPress={() => setRoleModalVisible(false)}
            >
              <Text style={[styles.modalCancelBtnText, { color: theme.textMain }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
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
  tabBar: {
    flexDirection: 'row',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
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
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
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
  activityAdminCard: {
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
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  activityThumbnailPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  activityTitleRow: {
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
  approvalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  approvalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  activitySubText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  activityCreator: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  activityActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteIconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    padding: 0,
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
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  userAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoCol: {
    flex: 1,
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
    backgroundColor: '#3B82F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  selfBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 1,
  },
  userEstablishment: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  roleBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
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
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
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
  modalCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
