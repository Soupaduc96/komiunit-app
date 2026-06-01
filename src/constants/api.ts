// API Configuration
export const API_CONFIG = {
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10),
  retryAttempts: parseInt(process.env.EXPO_PUBLIC_API_RETRY_ATTEMPTS || '3', 10),
  enableOfflineMode: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },

  // Users
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
  },

  // Modules
  komiSend: {
    list: '/komi-send',
    create: '/komi-send',
    detail: '/komi-send/:id',
    update: '/komi-send/:id',
    delete: '/komi-send/:id',
  },

  komiSol: {
    list: '/komi-sol',
    create: '/komi-sol',
    detail: '/komi-sol/:id',
    categories: '/komi-sol/categories',
  },

  komiMarche: {
    products: '/products',
    orders: '/orders',
    cart: '/cart',
  },

  komiLearn: {
    courses: '/courses',
    lessons: '/lessons/:courseId',
    progress: '/progress/:courseId',
  },

  komiVoix: {
    contacts: '/contacts',
    calls: '/calls',
  },
};

// Storage Buckets
export const STORAGE_BUCKETS = {
  avatars: 'avatars',
  documents: 'documents',
  products: 'products',
  courses: 'courses',
  voiceMessages: 'voice-messages',
};
