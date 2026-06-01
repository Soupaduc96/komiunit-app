import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@komiunit_';

export const Storage = {
  /**
   * Set item in storage
   */
  setItem: async (key: string, value: any): Promise<void> => {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(storageKey, jsonValue);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  /**
   * Get item from storage
   */
  getItem: async (key: string): Promise<any> => {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      const jsonValue = await AsyncStorage.getItem(storageKey);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  /**
   * Remove item from storage
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },

  /**
   * Clear all storage
   */
  clear: async (): Promise<void> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const komiunitKeys = allKeys.filter((key) => key.startsWith(STORAGE_PREFIX));
      await AsyncStorage.multiRemove(komiunitKeys);
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },

  /**
   * Get all keys
   */
  getAllKeys: async (): Promise<string[]> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .map((key) => key.replace(STORAGE_PREFIX, ''));
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  },

  /**
   * Set user preferences
   */
  setPreferences: async (preferences: Record<string, any>): Promise<void> => {
    await Storage.setItem('preferences', preferences);
  },

  /**
   * Get user preferences
   */
  getPreferences: async (): Promise<Record<string, any>> => {
    const prefs = await Storage.getItem('preferences');
    return prefs || {};
  },

  /**
   * Update preference
   */
  updatePreference: async (key: string, value: any): Promise<void> => {
    const preferences = await Storage.getPreferences();
    preferences[key] = value;
    await Storage.setPreferences(preferences);
  },
};
