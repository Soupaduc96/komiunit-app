const isDev = process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';

export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export const Logger = {
  /**
   * Log message
   */
  log: (message: string, data?: any) => {
    if (isDev) {
      console.log(`[LOG] ${message}`, data);
    }
  },

  /**
   * Log info
   */
  info: (message: string, data?: any) => {
    if (isDev) {
      console.info(`[INFO] ${message}`, data);
    }
  },

  /**
   * Log warning
   */
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },

  /**
   * Log error
   */
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },

  /**
   * Log with custom prefix
   */
  logWithPrefix: (prefix: string, message: string, data?: any) => {
    if (isDev) {
      console.log(`[${prefix}] ${message}`, data);
    }
  },

  /**
   * Create a logger instance for a module
   */
  createLogger: (moduleName: string) => ({
    log: (message: string, data?: any) => Logger.logWithPrefix(moduleName, message, data),
    info: (message: string, data?: any) => Logger.logWithPrefix(moduleName, message, data),
    warn: (message: string, data?: any) => console.warn(`[${moduleName}] ${message}`, data),
    error: (message: string, error?: any) => console.error(`[${moduleName}] ${message}`, error),
  }),
};
