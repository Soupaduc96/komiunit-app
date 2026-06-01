import { KomiSolService } from '@/services/komi-sol/solution-service';
import { Solution, UserTicket } from '@/types/komi-sol';

export class KomiSolRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getSolutions(category?: string): Promise<Solution[]> {
    return KomiSolService.getSolutions(category);
  }

  async getSolutionById(id: string): Promise<Solution | undefined> {
    return KomiSolService.getSolutionById(id);
  }

  async searchSolutions(query: string): Promise<Solution[]> {
    return KomiSolService.searchSolutions(query);
  }

  async getCategories() {
    return KomiSolService.getCategories();
  }

  async createTicket(
    title: string,
    description: string,
    priority: UserTicket['priority'] = 'medium'
  ): Promise<UserTicket> {
    return KomiSolService.createTicket({
      userId: this.userId,
      title,
      description,
      status: 'open',
      priority,
    });
  }

  async getUserTickets(): Promise<UserTicket[]> {
    return KomiSolService.getUserTickets(this.userId);
  }

  async updateTicket(
    id: string,
    updates: Partial<Pick<UserTicket, 'status' | 'priority'>>
  ): Promise<UserTicket> {
    return KomiSolService.updateTicket(id, updates);
  }
}
