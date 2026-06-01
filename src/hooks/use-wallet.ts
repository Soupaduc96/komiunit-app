import { useCallback, useEffect, useState } from 'react';
import { WalletService } from '@/services/wallet/wallet-service';
import { TransactionService } from '@/services/wallet/transaction-service';
import { Wallet, Transaction } from '@/types/wallet';
import { useAuth } from './use-auth';

const RECENT_LIMIT = 10;

export const useWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWallet = useCallback(async () => {
    if (!user?.id) return;
    const userId = user.id;
    setLoading(true);
    setError(null);
    try {
      const [w, txns] = await Promise.all([
        WalletService.getOrCreateWallet(userId),
        TransactionService.getRecentTransactions(userId, RECENT_LIMIT),
      ]);
      setWallet(w);
      setTransactions(txns);
    } catch (err) {
      console.error('[useWallet] loadWallet failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const loadMoreTransactions = useCallback(
    async (offset: number): Promise<Transaction[]> => {
      if (!user?.id) return [];
      try {
        const more = await TransactionService.getTransactions(user.id, 20, offset);
        setTransactions((prev) => {
          const ids = new Set(prev.map((t) => t.id));
          return [...prev, ...more.filter((t) => !ids.has(t.id))];
        });
        return more;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
        return [];
      }
    },
    [user?.id],
  );

  const refresh = useCallback(() => loadWallet(), [loadWallet]);

  const clearError = useCallback(() => setError(null), []);

  return {
    wallet,
    transactions,
    loading,
    error,
    refresh,
    loadMoreTransactions,
    clearError,
  };
};
