import { supabase } from './client';

export class StorageService {
  /**
   * Upload file to storage bucket
   */
  static async uploadFile(bucket: string, path: string, file: ArrayBuffer | Uint8Array) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download file from storage bucket
   */
  static async downloadFile(bucket: string, path: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get public URL for file
   */
  static getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || '';
  }

  /**
   * Delete file from storage bucket
   */
  static async deleteFile(bucket: string, path: string) {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List files in bucket
   */
  static async listFiles(bucket: string, path: string = '') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle storage errors
   */
  private static handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }

    const message = error?.message || 'A storage error occurred';
    return new Error(message);
  }
}
