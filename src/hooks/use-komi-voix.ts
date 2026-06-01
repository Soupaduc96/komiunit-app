import { useCallback, useState } from 'react';
import { KomiVoixService } from '@/services/komi-voix/call-service';
import { Contact, CallLog } from '@/types/komi-voix';
import { useAuth } from './use-auth';

export const useKomiVoix = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContacts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await KomiVoixService.getUserContacts(user.id);
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addContact = useCallback(
    async (
      contactUserId: string,
      contactName: string,
      contactPhone: string,
      contactAvatar?: string
    ): Promise<Contact> => {
      if (!user) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);
      try {
        const contact = await KomiVoixService.addContact(user.id, {
          contactUserId,
          contactName,
          contactPhone,
          contactAvatar,
        });
        setContacts((prev) => [contact, ...prev]);
        return contact;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add contact';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const removeContact = useCallback(
    async (contactId: string) => {
      setLoading(true);
      setError(null);
      try {
        await KomiVoixService.removeContact(contactId);
        setContacts((prev) => prev.filter((c) => c.id !== contactId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove contact';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getCallLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await KomiVoixService.getCallLogs(user.id);
      setCallLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load call history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCallLog = useCallback(
    async (
      recipientId: string,
      duration: number,
      status: CallLog['status']
    ): Promise<CallLog> => {
      if (!user) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);
      try {
        const log = await KomiVoixService.createCallLog({
          callerId: user.id,
          recipientId,
          duration,
          status,
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
        });
        setCallLogs((prev) => [log, ...prev]);
        return log;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to log call';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    contacts,
    callLogs,
    loading,
    error,
    getContacts,
    addContact,
    removeContact,
    getCallLogs,
    createCallLog,
    clearError,
  };
};
