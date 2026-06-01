import { supabase } from '@/services/supabase/client';
import { mapTransaction } from '@/services/supabase/mappers';
import { Transaction } from '@/types/wallet';

export class TransactionService {
  static async getTransactions(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapTransaction);
  }

  static async getRecentTransactions(
    userId: string,
    limit: number = 10,
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapTransaction);
  }

  static async getTransactionById(
    transactionId: string,
  ): Promise<Transaction | undefined> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapTransaction(data) : undefined;
  }
}
