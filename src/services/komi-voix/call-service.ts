import { supabase } from '@/services/supabase/client';
import {
  mapContact,
  mapCallLog,
  mapVoiceMessage,
} from '@/services/supabase/mappers';
import { Contact, CallLog, VoiceMessage } from '@/types/komi-voix';

export class KomiVoixService {
  // ─── Contacts ───────────────────────────────────────────────────────────────

  static async getUserContacts(userId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('contact_name', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapContact);
  }

  static async addContact(
    userId: string,
    contactData: Omit<Contact, 'id' | 'userId' | 'addedAt' | 'updatedAt'>
  ): Promise<Contact> {
    // Prevent duplicate contacts
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', userId)
      .eq('contact_user_id', contactData.contactUserId)
      .maybeSingle();

    if (existing) throw new Error('Contact already exists');

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        contact_user_id: contactData.contactUserId,
        contact_name: contactData.contactName,
        contact_phone: contactData.contactPhone,
        contact_avatar: contactData.contactAvatar ?? null,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapContact(data);
  }

  static async updateContact(
    contactId: string,
    updates: Partial<Pick<Contact, 'contactName' | 'contactPhone' | 'contactAvatar'>>
  ): Promise<Contact> {
    const patch: Record<string, any> = {};
    if (updates.contactName !== undefined) patch.contact_name = updates.contactName;
    if (updates.contactPhone !== undefined) patch.contact_phone = updates.contactPhone;
    if (updates.contactAvatar !== undefined) patch.contact_avatar = updates.contactAvatar;

    const { data, error } = await supabase
      .from('contacts')
      .update(patch)
      .eq('id', contactId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapContact(data);
  }

  static async removeContact(contactId: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw new Error(error.message);
  }

  // ─── Call Logs ───────────────────────────────────────────────────────────────

  static async getCallLogs(userId: string, limit: number = 50): Promise<CallLog[]> {
    // OR filter: rows where caller_id = userId OR recipient_id = userId
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .or(`caller_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCallLog);
  }

  static async createCallLog(
    logData: Omit<CallLog, 'id'>
  ): Promise<CallLog> {
    const { data, error } = await supabase
      .from('call_logs')
      .insert({
        caller_id: logData.callerId,
        recipient_id: logData.recipientId,
        duration: logData.duration,
        status: logData.status,
        started_at: logData.startedAt,
        ended_at: logData.endedAt ?? null,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapCallLog(data);
  }

  // ─── Voice Messages ──────────────────────────────────────────────────────────

  static async sendVoiceMessage(
    messageData: Omit<VoiceMessage, 'id' | 'isRead' | 'sentAt' | 'readAt'>
  ): Promise<VoiceMessage> {
    const { data, error } = await supabase
      .from('voice_messages')
      .insert({
        sender_id: messageData.senderId,
        recipient_id: messageData.recipientId,
        duration: messageData.duration,
        audio_url: messageData.audioUrl,
        transcription: messageData.transcription ?? null,
        is_read: false,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapVoiceMessage(data);
  }

  static async getVoiceMessages(userId: string): Promise<VoiceMessage[]> {
    const { data, error } = await supabase
      .from('voice_messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('sent_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapVoiceMessage);
  }

  static async markVoiceMessageAsRead(messageId: string): Promise<VoiceMessage> {
    const { data, error } = await supabase
      .from('voice_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', messageId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapVoiceMessage(data);
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('voice_messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}
