import { useCallback, useEffect, useState } from 'react';
import { Storage } from '@/utils/storage';

export type AppLanguage = 'en' | 'fr' | 'es' | 'pt' | 'ht';
export type AppCurrency = 'USD' | 'EUR' | 'HTG' | 'CAD' | 'GBP';

export interface Preferences {
  language: AppLanguage;
  currency: AppCurrency;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

const DEFAULTS: Preferences = {
  language: 'en',
  currency: 'USD',
  pushNotifications: true,
  emailNotifications: true,
};

export const LANGUAGE_OPTIONS: { value: AppLanguage; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'ht', label: 'Kreyòl Ayisyen', flag: '🇭🇹' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'pt', label: 'Português', flag: '🇧🇷' },
];

export const CURRENCY_OPTIONS: { value: AppCurrency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'HTG', label: 'Haitian Gourde', symbol: 'G' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
];

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Storage.getPreferences().then((stored) => {
      setPreferences({ ...DEFAULTS, ...stored });
      setLoading(false);
    });
  }, []);

  const updatePreference = useCallback(
    async <K extends keyof Preferences>(key: K, value: Preferences[K]): Promise<void> => {
      const updated = { ...preferences, [key]: value };
      setPreferences(updated);
      await Storage.setPreferences(updated);
    },
    [preferences]
  );

  const resetPreferences = useCallback(async (): Promise<void> => {
    setPreferences(DEFAULTS);
    await Storage.setPreferences(DEFAULTS);
  }, []);

  return {
    preferences,
    loading,
    updatePreference,
    resetPreferences,
  };
};
