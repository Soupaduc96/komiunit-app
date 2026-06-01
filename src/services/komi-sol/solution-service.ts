import { supabase } from '@/services/supabase/client';
import { mapSolution, mapSolutionCategory, mapUserTicket } from '@/services/supabase/mappers';
import { Solution, SolutionCategory, UserTicket } from '@/types/komi-sol';

export class KomiSolService {
  static async getSolutions(category?: string): Promise<Solution[]> {
    let q = supabase
      .from('solutions')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (category) q = q.eq('category', category);

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSolution);
  }

  static async getSolutionById(solutionId: string): Promise<Solution | undefined> {
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .eq('id', solutionId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapSolution(data) : undefined;
  }

  static async searchSolutions(query: string): Promise<Solution[]> {
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('views', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSolution);
  }

  static async getCategories(): Promise<SolutionCategory[]> {
    const { data, error } = await supabase
      .from('solution_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSolutionCategory);
  }

  static async incrementViews(solutionId: string): Promise<void> {
    await supabase.rpc('increment_solution_views', { solution_id: solutionId }).throwOnError();
  }

  static async toggleLike(solutionId: string, increment: boolean): Promise<void> {
    const delta = increment ? 1 : -1;
    const { data } = await supabase
      .from('solutions')
      .select('likes')
      .eq('id', solutionId)
      .single();
    if (data) {
      await supabase
        .from('solutions')
        .update({ likes: Math.max(0, (data.likes ?? 0) + delta) })
        .eq('id', solutionId);
    }
  }

  static async createTicket(
    ticketData: Omit<UserTicket, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserTicket> {
    const { data, error } = await supabase
      .from('user_tickets')
      .insert({
        user_id: ticketData.userId,
        title: ticketData.title,
        description: ticketData.description,
        status: ticketData.status ?? 'open',
        priority: ticketData.priority ?? 'medium',
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapUserTicket(data);
  }

  static async getUserTickets(userId: string): Promise<UserTicket[]> {
    const { data, error } = await supabase
      .from('user_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapUserTicket);
  }

  static async updateTicket(
    ticketId: string,
    updates: Partial<Pick<UserTicket, 'status' | 'priority'>>
  ): Promise<UserTicket> {
    const patch: Record<string, any> = {};
    if (updates.status) patch.status = updates.status;
    if (updates.priority) patch.priority = updates.priority;

    const { data, error } = await supabase
      .from('user_tickets')
      .update(patch)
      .eq('id', ticketId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapUserTicket(data);
  }
}
