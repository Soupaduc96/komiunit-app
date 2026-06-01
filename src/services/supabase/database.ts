import { supabase } from './client';

export interface QueryOptions {
  select?: string;
  filters?: Record<string, any>;
  orFilters?: string;
  ilikeFilters?: Array<{ column: string; value: string }>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export class DatabaseService {
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async updateUserProfile(userId: string, updates: Record<string, any>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async createUserProfile(userId: string, profile: Record<string, any>) {
    try {
      // Use upsert so this is safe to call even if the handle_new_user trigger
      // already created the row (e.g. when email confirmation is disabled).
      const { data, error } = await supabase
        .from('users')
        .upsert(
          [{ id: userId, ...profile }],
          { onConflict: 'id', ignoreDuplicates: false }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async query(table: string, options: QueryOptions = {}) {
    try {
      let q = supabase.from(table).select(options.select ?? '*');

      if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          if (value !== undefined && value !== null) {
            q = q.eq(key, value);
          }
        }
      }

      if (options.orFilters) {
        q = q.or(options.orFilters);
      }

      if (options.ilikeFilters) {
        for (const f of options.ilikeFilters) {
          q = q.ilike(f.column, `%${f.value}%`);
        }
      }

      if (options.orderBy) {
        q = q.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      if (options.limit) q = q.limit(options.limit);
      if (options.offset) q = q.range(options.offset, options.offset + (options.limit ?? 50) - 1);

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async insert(table: string, data: Record<string, any>) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async upsert(table: string, data: Record<string, any>, onConflict?: string) {
    try {
      let q = supabase.from(table).upsert([data]);
      if (onConflict) q = (q as any).onConflict(onConflict);
      const { data: result, error } = await (q as any).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async update(table: string, id: string, updates: Record<string, any>) {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async delete(table: string, id: string) {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): Error {
    if (error instanceof Error) return error;
    return new Error(error?.message ?? 'A database error occurred');
  }
}
