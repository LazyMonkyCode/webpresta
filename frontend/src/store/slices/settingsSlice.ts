import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  appDomain: string;
  interestRate: number;
  currency: string;
  minLoan: number;
  maxLoan: number;
  notificationsEnabled: boolean;
  supportEmail: string;
  appLogo: string | null;
  maintenanceMode: boolean;
  defaultLanguage: string;
  allowNewClients: boolean;
  graceDays: number;
  // Acciones
  lastBackup: string | null;
  lastSync: string | null;
  lastUpdateCheck: string | null;
}

const initialState: SettingsState = {
  appDomain: '',
  interestRate: 0,
  currency: 'ARS',
  minLoan: 1000,
  maxLoan: 1000000,
  notificationsEnabled: true,
  supportEmail: '',
  appLogo: null,
  maintenanceMode: false,
  defaultLanguage: 'es',
  allowNewClients: true,
  graceDays: 0,
  lastBackup: null,
  lastSync: null,
  lastUpdateCheck: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setAppDomain(state, action: PayloadAction<string>) {
      state.appDomain = action.payload;
    },
    setInterestRate(state, action: PayloadAction<number>) {
      state.interestRate = action.payload;
    },
    setCurrency(state, action: PayloadAction<string>) {
      state.currency = action.payload;
    },
    setMinLoan(state, action: PayloadAction<number>) {
      state.minLoan = action.payload;
    },
    setMaxLoan(state, action: PayloadAction<number>) {
      state.maxLoan = action.payload;
    },
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
    },
    setSupportEmail(state, action: PayloadAction<string>) {
      state.supportEmail = action.payload;
    },
    setAppLogo(state, action: PayloadAction<string | null>) {
      state.appLogo = action.payload;
    },
    setMaintenanceMode(state, action: PayloadAction<boolean>) {
      state.maintenanceMode = action.payload;
    },
    setDefaultLanguage(state, action: PayloadAction<string>) {
      state.defaultLanguage = action.payload;
    },
    setAllowNewClients(state, action: PayloadAction<boolean>) {
      state.allowNewClients = action.payload;
    },
    setGraceDays(state, action: PayloadAction<number>) {
      state.graceDays = action.payload;
    },
    setLastBackup(state, action: PayloadAction<string | null>) {
      state.lastBackup = action.payload;
    },
    setLastSync(state, action: PayloadAction<string | null>) {
      state.lastSync = action.payload;
    },
    setLastUpdateCheck(state, action: PayloadAction<string | null>) {
      state.lastUpdateCheck = action.payload;
    },
    resetSettings(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setAppDomain,
  setInterestRate,
  setCurrency,
  setMinLoan,
  setMaxLoan,
  setNotificationsEnabled,
  setSupportEmail,
  setAppLogo,
  setMaintenanceMode,
  setDefaultLanguage,
  setAllowNewClients,
  setGraceDays,
  setLastBackup,
  setLastSync,
  setLastUpdateCheck,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer; 