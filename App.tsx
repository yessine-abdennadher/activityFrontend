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
import { ExploreScreen } from './src/screens/ExploreScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { LogoutConfirmModal } from './src/components/ui/LogoutConfirmModal';
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
import { useActivities } from './src/hooks/useActivities';
import type { Activity, AuthUser } from './src/types';
import { logout as authLogout, restoreSession } from './src/services/authService';
import { getUserFavorites, toggleActivityFavorite, localizeActivity } from './src/services/activityService';
import { trackSessionStart, trackScreenView } from './src/services/telemetryService';

function MainContent({
  currentUser,
  onLogout,
  onUpdateUser,
}: {
  currentUser: AuthUser | null;
  onLogout: () => void;
  onUpdateUser: (user: AuthUser) => void;
}) {
  const { isDark, theme, toggleDarkMode, language, setLanguage } = usePreferences();
  const { t } = useTranslation();
  const { activities } = useActivities();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'favorites' | 'profile' | 'notifications'>('home');
  const [selectedCat, setSelectedCat] = useState('fun');
  const [mapVisible, setMapVisible] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [recommendationScreen, setRecommendationScreen] = useState<'idle' | 'flow' | 'results'>('idle');
  const [recommendationFilters, setRecommendationFilters] = useState<RecommendationFilters>({});
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
            currentUser={currentUser}
            onOpenProfile={() => setActiveTab('profile')}
          />
        )}

        {/* Screen 2: Explore */}
        {activeTab === 'explore' && (
          <ExploreScreen
            activities={localizedActivities}
            favorites={favorites}
            onToggleFavorite={toggleFav}
            onSelectActivity={(act) => setSelectedActivity(act)}
            onOpenMap={() => setMapVisible(true)}
          />
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
          <ProfileScreen
            currentUser={currentUser}
            favoritesCount={favorites.length}
            onUpdateUser={onUpdateUser}
            onLogout={handleLogout}
            onOpenNotifications={() => setActiveTab('notifications')}
            onOpenAdminDashboard={() => setAdminDashboardVisible(true)}
            onOpenPartnerDashboard={() => setPartnerDashboardVisible(true)}
          />
        )}

        {/* ALWAYS VISIBLE FLOATING BOTTOM TAB BAR */}
        <FloatingTabBar activeTab={activeTab} theme={theme} onTabChange={setActiveTab} notificationsCount={unreadCount} />
      </>}

      {/* Modal de confirmation de déconnexion moderne & multi-plateforme */}
      <LogoutConfirmModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
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
        onUpdateUser={onAuthSuccess}
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
});
