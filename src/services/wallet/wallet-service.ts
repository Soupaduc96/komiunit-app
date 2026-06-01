import { supabase } from '@/services/supabase/client';
import { mapWallet } from '@/services/supabase/mappers';
import { Wallet } from '@/types/wallet';

export class WalletService {
  static async getWallet(userId: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapWallet(data) : null;
  }

  static async getOrCreateWallet(userId: string): Promise<Wallet> {
    const existing = await WalletService.getWallet(userId);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('wallets')
      .insert({ user_id: userId, balance: 0.00, currency: 'USD' })
      .select('*')
      .single();

    if (error) {
      // Unique-violation: another concurrent call already created the wallet
      if (error.code === '23505') {
        const { data: raced, error: fetchErr } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (fetchErr) throw new Error(fetchErr.message);
        return mapWallet(raced);
      }
      throw new Error(error.message);
    }

    return mapWallet(data);
  }

  static async getBalance(userId: string): Promise<number> {
    const wallet = await WalletService.getWallet(userId);
    return wallet?.balance ?? 0;
  }
}
