import { supabase } from './client';
import { AuthService } from './auth';
import { mapUser } from './mappers';
import { User } from '@/context/auth-context';

export interface ProfileUpdates {
  fullName?: string;
  phone?: string;
}

export class ProfileService {
  // ─── Read ──────────────────────────────────────────────────────────────────

  static async getProfile(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    return mapUser(data) as User;
  }

  // ─── Update profile fields ─────────────────────────────────────────────────

  static async updateProfile(userId: string, updates: ProfileUpdates): Promise<User> {
    const patch: Record<string, any> = {};
    if (updates.fullName !== undefined) patch.full_name = updates.fullName.trim();
    if (updates.phone !== undefined) patch.phone = updates.phone.trim() || null;

    const { data, error } = await supabase
      .from('users')
      .update(patch)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapUser(data) as User;
  }

  // ─── Avatar upload ─────────────────────────────────────────────────────────

  static async uploadAvatar(
    userId: string,
    fileUri: string,
    mimeType: string = 'image/jpeg'
  ): Promise<string> {
    // Convert file URI to blob (works on both native and web)
    const response = await fetch(fileUri);
    if (!response.ok) throw new Error('Failed to read image file');
    const blob = await response.blob();

    const ext = mimeType.split('/')[1] ?? 'jpg';
    const storagePath = `${userId}/avatar.${ext}`;

    // Upload to Supabase Storage — upsert replaces existing avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(storagePath, blob, {
        contentType: mimeType,
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) throw new Error(uploadError.message);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Persist URL to users table — add cache-busting timestamp
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (updateError) throw new Error(updateError.message);

    return avatarUrl;
  }

  static async removeAvatar(userId: string): Promise<void> {
    // Try to remove common avatar files
    await supabase.storage
      .from('avatars')
      .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.jpeg`]);

    const { error } = await supabase
      .from('users')
      .update({ avatar_url: null })
      .eq('id', userId);

    if (error) throw new Error(error.message);
  }

  // ─── Password change ───────────────────────────────────────────────────────

  static async changePassword(newPassword: string): Promise<void> {
    await AuthService.updatePassword(newPassword);
  }
}
