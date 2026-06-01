import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ProfileService, ProfileUpdates } from '@/services/supabase/profile-service';
import { useAuth } from './use-auth';

export const useProfile = () => {
  const { user, updateProfile: syncUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateProfile = useCallback(
    async (updates: ProfileUpdates): Promise<void> => {
      if (!user) throw new Error('Not authenticated');
      setSaving(true);
      setError(null);
      setSuccess(null);
      try {
        const updated = await ProfileService.updateProfile(user.id, updates);
        syncUser(updated);
        setSuccess('Profile updated successfully');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update profile';
        setError(msg);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [user, syncUser]
  );

  const pickAndUploadAvatar = useCallback(async (): Promise<void> => {
    if (!user) throw new Error('Not authenticated');

    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Photo library permission is required to change your avatar');
      return;
    }

    // Launch picker — square crop, no editing UI to keep things simple
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const mimeType = asset.mimeType ?? 'image/jpeg';
      const avatarUrl = await ProfileService.uploadAvatar(user.id, asset.uri, mimeType);
      syncUser({ ...user, avatarUrl });
      setSuccess('Avatar updated');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }, [user, syncUser]);

  const removeAvatar = useCallback(async (): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    setUploading(true);
    setError(null);
    try {
      await ProfileService.removeAvatar(user.id);
      syncUser({ ...user, avatarUrl: undefined });
      setSuccess('Avatar removed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  }, [user, syncUser]);

  const changePassword = useCallback(
    async (newPassword: string): Promise<void> => {
      setSaving(true);
      setError(null);
      setSuccess(null);
      try {
        await ProfileService.changePassword(newPassword);
        setSuccess('Password updated successfully');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to change password';
        setError(msg);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    user,
    saving,
    uploading,
    error,
    success,
    updateProfile,
    pickAndUploadAvatar,
    removeAvatar,
    changePassword,
    clearMessages,
  };
};
