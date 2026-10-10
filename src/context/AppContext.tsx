import React, { createContext, useContext, useMemo, useState } from 'react';
import type { AppTab } from '../types';
import type { Activity } from '../types';

interface AppContextValue {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedActivity: Activity | null;
  openActivity: (activity: Activity) => void;
  closeActivity: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const openActivity = (activity: Activity) => setSelectedActivity(activity);
  const closeActivity = () => setSelectedActivity(null);
  const value = useMemo(() => ({ activeTab, setActiveTab, selectedActivity, openActivity, closeActivity }), [activeTab, selectedActivity]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used inside AppProvider');
  return context;
}
