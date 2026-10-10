import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Coordinates,
  UserLocationData,
  LocationPermissionState,
  SFAX_DEFAULT_LOCATION,
  SUPPORTED_CITIES,
  CityConfig,
  checkLocationPermission,
  getLiveUserLocation,
  fetchSupportedCities,
} from '../services/locationService';

interface LocationContextValue {
  location: UserLocationData;
  permissionStatus: LocationPermissionState;
  isLocating: boolean;
  requestGpsLocation: () => Promise<boolean>;
  selectCity: (cityKey: string) => void;
  activeCityConfig: CityConfig;
  allCities: CityConfig[];
  availableActiveCities: CityConfig[];
}

const LocationContext = createContext<LocationContextValue | null>(null);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<UserLocationData>(SFAX_DEFAULT_LOCATION);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionState>('undetermined');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [citiesMap, setCitiesMap] = useState<Record<string, CityConfig>>(SUPPORTED_CITIES);

  useEffect(() => {
    checkLocationPermission().then((status) => {
      setPermissionStatus(status);
      if (status === 'granted') {
        requestGpsLocation();
      }
    });

    // Chargement dynamique des villes depuis l'API MongoDB
    fetchSupportedCities().then((cities) => {
      if (Array.isArray(cities) && cities.length > 0) {
        const map: Record<string, CityConfig> = {};
        cities.forEach((c) => {
          map[c.name] = c;
        });
        setCitiesMap(map);
      }
    });
  }, []);

  const requestGpsLocation = useCallback(async (): Promise<boolean> => {
    setIsLocating(true);
    try {
      const result = await getLiveUserLocation();
      if (result) {
        setLocation(result);
        setPermissionStatus('granted');
        return true;
      } else {
        setPermissionStatus('denied');
        return false;
      }
    } finally {
      setIsLocating(false);
    }
  }, []);

  const selectCity = useCallback((cityKey: string) => {
    const config = citiesMap[cityKey] || SUPPORTED_CITIES[cityKey];
    if (config) {
      setLocation({
        coords: config.coords,
        city: config.name,
        cityAr: config.nameAr,
        cityFr: config.nameFr || config.name,
        cityEn: config.nameEn || config.name,
        source: 'manual',
        isInActiveRegion: config.isActive,
      });
    }
  }, [citiesMap]);

  const allCities = useMemo(() => Object.values(citiesMap), [citiesMap]);
  const availableActiveCities = useMemo(() => Object.values(citiesMap).filter((c) => c.isActive), [citiesMap]);
  const activeCityConfig = useMemo(
    () => citiesMap[location.city] || SUPPORTED_CITIES[location.city] || SUPPORTED_CITIES.Sfax,
    [location.city, citiesMap]
  );

  const value = useMemo(
    () => ({
      location,
      permissionStatus,
      isLocating,
      requestGpsLocation,
      selectCity,
      activeCityConfig,
      allCities,
      availableActiveCities,
    }),
    [location, permissionStatus, isLocating, requestGpsLocation, selectCity, activeCityConfig, allCities, availableActiveCities]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};


export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
