import { useCallback, useState } from 'react';
import { SendService, TransferResult } from '@/services/wallet/send-service';
import { Recipient } from '@/types/komi-send';
import { useAuth } from './use-auth';

export const useSend = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findRecipient = useCallback(async (email: string): Promise<Recipient | null> => {
    try {
      return await SendService.findRecipient(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not look up user');
      return null;
    }
  }, []);

  const sendMoney = useCallback(
    async (
      recipientId: string,
      amount: number,
      description?: string,
    ): Promise<TransferResult> => {
      if (!user) throw new Error('Not authenticated');
      if (recipientId === user.id) throw new Error('Cannot send money to yourself');
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be greater than 0');

      setLoading(true);
      setError(null);
      try {
        return await SendService.sendMoney(user.id, recipientId, amount, description);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transfer failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, findRecipient, sendMoney, clearError };
};
