import React, { useEffect, useState, useMemo } from 'react';
import {
  Alert,
  BackHandler,
  Modal,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Switch,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppPreferencesProvider, usePreferences } from './src/context/AppPreferencesContext';
import { LocationProvider } from './src/context/LocationContext';
import { ToastProvider } from './src/context/ToastContext';
import { NotificationProvider, useNotifications } from './src/context/NotificationContext';
import { useTranslation } from './src/hooks/useTranslation';
import { ActivityCard } from './src/components/ActivityCard';
import { FloatingTabBar } from './src/components/FloatingTabBar';
import { AnimatedGlowButton } from './src/components/ui/AnimatedGlowButton';
import { HomeScreenTab } from './src/screens/HomeScreenTab';
import ActivityDetailsScreen from './src/screens/ActivityDetailsScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { RecommendationFlowScreen, type RecommendationFilters } from './src/screens/RecommendationFlowScreen';
import { RecommendationResultsScreen } from './src/screens/RecommendationResultsScreen';
import { MapScreen } from './src/screens/MapScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { PartnerDashboardScreen } from './src/screens/PartnerDashboardScreen';
import { CATEGORIES, getLocalizedCategories } from './src/constants/categories';
import { useActivities } from './src/hooks/useActivities';
import type { Activity, AuthUser } from './src/types';
import { logout as authLogout, restoreSession } from './src/services/authService';
import { getUserFavorites, toggleActivityFavorite, localizeActivity } from './src/services/activityService';
import { trackSessionStart, trackScreenView } from './src/services/telemetryService';

function MainContent({ currentUser, onLogout }: { currentUser: AuthUser | null; onLogout: () => void }) {
  const { isDark, theme, toggleDarkMode, language, setLanguage } = usePreferences();
  const { t } = useTranslation();
  const { activities } = useActivities();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'favorites' | 'profile' | 'notifications'>('home');
  const [selectedCat, setSelectedCat] = useState('fun');
  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreCategory, setExploreCategory] = useState('');
  const [exploreBudget, setExploreBudget] = useState('');
  const [exploreDistance, setExploreDistance] = useState('');
  const [mapVisible, setMapVisible] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [recommendationScreen, setRecommendationScreen] = useState<'idle' | 'flow' | 'results'>('idle');
  const [recommendationFilters, setRecommendationFilters] = useState<RecommendationFilters>({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [adminDashboardVisible, setAdminDashboardVisible] = useState(false);
  const [partnerDashboardVisible, setPartnerDashboardVisible] = useState(false);

  // Télémétrie : suivi de la session et des écrans visités
  useEffect(() => {
    trackSessionStart();
  }, []);

  useEffect(() => {
    if (adminDashboardVisible) {
      trackScreenView('admin_dashboard');
    } else if (partnerDashboardVisible) {
      trackScreenView('partner_dashboard');
    } else if (selectedActivity) {
      trackScreenView('activity_details', { activityId: selectedActivity.id });
    } else if (recommendationScreen === 'flow') {
      trackScreenView('recommendation_flow');
    } else if (recommendationScreen === 'results') {
      trackScreenView('recommendation_results');
    } else if (mapVisible) {
      trackScreenView('interactive_map');
    } else {
      trackScreenView(`tab_${activeTab}`);
    }
  }, [activeTab, adminDashboardVisible, partnerDashboardVisible, selectedActivity, recommendationScreen, mapVisible]);

  // Gestion du bouton retour matériel Android pour une navigation fluide
  useEffect(() => {
    const onBackPress = () => {
      if (partnerDashboardVisible) {
        setPartnerDashboardVisible(false);
        return true;
      }
      if (adminDashboardVisible) {
        setAdminDashboardVisible(false);
        return true;
      }
      if (selectedActivity !== null) {
        setSelectedActivity(null);
        return true;
      }
      if (recommendationScreen !== 'idle') {
        setRecommendationScreen('idle');
        return true;
      }
      if (mapVisible) {
        setMapVisible(false);
        return true;
      }
      if (showLogoutModal) {
        setShowLogoutModal(false);
        return true;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }
      return false;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSubscription.remove();
  }, [selectedActivity, recommendationScreen, mapVisible, showLogoutModal, activeTab]);

  // Transform all activities into the active language (FR, AR, EN)
  const localizedActivities = useMemo(() => {
    return activities.map((act) => localizeActivity(act, language as any));
  }, [activities, language]);

  // Charger les favoris réels de l'utilisateur depuis MongoDB
  useEffect(() => {
    let active = true;
    getUserFavorites()
      .then((favIds) => {
        if (active && Array.isArray(favIds)) {
          setFavorites(favIds);
        }
      })
      .catch((err) => {
        console.warn('[App] Erreur chargement favoris MongoDB:', err);
      });

    return () => {
      active = false;
    };
  }, [currentUser]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await authLogout();
    } catch (err) {
      console.warn('[App] Erreur déconnexion:', err);
    }
    setFavorites([]);
    onLogout();
  };

  const toggleFav = async (id: string) => {
    // 1. Mise à jour optimiste immédiate dans l'interface
    const isCurrentlyFav = favorites.includes(id);
    const updatedLocally = isCurrentlyFav
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updatedLocally);

    // 2. Synchronisation avec le backend MongoDB
    try {
      const res = await toggleActivityFavorite(id);
      if (res && res.favorites) {
        setFavorites(res.favorites);
      }
    } catch (err) {
      console.warn('[App] Synchronisation du favori avec MongoDB échouée, état local conservé:', err);
    }
  };
  const exploreResults = localizedActivities.filter((activity) => {
    const queryMatches = !exploreQuery || `${activity.name} ${activity.city} ${activity.category} ${activity.description}`.toLocaleLowerCase().includes(exploreQuery.toLocaleLowerCase());
    const categoryMatches = !exploreCategory || activity.category === exploreCategory;
    const budgetMatches = !exploreBudget || (exploreBudget === '30' ? activity.price <= 30 : exploreBudget === '10' ? activity.price <= 10 : true);
    const distanceMatches = !exploreDistance || (activity.distanceKm !== undefined && (exploreDistance === '5' ? activity.distanceKm <= 5 : exploreDistance === '10' ? activity.distanceKm <= 10 : true));
    return queryMatches && categoryMatches && budgetMatches && distanceMatches;
  });

  if (recommendationScreen === 'flow') {
    return <RecommendationFlowScreen filters={recommendationFilters} onFiltersChange={setRecommendationFilters} onNavigate={(screen) => setRecommendationScreen(screen === 'recommendationResults' ? 'results' : 'idle')} />;
  }

  if (recommendationScreen === 'results') {
    return <RecommendationResultsScreen activities={localizedActivities as any} filters={recommendationFilters} favorites={favorites} onToggleFavorite={toggleFav} onSelectActivity={(activity) => { setSelectedActivity(activity as any); setRecommendationScreen('idle'); }} onNavigate={(screen) => setRecommendationScreen(screen === 'recommendationFlow' ? 'flow' : 'idle')} />;
  }

  if (mapVisible) {
    return <MapScreen activities={localizedActivities as any} onNavigate={() => setMapVisible(false)} onSelectActivity={(activity) => { setSelectedActivity(activity as any); setMapVisible(false); }} />;
  }

  if (adminDashboardVisible) {
    return (
      <AdminDashboardScreen
        currentUser={currentUser}
        onBack={() => setAdminDashboardVisible(false)}
      />
    );
  }

  if (partnerDashboardVisible) {
    return (
      <PartnerDashboardScreen
        currentUser={currentUser}
        onBack={() => setPartnerDashboardVisible(false)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {selectedActivity ? (
        <ActivityDetailsScreen
          activity={selectedActivity as any}
          isFavorite={favorites.includes(selectedActivity.id)}
          currentUser={currentUser}
          onBack={() => setSelectedActivity(null)}
          onToggleFavorite={toggleFav}
        />
      ) : <>

        {/* Screen 1: Home */}
        {activeTab === 'home' && (
          <HomeScreenTab
            activities={localizedActivities}
            selectedCat={selectedCat}
            onSelectCategory={setSelectedCat}
            favorites={favorites}
            onToggleFavorite={toggleFav}
            onSelectActivity={(act) => setSelectedActivity(act)}
            onOpenRecommendations={() => setRecommendationScreen('flow')}
            onOpenNotifications={() => setActiveTab('notifications')}
            unreadCount={unreadCount}
          />
        )}

        {/* Screen 2: Explore */}
        {activeTab === 'explore' && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={{ padding: 20 }}>
              <Text style={[styles.screenTitle, { color: theme.textMain }]}>{t('exploreTitle')}</Text>
              <View style={[styles.searchBar, { backgroundColor: theme.cardBg, marginTop: 16 }]}>
                <Ionicons name="search" size={20} color={theme.textSub} style={{ marginRight: 8 }} />
                <TextInput value={exploreQuery} onChangeText={setExploreQuery} placeholder={t('searchPlaceholder')} placeholderTextColor={theme.textSub} style={[styles.searchInput, { color: theme.textMain }]} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exploreFilters}>
                {['', 'fun', 'sport', 'food', 'outdoor'].map((catKey) => {
                  const catObj = getLocalizedCategories(language).find(c => c.id === catKey);
                  const label = catKey ? (catObj ? catObj.name : catKey) : t('all');
                  return (
                    <TouchableOpacity
                      key={catKey || 'all'}
                      onPress={() => setExploreCategory(catKey)}
                      style={[
                        styles.exploreFilter,
                        {
                          borderColor: theme.cardBorder,
                          backgroundColor: exploreCategory === catKey ? theme.primary : theme.cardBg,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: exploreCategory === catKey ? '#FFFFFF' : theme.textMain,
                          fontWeight: '700',
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {['30', '5'].map((filter) => <TouchableOpacity key={filter} onPress={() => filter === '30' ? setExploreBudget(exploreBudget === filter ? '' : filter) : setExploreDistance(exploreDistance === filter ? '' : filter)} style={[styles.exploreFilter, { borderColor: theme.cardBorder, backgroundColor: (filter === '30' ? exploreBudget : exploreDistance) === filter ? theme.primary : theme.cardBg }]}><Text style={{ color: (filter === '30' ? exploreBudget : exploreDistance) === filter ? '#FFFFFF' : theme.textMain, fontWeight: '700' }}>{filter === '30' ? t('budgetUnder30') : t('distanceUnder5')}</Text></TouchableOpacity>)}
              </ScrollView>
              <TouchableOpacity accessibilityRole="button" onPress={() => setMapVisible(true)} style={[styles.mapExploreButton, { borderColor: theme.primary }]}><Ionicons name="map-outline" size={20} color={theme.primary} /><Text style={{ color: theme.primary, fontWeight: '800' }}>{t('nearbyMap')}</Text></TouchableOpacity>
              <View style={{ marginTop: 24, gap: 16 }}>
                {exploreResults.map((act) => (
                  <ActivityCard
                    key={act.id}
                    activity={act as any}
                    theme={theme}
                    isFavorite={favorites.includes(act.id)}
                    onPress={() => setSelectedActivity(act)}
                    onToggleFavorite={() => toggleFav(act.id)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {/* Screen 3: Favorites */}
        {activeTab === 'favorites' && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={{ padding: 20 }}>
              <Text style={[styles.screenTitle, { color: theme.textMain }]}>{t('favoritesTitle')}</Text>
              {favorites.length === 0 ? (
                <Text style={{ color: theme.textMuted, marginTop: 40, textAlign: 'center' }}>{t('noFavorites')}</Text>
              ) : (
                <View style={{ marginTop: 20, gap: 16 }}>
                  {localizedActivities.filter((a) => favorites.includes(a.id)).map((act) => (
                    <ActivityCard
                      key={act.id}
                      activity={act as any}
                      theme={theme}
                      isFavorite={true}
                      onPress={() => setSelectedActivity(act)}
                      onToggleFavorite={() => toggleFav(act.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {/* Screen 4: Notifications Screen */}
        {activeTab === 'notifications' && (
          <NotificationsScreen
            currentUser={currentUser}
            activities={localizedActivities as any}
            onSelectActivity={(act) => setSelectedActivity(act)}
            onOpenPartnerDashboard={() => setPartnerDashboardVisible(true)}
            onOpenAdminDashboard={() => setAdminDashboardVisible(true)}
          />
        )}

        {/* Screen 5: Profile & Parameters Screen */}
        {activeTab === 'profile' && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View>
              {/* Hero Profil */}
              <View style={[styles.profileHero, { backgroundColor: theme.primary }]}>
                <Image
                  source={{ uri: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }}
                  style={styles.profileAvatar}
                />
                <Text style={styles.profileName}>{currentUser?.name || 'Utilisateur ActivityTN'}</Text>
                <Text style={styles.profileEmail}>{currentUser?.email || ''}</Text>
                <View style={[styles.roleBadge, {
                  backgroundColor: currentUser?.role === 'admin' ? '#EF4444' : currentUser?.role === 'partner' ? '#F59E0B' : '#0D7CF2'
                }]}>
                  <Ionicons
                    name={currentUser?.role === 'admin' ? 'shield-checkmark' : currentUser?.role === 'partner' ? 'cafe' : 'person'}
                    size={12}
                    color="#FFFFFF"
                  />
                  <Text style={styles.roleBadgeText}>
                    {currentUser?.role === 'admin' ? 'Administrateur' : currentUser?.role === 'partner' ? (currentUser.establishmentName || 'Partenaire') : 'Utilisateur'}
                  </Text>
                </View>
                {currentUser?.city && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{currentUser.city}</Text>
                  </View>
                )}
              </View>

              {/* Stats */}
              <View style={[styles.profileStats, { backgroundColor: theme.cardBg }]}>
                <View style={styles.profileStat}>
                  <Text style={[styles.profileStatValue, { color: theme.primary }]}>{favorites.length}</Text>
                  <Text style={[styles.profileStatLabel, { color: theme.textMuted }]}>Favoris</Text>
                </View>
                <View style={[styles.profileStatDivider, { backgroundColor: theme.cardBorder }]} />
                <View style={styles.profileStat}>
                  <Text style={[styles.profileStatValue, { color: theme.primary }]}>14</Text>
                  <Text style={[styles.profileStatLabel, { color: theme.textMuted }]}>Découvertes</Text>
                </View>
                <View style={[styles.profileStatDivider, { backgroundColor: theme.cardBorder }]} />
                <View style={styles.profileStat}>
                  <Text style={[styles.profileStatValue, { color: theme.primary }]}>4.8</Text>
                  <Text style={[styles.profileStatLabel, { color: theme.textMuted }]}>Note moy.</Text>
                </View>
              </View>

              <View style={{ gap: 12, padding: 20 }}>
                {currentUser?.role === 'admin' && (
                  <TouchableOpacity
                    style={[
                      styles.adminCtaCard,
                      {
                        backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
                        borderColor: isDark ? '#4338CA' : '#C7D2FE',
                      },
                    ]}
                    onPress={() => setAdminDashboardVisible(true)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.adminCtaLeft}>
                      <View style={styles.adminCtaIconBox}>
                        <Ionicons name="shield-checkmark" size={24} color="#4F46E5" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.adminCtaTitle, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]}>
                            Panneau d'administration
                          </Text>
                          <View style={styles.adminPill}>
                            <Text style={styles.adminPillText}>ADMIN</Text>
                          </View>
                        </View>
                        <Text style={[styles.adminCtaSub, { color: isDark ? '#A5B4FC' : '#4F46E5' }]}>
                          KPI en direct, modération & gestion
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
                  </TouchableOpacity>
                )}

                {currentUser?.role === 'partner' && (
                  <TouchableOpacity
                    style={[
                      styles.adminCtaCard,
                      {
                        backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
                        borderColor: isDark ? '#4338CA' : '#818CF8',
                      },
                    ]}
                    onPress={() => setPartnerDashboardVisible(true)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.adminCtaLeft}>
                      <View style={[styles.adminCtaIconBox, { backgroundColor: '#EDE9FE' }]}>
                        <Ionicons name="restaurant" size={24} color="#6D28D9" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.adminCtaTitle, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]} numberOfLines={1}>
                            {currentUser?.establishmentName || 'Espace Partenaire Pro'}
                          </Text>
                          <View style={[styles.adminPill, { backgroundColor: '#6D28D9' }]}>
                            <Text style={styles.adminPillText}>PRO</Text>
                          </View>
                        </View>
                        <Text style={[styles.adminCtaSub, { color: isDark ? '#C7D2FE' : '#6D28D9' }]}>
                          Gérer mon restaurant / établissement & mes offres
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6D28D9" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]} onPress={() => setActiveTab('notifications')}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name="notifications-outline" size={22} color={theme.primary} />
                    <Text style={[styles.settingText, { color: theme.textMain }]}>{t('notifications')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.textSub} />
                </TouchableOpacity>

                <View style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={theme.primary} />
                    <Text style={[styles.settingText, { color: theme.textMain }]}>{t('darkMode')}</Text>
                  </View>
                  <Switch value={isDark} onValueChange={toggleDarkMode} trackColor={{ false: '#CBD5E1', true: theme.primary }} thumbColor="#FFFFFF" />
                </View>

                <View style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name="notifications-outline" size={22} color={theme.primary} />
                    <Text style={[styles.settingText, { color: theme.textMain }]}>{t('notifications')}</Text>
                  </View>
                  <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: '#CBD5E1', true: theme.primary }} thumbColor="#FFFFFF" />
                </View>

                <View style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name="language-outline" size={22} color={theme.primary} />
                    <Text style={[styles.settingText, { color: theme.textMain }]}>{t('language')}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {(['ar', 'fr', 'en'] as const).map((item) => (
                      <TouchableOpacity key={item} accessibilityRole="button" onPress={() => setLanguage(item)} style={[styles.languageChip, language === item && { backgroundColor: theme.primary }]}>
                        <Text style={{ color: language === item ? '#FFFFFF' : theme.textMain, fontWeight: '700' }}>{item.toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[styles.settingRow, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name="navigate-outline" size={22} color={theme.primary} />
                    <Text style={[styles.settingText, { color: theme.textMain }]}>{t('locationServices')}</Text>
                  </View>
                  <Switch value={locationServicesEnabled} onValueChange={setLocationServicesEnabled} trackColor={{ false: '#CBD5E1', true: theme.primary }} thumbColor="#FFFFFF" />
                </View>

                {/* Bouton Déconnexion */}
                <TouchableOpacity
                  style={[styles.settingRow, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
                  onPress={handleLogout}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                    <Text style={[styles.settingText, { color: '#EF4444' }]}>
                      {language === 'fr' ? 'Se déconnecter' : language === 'en' ? 'Sign Out' : 'تسجيل الخروج'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#EF4444" />
                </TouchableOpacity>

                <Text style={{ color: theme.textMuted, textAlign: 'center', fontSize: 12, marginTop: 8 }}>ActivityTN · Version 1.0</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* ALWAYS VISIBLE FLOATING BOTTOM TAB BAR */}
        <FloatingTabBar activeTab={activeTab} theme={theme} onTabChange={setActiveTab} notificationsCount={unreadCount} />
      </>}

      {/* Modal de confirmation de déconnexion moderne & multi-plateforme */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.logoutModalCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={styles.logoutModalIconBox}>
              <Ionicons name="log-out-outline" size={32} color="#EF4444" />
            </View>
            <Text style={[styles.logoutModalTitle, { color: theme.textMain }]}>
              {language === 'fr' ? 'Déconnexion' : language === 'en' ? 'Sign Out' : 'تسجيل الخروج'}
            </Text>
            <Text style={[styles.logoutModalMessage, { color: theme.textMuted }]}>
              {language === 'fr'
                ? 'Êtes-vous sûr de vouloir vous déconnecter de votre compte ActivityTN ?'
                : language === 'en'
                ? 'Are you sure you want to sign out from your ActivityTN account?'
                : 'هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك في ActivityTN؟'}
            </Text>
            <View style={styles.logoutModalActions}>
              <TouchableOpacity
                style={[styles.logoutModalCancelBtn, { borderColor: theme.cardBorder, backgroundColor: theme.cardBg }]}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.logoutModalCancelText, { color: theme.textMain }]}>
                  {language === 'fr' ? 'Annuler' : language === 'en' ? 'Cancel' : 'إلغاء'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutModalConfirmBtn}
                onPress={handleConfirmLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.logoutModalConfirmText}>
                  {language === 'fr' ? 'Confirmer' : language === 'en' ? 'Confirm' : 'تأكيد الخروج'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Restauration automatique de la session persistée (token + profil) au démarrage
  useEffect(() => {
    let active = true;
    restoreSession()
      .then((savedUser) => {
        if (active && savedUser) {
          console.log(`[App] 🔑 Session restaurée automatiquement pour: ${savedUser.name} (${savedUser.email})`);
          setCurrentUser(savedUser);
        }
      })
      .catch((err) => {
        console.warn('[App] Erreur restauration session persistée:', err);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    authLogout();
    setCurrentUser(null);
  };

  return (
    <SafeAreaProvider>
      <AppPreferencesProvider>
        <LocationProvider>
          <ToastProvider>
            <NotificationProvider>
              <IntroGate currentUser={currentUser} onAuthSuccess={setCurrentUser} onLogout={handleLogout} />
            </NotificationProvider>
          </ToastProvider>
        </LocationProvider>
      </AppPreferencesProvider>
    </SafeAreaProvider>
  );
}

function IntroGate({
  currentUser,
  onAuthSuccess,
  onLogout,
}: {
  currentUser: AuthUser | null;
  onAuthSuccess: (u: AuthUser) => void;
  onLogout: () => void;
}) {
  const [screen, setScreen] = useState<'splash' | 'onboarding' | 'auth' | 'app'>('splash');

  // Si l'utilisateur est connecté (session restaurée ou login réussi), aller directement à l'application
  if (currentUser) {
    return (
      <MainContent
        currentUser={currentUser}
        onLogout={() => {
          onLogout();
          setScreen('auth');
        }}
      />
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher splash ou onboarding lors du premier lancement
  if (screen === 'splash') {
    return (
      <SplashScreen
        onNavigate={(next: string) =>
          setScreen(next === 'onboarding' ? 'onboarding' : 'auth')
        }
      />
    );
  }

  if (screen === 'onboarding') {
    return (
      <OnboardingScreen
        onNavigate={() => setScreen('auth')}
      />
    );
  }

  return (
    <AuthScreen
      onSuccess={(user) => {
        onAuthSuccess(user);
        setScreen('app');
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '900',
  },
  headerCard: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  headerTextContainer: {
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  recommendationCta: {
    minHeight: 76,
    borderRadius: 22,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recommendationCtaTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  recommendationCtaText: {
    color: '#FCE7F3',
    fontSize: 12,
    marginTop: 3,
  },
  exploreFilters: {
    gap: 8,
    paddingTop: 14,
  },
  exploreFilter: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapExploreButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 24,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '800',
  },
  locationSub: {
    fontSize: 13,
    fontWeight: '600',
  },
  catList: {
    gap: 10,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  catText: {
    fontSize: 14,
    fontWeight: '800',
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderRadius: 20,
  },
  notifIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  adminCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  adminCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  adminCtaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminCtaTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  adminPill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  adminPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  adminCtaSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '700',
  },
  languageChip: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  profileHero: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900' as const,
  },
  profileEmail: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  profileStats: {
    flexDirection: 'row' as const,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    paddingVertical: 16,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  profileStat: {
    alignItems: 'center' as const,
    flex: 1,
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: '900' as const,
  },
  profileStatLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  profileStatDivider: {
    height: 30,
    width: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoutModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  logoutModalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutModalTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    textAlign: 'center',
    marginBottom: 8,
  },
  logoutModalMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutModalActions: {
    flexDirection: 'row' as const,
    width: '100%',
    gap: 12,
  },
  logoutModalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  logoutModalCancelText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  logoutModalConfirmBtn: {
    flex: 1.2,
    flexDirection: 'row' as const,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    elevation: 3,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoutModalConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
