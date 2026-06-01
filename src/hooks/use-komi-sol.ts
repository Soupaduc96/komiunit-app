import { useCallback, useState } from 'react';
import { KomiSolService } from '@/services/komi-sol/solution-service';
import { Solution, UserTicket } from '@/types/komi-sol';
import { useAuth } from './use-auth';

export const useKomiSol = () => {
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSolutions = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await KomiSolService.getSolutions(category);
      setSolutions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load solutions');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchSolutions = useCallback(async (query: string) => {
    if (!query.trim()) return getSolutions();
    setLoading(true);
    setError(null);
    try {
      const data = await KomiSolService.searchSolutions(query);
      setSolutions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [getSolutions]);

  const createTicket = useCallback(
    async (title: string, description: string, priority?: string): Promise<UserTicket> => {
      if (!user) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);
      try {
        const ticket = await KomiSolService.createTicket({
          userId: user.id,
          title,
          description,
          status: 'open',
          priority: (priority as UserTicket['priority']) ?? 'medium',
        });
        setTickets((prev) => [ticket, ...prev]);
        return ticket;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create ticket';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const getUserTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await KomiSolService.getUserTickets(user.id);
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clearError = useCallback(() => setError(null), []);

  return {
    solutions,
    tickets,
    loading,
    error,
    getSolutions,
    searchSolutions,
    createTicket,
    getUserTickets,
    clearError,
  };
};
