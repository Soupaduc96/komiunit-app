import { VALIDATION_ERRORS } from '@/constants/errors';

export const Validation = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   */
  isValidPassword: (password: string): boolean => {
    return password.length >= 8;
  },

  /**
   * Validate phone number
   */
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Validate full name
   */
  isValidName: (name: string): boolean => {
    return name.trim().length >= 2;
  },

  /**
   * Validate required field
   */
  isRequired: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  /**
   * Validate minimum length
   */
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  /**
   * Validate maximum length
   */
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  /**
   * Validate passwords match
   */
  passwordsMatch: (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  },

  /**
   * Validate numeric input
   */
  isNumeric: (value: string): boolean => {
    return /^\d+(\.\d+)?$/.test(value);
  },

  /**
   * Get validation error message
   */
  getErrorMessage: (field: string, rule: string, params?: Record<string, any>): string => {
    const allErrors = {
      ...VALIDATION_ERRORS,
    } as Record<string, string>;

    let message = allErrors[rule] || 'Invalid input';

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, String(value));
      });
    }

    return `${field}: ${message}`;
  },
};
