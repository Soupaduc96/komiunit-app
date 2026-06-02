// Atomic transfer requires the `transfer_funds` Postgres function.
// Deploy this SQL to your Supabase project before using SendService.sendMoney():
//
// CREATE OR REPLACE FUNCTION public.transfer_funds(
//   p_sender_id   UUID,
//   p_receiver_id UUID,
//   p_amount      NUMERIC,
//   p_description TEXT DEFAULT NULL
// )
// RETURNS JSON
// LANGUAGE plpgsql
// SECURITY DEFINER
// SET search_path = public
// AS $$
// DECLARE
//   v_sender_wallet_id   UUID;
//   v_receiver_wallet_id UUID;
//   v_sender_balance     NUMERIC;
//   v_receiver_balance   NUMERIC;
// BEGIN
//   -- Lock in consistent order to prevent deadlocks
//   SELECT id, balance INTO v_sender_wallet_id, v_sender_balance
//     FROM wallets WHERE user_id = p_sender_id AND is_active = true FOR UPDATE;
//   IF NOT FOUND THEN RAISE EXCEPTION 'SENDER_NO_WALLET'; END IF;
//
//   IF v_sender_balance < p_amount THEN RAISE EXCEPTION 'INSUFFICIENT_FUNDS'; END IF;
//
//   SELECT id, balance INTO v_receiver_wallet_id, v_receiver_balance
//     FROM wallets WHERE user_id = p_receiver_id AND is_active = true FOR UPDATE;
//   IF NOT FOUND THEN
//     INSERT INTO wallets (user_id, balance, currency)
//       VALUES (p_receiver_id, 0, 'USD')
//       RETURNING id, balance INTO v_receiver_wallet_id, v_receiver_balance;
//   END IF;
//
//   UPDATE wallets SET balance = v_sender_balance - p_amount, updated_at = NOW()
//     WHERE id = v_sender_wallet_id;
//   UPDATE wallets SET balance = v_receiver_balance + p_amount, updated_at = NOW()
//     WHERE id = v_receiver_wallet_id;
//
//   INSERT INTO transactions (wallet_id, user_id, type, amount, balance_after, description, reference_type, status)
//     VALUES (v_sender_wallet_id,   p_sender_id,   'transfer_out', p_amount, v_sender_balance   - p_amount, p_description, 'transfer', 'completed'),
//            (v_receiver_wallet_id, p_receiver_id, 'transfer_in',  p_amount, v_receiver_balance + p_amount, p_description, 'transfer', 'completed');
//
//   RETURN json_build_object('sender_balance', v_sender_balance - p_amount);
// END;
// $$;

import { supabase } from '@/services/supabase/client';
import { mapRecipient } from '@/services/supabase/mappers';
import { Recipient } from '@/types/komi-send';

export interface TransferResult {
  senderBalance: number;
}

export class SendService {
  static async findRecipient(email: string): Promise<Recipient | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, avatar_url, phone')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapRecipient(data);
  }

  static async sendMoney(
    senderId: string,
    recipientId: string,
    amount: number,
    description?: string,
  ): Promise<TransferResult> {
    const { data, error } = await supabase.rpc('transfer_funds', {
      p_sender_id: senderId,
      p_receiver_id: recipientId,
      p_amount: amount,
      p_description: description ?? null,
    });

    if (error) {
      if (error.message.includes('INSUFFICIENT_FUNDS')) {
        throw new Error('Insufficient balance for this transfer');
      }
      if (error.message.includes('SENDER_NO_WALLET')) {
        throw new Error('Your wallet could not be found');
      }
      throw new Error(error.message);
    }

    return { senderBalance: (data as { sender_balance: number }).sender_balance };
  }
}
