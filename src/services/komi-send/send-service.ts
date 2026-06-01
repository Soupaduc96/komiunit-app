import { supabase } from '@/services/supabase/client';
import { mapSend, mapRecipient } from '@/services/supabase/mappers';
import { Send, Recipient } from '@/types/komi-send';

export class KomiSendService {
  static async getUserSends(userId: string): Promise<Send[]> {
    const { data, error } = await supabase
      .from('komi_sends')
      .select(`
        *,
        recipient:users!komi_sends_recipient_id_fkey(id, full_name, email, avatar_url)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSend);
  }

  static async createSend(
    sendData: Omit<Send, 'id' | 'createdAt' | 'updatedAt' | 'recipientName'>
  ): Promise<Send> {
    const { data, error } = await supabase
      .from('komi_sends')
      .insert({
        sender_id: sendData.senderId,
        recipient_id: sendData.recipientId,
        amount: sendData.amount,
        status: sendData.status ?? 'pending',
        description: sendData.description ?? null,
      })
      .select(`
        *,
        recipient:users!komi_sends_recipient_id_fkey(id, full_name, email, avatar_url)
      `)
      .single();

    if (error) throw new Error(error.message);
    return mapSend(data);
  }

  static async getSendById(sendId: string): Promise<Send | undefined> {
    const { data, error } = await supabase
      .from('komi_sends')
      .select(`
        *,
        recipient:users!komi_sends_recipient_id_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', sendId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapSend(data) : undefined;
  }

  static async updateSendStatus(sendId: string, status: Send['status']): Promise<Send> {
    const { data, error } = await supabase
      .from('komi_sends')
      .update({ status })
      .eq('id', sendId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapSend(data);
  }

  static async getUserRecipients(userId: string): Promise<Recipient[]> {
    // Get unique recipients the user has sent money to
    const { data, error } = await supabase
      .from('komi_sends')
      .select(`
        recipient_id,
        created_at,
        amount,
        recipient:users!komi_sends_recipient_id_fkey(id, full_name, email, avatar_url, phone)
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Deduplicate by recipient_id, keep most recent
    const seen = new Set<string>();
    const recipients: Recipient[] = [];
    for (const row of data ?? []) {
      if (!seen.has(row.recipient_id) && row.recipient) {
        seen.add(row.recipient_id);
        recipients.push({
          id: (row.recipient as any).id,
          name: (row.recipient as any).full_name ?? '',
          email: (row.recipient as any).email ?? '',
          phone: (row.recipient as any).phone ?? undefined,
          avatar: (row.recipient as any).avatar_url ?? undefined,
          lastSent: row.created_at,
        });
      }
    }
    return recipients;
  }

  static async findUserByEmail(email: string): Promise<Recipient | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, avatar_url, phone')
      .eq('email', email)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapRecipient(data);
  }
}
