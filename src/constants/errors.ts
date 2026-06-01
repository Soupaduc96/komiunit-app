// Authentication Errors
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Email or password is incorrect',
  EMAIL_TAKEN: 'This email is already registered',
  WEAK_PASSWORD: 'Password must be at least 8 characters',
  INVALID_EMAIL: 'Please enter a valid email address',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',
  ACCOUNT_DISABLED: 'This account has been disabled',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
} as const;

// Network Errors
export const NETWORK_ERRORS = {
  NETWORK_ERROR: 'Network error. Please check your connection',
  TIMEOUT: 'Request timeout. Please try again',
  SERVER_ERROR: 'Server error. Please try again later',
  NOT_FOUND: 'Resource not found',
} as const;

// Validation Errors
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  MIN_LENGTH: 'Input must be at least {min} characters',
  MAX_LENGTH: 'Input must not exceed {max} characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_PHONE: 'Please enter a valid phone number',
} as const;

// Module Errors
export const MODULE_ERRORS = {
  SEND_FAILED: 'Failed to send. Please try again',
  RECIPIENT_NOT_FOUND: 'Recipient not found',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  PRODUCT_OUT_OF_STOCK: 'Product is out of stock',
  INVALID_COURSE_ID: 'Course not found',
  CALL_FAILED: 'Call failed. Please try again',
} as const;

export type AuthError = keyof typeof AUTH_ERRORS;
export type NetworkError = keyof typeof NETWORK_ERRORS;
export type ValidationError = keyof typeof VALIDATION_ERRORS;
export type ModuleError = keyof typeof MODULE_ERRORS;

/**
 * Get error message by key
 */
export const getErrorMessage = (key: string, params?: Record<string, any>): string => {
  const allErrors = {
    ...AUTH_ERRORS,
    ...NETWORK_ERRORS,
    ...VALIDATION_ERRORS,
    ...MODULE_ERRORS,
  };

  let message = (allErrors as Record<string, string>)[key] || 'An error occurred';

  // Replace placeholders
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
    });
  }

  return message;
};
