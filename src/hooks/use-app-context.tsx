import React, { createContext, useContext, ReactNode } from 'react';
import { createDIContainer, DIContainer } from '../config/di';
import { SupabaseClient } from '@supabase/supabase-js';

interface AppContextValue {
  di: DIContainer;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  supabase: SupabaseClient;
}

export function AppProvider({ children, supabase }: AppProviderProps) {
  const di = createDIContainer(supabase);

  return <AppContext.Provider value={{ di }}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return context;
}

export function useDI(): DIContainer {
  const { di } = useAppContext();
  return di;
}

// Specialized hooks para cada serviço
export function useEquipmentService() {
  const { di } = useAppContext();
  return di.equipmentService;
}

export function useMovementService() {
  const { di } = useAppContext();
  return di.movementService;
}

export function useEquipmentRepository() {
  const { di } = useAppContext();
  return di.equipmentRepository;
}

export function useMovementRepository() {
  const { di } = useAppContext();
  return di.movementRepository;
}
