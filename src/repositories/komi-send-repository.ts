import { KomiSendService } from '@/services/komi-send/send-service';
import { Send, Recipient } from '@/types/komi-send';

export class KomiSendRepository {
  constructor(private userId: string) {}

  getAll(): Promise<Send[]> {
    return KomiSendService.getUserSends(this.userId);
  }

  getById(id: string): Promise<Send | undefined> {
    return KomiSendService.getSendById(id);
  }

  create(recipientId: string, amount: number, description?: string): Promise<Send> {
    return KomiSendService.createSend({
      senderId: this.userId,
      recipientId,
      amount,
      status: 'pending',
      description,
    });
  }

  updateStatus(id: string, status: Send['status']): Promise<Send> {
    return KomiSendService.updateSendStatus(id, status);
  }

  getRecipients(): Promise<Recipient[]> {
    return KomiSendService.getUserRecipients(this.userId);
  }

  findUserByEmail(email: string): Promise<Recipient | null> {
    return KomiSendService.findUserByEmail(email);
  }
}
