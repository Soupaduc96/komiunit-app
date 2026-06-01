import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const Formatting = {
  /**
   * Format currency
   */
  currency: (amount: number, currency: string = 'USD'): string => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
      }).format(isFinite(amount) ? amount : 0);
    } catch {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        isFinite(amount) ? amount : 0,
      );
    }
  },

  /**
   * Format percentage
   */
  percentage: (value: number, decimals: number = 0): string => {
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * Format date
   */
  date: (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, formatStr);
    } catch {
      return '';
    }
  },

  /**
   * Format time
   */
  time: (date: string | Date, formatStr: string = 'HH:mm'): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, formatStr);
    } catch {
      return '';
    }
  },

  /**
   * Format date and time
   */
  dateTime: (date: string | Date, formatStr: string = 'MMM dd, yyyy HH:mm'): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, formatStr);
    } catch {
      return '';
    }
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  relative: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
      return '';
    }
  },

  /**
   * Format phone number
   */
  phone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  },

  /**
   * Format file size
   */
  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Truncate text
   */
  truncate: (text: string, length: number = 50, suffix: string = '...'): string => {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
  },

  /**
   * Capitalize first letter
   */
  capitalize: (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  /**
   * Convert to sentence case
   */
  sentenceCase: (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => Formatting.capitalize(word))
      .join(' ');
  },
};
