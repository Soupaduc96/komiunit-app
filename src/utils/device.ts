import { Platform } from 'react-native';
import * as Device from 'expo-device';

export const DeviceUtil = {
  /**
   * Get platform name
   */
  getPlatform: (): 'ios' | 'android' | 'web' => {
    if (Platform.OS === 'ios') return 'ios';
    if (Platform.OS === 'android') return 'android';
    return 'web';
  },

  /**
   * Check if running on iOS
   */
  isIOS: (): boolean => Platform.OS === 'ios',

  /**
   * Check if running on Android
   */
  isAndroid: (): boolean => Platform.OS === 'android',

  /**
   * Check if running on Web
   */
  isWeb: (): boolean => Platform.OS === 'web',

  /**
   * Check if running on physical device
   */
  isPhysicalDevice: (): boolean => Device.isDevice,

  /**
   * Get device name
   */
  getDeviceName: (): string => Device.deviceName || 'Unknown Device',

  /**
   * Get OS version
   */
  getOSVersion: (): string => Device.osVersion || 'Unknown',

  /**
   * Check if device is tablet
   */
  isTablet: (): boolean => {
    return Device.deviceType === Device.DeviceType.TABLET;
  },

  /**
   * Check if device is phone
   */
  isPhone: (): boolean => {
    return Device.deviceType === Device.DeviceType.PHONE;
  },

  /**
   * Get screen dimensions
   */
  getScreenDimensions: () => {
    const { width, height } = Platform.select({
      web: {
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
      },
      default: {
        width: 0,
        height: 0,
      },
    });

    return { width, height };
  },

  /**
   * Check if screen is in portrait mode
   */
  isPortrait: (): boolean => {
    const { width, height } = DeviceUtil.getScreenDimensions();
    return height > width;
  },

  /**
   * Check if screen is in landscape mode
   */
  isLandscape: (): boolean => {
    const { width, height } = DeviceUtil.getScreenDimensions();
    return width > height;
  },
};
