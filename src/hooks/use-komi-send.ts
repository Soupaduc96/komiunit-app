import { useCallback, useState } from 'react';
import { KomiSendService } from '@/services/komi-send/send-service';
import { SendService } from '@/services/wallet/send-service';
import { Send, Recipient } from '@/types/komi-send';
import { useAuth } from './use-auth';

export const useKomiSend = () => {
  const { user } = useAuth();
  const [sends, setSends] = useState<Send[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSends = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await KomiSendService.getUserSends(user.id);
      setSends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transfers');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createSend = useCallback(
    async (recipientId: string, amount: number, description?: string): Promise<Send> => {
      if (!user) throw new Error('Not authenticated');

      setLoading(true);
      setError(null);

      try {
        // Step 1: atomic wallet transfer via Postgres RPC
        await SendService.sendMoney(
          user.id,
          recipientId,
          amount,
          description
        );

        // DEBUG
        console.log('CREATE SEND STATUS = COMPLETED');

        // Step 2: create Transfer History record
        const send = await KomiSendService.createSend({
          senderId: user.id,
          recipientId,
          amount,
          status: 'completed',
          description,
        });

        console.log('CREATED SEND RECORD:', send);

        setSends((prev) => [send, ...prev]);

        return send;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to send money';

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const getRecipients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await KomiSendService.getUserRecipients(user.id);
      setRecipients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipients');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const findUserByEmail = useCallback(async (email: string): Promise<Recipient | null> => {
    try {
      return await KomiSendService.findUserByEmail(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'User not found');
      return null;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    sends,
    recipients,
    loading,
    error,
    getSends,
    createSend,
    getRecipients,
    findUserByEmail,
    clearError,
  };
};
