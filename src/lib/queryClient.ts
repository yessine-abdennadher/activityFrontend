import { QueryClient, onlineManager } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import NetInfo from '@react-native-community/netinfo';

// Synchronisation automatique de l'état réseau avec TanStack Query
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    // Si isConnected est null ou true, on considère en ligne, sinon hors-ligne
    const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
    setOnline(isOnline);
  });
});

// Persister du cache sur le stockage local du smartphone (survit au redémarrage de l'app)
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'ACTIVITYTN_QUERY_CACHE_V1',
  throttleTime: 1000,
});

// Instance du QueryClient configurée pour le mode Offline-First
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // Cache conservé 24 heures en local
      staleTime: 1000 * 60 * 10,    // Données considérées fraîches pendant 10 minutes
      networkMode: 'offlineFirst',  // Stratégie hors-ligne : renvoie le cache immédiatement
      refetchOnWindowFocus: false,  // Évite les rechargements intempestifs sur mobile
      retry: (failureCount) => {
        // Ne pas gaspiller la batterie si l'appareil n'a pas de connexion
        if (!onlineManager.isOnline()) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});
