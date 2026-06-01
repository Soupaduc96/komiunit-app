import { supabase } from './client';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  fullName: string;
}

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new user account
   */
  static async signUp(email: string, password: string, fullName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current session
   */
  static async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data?.session;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user
   */
  static async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data?.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend the email confirmation link.
   * Supabase rate-limits this to once per 60 s per email address.
   */
  static async resendConfirmation(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Handle authentication errors
   */
  private static handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }

    const message = error?.message || 'An authentication error occurred';
    return new Error(message);
  }
}
